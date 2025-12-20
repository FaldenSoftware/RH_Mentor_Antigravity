import React, { useState } from 'react';
import { X, Loader2, Trophy, Star, Medal, Award, Crown } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { gamificationRepository } from '../repositories/GamificationRepository';

interface NewAchievementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const ICONS = [
    { name: 'Trophy', icon: Trophy },
    { name: 'Star', icon: Star },
    { name: 'Medal', icon: Medal },
    { name: 'Award', icon: Award },
    { name: 'Crown', icon: Crown },
];

export const NewAchievementModal: React.FC<NewAchievementModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        points: 100,
        icon: 'Trophy'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await gamificationRepository.createAchievement({
                title: formData.title,
                description: formData.description,
                points: Number(formData.points),
                icon: formData.icon
            });
            onSuccess();
            onClose();
            setFormData({ title: '', description: '', points: 100, icon: 'Trophy' });
        } catch (error) {
            console.error('Error creating achievement:', error);
            alert('Erro ao criar conquista. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <h3 className="font-bold text-lg text-slate-900">Nova Conquista</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Título
                        </label>
                        <Input
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ex: Mestre das Vendas"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Descrição
                        </label>
                        <textarea
                            required
                            className="w-full rounded-lg border-slate-200 focus:border-teal-500 focus:ring-teal-500 min-h-[80px]"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Ex: Atingiu 1 milhão em vendas..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Pontos (XP)
                        </label>
                        <Input
                            type="number"
                            required
                            min="0"
                            value={formData.points}
                            onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">
                            Ícone
                        </label>
                        <div className="flex gap-3 justify-center">
                            {ICONS.map((item) => {
                                const Icon = item.icon;
                                const isSelected = formData.icon === item.name;
                                return (
                                    <button
                                        key={item.name}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, icon: item.name })}
                                        className={`p-3 rounded-xl transition-all ${isSelected
                                                ? 'bg-[#0f5156] text-white shadow-md scale-110'
                                                : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                            }`}
                                    >
                                        <Icon size={24} />
                                    </button>
                                );
                            })}
                        </div>
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
                                'Criar Conquista'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
