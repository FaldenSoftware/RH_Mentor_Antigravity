import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../auth/contexts/AuthContext';
import { invitationRepository, type Invitation } from '../repositories/InvitationRepository';
import { Loader2, Mail, Plus, Copy, Check } from 'lucide-react';

const inviteSchema = z.object({
    email: z.string().email('Invalid email address'),
});

type InviteForm = z.infer<typeof inviteSchema>;

export default function MembersPage() {
    const { profile } = useAuth();
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviting, setInviting] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteForm>({
        resolver: zodResolver(inviteSchema),
    });

    useEffect(() => {
        if (profile?.organization_id) {
            loadData();
        }
    }, [profile?.organization_id]);

    const loadData = async () => {
        if (!profile?.organization_id) return;

        setLoading(true);
        const { data } = await invitationRepository.list(profile.organization_id);
        if (data) {
            setInvitations(data);
        }
        setLoading(false);
    };

    const onInvite = async (data: InviteForm) => {
        if (!profile?.organization_id) return;

        setInviting(true);
        const { data: newInvite, error } = await invitationRepository.create(data.email, profile.organization_id);

        if (error) {
            alert('Failed to send invite: ' + error.message);
        } else if (newInvite) {
            setInvitations([newInvite, ...invitations]);
            reset();
        }
        setInviting(false);
    };

    const copyLink = (token: string, id: string) => {
        const link = `${window.location.origin}/register-leader?token=${token}`;
        navigator.clipboard.writeText(link);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Team Members
                    </h2>
                </div>
            </div>

            {/* Invite Section */}
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Invite a new Leader
                    </h3>
                    <div className="mt-2 max-w-xl text-sm text-gray-500">
                        <p>Enter an email address to generate an invitation link for a new leader.</p>
                    </div>
                    <form onSubmit={handleSubmit(onInvite)} className="mt-5 sm:flex sm:items-center">
                        <div className="w-full sm:max-w-xs">
                            <label htmlFor="email" className="sr-only">Email</label>
                            <input
                                {...register('email')}
                                type="email"
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                placeholder="leader@example.com"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>
                        <button
                            type="submit"
                            disabled={inviting}
                            className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                        >
                            {inviting ? <Loader2 className="animate-spin h-4 w-4" /> : <Plus className="h-4 w-4 mr-2" />}
                            Generate Invite
                        </button>
                    </form>
                </div>
            </div>

            {/* Pending Invites List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Pending Invitations
                    </h3>
                </div>
                <ul className="divide-y divide-gray-200">
                    {invitations.length === 0 ? (
                        <li className="px-4 py-4 sm:px-6 text-gray-500 text-sm">No pending invitations.</li>
                    ) : (
                        invitations.map((invite) => (
                            <li key={invite.id}>
                                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Mail className="h-5 w-5 text-gray-400 mr-3" />
                                        <p className="text-sm font-medium text-indigo-600 truncate">{invite.email}</p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${new Date(invite.expires_at) > new Date() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {new Date(invite.expires_at) > new Date() ? 'Active' : 'Expired'}
                                        </span>
                                        <button
                                            onClick={() => copyLink(invite.token, invite.id)}
                                            className="text-gray-400 hover:text-gray-500 flex items-center text-sm"
                                            title="Copy Invite Link"
                                        >
                                            {copiedId === invite.id ? (
                                                <Check className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <Copy className="h-5 w-5" />
                                            )}
                                            <span className="ml-1 hidden sm:inline">Copy Link</span>
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}
