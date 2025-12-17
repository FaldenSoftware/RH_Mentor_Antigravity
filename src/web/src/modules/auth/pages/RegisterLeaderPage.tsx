import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import { invitationRepository } from '../../organization/repositories/InvitationRepository'
import { Mail, Lock, Loader2, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/Card'

const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must contain one uppercase letter')
        .regex(/[0-9]/, 'Must contain one number'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterLeaderPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [inviteData, setInviteData] = useState<{ valid: boolean; email?: string } | null>(null);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }
        validateToken();
    }, [token]);

    const validateToken = async () => {
        if (!token) return;
        const result = await invitationRepository.validateToken(token);
        setInviteData(result);
        if (result.valid && result.email) {
            setValue('email', result.email);
        }
        setLoading(false);
    };

    const onSubmit = async (data: RegisterForm) => {
        if (!token) return;
        setSubmitting(true);
        setError(null);

        try {
            // Sign up with token in metadata to trigger DB provisioning
            const { error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        invite_token: token,
                        role: 'leader'
                    }
                }
            });

            if (authError) throw authError;

            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to register');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        );
    }

    if (!token || (inviteData && !inviteData.valid)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                <Card className="max-w-md w-full border-destructive/20 shadow-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                            <AlertCircle className="h-6 w-6 text-destructive" />
                        </div>
                        <CardTitle className="text-destructive">Invalid Invitation</CardTitle>
                        <CardDescription>
                            This invitation link is invalid or has expired. Please ask your manager for a new one.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="justify-center">
                        <Link to="/login">
                            <Button variant="outline">Back to Sign In</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md px-4 relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary mb-4">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Join your team</h1>
                    <p className="mt-2 text-slate-600">Create your account to accept the invitation</p>
                </div>

                <Card className="border-slate-200 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Complete Registration</CardTitle>
                        <CardDescription>Set up your password to continue</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        {...register('email')}
                                        type="email"
                                        readOnly
                                        className="pl-10 bg-slate-50 text-muted-foreground cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        {...register('password')}
                                        type="password"
                                        placeholder="Create Password"
                                        className="pl-10"
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-destructive">{errors.password.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        {...register('confirmPassword')}
                                        type="password"
                                        placeholder="Confirm Password"
                                        className="pl-10"
                                    />
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                                )}
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                loading={submitting}
                            >
                                Create Account
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
