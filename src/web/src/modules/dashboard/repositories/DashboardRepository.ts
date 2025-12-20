import { supabase } from '../../../lib/supabase';

export interface DashboardStats {
    activeClients: number;
    pendingAssessments: number;
    completionRate: number;
    achievementsCount: number;
    totalAchievements: number;
}

export interface RankingUser {
    name: string;
    points: string;
    trend: 'up' | 'down' | 'neutral';
    avatar: string;
    color: string;
}

export interface ProgressData {
    name: string;
    value: number;
    color: string;
}

export class DashboardRepository {
    async getManagerStats(organizationId: string, userId: string): Promise<DashboardStats> {
        // 1. Active Clients (Leaders in the organization)
        const { count: activeClients } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', organizationId)
            .eq('role', 'leader');

        // 2. Pending Assessments (in the organization)
        const { count: pendingAssessments } = await supabase
            .from('assignments')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', organizationId)
            .is('completed_at', null);

        // 3. Completion Rate
        const { count: totalAssignments } = await supabase
            .from('assignments')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', organizationId);

        const { count: completedAssignments } = await supabase
            .from('assignments')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', organizationId)
            .not('completed_at', 'is', null);

        const completionRate = totalAssignments ? Math.round((completedAssignments || 0) / totalAssignments * 100) : 0;

        // 4. Achievements (User's achievements)
        const { count: achievementsCount } = await supabase
            .from('user_achievements')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        const { count: totalAchievements } = await supabase
            .from('achievements')
            .select('*', { count: 'exact', head: true });

        return {
            activeClients: activeClients || 0,
            pendingAssessments: pendingAssessments || 0,
            completionRate,
            achievementsCount: achievementsCount || 0,
            totalAchievements: totalAchievements || 0
        };
    }

    async getRanking(organizationId: string): Promise<RankingUser[]> {
        const { data } = await supabase
            .from('profiles')
            .select('full_name, points')
            .eq('organization_id', organizationId)
            .eq('role', 'leader')
            .order('points', { ascending: false })
            .limit(5);

        if (!data) return [];

        return data.map((profile, index) => {
            const name = profile.full_name || 'Usuário';
            const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
            const colors = ['bg-yellow-100 text-yellow-700', 'bg-slate-100 text-slate-700', 'bg-orange-100 text-orange-700', 'bg-teal-100 text-teal-700'];

            return {
                name,
                points: `${profile.points || 0} pts`,
                trend: 'neutral',
                avatar: initials,
                color: colors[index % colors.length]
            };
        });
    }

    async getProgress(organizationId: string, userId: string): Promise<ProgressData[]> {
        // 1. Assignments Completed %
        const { count: totalAssignments } = await supabase.from('assignments').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId);
        const { count: completedAssignments } = await supabase.from('assignments').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId).not('completed_at', 'is', null);

        const tasksValue = totalAssignments ? Math.round((completedAssignments || 0) / totalAssignments * 100) : 0;

        // 2. Goals (Metas) - User's goals
        const { count: totalGoals } = await supabase.from('goals').select('*', { count: 'exact', head: true }).eq('user_id', userId);
        const { count: completedGoals } = await supabase.from('goals').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'completed');

        const goalsValue = totalGoals ? Math.round((completedGoals || 0) / totalGoals * 100) : 0;

        // 3. Assessments Applied (Assignments created) - Placeholder logic
        // If there are assignments, we consider it 100% "applied" for now, or we could compare to a target.
        const assessmentsValue = totalAssignments && totalAssignments > 0 ? 100 : 0;

        return [
            { name: 'Tarefas concluídas', value: tasksValue, color: '#EAB308' },
            { name: 'Metas atingidas', value: goalsValue, color: '#0F5156' },
            { name: 'Avaliações aplicadas', value: assessmentsValue, color: '#22C55E' },
        ];
    }
}

export const dashboardRepository = new DashboardRepository();
