import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import { Users, ClipboardList, TrendingUp, Trophy, Plus, Target } from 'lucide-react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { dashboardRepository, type DashboardStats, type RankingUser, type ProgressData } from '../repositories/DashboardRepository';

export const ManagerDashboard: React.FC = () => {
    const { profile, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [ranking, setRanking] = useState<RankingUser[]>([]);
    const [progressData, setProgressData] = useState<ProgressData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (profile?.organization_id && user?.id) {
                try {
                    const [statsData, rankingData, progress] = await Promise.all([
                        dashboardRepository.getManagerStats(profile.organization_id, user.id),
                        dashboardRepository.getRanking(profile.organization_id),
                        dashboardRepository.getProgress(profile.organization_id, user.id)
                    ]);
                    setStats(statsData);
                    setRanking(rankingData);
                    setProgressData(progress);
                } catch (error) {
                    console.error('Error fetching dashboard data:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [profile, user]);

    const statsCards = [
        { title: 'Clientes Ativos', value: stats?.activeClients || 0, sub: 'Total na organização', change: '', icon: Users, color: 'bg-teal-50 text-teal-600' },
        { title: 'Avaliações Pendentes', value: stats?.pendingAssessments || 0, sub: 'Aguardando conclusão', change: '', icon: ClipboardList, color: 'bg-yellow-50 text-yellow-600' },
        { title: 'Taxa de Conclusão', value: `${stats?.completionRate || 0}%`, sub: 'Geral', change: '', icon: TrendingUp, color: 'bg-slate-50 text-slate-600' },
        { title: 'Conquistas', value: `${stats?.achievementsCount || 0}/${stats?.totalAchievements || 0}`, sub: 'Desbloqueadas', change: '', icon: Trophy, color: 'bg-orange-50 text-orange-600' },
    ];

    const CircularProgress = ({ value, label, color }: { value: number, label: string, color: string }) => {
        const data = [{ value: value }, { value: 100 - value }];
        return (
            <div className="flex flex-col items-center justify-center">
                <div className="h-32 w-32 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={60}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                cornerRadius={10}
                            >
                                <Cell key="val" fill={color} />
                                <Cell key="bg" fill="#f1f5f9" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-slate-900">{value}%</span>
                    </div>
                </div>
                <p className="text-sm text-slate-500 text-center mt-2 max-w-[100px]">{label}</p>
            </div>
        );
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-full min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-500 pb-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Olá, {profile?.full_name?.split(' ')[0] || 'Gestor'}! 👋
                        </h1>
                        <p className="text-slate-500">Veja o progresso da sua equipe hoje</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200">
                            <Target className="mr-2 h-4 w-4" />
                            Ver Metas
                        </Button>
                        <Button className="bg-[#0f5156] hover:bg-[#0a3d41] text-white">
                            <Plus className="mr-2 h-4 w-4" />
                            Nova Avaliação
                        </Button>
                    </div>
                </div>

                {/* Level Card */}
                <Card className="border-none shadow-sm bg-white overflow-hidden relative">
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            {/* Level Badge */}
                            <div className="relative">
                                <div className="w-20 h-20 bg-yellow-400 rounded-2xl rotate-3 flex items-center justify-center shadow-lg shadow-yellow-400/20">
                                    <span className="text-3xl font-bold text-yellow-900 -rotate-3">{profile?.level || 1}</span>
                                </div>
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#0f5156] rounded-full flex items-center justify-center border-2 border-white">
                                    <Trophy size={12} className="text-white" />
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="flex-1 w-full">
                                <div className="flex justify-between items-end mb-2">
                                    <h3 className="text-lg font-bold text-slate-900">Nível {profile?.level || 1}</h3>
                                    <span className="text-yellow-600 font-bold">⚡ {profile?.points || 0} pts</span>
                                </div>
                                <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#0f5156] rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(((profile?.current_xp || 0) / (profile?.next_level_xp || 1000)) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between mt-2 text-xs font-medium text-slate-400">
                                    <span>{profile?.current_xp || 0} / {profile?.next_level_xp || 1000} XP</span>
                                    <span>{(profile?.next_level_xp || 1000) - (profile?.current_xp || 0)} XP para o próximo nível</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statsCards.map((stat, index) => (
                        <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                                        <h3 className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                                    </div>
                                    <div className={`p-3 rounded-xl ${stat.color}`}>
                                        <stat.icon size={20} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-slate-400">{stat.sub}</span>
                                    {stat.change && (
                                        <span className="text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded">
                                            {stat.change}
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Progress Overview */}
                    <Card className="lg:col-span-2 border-none shadow-sm">
                        <CardContent className="p-8">
                            <h3 className="text-lg font-bold text-slate-900 mb-8">Visão Geral do Progresso</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {progressData.map((item, index) => (
                                    <CircularProgress key={index} value={item.value} label={item.name} color={item.color} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ranking */}
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-slate-900">Ranking</h3>
                                <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full">Top 5</span>
                            </div>
                            <div className="space-y-4">
                                {ranking.length === 0 ? (
                                    <p className="text-sm text-slate-500 text-center py-4">Nenhum dado de ranking disponível.</p>
                                ) : (
                                    ranking.map((user, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${user.color}`}>
                                                    {user.avatar}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{user.name}</p>
                                                    <p className="text-xs text-slate-500">{user.points}</p>
                                                </div>
                                            </div>
                                            {user.trend === 'up' && <TrendingUp size={16} className="text-green-500" />}
                                            {user.trend === 'down' && <TrendingUp size={16} className="text-red-500 rotate-180" />}
                                            {user.trend === 'neutral' && <div className="w-4 h-0.5 bg-slate-300"></div>}
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Pending Tasks Header (Placeholder for bottom section) */}
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">Tarefas Pendentes</h3>
                    <Button variant="ghost" className="text-slate-500 hover:text-slate-900">Ver todas</Button>
                </div>
            </div>
        </DashboardLayout>
    );
};

