import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Download, BarChart2, PieChart, TrendingUp, Users } from 'lucide-react';
import { dashboardRepository } from '../../dashboard/repositories/DashboardRepository';
import { assignmentRepository } from '../../assessment/repositories/AssignmentRepository';
import { gamificationRepository } from '../../gamification/repositories/GamificationRepository';

export const ReportsPage: React.FC = () => {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalAssessments: 0,
        completionRate: 0,
        activeGoals: 0,
        achievementsUnlocked: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            if (profile?.organization_id && profile?.user_id) {
                try {
                    const [dashStats, assignStats, goals, unlocks] = await Promise.all([
                        dashboardRepository.getManagerStats(profile.organization_id, profile.user_id),
                        assignmentRepository.getAssignmentStats(profile.organization_id),
                        gamificationRepository.getGoals(profile.organization_id),
                        gamificationRepository.getRecentUnlocks(profile.organization_id, 100) // Fetch more for stats
                    ]);

                    setStats({
                        totalAssessments: assignStats.total,
                        completionRate: dashStats.completionRate,
                        activeGoals: goals.filter(g => g.status === 'active').length,
                        achievementsUnlocked: unlocks.length
                    });
                } catch (error) {
                    console.error('Error fetching reports data:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [profile]);

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
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Relatórios</h1>
                        <p className="text-slate-500">Análise detalhada do desempenho da sua equipe</p>
                    </div>
                    <Button variant="outline" className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200">
                        <Download className="mr-2 h-4 w-4" />
                        Exportar PDF
                    </Button>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                                    <BarChart2 size={24} />
                                </div>
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900">{stats.totalAssessments}</h3>
                            <p className="text-sm font-medium text-slate-500">Avaliações Totais</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-teal-50 text-teal-600">
                                    <PieChart size={24} />
                                </div>
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+5%</span>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900">{stats.completionRate}%</h3>
                            <p className="text-sm font-medium text-slate-500">Taxa de Conclusão</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                                    <TrendingUp size={24} />
                                </div>
                                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">0%</span>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900">{stats.activeGoals}</h3>
                            <p className="text-sm font-medium text-slate-500">Metas Ativas</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                                    <Users size={24} />
                                </div>
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+8%</span>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900">{stats.achievementsUnlocked}</h3>
                            <p className="text-sm font-medium text-slate-500">Conquistas Desbloqueadas</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Area (Mocked for visual structure) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-slate-900">Evolução de Avaliações</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-end justify-between gap-2 px-4 pb-4 border-b border-slate-100">
                                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                    <div key={i} className="w-full bg-teal-100 rounded-t-lg relative group">
                                        <div
                                            className="absolute bottom-0 w-full bg-[#0f5156] rounded-t-lg transition-all duration-500 group-hover:bg-[#0a3d41]"
                                            style={{ height: `${h}%` }}
                                        ></div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between text-xs text-slate-400 mt-2 px-2">
                                <span>Seg</span>
                                <span>Ter</span>
                                <span>Qua</span>
                                <span>Qui</span>
                                <span>Sex</span>
                                <span>Sab</span>
                                <span>Dom</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-slate-900">Status das Metas</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center h-72">
                            <div className="relative w-48 h-48 rounded-full border-[16px] border-slate-100 flex items-center justify-center">
                                <div className="absolute inset-0 rounded-full border-[16px] border-[#0f5156] border-l-transparent border-b-transparent rotate-45"></div>
                                <div className="text-center">
                                    <span className="block text-3xl font-bold text-slate-900">75%</span>
                                    <span className="text-xs text-slate-500">Atingidas</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};
