import { supabase } from '../../../lib/supabase';

export interface Assignment {
    id: string;
    leader_id: string;
    test_id: string;
    organization_id: string;
    assigned_at: string;
    completed_at: string | null;
    test?: {
        title: string;
    };
    profile?: {
        user_id: string;
        // We might join with auth users via profiles if we need names, 
        // but profiles usually don't have names unless we add them.
        // For now, we rely on email from auth or add name to profile.
        // Let's assume we just need ID for now or fetch email separately.
    };
}

export class AssignmentRepository {
    async create(leaderId: string, testId: string, organizationId: string): Promise<{ data: Assignment | null; error: any }> {
        const { data, error } = await supabase
            .from('assignments')
            .insert({
                leader_id: leaderId,
                test_id: testId,
                organization_id: organizationId
            })
            .select()
            .single();

        return { data, error };
    }

    async listByOrganization(organizationId: string, page: number = 1, limit: number = 10): Promise<{ data: Assignment[] | null; count: number | null; error: any }> {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, count, error } = await supabase
            .from('assignments')
            .select('id, leader_id, test_id, organization_id, assigned_at, completed_at, test:tests(title)', { count: 'exact' })
            .eq('organization_id', organizationId)
            .order('assigned_at', { ascending: false })
            .range(from, to);

        return { data: data as any, count, error };
    }

    async listByLeader(leaderId: string, page: number = 1, limit: number = 10): Promise<{ data: Assignment[] | null; count: number | null; error: any }> {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, count, error } = await supabase
            .from('assignments')
            .select('id, leader_id, test_id, organization_id, assigned_at, completed_at, test:tests(title, description)', { count: 'exact' })
            .eq('leader_id', leaderId)
            .order('assigned_at', { ascending: false })
            .range(from, to);

        return { data: data as any, count, error };
    }

    async getById(id: string): Promise<{ data: Assignment | null; error: any }> {
        const { data, error } = await supabase
            .from('assignments')
            .select('id, leader_id, test_id, organization_id, assigned_at, completed_at, test:tests(title, questions)')
            .eq('id', id)
            .single();

        return { data: data as any, error };
    }

    async markAsCompleted(id: string): Promise<{ error: any }> {
        const { error } = await supabase
            .from('assignments')
            .update({ completed_at: new Date().toISOString() })
            .eq('id', id);

        return { error };
    }
}

export const assignmentRepository = new AssignmentRepository();
