import { supabase } from '../../../lib/supabase';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    points: number;
    created_at: string;
}

export interface UserAchievement {
    id: string;
    user_id: string;
    achievement_id: string;
    earned_at: string;
    achievement?: Achievement;
    profile?: {
        full_name: string;
        avatar_url?: string;
    };
}

export interface Goal {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    target_value: number;
    current_value: number;
    deadline: string;
    status: 'active' | 'completed' | 'missed';
    reward_points: number;
    profile?: {
        full_name: string;
import { supabase } from '../../../lib/supabase';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    points: number;
    created_at: string;
}

export interface UserAchievement {
    id: string;
    user_id: string;
    achievement_id: string;
    earned_at: string;
    achievement?: Achievement;
    profile?: {
        full_name: string;
        avatar_url?: string;
    };
}

export interface Goal {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    target_value: number;
    current_value: number;
    deadline: string;
    status: 'active' | 'completed' | 'missed';
    reward_points: number;
    profile?: {
        full_name: string;
        avatar_url?: string;
    };
}

export class GamificationRepository {
    // Achievements
    async getAchievements(page: number = 1, limit: number = 50): Promise<Achievement[]> {
        try {
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            const { data, error } = await supabase
                .from('achievements')
                .select('id, title, description, icon, points, created_at')
                .order('points', { ascending: true })
                .range(from, to);

            if (error) throw error;
            return data as Achievement[];
        } catch (error) {
            console.error('Error in getAchievements:', error);
            throw error;
        }
    }

    async createAchievement(achievement: Omit<Achievement, 'id' | 'created_at'>): Promise<{ error: any }> {
        try {
            const { error } = await supabase
                .from('achievements')
                .insert(achievement);
            return { error };
        } catch (error) {
            console.error('Error in createAchievement:', error);
            return { error };
        }
    }

    async getRecentUnlocks(organizationId: string, limit: number = 5): Promise<UserAchievement[]> {
        try {
            // Fetch user achievements and manually filter by organization if deep filtering is tricky
            // For now, we'll try to join profiles and filter.
            // Note: Supabase JS client syntax for deep filtering on foreign tables:
            // .eq('profiles.organization_id', organizationId) should work if the join is correct.

            const { data, error } = await supabase
                .from('user_achievements')
                .select(`
                    id, user_id, achievement_id, earned_at,
                    achievement:achievements(id, title, description, icon, points),
                    profile:profiles!user_id(full_name, avatar_url, organization_id)
                `)
                .order('earned_at', { ascending: false })
                .limit(limit * 2); // Fetch more to filter client side if needed

            if (error) throw error;

            // Filter by organization client-side to be safe and simple
            const filtered = (data || []).filter((ua: any) => ua.profile?.organization_id === organizationId);
            return filtered.slice(0, limit) as UserAchievement[];
        } catch (error) {
            console.error('Error in getRecentUnlocks:', error);
            throw error;
        }
    }

    // Goals
    async getGoals(organizationId: string, page: number = 1, limit: number = 50): Promise<Goal[]> {
        try {
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            const { data, error } = await supabase
                .from('goals')
                .select(`
                    id, user_id, title, description, target_value, current_value, deadline, status, reward_points,
                    profile:profiles!user_id(full_name, avatar_url, organization_id)
                `)
                .order('deadline', { ascending: true })
                .range(from, to);

            if (error) throw error;

            // Filter by organization
            return (data || []).filter((g: any) => g.profile?.organization_id === organizationId) as Goal[];
        } catch (error) {
            console.error('Error in getGoals:', error);
            throw error;
        }
    }

    async createGoal(goal: Omit<Goal, 'id' | 'current_value' | 'status' | 'profile'>): Promise<{ error: any }> {
        try {
            const { error } = await supabase
                .from('goals')
                .insert({
                    ...goal,
                    current_value: 0,
                    status: 'active'
                });
            return { error };
        } catch (error) {
            console.error('Error in createGoal:', error);
            return { error };
        }
    }
}

export const gamificationRepository = new GamificationRepository();
