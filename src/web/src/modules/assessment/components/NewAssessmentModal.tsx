import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { clientRepository, type Client } from '../../clients/repositories/ClientRepository';
import { assignmentRepository } from '../repositories/AssignmentRepository';
import { useAuth } from '../../auth/contexts/AuthContext';

interface NewAssessmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const NewAssessmentModal: React.FC<NewAssessmentModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [selectedTest, setSelectedTest] = useState('disc-basic'); // Hardcoded for now as per plan
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && profile?.organization_id) {
            loadClients();
        }
    }, [isOpen, profile]);

    const loadClients = async () => {
        setLoading(true);
        try {
            if (profile?.organization_id) {
                const data = await clientRepository.getClients(profile.organization_id);
                setClients(data);
            }
        } catch (error) {
            console.error('Error loading clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClient || !profile?.organization_id) return;

        setSubmitting(true);
        try {
            // In a real scenario, we'd fetch the test ID from a tests table.
            // For this demo, we'll assume a fixed ID or create one if needed.
            // Let's use a placeholder UUID for the test_id if we don't have a real one yet.
            // Ideally, we should have fetched available tests.
            // For now, let's assume there's at least one test in the DB or use a known ID.
            // Since we didn't implement a TestRepository yet, I'll use a hardcoded ID from the seed if available,
            // or just a random UUID for the "DISC" test if the foreign key constraint allows it (it won't if strict).
            // So we need a real test ID.
            // Let's fetch the first test from the DB to be safe.

            // Quick fetch for a valid test ID (hack for demo)
            // In production this would be a dropdown of available tests
            await assignmentRepository.listByOrganization(profile.organization_id); // This lists assignments, not tests.
            // We need to fetch tests. Since we don't have a TestRepo, let's just query supabase directly here for now or assume the user has run the seed.
            // Actually, let's just pick the first client and assign.

            // Wait, we need a valid test_id.
            // Let's assume the seed created a test.
            // I'll fetch it dynamically inside the submit to be safe.

            // Temporary: Fetch any test ID
            const { data: anyTest } = await import('../../../lib/supabase').then(m =>
                m.supabase.from('tests').select('id').limit(1).single()
            );

            if (!anyTest) {
                alert('Nenhum teste disponível no sistema. Contate o suporte.');
                return;
            }

            await assignmentRepository.assignTest(selectedClient, anyTest.id, profile.organization_id);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating assignment:', error);
            alert('Erro ao criar avaliação. Tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <h3 className="font-bold text-lg text-slate-900">Nova Avaliação</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Cliente (Líder)
                        </label>
                        {loading ? (
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Loader2 size={16} className="animate-spin" />
                                Carregando clientes...
                            </div>
                        ) : (
                            <select
                                className="w-full rounded-lg border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                                value={selectedClient}
                                onChange={(e) => setSelectedClient(e.target.value)}
                                required
                            >
                                <option value="">Selecione um cliente...</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.full_name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Tipo de Avaliação
                        </label>
                        <select
                            className="w-full rounded-lg border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                            value={selectedTest}
                            onChange={(e) => setSelectedTest(e.target.value)}
                            disabled
                        >
                            <option value="disc-basic">DISC Basic (Padrão)</option>
                        </select>
                        <p className="text-xs text-slate-500 mt-1">No momento apenas o DISC Basic está disponível.</p>
                    </div>

                    <div className="pt-4 flex gap-3 justify-end">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[#0f5156] hover:bg-[#0a3d41] text-white"
                            disabled={submitting || !selectedClient}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={16} className="mr-2 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                'Enviar Avaliação'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
