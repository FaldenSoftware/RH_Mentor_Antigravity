import { useAuth } from '../../auth/contexts/AuthContext';

export default function DashboardPage() {
    const { profile } = useAuth();

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <div className="py-4">
                <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Welcome back!
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            You are logged in as a {profile?.role}.
                        </p>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Placeholder stats */}
                            <div className="bg-indigo-50 overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Total Members
                                    </dt>
                                    <dd className="mt-1 text-3xl font-semibold text-indigo-600">
                                        0
                                    </dd>
                                </div>
                            </div>
                            <div className="bg-green-50 overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Active Tests
                                    </dt>
                                    <dd className="mt-1 text-3xl font-semibold text-green-600">
                                        0
                                    </dd>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
