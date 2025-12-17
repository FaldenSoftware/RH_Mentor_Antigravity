import { supabase } from '../../../lib/supabase';

export interface Invitation {
    id: string;
    email: string;
    token: string;
    role: 'manager' | 'leader';
    created_at: string;
    expires_at: string;
    organization_id: string;
}

export class InvitationRepository {
    async create(email: string, organizationId: string): Promise<{ data: Invitation | null; error: any }> {
        const { data, error } = await supabase
            .from('invitations')
            .insert({
                email,
                organization_id: organizationId,
                role: 'leader' // Only inviting leaders for now
            })
            .select()
            .single();

        return { data, error };
    }

    async list(organizationId: string): Promise<{ data: Invitation[] | null; error: any }> {
        const { data, error } = await supabase
            .from('invitations')
            .select('*')
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false });

        return { data, error };
    }

    async validateToken(token: string): Promise<{ valid: boolean; email?: string; organization_id?: string; role?: string }> {
        const { data, error } = await supabase.rpc('check_invite_token', { token_input: token });

        if (error || !data) {
            return { valid: false };
        }

        return {
            valid: data.valid,
            email: data.email,
            // RPC might need update to return more info if needed, but email is good for pre-fill
        };
    }
}

export const invitationRepository = new InvitationRepository();
