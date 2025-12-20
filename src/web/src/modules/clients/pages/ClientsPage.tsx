import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Search, Filter, Plus, Users, UserCheck, Clock, UserX } from 'lucide-react';
import { clientRepository, type Client, type ClientStats } from '../repositories/ClientRepository';
import { ClientCard } from '../components/ClientCard';

export const ClientsPage: React.FC = () => {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState<Client[]>([]);
    const [stats, setStats] = useState<ClientStats | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredClients, setFilteredClients] = useState<Client[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (profile?.organization_id) {
                try {
                    const [clientsData, statsData] = await Promise.all([
                        clientRepository.getClients(profile.organization_id),
                        clientRepository.getClientStats(profile.organization_id)
                    ]);
                    setClients(clientsData);
                    setStats(statsData);
                    setFilteredClients(clientsData);
                } catch (error) {
                    console.error('Error fetching clients data:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [profile]);

    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = clients.filter(client =>
            client.full_name.toLowerCase().includes(lowerTerm) ||
            client.email.toLowerCase().includes(lowerTerm)
        );
        setFilteredClients(filtered);
    }, [searchTerm, clients]);

    const statCards = [
        { title: 'Total de Clientes', value: stats?.total || 0, icon: Users, color: 'bg-slate-50 text-slate-600' },
        { title: 'Ativos', value: stats?.active || 0, icon: UserCheck, color: 'bg-teal-50 text-teal-600' },
        { title: 'Pendentes', value: stats?.pending || 0, icon: Clock, color: 'bg-yellow-50 text-yellow-600' },
        { title: 'Inativos', value: stats?.inactive || 0, icon: UserX, color: 'bg-slate-50 text-slate-400' },
    ];

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
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
                    <p className="text-slate-500">Gerencie seus clientes e acompanhe o progresso de cada um</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                            placeholder="Buscar por nome ou email..."
                            className="pl-10 bg-slate-50 border-slate-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <Button variant="outline" className="flex-1 md:flex-none bg-white hover:bg-slate-50 text-slate-700 border-slate-200">
                            <Filter className="mr-2 h-4 w-4" />
                            Filtros
                        </Button>
                        <Button className="flex-1 md:flex-none bg-[#0f5156] hover:bg-[#0a3d41] text-white">
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Cliente
                        </Button>
                    </div>
                </div>

                {/* Results Count */}
                <p className="text-sm text-slate-500">
                    Mostrando {filteredClients.length} de {clients.length} clientes
                </p>

                {/* Clients Grid */}
                {filteredClients.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredClients.map((client) => (
                            <ClientCard key={client.id} client={client} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                        <Users className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">Nenhum cliente encontrado</h3>
                        <p className="text-slate-500">Tente ajustar sua busca ou filtros.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};
