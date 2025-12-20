import { supabase } from '../../../lib/supabase';

export interface Assignment {
    id: string;
    leader_id: string;
    test_id: string;
    organization_id: string;
    assigned_at: string;
    completed_at: string | null;
    status: 'pending' | 'completed';
    test?: {
        title: string;
    };
    profile?: {
        full_name: string;
        avatar_url?: string;
        email?: string;
    };
}

export interface AssignmentStats {
    total: number;
    pending: number;
    completed: number;
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
            .select('id, leader_id, test_id, organization_id, assigned_at, completed_at')
            .single();

        return { data, error };
    }

    async listByOrganization(organizationId: string, page: number = 1, limit: number = 10): Promise<{ data: Assignment[] | null; count: number | null; error: any }> {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, count, error } = await supabase
            .from('assignments')
            .select(`
                id, leader_id, test_id, organization_id, assigned_at, completed_at,
                test:tests(title),
                profile:profiles!leader_id(full_name, avatar_url, email)
            `, { count: 'exact' })
            .eq('organization_id', organizationId)
            .order('assigned_at', { ascending: false })
            .range(from, to);

        const formattedData = data?.map((item: any) => ({
            ...item,
            status: item.completed_at ? 'completed' : 'pending',
            profile: item.profile // Profile is now joined directly
        }));

        return { data: formattedData as Assignment[], count, error };
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

        const formattedData = data?.map((item: any) => ({
            ...item,
            status: item.completed_at ? 'completed' : 'pending'
        }));

        return { data: formattedData as Assignment[], count, error };
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

    async getAssignmentStats(organizationId: string): Promise<AssignmentStats> {
        const { count: total } = await supabase
            .from('assignments')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', organizationId);

        const { count: completed } = await supabase
            .from('assignments')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', organizationId)
            .not('completed_at', 'is', null);

        return {
            total: total || 0,
            completed: completed || 0,
            pending: (total || 0) - (completed || 0)
        };
    }

    async assignTest(leaderId: string, testId: string, organizationId: string): Promise<{ error: any }> {
        const { error } = await supabase
            .from('assignments')
            .insert({
                leader_id: leaderId,
                test_id: testId,
                organization_id: organizationId
            });
        return { error };
    }
}

export const assignmentRepository = new AssignmentRepository();
