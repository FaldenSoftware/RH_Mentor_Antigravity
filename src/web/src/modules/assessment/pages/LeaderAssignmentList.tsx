import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import { assignmentRepository, type Assignment } from '../repositories/AssignmentRepository';
import { Loader2, ClipboardList, ArrowRight } from 'lucide-react';

export default function LeaderAssignmentList() {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        if (!user) return;

        setLoading(true);
        const { data } = await assignmentRepository.listByLeader(user.id);
        if (data) {
            setAssignments(data);
        }
        setLoading(false);
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900">My Assessments</h2>
            <p className="mt-1 text-sm text-gray-500">Complete the pending assessments assigned to you.</p>

            <div className="mt-6 space-y-4">
                {assignments.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No pending assessments</h3>
                        <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
                    </div>
                ) : (
                    assignments.map((assignment) => (
                        <div key={assignment.id} className="bg-white shadow sm:rounded-lg p-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">{assignment.test?.title}</h3>
                                <p className="text-sm text-gray-500">Assigned on {new Date(assignment.assigned_at).toLocaleDateString()}</p>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                                {assignment.completed_at ? (
                                    <Link
                                        to={`/dashboard/result/${assignment.id}`}
                                        className="font-medium text-indigo-600 hover:text-indigo-500"
                                    >
                                        View Result
                                    </Link>
                                ) : (
                                    <Link
                                        to={`/dashboard/test/${assignment.id}`}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        Start Assessment
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
