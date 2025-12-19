import { supabase } from '../../../lib/supabase';

export interface Profile {
    id: string;
    user_id: string;
    organization_id: string;
    role: 'manager' | 'leader';
    created_at: string;
    email?: string; // Optional, fetched from auth metadata or separate table if we had one
    full_name?: string;
}

export class ProfileRepository {
    async listByOrganization(organizationId: string, page: number = 1, limit: number = 10): Promise<{ data: Profile[] | null; count: number | null; error: any }> {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        // Note: In a real scenario, we might want to join with auth.users to get emails/names.
        // However, Supabase client doesn't support joining with auth.users directly in a simple way without a view.
        // For now, we assume profiles might have extra data or we fetch it differently.
        // But wait, the requirements say "Manager must see a list of all his leaders".
        // If profiles table doesn't have name/email, this list is useless (just IDs).
        // The migration `20251216_init_phase1.sql` shows profiles table only has IDs and role.
        // The `20251216_phase2_auth.sql` implies we might rely on auth metadata.
        // A common pattern is to have a `public.profiles` table that duplicates some auth info or we use a secure view.
        // Given the constraints and the current schema, I will just fetch profiles. 
        // If we need emails, we might need a database function or a view.
        // Let's stick to the schema we have. If the user needs names, we'll have to add them to the profiles table or create a view.
        // For this phase, I will assume we might need to add 'email' or 'name' to profiles later, or use a view.
        // BUT, for now, let's just fetch what we have.

        const { data, count, error } = await supabase
            .from('profiles')
            .select('*', { count: 'exact' })
            .eq('organization_id', organizationId)
            .eq('role', 'leader')
            .range(from, to);

        return { data: data as any, count, error };
    }

    async getByUserId(userId: string): Promise<{ data: Profile | null; error: any }> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        return { data: data as any, error };
    }
}

export const profileRepository = new ProfileRepository();
