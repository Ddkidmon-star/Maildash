import { useState, useEffect } from 'react';
import { ShieldAlert, Ban, CheckCircle2, PauseCircle } from 'lucide-react';
import { fetchAllUsers, updateUserStatus, UserProfile } from '../lib/userUtils';

export default function AdminScreen() {
  const [users, setUsers] = useState<{id: string, profile: UserProfile}[]>(() => {
    const cached = localStorage.getItem('maildash_admin_users');
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(users.length === 0);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await fetchAllUsers();
      const sorted = allUsers.sort((a, b) => b.profile.createdAt - a.profile.createdAt);
      setUsers(sorted);
      localStorage.setItem('maildash_admin_users', JSON.stringify(sorted));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const setStatus = async (userId: string, status: 'active' | 'suspended' | 'banned', currentVerified: boolean) => {
    try {
      await updateUserStatus(userId, status, currentVerified);
      setUsers(users.map(u => u.id === userId ? { ...u, profile: { ...u.profile, status } } : u));
    } catch (e) {
      console.error(e);
    }
  };

  const setVerified = async (userId: string, isVerified: boolean, currentStatus: 'active' | 'suspended' | 'banned') => {
    try {
      await updateUserStatus(userId, currentStatus, isVerified);
      setUsers(users.map(u => u.id === userId ? { ...u, profile: { ...u.profile, isVerified } } : u));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto h-full pb-24 md:pb-8 flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-amber-500" />
          Owner Admin Panel
        </h1>
        <p className="text-neutral-500 mt-2">Manage users, ban accounts, or verify users.</p>
      </div>

      <div className="bg-white dark:bg-[#121212] border border-neutral-200 dark:border-[#1E1E1E] rounded-3xl overflow-hidden shadow-lg flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-[#333] bg-neutral-50 dark:bg-[#0a0a0a]">
                  <th className="p-4 font-bold text-sm">Email</th>
                  <th className="p-4 font-bold text-sm">Role</th>
                  <th className="p-4 font-bold text-sm">Balance</th>
                  <th className="p-4 font-bold text-sm">Status</th>
                  <th className="p-4 font-bold text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-[#1a1a1a]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-[#1a1a1a] transition-colors">
                    <td className="p-4 font-medium flex items-center gap-2">
                      {u.profile.email}
                      {u.profile.isVerified && <CheckCircle2 className="w-4 h-4 text-blue-500" fill="currentColor" stroke="white" strokeWidth={1} title="Verified User" />}
                    </td>
                    <td className="p-4">
                      {u.profile.role === 'owner' ? (
                        <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-1 rounded-md font-bold uppercase">Owner</span>
                      ) : (
                        <span className="bg-neutral-100 dark:bg-[#333] text-neutral-600 dark:text-neutral-300 text-[10px] px-2 py-1 rounded-md font-bold uppercase">User</span>
                      )}
                    </td>
                    <td className="p-4 font-medium text-black dark:text-white font-mono">
                      ₦{u.profile.balance?.toFixed(2) || '0.00'}
                    </td>
                    <td className="p-4">
                      {u.profile.status === 'active' && <span className="text-green-500 font-bold text-sm">Active</span>}
                      {u.profile.status === 'suspended' && <span className="text-amber-500 font-bold text-sm flex items-center gap-1"><PauseCircle className="w-4 h-4" /> Suspended</span>}
                      {u.profile.status === 'banned' && <span className="text-red-500 font-bold text-sm flex items-center gap-1"><Ban className="w-4 h-4" /> Banned</span>}
                    </td>
                    <td className="p-4 flex items-center justify-end gap-2">
                      {u.profile.role !== 'owner' && (
                        <>
                          <button 
                            onClick={() => setVerified(u.id, !u.profile.isVerified, u.profile.status)}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                          >
                            {u.profile.isVerified ? 'Unverify' : 'Verify'}
                          </button>
                          
                          {u.profile.status !== 'active' && (
                            <button 
                              onClick={() => setStatus(u.id, 'active', u.profile.isVerified)}
                              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-green-200 dark:border-green-900 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
                            >
                              Activate
                            </button>
                          )}
                          {u.profile.status !== 'suspended' && (
                            <button 
                              onClick={() => setStatus(u.id, 'suspended', u.profile.isVerified)}
                              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
                            >
                              Suspend
                            </button>
                          )}
                          {u.profile.status !== 'banned' && (
                            <button 
                              onClick={() => setStatus(u.id, 'banned', u.profile.isVerified)}
                              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
                            >
                              Ban
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && loading && (
              <div className="p-8 text-center text-neutral-500">Loading users...</div>
            )}
          </div>
      </div>
    </div>
  );
}
