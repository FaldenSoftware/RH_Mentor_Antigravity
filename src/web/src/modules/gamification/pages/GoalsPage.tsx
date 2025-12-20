import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Plus, Target } from 'lucide-react';
import { gamificationRepository, type Goal } from '../repositories/GamificationRepository';
import { NewGoalModal } from '../components/NewGoalModal';

export const GoalsPage: React.FC = () => {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        if (profile?.organization_id) {
            try {
                const data = await gamificationRepository.getGoals(profile.organization_id);
                setGoals(data);
            } catch (error) {
                console.error('Error fetching goals:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, [profile]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-teal-100 text-teal-700';
            case 'missed': return 'bg-red-100 text-red-700';
            default: return 'bg-blue-100 text-blue-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return 'Concluída';
            case 'missed': return 'Não Atingida';
            default: return 'Em Andamento';
        }
    };

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateString));
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
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Metas</h1>
                        <p className="text-slate-500">Defina e acompanhe os objetivos da sua equipe</p>
                    </div>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#0f5156] hover:bg-[#0a3d41] text-white"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Meta
                    </Button>
                </div>

                {/* Goals List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.length > 0 ? (
                        goals.map((goal) => {
                            const progress = Math.min(100, Math.round((goal.current_value / goal.target_value) * 100));
                            return (
                                <Card key={goal.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                                    {goal.profile?.avatar_url ? (
                                                        <img src={goal.profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        goal.profile?.full_name?.substring(0, 2).toUpperCase() || 'U'
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-sm">{goal.profile?.full_name}</h3>
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getStatusColor(goal.status)}`}>
                                                        {getStatusLabel(goal.status)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs text-slate-400 block">Prazo</span>
                                                <span className="text-xs font-medium text-slate-700">{formatDate(goal.deadline)}</span>
                                            </div>
                                        </div>

                                        <h4 className="font-bold text-slate-800 mb-2">{goal.title}</h4>

                                        <div className="mb-4">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-slate-500">Progresso</span>
                                                <span className="font-bold text-slate-700">{progress}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-[#0f5156] rounded-full transition-all duration-500"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-xs mt-1 text-slate-400">
                                                <span>{goal.current_value}</span>
                                                <span>{goal.target_value}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs font-medium text-amber-600 bg-amber-50 p-2 rounded-lg">
                                            <Target size={14} />
                                            Recompensa: {goal.reward_points} XP
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-slate-200">
                            <Target className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900">Nenhuma meta definida</h3>
                            <p className="text-slate-500 mb-4">Crie metas para engajar sua equipe.</p>
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                variant="outline"
                            >
                                Criar Primeira Meta
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <NewGoalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
            />
        </DashboardLayout>
    );
};
