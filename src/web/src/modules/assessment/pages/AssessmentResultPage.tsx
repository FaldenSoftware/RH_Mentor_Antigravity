import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resultRepository, type Result } from '../repositories/ResultRepository';
import { Loader2, ArrowLeft, BarChart2 } from 'lucide-react';

type DiscProfile = 'D' | 'I' | 'S' | 'C';
// ... (profiles definition skipped in replacement content for brevity if not changing, but I need to be careful with context)
// Actually I can't skip content in ReplacementContent easily without context.
// Let's just replace the top part.

const profiles: Record<DiscProfile, { title: string; description: string; color: string }> = {
    D: {
        title: 'Dominance',
        description: 'Direct, firm, strong-willed, force of character, result-oriented.',
        color: 'bg-red-500'
    },
    I: {
        title: 'Influence',
        description: 'Outgoing, enthusiastic, optimistic, high-spirited, lively.',
        color: 'bg-yellow-500'
    },
    S: {
        title: 'Steadiness',
        description: 'Even-tempered, accommodating, patient, humble, tactful.',
        color: 'bg-green-500'
    },
    C: {
        title: 'Conscientiousness',
        description: 'Analytical, reserved, precise, private, systematic.',
        color: 'bg-blue-500'
    }
};

export default function AssessmentResultPage() {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<Result | null>(null);

    useEffect(() => {
        if (assignmentId) {
            loadResult();
        }
    }, [assignmentId]);

    const loadResult = async () => {
        if (!assignmentId) return;
        setLoading(true);
        const { data, error } = await resultRepository.getByAssignmentId(assignmentId);

        if (error) {
            console.error('Error loading result:', error);
            alert('Failed to load result');
            navigate('/dashboard');
            return;
        }

        setResult(data);
        setLoading(false);
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>;
    }

    if (!result) {
        return <div className="text-center p-8">Result not found.</div>;
    }

    const scores = result.score as Record<string, number>;
    const maxScore = Math.max(...Object.values(scores));
    const dominantProfile = Object.keys(scores).find(key => scores[key] === maxScore) as DiscProfile;
    const profileData = profiles[dominantProfile];

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <button
                onClick={() => navigate('/dashboard/my-assessments')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Assessments
            </button>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Assessment Result</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">DISC Profile Analysis</p>
                    </div>
                    <BarChart2 className="h-8 w-8 text-indigo-600" />
                </div>

                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Chart / Scores */}
                        <div>
                            <h4 className="text-md font-medium text-gray-900 mb-4">Score Breakdown</h4>
                            <div className="space-y-4">
                                {(Object.keys(profiles) as DiscProfile[]).map(key => (
                                    <div key={key}>
                                        <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                                            <span>{profiles[key].title} ({key})</span>
                                            <span>{scores[key] || 0}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className={`h-2.5 rounded-full ${profiles[key].color}`}
                                                style={{ width: `${((scores[key] || 0) / 20) * 100}%` }} // Assuming max score per category is roughly 20 for visualization
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Dominant Profile */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h4 className="text-md font-medium text-gray-900 mb-2">Your Dominant Profile</h4>
                            <div className="flex items-center mb-4">
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${profileData.color}`}>
                                    {dominantProfile}
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-2xl font-bold text-gray-900">{profileData.title}</h2>
                                </div>
                            </div>
                            <p className="text-gray-600 text-base leading-relaxed">
                                {profileData.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
