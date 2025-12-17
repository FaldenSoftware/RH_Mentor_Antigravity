import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import { assignmentRepository, type Assignment } from '../../assessment/repositories/AssignmentRepository';
import { ClipboardCheck, Clock, CheckCircle, ChevronRight, PlayCircle, ChevronLeft, Trophy, Target, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

export const LeaderDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const limit = 10;

    const fetchAssignments = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const { data, count, error } = await assignmentRepository.listByLeader(user.id, page, limit);
            if (error) throw error;
            setAssignments(data || []);
            setTotalCount(count || 0);
        } catch (err) {
            console.error('Failed to fetch assignments', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, [user?.id, page]);

    const pendingAssignments = assignments.filter(a => !a.completed_at);
    const completedAssignments = assignments.filter(a => a.completed_at);
    const totalPages = Math.ceil(totalCount / limit);

    const data = [
        { name: 'Completed', value: completedAssignments.length },
        { name: 'Pending', value: pendingAssignments.length },
    ];
    const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted))'];

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">My Development Plan</h1>
                    <p className="text-muted-foreground mt-1">Track your assessments and view your results.</p>
                </div>

                <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
                    <div className="space-y-8">
                        {/* Pending Assessments */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Clock className="text-primary h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-semibold text-foreground">Pending Assessments</h2>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : pendingAssignments.length === 0 ? (
                                <Card className="bg-primary/5 border-primary/10">
                                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mb-4 shadow-sm ring-1 ring-primary/20">
                                            <Trophy className="text-primary h-6 w-6" />
                                        </div>
                                        <h3 className="text-lg font-medium text-primary">All Caught Up!</h3>
                                        <p className="text-muted-foreground mt-1 max-w-sm">
                                            You have no pending assessments. Great job staying on top of your development plan.
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid gap-4">
                                    {pendingAssignments.map((assignment, index) => (
                                        <motion.div
                                            key={assignment.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary group">
                                                <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                    <div>
                                                        <Badge variant="secondary" className="mb-2 bg-primary/10 text-primary hover:bg-primary/20">
                                                            Assigned {new Date(assignment.assigned_at).toLocaleDateString()}
                                                        </Badge>
                                                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{assignment.test?.title}</h3>
                                                        <p className="text-muted-foreground text-sm mt-1">
                                                            Complete this assessment to unlock your leadership insights.
                                                        </p>
                                                    </div>
                                                    <Button
                                                        onClick={() => navigate(`/assessment/${assignment.id}`)}
                                                        className="w-full sm:w-auto shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform"
                                                    >
                                                        <PlayCircle className="mr-2 h-4 w-4" />
                                                        Start Now
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Completed Assessments */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <CheckCircle className="text-green-600 h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-semibold text-foreground">Completed History</h2>
                            </div>

                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-0">
                                    {loading ? (
                                        <div className="p-8 text-center text-muted-foreground">Loading...</div>
                                    ) : completedAssignments.length === 0 ? (
                                        <div className="p-12 text-center text-muted-foreground">
                                            No completed assessments yet.
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-border/50">
                                            {completedAssignments.map(assignment => (
                                                <div key={assignment.id} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center ring-2 ring-background">
                                                            <ClipboardCheck className="text-green-600 h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                                                                {assignment.test?.title}
                                                            </h3>
                                                            <p className="text-sm text-muted-foreground">
                                                                Completed on {new Date(assignment.completed_at!).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                                        View Result <ChevronRight className="ml-1 h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="p-4 border-t flex justify-between items-center bg-muted/20">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={page === 1}
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={page === totalPages}
                                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </section>
                    </div>

                    {/* Sidebar / Info Column */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden relative">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-black/10 rounded-full blur-2xl"></div>

                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    Your Progress
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="h-[200px] w-full flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={data}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {data.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)', color: 'hsl(var(--popover-foreground))' }}
                                                itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-3xl font-bold">{completedAssignments.length}</span>
                                        <span className="text-xs opacity-80">Completed</span>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="opacity-80">Pending</span>
                                        <span className="font-medium">{pendingAssignments.length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="opacity-80">Total</span>
                                        <span className="font-medium">{totalCount}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-secondary/50 border-none">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-yellow-500" />
                                    Quick Tip
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Consistent growth comes from regular self-reflection. Try to complete one assessment per week.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
