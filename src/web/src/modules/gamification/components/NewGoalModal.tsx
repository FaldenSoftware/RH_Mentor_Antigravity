import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { gamificationRepository } from '../repositories/GamificationRepository';
import { clientRepository, type Client } from '../../clients/repositories/ClientRepository';
import { useAuth } from '../../auth/contexts/AuthContext';

interface NewGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const NewGoalModal: React.FC<NewGoalModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [formData, setFormData] = useState({
        userId: '',
        title: '',
        targetValue: 100,
        deadline: '',
        rewardPoints: 50
    });

    useEffect(() => {
        if (isOpen && profile?.organization_id) {
            loadClients();
        }
    }, [isOpen, profile]);

    const loadClients = async () => {
        try {
            if (profile?.organization_id) {
                const data = await clientRepository.getClients(profile.organization_id);
                setClients(data);
            }
        } catch (error) {
            console.error('Error loading clients:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.userId) return;

        setLoading(true);
        try {
            await gamificationRepository.createGoal({
                user_id: formData.userId,
                title: formData.title,
                target_value: Number(formData.targetValue),
                deadline: formData.deadline,
                reward_points: Number(formData.rewardPoints)
            });
            onSuccess();
            onClose();
            setFormData({
                userId: '',
                title: '',
                targetValue: 100,
                deadline: '',
                rewardPoints: 50
            });
        } catch (error) {
            console.error('Error creating goal:', error);
            alert('Erro ao criar meta. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <h3 className="font-bold text-lg text-slate-900">Nova Meta</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Líder Responsável
                        </label>
                        <select
                            className="w-full rounded-lg border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                            value={formData.userId}
                            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                            required
                        >
                            <option value="">Selecione um líder...</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>
                                    {client.full_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Título da Meta
                        </label>
                        <Input
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ex: Concluir Curso de Liderança"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Meta (Valor)
                            </label>
                            <Input
                                type="number"
                                required
                                min="1"
                                value={formData.targetValue}
                                onChange={(e) => setFormData({ ...formData, targetValue: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Recompensa (XP)
                            </label>
                            <Input
                                type="number"
                                required
                                min="0"
                                value={formData.rewardPoints}
                                onChange={(e) => setFormData({ ...formData, rewardPoints: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Prazo
                        </label>
                        <Input
                            type="date"
                            required
                            value={formData.deadline}
                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex gap-3 justify-end">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[#0f5156] hover:bg-[#0a3d41] text-white"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="mr-2 animate-spin" />
                                    Criando...
                                </>
                            ) : (
                                'Criar Meta'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
