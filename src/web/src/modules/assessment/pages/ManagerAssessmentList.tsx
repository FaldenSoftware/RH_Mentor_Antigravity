import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import { testRepository, type Test } from '../repositories/TestRepository';
import { assignmentRepository } from '../repositories/AssignmentRepository';
import { profileRepository, type Profile } from '../../auth/repositories/ProfileRepository';
import { Loader2, UserPlus, Check } from 'lucide-react';

export default function ManagerAssessmentList() {
    const { profile } = useAuth();
    const [tests, setTests] = useState<Test[]>([]);
    const [members, setMembers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTest, setSelectedTest] = useState<string | null>(null);
    const [assigning, setAssigning] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [profile?.organization_id]);

    const loadData = async () => {
        if (!profile?.organization_id) return;

        setLoading(true);
        const [testsRes, membersRes] = await Promise.all([
            testRepository.list(),
            profileRepository.listByOrganization(profile.organization_id)
        ]);

        if (testsRes.data) setTests(testsRes.data);
        if (membersRes.data) setMembers(membersRes.data);

        setLoading(false);
    };

    const handleAssign = async (memberId: string) => {
        if (!selectedTest || !profile?.organization_id) return;

        setAssigning(true);
        const { error } = await assignmentRepository.create(memberId, selectedTest, profile.organization_id);

        if (error) {
            alert('Failed to assign test: ' + error.message);
        } else {
            setSuccessMsg('Test assigned successfully!');
            setTimeout(() => {
                setSuccessMsg(null);
                setSelectedTest(null);
            }, 2000);
        }
        setAssigning(false);
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900">Assessments Library</h2>
            <p className="mt-1 text-sm text-gray-500">Assign tests to your team members.</p>

            {successMsg && (
                <div className="mt-4 bg-green-50 p-4 rounded-md flex items-center">
                    <Check className="h-5 w-5 text-green-400 mr-2" />
                    <span className="text-green-800">{successMsg}</span>
                </div>
            )}

            <div className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {tests.map((test) => (
                    <div key={test.id} className="bg-white overflow-hidden shadow rounded-lg flex flex-col">
                        <div className="px-4 py-5 sm:p-6 flex-1">
                            <h3 className="text-lg font-medium text-gray-900">{test.title}</h3>
                            <p className="mt-1 text-sm text-gray-500">{test.description}</p>
                        </div>
                        <div className="bg-gray-50 px-4 py-4 sm:px-6">
                            <button
                                onClick={() => setSelectedTest(test.id)}
                                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                <UserPlus className="mr-2 h-4 w-4" />
                                Assign to Member
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal for member selection */}
            {selectedTest && (
                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setSelectedTest(null)}></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                            Select Member
                                        </h3>
                                        <div className="mt-4">
                                            {members.length === 0 ? (
                                                <p className="text-sm text-gray-500">No members found. Invite leaders first.</p>
                                            ) : (
                                                <ul className="divide-y divide-gray-200">
                                                    {members.map((member) => (
                                                        <li key={member.id} className="py-3 flex justify-between items-center">
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {/* We don't have name/email in profile yet, only user_id. 
                                                                    Ideally we fetch auth data or store email in profile.
                                                                    For now displaying ID (not ideal UX but functional for v1) */}
                                                                User {member.user_id.substring(0, 8)}...
                                                            </span>
                                                            <button
                                                                onClick={() => handleAssign(member.user_id)}
                                                                disabled={assigning}
                                                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 disabled:opacity-50"
                                                            >
                                                                {assigning ? <Loader2 className="animate-spin h-3 w-3" /> : 'Assign'}
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setSelectedTest(null)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
