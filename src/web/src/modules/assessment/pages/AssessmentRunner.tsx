import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assignmentRepository, type Assignment } from '../repositories/AssignmentRepository';
import { testRepository, type Test } from '../repositories/TestRepository';
import { resultRepository } from '../repositories/ResultRepository';
import { useAuth } from '../../auth/contexts/AuthContext';
import { Loader2, CheckCircle, ArrowRight, ArrowLeft, Trophy, Sparkles } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../../components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';

export const AssessmentRunner: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [test, setTest] = useState<Test | null>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [submitting, setSubmitting] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [score, setScore] = useState<any>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Load assignment and test data
    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            try {
                const { data: assignmentData, error: assignmentError } = await assignmentRepository.getById(id);
                if (assignmentError) throw assignmentError;
                setAssignment(assignmentData);

                if (assignmentData?.test_id) {
                    const { data: testData, error: testError } = await testRepository.getById(assignmentData.test_id);
                    if (testError) throw testError;
                    setTest(testData);
                }
            } catch (error) {
                console.error('Failed to load assessment', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const handleAnswer = (questionId: string, value: any) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const calculateScore = () => {
        return { total: Object.keys(answers).length * 10 };
    };

    const handleSubmit = async () => {
        if (!assignment || !user) return;
        setSubmitting(true);
        try {
            const calculatedScore = calculateScore();
            setScore(calculatedScore);

            await resultRepository.create({
                assignment_id: assignment.id,
                user_id: user.id,
                answers,
                score: calculatedScore
            });

            await assignmentRepository.markAsCompleted(assignment.id);
            setCompleted(true);
        } catch (error) {
            console.error('Failed to submit assessment', error);
        } finally {
            setSubmitting(false);
        }
    };

    const nextQuestion = () => {
        if (!test) return;
        if (currentQuestionIndex < (test.questions as any[]).length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!test) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="text-destructive">Error Loading Assessment</CardTitle>
                        <CardDescription>We couldn't find the test you're looking for.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
                            Return to Dashboard
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (completed) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden relative">
                {/* Confetti-like background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full bg-primary/20"
                            initial={{
                                x: Math.random() * window.innerWidth,
                                y: -20,
                                opacity: 1
                            }}
                            animate={{
                                y: window.innerHeight + 20,
                                rotate: 360,
                                opacity: 0
                            }}
                            transition={{
                                duration: Math.random() * 2 + 3,
                                repeat: Infinity,
                                delay: Math.random() * 2
                            }}
                        />
                    ))}
                </div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", duration: 0.8 }}
                    className="w-full max-w-lg relative z-10"
                >
                    <Card className="text-center border-primary/20 shadow-2xl bg-card/95 backdrop-blur-sm">
                        <CardHeader>
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                                className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 ring-4 ring-green-50"
                            >
                                <Trophy className="h-10 w-10 text-green-600" />
                            </motion.div>
                            <CardTitle className="text-3xl font-bold text-foreground">Assessment Completed!</CardTitle>
                            <CardDescription className="text-lg mt-2">
                                Great job! You've successfully completed {test.title}.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="py-8">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex flex-col items-center"
                            >
                                <div className="text-5xl font-extrabold text-primary mb-2">{score?.total}</div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide font-medium">
                                    <Sparkles className="w-4 h-4 text-yellow-500" />
                                    Total Score
                                    <Sparkles className="w-4 h-4 text-yellow-500" />
                                </div>
                            </motion.div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => navigate('/dashboard')} className="w-full h-12 text-lg shadow-lg shadow-primary/20" size="lg">
                                Return to Dashboard
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        );
    }

    const questions = test.questions as any[];
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const hasAnsweredCurrent = answers[currentQuestion.id] !== undefined;

    return (
        <div className="min-h-screen bg-muted/30 flex flex-col">
            {/* Header */}
            <header className="bg-background border-b sticky top-0 z-10 shadow-sm">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4 w-full">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="shrink-0">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1.5">
                                <h1 className="font-semibold text-foreground text-sm sm:text-base truncate pr-4">{test.title}</h1>
                                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                                    {currentQuestionIndex + 1} of {questions.length}
                                </span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-3xl mx-auto w-full p-4 md:p-8 flex flex-col justify-center min-h-[calc(100vh-8rem)]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion.id}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                    >
                        <Card className="border-none shadow-xl ring-1 ring-border/50 overflow-hidden">
                            <div className="bg-muted/30 px-6 py-4 border-b border-border/50 flex justify-between items-center">
                                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                                    Question {currentQuestionIndex + 1}
                                </span>
                                {hasAnsweredCurrent && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="flex items-center gap-1 text-green-600 text-xs font-medium"
                                    >
                                        <CheckCircle className="w-3 h-3" />
                                        Answered
                                    </motion.div>
                                )}
                            </div>
                            <CardContent className="p-6 md:p-10">
                                <h3 className="text-xl md:text-2xl font-medium text-foreground mb-8 leading-relaxed">
                                    {currentQuestion.text}
                                </h3>
                                <div className="space-y-3">
                                    {currentQuestion.options.map((option: any) => (
                                        <label
                                            key={option.id}
                                            className={`
                                                flex items-center p-4 md:p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 group relative overflow-hidden
                                                ${answers[currentQuestion.id] === option.value
                                                    ? 'border-primary bg-primary/5 shadow-md'
                                                    : 'border-muted hover:border-primary/50 hover:bg-muted/50'
                                                }
                                            `}
                                        >
                                            <div className={`
                                                w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                                                ${answers[currentQuestion.id] === option.value
                                                    ? 'border-primary bg-primary'
                                                    : 'border-muted-foreground/30 group-hover:border-primary/50'
                                                }
                                            `}>
                                                {answers[currentQuestion.id] === option.value && (
                                                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                                                )}
                                            </div>
                                            <input
                                                type="radio"
                                                name={currentQuestion.id}
                                                value={option.value}
                                                checked={answers[currentQuestion.id] === option.value}
                                                onChange={() => handleAnswer(currentQuestion.id, option.value)}
                                                className="sr-only"
                                            />
                                            <span className={`ml-4 font-medium text-base md:text-lg ${answers[currentQuestion.id] === option.value ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                                                {option.text}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg z-20">
                <div className="max-w-3xl mx-auto flex justify-between items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={prevQuestion}
                        disabled={currentQuestionIndex === 0 || submitting}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Previous
                    </Button>

                    <Button
                        size="lg"
                        onClick={nextQuestion}
                        disabled={!hasAnsweredCurrent || submitting}
                        className="min-w-[140px] shadow-lg shadow-primary/20"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : isLastQuestion ? (
                            <>
                                Finish
                                <Trophy className="ml-2 h-4 w-4" />
                            </>
                        ) : (
                            <>
                                Next
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
