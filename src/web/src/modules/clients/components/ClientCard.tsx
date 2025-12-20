import React from 'react';
import { Mail, Phone, TrendingUp, Calendar, Clock } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card';
import { type Client } from '../repositories/ClientRepository';

interface ClientCardProps {
    client: Client;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-teal-100 text-teal-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'inactive': return 'bg-slate-100 text-slate-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'Ativo';
            case 'pending': return 'Pendente';
            case 'inactive': return 'Inativo';
            default: return status;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(date);
    };

    // Calculate time since active (mock logic for demo)
    const getTimeActive = () => {
        if (client.status === 'active') return 'Ativo há 2h';
        if (client.status === 'pending') return 'Pendente há 5h';
        return 'Inativo há 3 dias';
    };

    return (
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardContent className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0f5156] flex items-center justify-center text-white font-bold text-sm">
                            {client.avatar_url ? (
                                <img src={client.avatar_url} alt={client.full_name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                client.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">{client.full_name}</h3>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getStatusColor(client.status)}`}>
                                {getStatusLabel(client.status)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Mail size={14} />
                        <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Phone size={14} />
                        <span>{client.phone}</span>
                    </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                    <div className="flex justify-between items-end mb-1">
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-slate-900">{client.progress}%</span>
                            <span className="text-xs text-slate-500 font-medium">Progresso</span>
                        </div>
                        {client.trend === 'up' && (
                            <div className="flex items-center text-green-500 text-xs font-bold">
                                <TrendingUp size={14} className="mr-1" />
                                +12%
                            </div>
                        )}
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#0f5156] rounded-full transition-all duration-500"
                            style={{ width: `${client.progress}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{client.tasks_completed}/{client.total_tasks} tarefas</p>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-100 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>Desde {formatDate(client.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{getTimeActive()}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
