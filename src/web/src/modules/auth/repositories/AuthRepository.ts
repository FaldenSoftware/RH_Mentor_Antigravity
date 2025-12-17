import { supabase } from '../../../lib/supabase';
import type { AuthResponse } from '@supabase/supabase-js';

export class AuthRepository {
    async signInWithPassword(email: string, password: string): Promise<AuthResponse> {
        return await supabase.auth.signInWithPassword({
            email,
            password,
        });
    }

    async signUpManager(email: string, password: string, companyName: string): Promise<AuthResponse> {
        return await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    org_name: companyName,
                    role: 'manager'
                }
            }
        });
    }

    async signOut(): Promise<{ error: Error | null }> {
        return await supabase.auth.signOut();
    }
}

export const authRepository = new AuthRepository();
