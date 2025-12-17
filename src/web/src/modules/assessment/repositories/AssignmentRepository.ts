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

    async listByOrganization(organizationId: string): Promise<{ data: Assignment[] | null; error: any }> {
        const { data, error } = await supabase
            .from('assignments')
            .select('*, test:tests(title)')
            .eq('organization_id', organizationId)
            .order('assigned_at', { ascending: false });

        return { data: data as any, error };
    }

    async listByLeader(leaderId: string): Promise<{ data: Assignment[] | null; error: any }> {
        const { data, error } = await supabase
            .from('assignments')
            .select('*, test:tests(title, description)')
            .eq('leader_id', leaderId)
            .order('assigned_at', { ascending: false });

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
