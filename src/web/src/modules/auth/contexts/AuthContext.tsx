import { createContext, useContext, useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "../../../lib/supabase";
import { profileRepository, type Profile } from "../repositories/ProfileRepository";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        try {
            const { data: profileData, error } = await profileRepository.getByUserId(userId);
            if (error) throw error;
            setProfile(profileData);
        } catch (error) {
            console.error('Unexpected error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let mockApplied = false;
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setSession(session);
                setUser(session.user);
                fetchProfile(session.user.id);
            } else {
                // MOCK AUTH BYPASS FOR DEV
                console.log("Dev Mode: Bypassing Auth with Mock Manager Profile");
                const mockUser = { id: 'mock-user-id', email: 'dev@manager.com' } as User;
                const mockProfile: Profile = {
                    id: 'mock-profile-id',
                    user_id: 'mock-user-id',
                    organization_id: '26d0ab36-fdd0-4d06-8a59-7b5af7387edb',
                    role: 'manager',
                    created_at: new Date().toISOString()
                };
                setUser(mockUser);
                setProfile(mockProfile);
                setLoading(false);
                mockApplied = true;
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                mockApplied = false;
                setSession(session);
                setUser(session.user);
                fetchProfile(session.user.id);
            } else {
                if (!mockApplied) {
                    setSession(null);
                    setUser(null);
                    setProfile(null);
                    setLoading(false);
                }
                mockApplied = false; // Reset after one check
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setProfile(null);
        setUser(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider value={{ user, session, profile, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
