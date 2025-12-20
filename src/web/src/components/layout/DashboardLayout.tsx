import React, { useState, useEffect } from 'react';
import { useAuth } from '../../modules/auth/contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    FileText,
    BarChart2,
    Trophy,
    Settings,
    HelpCircle,
    LogOut,
    Menu,
    X,
    Bell,
    ChevronDown,
    Layers,
    Target
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { dashboardRepository } from '../../modules/dashboard/repositories/DashboardRepository';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [pendingAssessmentsCount, setPendingAssessmentsCount] = useState(0);

    useEffect(() => {
        const fetchBadgeCount = async () => {
            if (profile?.organization_id && user?.id && profile.role === 'manager') {
                try {
                    const stats = await dashboardRepository.getManagerStats(profile.organization_id, user.id);
                    setPendingAssessmentsCount(stats.pendingAssessments);
                } catch (error) {
                    console.error('Error fetching badge count:', error);
                }
            }
        };
        fetchBadgeCount();
    }, [profile, user]);

    // Menu items based on the reference image
    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Clientes', href: '/clients', icon: Users },
        { name: 'Avaliações', href: '/assessments', icon: FileText, badge: pendingAssessmentsCount > 0 ? pendingAssessmentsCount : undefined },
        { name: 'Conquistas', href: '/achievements', icon: Trophy },
        { name: 'Metas', href: '/goals', icon: Target },
        { name: 'Relatórios', href: '/reports', icon: BarChart2 },
    ];

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-[#0f5156] border-b border-white/10 p-4">
                <div className="flex items-center gap-2 text-white">
                    <Layers className="h-6 w-6" />
                    <span className="font-bold">RH Master</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-[#0f5156] text-white transition-transform duration-200 ease-in-out",
                "lg:translate-x-0", // Always visible on desktop
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Logo Area */}
                <div className="h-16 flex items-center gap-3 px-6 border-b border-white/10">
                    <Layers className="h-6 w-6 text-white" />
                    <span className="font-bold text-lg tracking-wide">RH Master</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-white/10 text-white shadow-sm"
                                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <item.icon size={20} className={isActive ? "text-teal-200" : "text-slate-400"} />
                                <span className="flex-1">{item.name}</span>
                                {/* @ts-ignore */}
                                {item.badge && (
                                    <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                                        {/* @ts-ignore */}
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-white/10 space-y-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                        <Settings size={20} className="text-slate-400" />
                        Configurações
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                        <HelpCircle size={20} className="text-slate-400" />
                        Ajuda
                    </button>

                    <div className="pt-4 mt-2">
                        <Button
                            variant="destructive"
                            className="w-full justify-start bg-red-600 hover:bg-red-700 text-white border-none"
                            onClick={handleSignOut}
                        >
                            <LogOut size={18} className="mr-2" />
                            Sair da Conta
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className={cn(
                "flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-200",
                "lg:pl-64" // Add padding on desktop to account for fixed sidebar
            )}>
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
                    {/* Breadcrumbs */}
                    <div className="flex items-center text-sm">
                        <span className="font-semibold text-[#0f5156]">RH Master</span>
                        <span className="mx-2 text-slate-400">•</span>
                        <span className="text-slate-600">Painel do Mentor</span>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="h-8 w-px bg-slate-200 mx-1"></div>

                        <div className="flex items-center gap-3 pl-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
                            <div className="w-8 h-8 rounded-full bg-[#0f5156] flex items-center justify-center text-white text-sm font-medium">
                                {user?.email?.[0].toUpperCase() || 'U'}
                            </div>
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-medium text-slate-900 leading-none">
                                    {profile?.full_name || 'Usuário'}
                                </p>
                            </div>
                            <ChevronDown size={16} className="text-slate-400" />
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
};
