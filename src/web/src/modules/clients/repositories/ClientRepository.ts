import { supabase } from '../../../lib/supabase';

export interface Client {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    status: 'active' | 'inactive' | 'pending';
    avatar_url?: string;
    created_at: string;
    progress: number;
    tasks_completed: number;
    total_tasks: number;
    trend: 'up' | 'down' | 'neutral';
}

export interface ClientStats {
    total: number;
    active: number;
    pending: number;
    inactive: number;
}

export class ClientRepository {
    async getClients(organizationId: string, page: number = 1, limit: number = 50): Promise<Client[]> {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, phone, status, avatar_url, created_at')
            .eq('organization_id', organizationId)
            .eq('role', 'leader')
            .order('full_name')
            .range(from, to);

        if (error) throw error;

        // In a real app, we would join with assignments/goals to calculate progress
        // For now, we'll simulate some of this data based on the user's ID to be deterministic but "random"
        return profiles.map(profile => {
            // Deterministic pseudo-random based on ID char codes
            const seed = profile.id.charCodeAt(0) + profile.id.charCodeAt(profile.id.length - 1);
            const progress = (seed * 7) % 100;
            const totalTasks = 15 + (seed % 10);
            const tasksCompleted = Math.floor((progress / 100) * totalTasks);

            return {
                id: profile.id,
                full_name: profile.full_name || 'Cliente Sem Nome',
                email: profile.email || 'sem.email@exemplo.com',
                phone: profile.phone || '(11) 99999-9999',
                status: profile.status || 'active',
                avatar_url: profile.avatar_url,
                created_at: profile.created_at,
                progress: progress,
                tasks_completed: tasksCompleted,
                total_tasks: totalTasks,
                trend: progress > 50 ? 'up' : 'neutral'
            };
        });
    }

    async getClientStats(organizationId: string): Promise<ClientStats> {
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('status')
            .eq('organization_id', organizationId)
            .eq('role', 'leader');

        if (error) throw error;

        const stats = {
            total: profiles.length,
            active: 0,
            pending: 0,
            inactive: 0
        };

        profiles.forEach(p => {
            const status = p.status as keyof typeof stats;
            if (status && status !== 'total' && stats[status] !== undefined) {
                stats[status]++;
            } else {
                // Default to active if unknown or null
                stats.active++;
            }
        });

        return stats;
    }
}

export const clientRepository = new ClientRepository();
