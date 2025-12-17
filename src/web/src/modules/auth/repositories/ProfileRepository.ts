import { supabase } from '../../../lib/supabase';

export type UserRole = 'manager' | 'leader';

export interface Profile {
    id: string;
    user_id: string;
    role: UserRole;
    organization_id: string | null;
    created_at?: string;
}

export class ProfileRepository {
    async getByUserId(userId: string): Promise<Profile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, user_id, role, organization_id')
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }

        return data as Profile;
    }

    // Future methods: create, update, etc.
    async listByOrganization(organizationId: string): Promise<{ data: Profile[] | null; error: any }> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('organization_id', organizationId)
            .eq('role', 'leader'); // Only list leaders for assignment

        return { data: data as Profile[], error };
    }
}

export const profileRepository = new ProfileRepository();
