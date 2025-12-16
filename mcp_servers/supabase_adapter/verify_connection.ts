
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load .env from current directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ Missing env vars");
    process.exit(1);
}

console.log(`Connecting to ${SUPABASE_URL}...`);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testConnection() {
    try {
        // Try to list schemas or a public table. relying on admin key to bypass RLS.
        // Since we don't know tables yet, we'll try to get the auth settings or just a simple 'health check' 
        // by selecting from a non-existent table (should return 404 or empty) or just check auth.admin.listUsers()

        // Check 'organizations' table access
        const { data: orgs, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .limit(5);

        if (orgError) {
            console.error("❌ Failed to query organizations:", orgError.message);
        } else {
            console.log("✅ Connection Successful! Verified Service Role Key.");
            console.log(`✅ Accessed 'organizations' table. Count: ${orgs.length}`);
            if (orgs.length === 0) {
                console.log("   (Table is empty, but query worked)");
            }
        }
    } catch (err) {
        console.error("❌ Unexpected Error:", err);
    }
}

testConnection();
