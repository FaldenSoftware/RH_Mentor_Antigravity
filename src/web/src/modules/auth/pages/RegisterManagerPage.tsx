import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Building, ArrowRight, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { authRepository } from '../repositories/AuthRepository'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/Card'

const registerSchema = z.object({
    companyName: z.string().min(2, 'Company name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must contain one uppercase letter')
        .regex(/[0-9]/, 'Must contain one number'),
    terms: z.boolean().refine(val => val === true, {
        message: "You must accept the terms and conditions",
    }),
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterManagerPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    })

    const onSubmit = async (data: RegisterForm) => {
        setLoading(true)
        setError(null)

        try {
            const { error: authError } = await authRepository.signUpManager(
                data.email,
                data.password,
                data.companyName
            )

            if (authError) {
                throw authError
            }

            navigate('/dashboard')
        } catch (err: any) {
            setError(err.message || 'Failed to register')
        } finally {
            setLoading(false)
        }
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
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Start your free trial</h1>
                    <p className="mt-2 text-slate-600">Join thousands of leaders growing their teams</p>
                </div>

                <Card className="border-slate-200 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Create Account</CardTitle>
                        <CardDescription>Enter your details to get started</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <div className="relative">
                                    <Building className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        {...register('companyName')}
                                        type="text"
                                        placeholder="Company Name"
                                        className="pl-10"
                                    />
                                </div>
                                {errors.companyName && (
                                    <p className="text-sm text-destructive">{errors.companyName.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        {...register('email')}
                                        type="email"
                                        placeholder="name@company.com"
                                        className="pl-10"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        {...register('password')}
                                        type="password"
                                        placeholder="Create password"
                                        className="pl-10"
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-destructive">{errors.password.message}</p>
                                )}
                            </div>

                            <div className="flex items-start space-x-2 pt-2">
                                <input
                                    id="terms"
                                    type="checkbox"
                                    {...register('terms')}
                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
                                    I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                                </label>
                            </div>
                            {errors.terms && (
                                <p className="text-sm text-destructive">{errors.terms.message}</p>
                            )}

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
                                loading={loading}
                            >
                                Create Account
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center border-t bg-slate-50/50 p-6">
                        <div className="text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
                                Sign in
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    )
}
