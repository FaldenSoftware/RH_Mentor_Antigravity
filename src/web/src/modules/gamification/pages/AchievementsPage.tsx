import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Plus, Trophy, Star, Medal, Award, Crown, Users } from 'lucide-react';
import { gamificationRepository, type Achievement, type UserAchievement } from '../repositories/GamificationRepository';
import { NewAchievementModal } from '../components/NewAchievementModal';

const ICON_MAP: Record<string, React.ElementType> = {
    'Trophy': Trophy,
    'Star': Star,
    'Medal': Medal,
    'Award': Award,
    'Crown': Crown,
};

export const AchievementsPage: React.FC = () => {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [recentUnlocks, setRecentUnlocks] = useState<UserAchievement[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        if (profile?.organization_id) {
            try {
                const [achievementsData, unlocksData] = await Promise.all([
                    gamificationRepository.getAchievements(),
                    gamificationRepository.getRecentUnlocks(profile.organization_id)
                ]);
                setAchievements(achievementsData);
                setRecentUnlocks(unlocksData);
            } catch (error) {
                console.error('Error fetching achievements data:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
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
                        <h1 className="text-2xl font-bold text-slate-900">Conquistas</h1>
                        <p className="text-slate-500">Gerencie as medalhas e reconhecimentos da sua equipe</p>
                    </div>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#0f5156] hover:bg-[#0a3d41] text-white"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Conquista
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Achievements Grid */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Trophy className="text-[#0f5156]" size={20} />
                            Conquistas Disponíveis
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {achievements.map((achievement) => {
                                const Icon = ICON_MAP[achievement.icon] || Trophy;
                                return (
                                    <Card key={achievement.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                                        <CardContent className="p-6 flex items-start gap-4">
                                            <div className="p-3 rounded-xl bg-amber-100 text-amber-600">
                                                <Icon size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900">{achievement.title}</h3>
                                                <p className="text-sm text-slate-500 mb-2">{achievement.description}</p>
                                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold">
                                                    +{achievement.points} XP
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sidebar: Recent Unlocks */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Users className="text-[#0f5156]" size={20} />
                            Desbloqueios Recentes
                        </h2>
                        <Card className="border-none shadow-sm bg-white">
                            <CardContent className="p-0">
                                {recentUnlocks.length > 0 ? (
                                    <div className="divide-y divide-slate-100">
                                        {recentUnlocks.map((unlock) => {
                                            const Icon = ICON_MAP[unlock.achievement?.icon || 'Trophy'] || Trophy;
                                            return (
                                                <div key={unlock.id} className="p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs overflow-hidden">
                                                        {unlock.profile?.avatar_url ? (
                                                            <img src={unlock.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            unlock.profile?.full_name?.substring(0, 2).toUpperCase() || 'U'
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-slate-900 truncate">
                                                            {unlock.profile?.full_name}
                                                        </p>
                                                        <p className="text-xs text-slate-500 truncate">
                                                            Desbloqueou: <span className="text-[#0f5156] font-medium">{unlock.achievement?.title}</span>
                                                        </p>
                                                    </div>
                                                    <div className="text-amber-500">
                                                        <Icon size={16} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-slate-400 text-sm">
                                        Nenhuma conquista recente.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <NewAchievementModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
            />
        </DashboardLayout>
    );
};
