import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import { assignmentRepository } from '../repositories/AssignmentRepository';
import { testRepository, type Test } from '../repositories/TestRepository';
import { resultRepository } from '../repositories/ResultRepository';
import { Loader2, CheckCircle } from 'lucide-react';

export default function TakeTestPage() {
    const { assignmentId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [test, setTest] = useState<Test | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (assignmentId) {
            loadData();
        }
    }, [assignmentId]);

    const loadData = async () => {
        if (!assignmentId) return;
        setLoading(true);

        // Get assignment to verify and get test_id
        // We don't have getById in AssignmentRepository yet, let's assume we fetch list or add getById.
        // For speed, let's use listByLeader and find it, or better, add getById to repo.
        // I'll add getById to AssignmentRepository in next step or use direct query here if needed.
        // Actually, let's just fetch the test directly using the ID from the assignment if we had it.
        // Let's do a quick direct fetch for now to unblock.
        const { data: assignData } = await assignmentRepository.listByLeader(user!.id);
        const targetAssign = assignData?.find(a => a.id === assignmentId);

        if (targetAssign) {
            const { data: testData } = await testRepository.getById(targetAssign.test_id);
            setTest(testData);
        } else {
            // Handle not found or already completed
            alert('Assignment not found or already completed.');
            navigate('/dashboard');
        }

        setLoading(false);
    };

    const handleOptionSelect = (questionId: number, type: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: type }));
    };

    const handleNext = () => {
        if (currentStep < (test?.questions.length || 0) - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const calculateScore = () => {
        const score: Record<string, number> = { D: 0, I: 0, S: 0, C: 0 };
        Object.values(answers).forEach(type => {
            if (score[type] !== undefined) {
                score[type]++;
            }
        });
        return score;
    };

    const handleSubmit = async () => {
        if (!assignmentId || !user) return;
        setSubmitting(true);

        const score = calculateScore();

        // 1. Create Result
        const { error: resultError } = await resultRepository.create({
            assignment_id: assignmentId,
            user_id: user.id,
            answers,
            score
        });

        if (resultError) {
            alert('Failed to submit results: ' + resultError.message);
            setSubmitting(false);
            return;
        }

        // 2. Mark Assignment as Completed
        await assignmentRepository.markAsCompleted(assignmentId);

        navigate(`/dashboard/result/${assignmentId}`);
    };

    if (loading || !test) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>;
    }

    const currentQuestion = test.questions[currentStep];
    const progress = ((currentStep + 1) / test.questions.length) * 100;

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="mt-2 text-sm text-gray-500 text-right">Question {currentStep + 1} of {test.questions.length}</p>
            </div>

            <div className="bg-white shadow sm:rounded-lg p-6">
                <h3 className="text-xl font-medium text-gray-900 mb-6">{currentQuestion.text}</h3>

                <div className="space-y-4">
                    {currentQuestion.options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleOptionSelect(currentQuestion.id, option.type)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${answers[currentQuestion.id] === option.type
                                ? 'border-indigo-600 bg-indigo-50'
                                : 'border-gray-200 hover:border-indigo-300'
                                }`}
                        >
                            <div className="flex items-center">
                                <div className={`h-5 w-5 rounded-full border flex items-center justify-center mr-3 ${answers[currentQuestion.id] === option.type
                                    ? 'border-indigo-600 bg-indigo-600'
                                    : 'border-gray-300'
                                    }`}>
                                    {answers[currentQuestion.id] === option.type && <CheckCircle className="h-3 w-3 text-white" />}
                                </div>
                                <span className="text-gray-900">{option.text}</span>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleNext}
                        disabled={!answers[currentQuestion.id] || submitting}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="animate-spin h-5 w-5" /> : (
                            currentStep === test.questions.length - 1 ? 'Finish' : 'Next'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
