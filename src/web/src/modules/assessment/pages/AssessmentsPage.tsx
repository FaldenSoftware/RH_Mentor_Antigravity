import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Search, Filter, Plus, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { assignmentRepository, type Assignment, type AssignmentStats } from '../repositories/AssignmentRepository';
import { NewAssessmentModal } from '../components/NewAssessmentModal';

export const AssessmentsPage: React.FC = () => {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [stats, setStats] = useState<AssignmentStats | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        if (profile?.organization_id) {
            try {
                const [assignmentsData, statsData] = await Promise.all([
                    assignmentRepository.listByOrganization(profile.organization_id),
                    assignmentRepository.getAssignmentStats(profile.organization_id)
                ]);
                setAssignments(assignmentsData.data || []);
                setStats(statsData);
                setFilteredAssignments(assignmentsData.data || []);
            } catch (error) {
                console.error('Error fetching assessments data:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, [profile]);

    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = assignments.filter(a =>
            a.profile?.full_name?.toLowerCase().includes(lowerTerm) ||
            a.test?.title?.toLowerCase().includes(lowerTerm)
        );
        setFilteredAssignments(filtered);
    }, [searchTerm, assignments]);

    const statCards = [
        { title: 'Total de Avaliações', value: stats?.total || 0, icon: FileText, color: 'bg-slate-50 text-slate-600' },
        { title: 'Pendentes', value: stats?.pending || 0, icon: Clock, color: 'bg-yellow-50 text-yellow-600' },
        { title: 'Concluídas', value: stats?.completed || 0, icon: CheckCircle, color: 'bg-teal-50 text-teal-600' },
    ];

    const getStatusBadge = (status: string) => {
        if (status === 'completed') {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">Concluída</span>;
        }
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pendente</span>;
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
                        <h1 className="text-2xl font-bold text-slate-900">Avaliações</h1>
                        <p className="text-slate-500">Gerencie e acompanhe as avaliações da sua equipe</p>
                    </div>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#0f5156] hover:bg-[#0a3d41] text-white"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Avaliação
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {statCards.map((stat, index) => (
                        <Card key={index} className="border-none shadow-sm">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className={`p-3 rounded-xl ${stat.color}`}>
                                    <stat.icon size={24} />
                                </div>
                                <div className="text-right">
                                    <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
                                    <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Actions Bar */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                            placeholder="Buscar por nome ou teste..."
                            className="pl-10 bg-slate-50 border-slate-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="w-full md:w-auto bg-white hover:bg-slate-50 text-slate-700 border-slate-200">
                        <Filter className="mr-2 h-4 w-4" />
                        Filtros
                    </Button>
                </div>

                {/* Assignments List */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Líder</th>
                                    <th className="px-6 py-4">Teste</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Data de Envio</th>
                                    <th className="px-6 py-4">Conclusão</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredAssignments.length > 0 ? (
                                    filteredAssignments.map((assignment) => (
                                        <tr key={assignment.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[#0f5156] flex items-center justify-center text-white text-xs font-bold">
                                                        {assignment.profile?.avatar_url ? (
                                                            <img src={assignment.profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                                        ) : (
                                                            assignment.profile?.full_name?.substring(0, 2).toUpperCase() || 'NA'
                                                        )}
                                                    </div>
                                                    <div className="font-medium text-slate-900">
                                                        {assignment.profile?.full_name || 'Usuário Desconhecido'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {assignment.test?.title || 'Teste Removido'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(assignment.status)}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {formatDate(assignment.assigned_at)}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {assignment.completed_at ? formatDate(assignment.completed_at) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="sm" className="text-[#0f5156] hover:text-[#0a3d41] hover:bg-teal-50">
                                                    Ver Detalhes
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <AlertCircle className="h-10 w-10 text-slate-300 mb-3" />
                                                <p>Nenhuma avaliação encontrada.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <NewAssessmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    fetchData(); // Refresh list
                }}
            />
        </DashboardLayout>
    );
};
