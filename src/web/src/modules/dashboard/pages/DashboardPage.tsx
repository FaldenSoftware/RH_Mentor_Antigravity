import { useState } from 'react';
import { Trophy, Star, Medal, Clock, ExternalLink } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState('ranking');

    return (
        <div className="space-y-8">
            {/* Alert Banner */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
                        <Clock size={18} />
                    </div>
                    <div>
                        <span className="font-semibold text-slate-900">Período de Avaliação</span>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            9 dias restantes
                        </span>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Seu período de avaliação gratuito termina em 11/05/2025. Assine agora para continuar acessando todos os recursos.
                        </p>
                    </div>
                </div>
                <Button className="bg-[#0f5156] hover:bg-[#0a3d41] text-white">
                    Assinar Agora
                    <ExternalLink size={16} className="ml-2" />
                </Button>
            </div>

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Gamificação</h1>
                <p className="text-slate-500 mt-1">
                    Acompanhe rankings, conquistas e desafios para motivar seus clientes
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Seus Pontos</p>
                            <h3 className="text-3xl font-bold text-slate-900">0</h3>
                            <p className="text-xs text-green-600 font-medium mt-2 flex items-center">
                                +0 pontos este mês
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                            <Star size={20} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-start justify-between">
                        <div className="w-full">
                            <p className="text-sm font-medium text-slate-500 mb-1">Seu Nível</p>
                            <h3 className="text-3xl font-bold text-slate-900">0</h3>
                            <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-teal-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                            </div>
                            <div className="flex justify-between mt-1">
                                <span className="text-xs text-slate-500">Progresso para nível 1</span>
                                <span className="text-xs text-slate-500">0%</span>
                            </div>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 ml-4">
                            <Trophy size={20} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Conquistas</p>
                            <h3 className="text-3xl font-bold text-slate-900">0/0</h3>
                            <p className="text-xs text-slate-500 mt-2">
                                Conquiste badges completando desafios
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                            <Medal size={20} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs & Content */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-50/50 px-6">
                    <div className="flex space-x-8">
                        {['Ranking', 'Badges', 'Desafios', 'Recompensas'].map((tab) => {
                            const id = tab.toLowerCase();
                            const isActive = activeTab === id;
                            return (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={`py-4 text-sm font-medium border-b-2 transition-colors ${isActive
                                        ? 'border-teal-600 text-teal-700'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                        }`}
                                >
                                    {tab}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-8 min-h-[400px]">
                    {activeTab === 'ranking' && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">Ranking de Clientes</h3>
                                <p className="text-sm text-slate-500">
                                    Os clientes com melhor desempenho nas atividades e testes
                                </p>
                            </div>

                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <Trophy className="h-8 w-8 text-slate-400" />
                                </div>
                                <h4 className="text-lg font-medium text-slate-900">Nenhum ranking disponível</h4>
                                <p className="text-slate-500 max-w-sm mt-2">
                                    Quando seus clientes completarem testes, eles aparecerão no ranking de desempenho.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab !== 'ranking' && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-slate-500">Funcionalidade em desenvolvimento.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
