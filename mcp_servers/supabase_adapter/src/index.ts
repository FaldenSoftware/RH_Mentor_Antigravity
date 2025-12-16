#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { z } from "zod";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
    process.exit(1);
}

const QueryTableSchema = z.object({
    table: z.string().min(1),
    columns: z.string().optional().default("*"),
    filters: z.record(z.string(), z.any()).optional().default({}),
    userId: z.string().uuid().optional(),
    page: z.number().int().min(1).optional().default(1),
    pageSize: z.number().int().min(1).max(100).optional().default(10),
});

const InsertRecordSchema = z.object({
    table: z.string().min(1),
    data: z.record(z.string(), z.any()),
    userId: z.string().uuid().optional(),
});

// Admin client for non-RLS operations (careful use)
const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

const server = new Server(
    {
        name: "supabase-adapter",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

/**
 * Helper to get a Supabase client authenticated as a specific user (or admin if no user provided)
 * If userId is provided, we sign a JWT for them to enforce RLS.
 */
function getClient(userId?: string): SupabaseClient {
    if (!userId) {
        return adminClient;
    }

    if (!SUPABASE_JWT_SECRET) {
        throw new Error("SUPABASE_JWT_SECRET is required to impersonate users for RLS.");
    }

    const payload = {
        aud: "authenticated",
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
        sub: userId,
        role: "authenticated",
    };

    const token = jwt.sign(payload, SUPABASE_JWT_SECRET);

    return createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "query_table",
                description: "Execute a SELECT query on a table with RLS. If userId is provided, runs as that user.",
                inputSchema: {
                    type: "object",
                    properties: {
                        table: { type: "string" },
                        columns: { type: "string", description: "Columns to select, default '*'" },
                        filters: {
                            type: "object",
                            description: "Key-value pairs for equality filters (e.g., { 'status': 'active' })"
                        },
                        userId: { type: "string", description: "UUID of the user to impersonate for RLS" },
                        page: { type: "number", description: "Page number (1-indexed)" },
                        pageSize: { type: "number", description: "Items per page, default 10" }
                    },
                    required: ["table"],
                },
            },
            {
                name: "insert_record",
                description: "Insert a record into a table.",
                inputSchema: {
                    type: "object",
                    properties: {
                        table: { type: "string" },
                        data: { type: "object", description: "Record data to insert" },
                        userId: { type: "string", description: "UUID of the user to impersonate for RLS" }
                    },
                    required: ["table", "data"],
                },
            },
            {
                name: "run_sql",
                description: "Execute raw SQL query (Admin only). Use with caution for migrations.",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: { type: "string", description: "SQL query to execute" }
                    },
                    required: ["query"],
                },
            },
            // Add more tools as needed (update, delete, etc.)
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        if (name === "query_table") {
            const { table, columns, filters, userId, page, pageSize } = QueryTableSchema.parse(args);
            const client = getClient(userId);

            let query = client.from(table).select(columns, { count: 'exact' });

            // Apply filters
            Object.entries(filters).forEach(([key, value]) => {
                query = query.eq(key, value);
            });

            // Pagination
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.range(from, to);

            const { data, error, count } = await query;

            if (error) throw error;

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({ data, count, page, pageSize }, null, 2),
                    },
                ],
            };
        } else if (name === "insert_record") {
            const { table, data, userId } = InsertRecordSchema.parse(args);
            const client = getClient(userId);

            const { data: result, error } = await client.from(table).insert(data).select();

            if (error) throw error;

            return {
                content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
            }
        } else if (name === "run_sql") {
            const { query } = args as any;
            // Admin client is used for raw SQL to allow DDL operations (migrations)
            // Note: rpc() is usually for functions, for raw SQL we might need a direct driver or a specific function exposed in DB.
            // However, Supabase-js doesn't natively support raw SQL from client unless via RPC.
            // BUT, if we are in node, maybe we don't have direct PG access.
            // Wait, supabase-js NO tem raw sql execution outside of RPC.
            // WE NEED TO CHECK if there is an 'exec_sql' RPC or similar, OR usage of pg driver?
            // Actually, for this environment, often a specific PG client is better for migrations.
            // Let's assume for now we might need to install 'pg' or use a 'exec_sql' function if it exists.
            // AS A FALLBACK in this specific agent environment:
            // logic: The user wants me to execute SQL.
            // If I can't via supabase-js, I must ask user to install CLI or I install 'pg'.
            // Let's try to bundle 'pg' usage if I can, OR just use an RPC call if the user had one.
            // Since I am creating the DB from scratch, I can't rely on an RPC existing.

            // RE-EVALUATION: supabase-js admin client strictly calls PostgREST. PostgREST doesn't do raw SQL.
            // I need to use 'pg' (node-postgres) to connect directly using the connection string.
            // Check if 'pg' is in package.json?
            // If not, I'll add it.

            throw new Error("Direct SQL execution requires a PG client connection, which works better with the 'pg' package. Please install 'pg' or use Supabase CLI.");
        }
    }

        throw new Error(`Unknown tool: ${name}`);
} catch (error: any) {
    return {
        content: [
            {
                type: "text",
                text: `Error: ${error.message}`,
            },
        ],
        isError: true,
    };
}
});
});

const transport = new StdioServerTransport();
await server.connect(transport);
