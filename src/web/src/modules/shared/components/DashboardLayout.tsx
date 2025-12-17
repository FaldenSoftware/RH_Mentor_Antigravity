import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import { authRepository } from '../../auth/repositories/AuthRepository';
import {
    LayoutDashboard,
    Users,
    LogOut,
    Menu,
    X,
    UserCircle,
    ClipboardList,
    BookOpen
} from 'lucide-react';

export default function DashboardLayout() {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await authRepository.signOut();
        navigate('/login');
    };

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        ...(profile?.role === 'manager' ? [
            { name: 'Team Members', href: '/dashboard/members', icon: Users },
            { name: 'Assessments Library', href: '/dashboard/assessments', icon: BookOpen }
        ] : [
            { name: 'My Assessments', href: '/dashboard/my-assessments', icon: ClipboardList }
        ]),
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile menu overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 flex md:hidden">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button
                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <X className="h-6 w-6 text-white" />
                            </button>
                        </div>
                        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                            <div className="flex-shrink-0 flex items-center px-4">
                                <h1 className="text-xl font-bold text-indigo-600">RH Mentor</h1>
                            </div>
                            <nav className="mt-5 px-2 space-y-1">
                                {navigation.map((item) => {
                                    const isActive = location.pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={`${isActive
                                                    ? 'bg-indigo-50 text-indigo-600'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <item.icon
                                                className={`${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                                                    } mr-4 flex-shrink-0 h-6 w-6`}
                                            />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Static sidebar for desktop */}
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
                <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
                    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                        <div className="flex items-center flex-shrink-0 px-4">
                            <h1 className="text-2xl font-bold text-indigo-600">RH Mentor</h1>
                        </div>
                        <nav className="mt-5 flex-1 px-2 space-y-1">
                            {navigation.map((item) => {
                                const isActive = location.pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`${isActive
                                                ? 'bg-indigo-50 text-indigo-600'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                                    >
                                        <item.icon
                                            className={`${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                                                } mr-3 flex-shrink-0 h-6 w-6`}
                                        />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                    <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                        <div className="flex-shrink-0 w-full group block">
                            <div className="flex items-center">
                                <div>
                                    <UserCircle className="inline-block h-9 w-9 rounded-full text-gray-400" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                        {profile?.role === 'manager' ? 'Manager' : 'Leader'}
                                    </p>
                                    <button
                                        onClick={handleSignOut}
                                        className="text-xs font-medium text-gray-500 group-hover:text-gray-700 flex items-center mt-1"
                                    >
                                        <LogOut className="mr-1 h-3 w-3" />
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="md:pl-64 flex flex-col flex-1">
                <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white border-b border-gray-200">
                    <button
                        type="button"
                        className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
                <main className="flex-1">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
