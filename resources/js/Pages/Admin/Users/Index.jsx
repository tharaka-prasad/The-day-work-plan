import { Head, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const field = 'rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/30';

export default function Index({ users }) {
    const me = usePage().props.auth.user;
    const { data, setData, post, processing, reset, errors } = useForm({ name: '', email: '', password: '', role: 'user' });

    const toggle = (u) => router.patch(route('admin.users.update', u.id), { is_active: !u.is_active }, { preserveScroll: true });
    const resetPw = (u) => { const password = prompt(`New password for ${u.name} (min 8 characters)`); if (password) router.patch(route('admin.users.update', u.id), { password }, { preserveScroll: true }); };
    const remove = (u) => confirm(`Delete ${u.name} and all their tasks and projects?`) && router.delete(route('admin.users.destroy', u.id), { preserveScroll: true });

    return (
        <AppLayout title="Users">
            <Head title="Users" />

            <form onSubmit={(e) => { e.preventDefault(); post(route('admin.users.store'), { preserveScroll: true, onSuccess: () => reset() }); }}
                className="fade-up mb-8 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="flex flex-wrap gap-3">
                    <input className={`${field} min-w-[180px] flex-1`} placeholder="Full name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                    <input type="email" className={`${field} min-w-[220px] flex-1`} placeholder="Email" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                    <input type="password" className={field} placeholder="Password (min 8)" value={data.password} onChange={(e) => setData('password', e.target.value)} required />
                    <select className={field} value={data.role} onChange={(e) => setData('role', e.target.value)}>
                        <option value="user">User</option><option value="super_admin">Super admin</option>
                    </select>
                    <button disabled={processing} className="animated-gradient rounded-xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 px-6 py-2 text-sm font-bold shadow-lg transition hover:scale-105 active:scale-95 disabled:opacity-50">+ Create user</button>
                </div>
                {Object.values(errors).map((e) => <p key={e} className="mt-2 text-sm text-rose-300">{e}</p>)}
            </form>

            <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
                <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="text-xs text-slate-400"><tr>
                        <th className="p-4">User</th><th>Role</th><th>Tasks</th><th>Projects</th><th>Status</th><th className="pr-4 text-right">Actions</th>
                    </tr></thead>
                    <tbody>
                        {users.map((u, i) => (
                            <tr key={u.id} className="fade-up border-t border-white/5 transition hover:bg-white/5" style={{ animationDelay: `${i * 50}ms` }}>
                                <td className="p-4"><p className="font-semibold">{u.name}{u.id === me.id && ' (you)'}</p><p className="text-xs text-slate-400">{u.email}</p></td>
                                <td><span className={`rounded-full px-3 py-1 text-xs ${u.role === 'super_admin' ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'bg-indigo-500/20 text-indigo-300'}`}>{u.role.replace('_', ' ')}</span></td>
                                <td>{u.tasks_count}</td><td>{u.projects_count}</td>
                                <td><span className={u.is_active ? 'text-emerald-300' : 'text-rose-300'}>{u.is_active ? 'Active' : 'Disabled'}</span></td>
                                <td className="space-x-1 pr-4 text-right text-xs">
                                    <button onClick={() => resetPw(u)} className="rounded-lg bg-white/10 px-3 py-1.5 hover:bg-indigo-500/60">Reset password</button>
                                    {u.id !== me.id && <>
                                        <button onClick={() => toggle(u)} className="rounded-lg bg-white/10 px-3 py-1.5 hover:bg-amber-500/60">{u.is_active ? 'Disable' : 'Enable'}</button>
                                        <button onClick={() => remove(u)} className="rounded-lg bg-white/10 px-3 py-1.5 hover:bg-rose-500/70">Delete</button>
                                    </>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
