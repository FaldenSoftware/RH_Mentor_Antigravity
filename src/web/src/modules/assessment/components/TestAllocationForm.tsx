import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { testRepository, type TestSummary } from '../repositories/TestRepository';
import { profileRepository, type Profile } from '../../auth/repositories/ProfileRepository';
import { assignmentRepository } from '../repositories/AssignmentRepository';
import { useAuth } from '../../auth/contexts/AuthContext'; // Assuming we have this
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface TestAllocationFormProps {
    onSuccess?: () => void;
}

interface AllocationFormData {
    testId: string;
    leaderIds: string[];
    deadline?: string;
}

export const TestAllocationForm: React.FC<TestAllocationFormProps> = ({ onSuccess }) => {
    const { profile } = useAuth();
    const [tests, setTests] = useState<TestSummary[]>([]);
    const [leaders, setLeaders] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<AllocationFormData>();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch tests
                const { data: testsData, error: testsError } = await testRepository.list(1, 100); // Fetching first 100 for dropdown
                if (testsError) throw testsError;
                setTests(testsData || []);

                // Fetch leaders
                if (profile?.organization_id) {
                    const { data: leadersData, error: leadersError } = await profileRepository.listByOrganization(profile.organization_id, 1, 100);
                    if (leadersError) throw leadersError;
                    setLeaders(leadersData || []);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [profile?.organization_id]);

    const onSubmit = async (data: AllocationFormData) => {
        if (!profile?.organization_id) return;
        setSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            // Create assignments for each selected leader
            const promises = data.leaderIds.map(leaderId =>
                assignmentRepository.create(leaderId, data.testId, profile.organization_id!)
            );

            await Promise.all(promises);

            setSuccess(true);
            reset();
            if (onSuccess) onSuccess();
        } catch (err: any) {
            setError(err.message || 'Failed to assign tests');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Allocate New Test</h3>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded mb-4 flex items-center gap-2">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 text-green-600 p-3 rounded mb-4 flex items-center gap-2">
                    <CheckCircle size={18} />
                    Test allocated successfully!
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Test</label>
                    <select
                        {...register('testId', { required: 'Test is required' })}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">-- Choose a test --</option>
                        {tests.map(test => (
                            <option key={test.id} value={test.id}>{test.title}</option>
                        ))}
                    </select>
                    {errors.testId && <span className="text-red-500 text-sm">{errors.testId.message}</span>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Leaders</label>
                    <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2">
                        {leaders.length === 0 ? (
                            <p className="text-gray-500 text-sm p-2">No leaders found in your organization.</p>
                        ) : (
                            leaders.map(leader => (
                                <div key={leader.user_id} className="flex items-center gap-2 p-1 hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        value={leader.user_id}
                                        {...register('leaderIds', { required: 'Select at least one leader' })}
                                        id={`leader-${leader.user_id}`}
                                        className="rounded text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor={`leader-${leader.user_id}`} className="text-sm text-gray-700 cursor-pointer w-full">
                                        {leader.email || `Leader ${leader.user_id.substring(0, 8)}...`}
                                    </label>
                                </div>
                            ))
                        )}
                    </div>
                    {errors.leaderIds && <span className="text-red-500 text-sm">{errors.leaderIds.message}</span>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadline (Optional)</label>
                    <input
                        type="date"
                        {...register('deadline')}
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-2"
                >
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Allocate Test'}
                </button>
            </form>
        </div>
    );
};
