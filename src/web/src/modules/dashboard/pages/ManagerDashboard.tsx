import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import { assignmentRepository, type Assignment } from '../../assessment/repositories/AssignmentRepository';
import { TestAllocationForm } from '../../assessment/components/TestAllocationForm';
import { Users, ClipboardList, Plus, ChevronLeft, ChevronRight, Search, Filter, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for the chart
const completionData = [
    { name: 'Mon', completed: 4 },
    { name: 'Tue', completed: 3 },
    { name: 'Wed', completed: 7 },
    { name: 'Thu', completed: 5 },
    { name: 'Fri', completed: 8 },
    { name: 'Sat', completed: 2 },
    { name: 'Sun', completed: 1 },
];

export const ManagerDashboard: React.FC = () => {
    const { profile } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'allocate'>('overview');
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const limit = 10;

    const fetchAssignments = async () => {
        if (!profile?.organization_id) return;
        setLoading(true);
        try {
            const { data, count, error } = await assignmentRepository.listByOrganization(profile.organization_id, page, limit);
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
    }, [profile?.organization_id, page]);

    const totalPages = Math.ceil(totalCount / limit);

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                        <p className="text-muted-foreground mt-1">Overview of your team's performance and assessments.</p>
                    </div>
                    <Button onClick={() => setActiveTab('allocate')} className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                        <Plus className="mr-2 h-4 w-4" />
                        Allocate New Test
                    </Button>
                </div>

                {/* Stats & Charts Section */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* KPI Cards */}
                    <div className="col-span-3 grid gap-4">
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalCount}</div>
                                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                                    +20.1% from last month
                                </p>
                            </CardContent>
                        </Card>
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active Leaders</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">12</div>
                                    <p className="text-xs text-muted-foreground mt-1">+2 this week</p>
                                </CardContent>
                            </Card>
                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Completion</CardTitle>
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">85%</div>
                                    <p className="text-xs text-muted-foreground mt-1">Target: 90%</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Chart */}
                    <Card className="col-span-4 hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle>Weekly Completion Trends</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={completionData}>
                                        <defs>
                                            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                        <XAxis
                                            dataKey="name"
                                            stroke="hsl(var(--muted-foreground))"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="hsl(var(--muted-foreground))"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `${value}`}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                                            itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="completed"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorCompleted)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {activeTab === 'allocate' ? (
                    <Card className="border-primary/10 shadow-lg animate-in slide-in-from-bottom-4 duration-500">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Allocate Assessment</CardTitle>
                                    <CardDescription>Select a test and assign it to your team members.</CardDescription>
                                </div>
                                <Button variant="ghost" onClick={() => setActiveTab('overview')}>
                                    Cancel
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <TestAllocationForm onSuccess={() => {
                                setActiveTab('overview');
                                fetchAssignments();
                            }} />
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-border shadow-sm hover:shadow-md transition-shadow duration-300">
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <CardTitle>Recent Assignments</CardTitle>
                                    <CardDescription>A list of all assessments assigned to your team.</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="Search..." className="pl-8 w-[200px] bg-background" />
                                    </div>
                                    <Button variant="outline" size="icon">
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : assignments.length === 0 ? (
                                <div className="text-center py-16 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                                    <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p className="text-lg font-medium">No assignments found</p>
                                    <p className="text-sm mb-4">Get started by allocating a new test to your team.</p>
                                    <Button onClick={() => setActiveTab('allocate')} variant="outline">
                                        Allocate Test
                                    </Button>
                                </div>
                            ) : (
                                <div className="rounded-md border overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted/40 text-muted-foreground font-medium">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Test</th>
                                                <th className="px-4 py-3 font-medium">Leader</th>
                                                <th className="px-4 py-3 font-medium">Assigned Date</th>
                                                <th className="px-4 py-3 font-medium">Status</th>
                                                <th className="px-4 py-3 text-right font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50 bg-card">
                                            {assignments.map((assignment) => (
                                                <tr key={assignment.id} className="hover:bg-muted/30 transition-colors group">
                                                    <td className="px-4 py-3 font-medium text-foreground">{assignment.test?.title}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold ring-2 ring-background">
                                                                L
                                                            </div>
                                                            <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                                                                Leader ID: {assignment.leader_id.slice(0, 8)}...
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {new Date(assignment.assigned_at).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {assignment.completed_at ? (
                                                            <Badge variant="success" className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">Completed</Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200">Pending</Badge>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">View Details</Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-end space-x-2 py-4 mt-4 border-t">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>
                                    <div className="text-sm text-muted-foreground px-2">
                                        Page {page} of {totalPages}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
};

