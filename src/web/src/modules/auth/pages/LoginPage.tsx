import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Layers } from 'lucide-react'
import { motion } from 'framer-motion'
import { authRepository } from '../repositories/AuthRepository'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'


const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
    const navigate = useNavigate()

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginForm) => {
        setLoading(true)
        setError(null)

        try {
            const { error: authError } = await authRepository.signInWithPassword(
                data.email,
                data.password
            )

            if (authError) {
                throw authError
            }

            navigate('/dashboard')
        } catch (err: any) {
            setError(err.message || 'Falha ao entrar')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white p-4">

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-[480px] space-y-8"
            >
                {/* Header Section */}
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="bg-teal-50 p-3 rounded-xl">
                            <Layers className="h-10 w-10 text-teal-700" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-slate-900">RH Master</h1>
                        <p className="text-slate-500 text-sm">
                            Transforme sua mentoria em resultados mensuráveis
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('login')}
                        className={`py-2.5 text-sm font-medium rounded-md transition-all ${activeTab === 'login'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('register')
                            navigate('/register-manager')
                        }}
                        className={`py-2.5 text-sm font-medium rounded-md transition-all ${activeTab === 'register'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Cadastro
                    </button>
                </div>

                {/* Main Content */}
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-semibold text-slate-900">Bem-vindo de volta</h2>
                        <p className="text-sm text-slate-500">
                            Entre com seu nome de usuário e senha para acessar sua conta
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">
                                Nome de usuário
                            </label>
                            <Input
                                {...register('email')}
                                type="email"
                                placeholder="Seu nome de usuário"
                                className="h-12 px-4 bg-white border-slate-200 focus-visible:border-teal-600 focus-visible:ring-teal-600"
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-slate-700">
                                    Senha
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-teal-700 hover:text-teal-800 font-medium"
                                >
                                    Esqueceu a senha?
                                </Link>
                            </div>
                            <Input
                                {...register('password')}
                                type="password"
                                className="h-12 px-4 bg-white border-slate-200 focus-visible:border-teal-600 focus-visible:ring-teal-600"
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        {error && (
                            <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold bg-[#0f5156] hover:bg-[#0a3d41] text-white"
                            loading={loading}
                        >
                            Entrar
                        </Button>
                    </form>

                    <div className="text-center">
                        <p className="text-sm text-slate-500">
                            Você é um cliente?{' '}
                            <Link to="/login-client" className="text-teal-700 font-medium hover:underline">
                                Entre com as credenciais enviadas pelo seu mentor
                            </Link>
                        </p>
                    </div>

                    {/* Test Users Box */}
                    <div className="bg-teal-50/50 border border-teal-100 rounded-lg p-4">
                        <p className="text-sm font-semibold text-teal-900 text-center mb-3">
                            Usuários para teste:
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <p className="font-medium text-teal-900">Mentor:</p>
                                <p className="text-teal-700">admin</p>
                                <p className="text-teal-700">Senha: admin</p>
                            </div>
                            <div className="space-y-1">
                                <p className="font-medium text-teal-900">Cliente:</p>
                                <p className="text-teal-700">cliente</p>
                                <p className="text-teal-700">Senha: admin</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
