import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ProjectForm from '@/Components/ProjectForm';
import ExtendControls from '@/Components/ExtendControls';

const field = 'rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/30';
const money = (n) => 'Rs. ' + Number(n).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fd = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const hm = (s) => (s ? s.slice(0, 5) : '');
const statusStyle = { planning: 'bg-sky-500/20 text-sky-300', in_progress: 'bg-indigo-500/20 text-indigo-300', completed: 'bg-emerald-500/20 text-emerald-300' };
const prio = { high: 'bg-rose-500/20 text-rose-300', medium: 'bg-amber-500/20 text-amber-300', low: 'bg-emerald-500/20 text-emerald-300' };

function Info({ label, children }) {
    return <div><p className="text-xs text-slate-400">{label}</p><div className="mt-0.5 text-sm font-medium">{children || '—'}</div></div>;
}

function AddTask({ project, today }) {
    const { data, setData, post, processing, reset } = useForm({ title: '', task_date: today, start_time: '', due_time: '', priority: 'medium', project_id: project.id });
    const submit = (e) => { e.preventDefault(); post(route('tasks.store'), { preserveScroll: true, onSuccess: () => reset('title', 'start_time', 'due_time') }); };

    return (
        <form onSubmit={submit} className="mb-4 flex flex-wrap gap-2">
            <input className={`${field} min-w-[180px] flex-1`} placeholder="Add a task to this project" value={data.title} onChange={(e) => setData('title', e.target.value)} required />
            <input type="date" className={field} value={data.task_date} onChange={(e) => setData('task_date', e.target.value)} />
            <input type="time" className={field} value={data.start_time} onChange={(e) => setData('start_time', e.target.value)} title="Start time" />
            <input type="time" className={field} value={data.due_time} onChange={(e) => setData('due_time', e.target.value)} title="Due time" />
            <select className={field} value={data.priority} onChange={(e) => setData('priority', e.target.value)}>
                <option value="high">🔴 High</option><option value="medium">🟠 Medium</option><option value="low">🟢 Low</option>
            </select>
            <button disabled={processing} className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-bold transition hover:bg-indigo-400 disabled:opacity-50">+ Add</button>
        </form>
    );
}

function AddMilestone({ project }) {
    const { data, setData, post, processing, reset } = useForm({ title: '', due_date: '' });
    const submit = (e) => { e.preventDefault(); post(route('milestones.store', project.id), { preserveScroll: true, onSuccess: () => reset() }); };

    return (
        <form onSubmit={submit} className="mt-4 flex flex-wrap gap-2">
            <input className={`${field} min-w-[160px] flex-1`} placeholder="New phase / milestone" value={data.title} onChange={(e) => setData('title', e.target.value)} required />
            <input type="date" className={field} value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} />
            <button disabled={processing} className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-bold transition hover:bg-indigo-400 disabled:opacity-50">+ Add</button>
        </form>
    );
}

export default function Show({ project: p, milestones, tasks, today, extensions }) {
    const [editing, setEditing] = useState(false);
    const overdue = p.status !== 'completed' && p.days_left !== null && p.days_left < 0;
    const bar = p.progress >= 100 ? 'from-emerald-400 to-teal-400' : overdue ? 'from-rose-500 to-orange-400' : 'from-indigo-500 via-fuchsia-500 to-cyan-400';
    const totalDays = p.start_date && p.due_date ? Math.round((new Date(p.due_date) - new Date(p.start_date)) / 86400000) : null;

    const patchTask = (t, data) => router.patch(route('tasks.update', t.id), data, { preserveScroll: true });

    return (
        <AppLayout title={p.name}>
            <Head title={p.name} />

            <div className="fade-up mb-6 flex flex-wrap items-center gap-2 text-sm">
                <Link href={route('projects.index')} className="rounded-lg bg-white/10 px-3 py-1.5 transition hover:bg-white/20">← Projects</Link>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[p.status]}`}>{p.status.replace('_', ' ')}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${prio[p.priority]}`}>{p.priority} priority</span>
                <button onClick={() => setEditing(!editing)} className="ml-auto rounded-lg bg-white/10 px-3 py-1.5 transition hover:bg-indigo-500/60">✏️ Edit</button>
                <button onClick={() => confirm('Delete this project and its phases? Tasks stay but lose the project link.') && router.delete(route('projects.destroy', p.id))}
                    className="rounded-lg bg-white/10 px-3 py-1.5 transition hover:bg-rose-500/70">Delete</button>
            </div>

            {editing && <ProjectForm project={p} onDone={() => setEditing(false)} />}

            <div className="mb-8 grid gap-6 lg:grid-cols-3">
                <section className="fade-up rounded-3xl border border-white/10 bg-white/5 p-5 lg:col-span-2">
                    <div className="mb-4 flex justify-between text-sm">
                        <span className="text-slate-300">{p.done_count}/{p.tasks_count} tasks · {p.milestones_done}/{p.milestones_count} phases</span>
                        <span className="font-bold">{p.progress}%</span>
                    </div>
                    <div className="mb-5 h-4 overflow-hidden rounded-full bg-slate-800">
                        <div className={`bar-grow h-full rounded-full bg-gradient-to-r ${bar}`} style={{ width: `${p.progress}%` }} />
                    </div>
                    <p className={`mb-5 text-sm font-semibold ${overdue ? 'text-rose-400' : 'text-slate-200'}`}>
                        {p.status === 'completed' ? `✅ Finished ${fd(p.completed_at)}`
                            : p.days_left === null ? 'No deadline set'
                            : overdue ? `⚠️ OVERDUE by ${Math.abs(p.days_left)} days`
                            : `⏳ ${p.days_left} days remaining`}
                    </p>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <Info label="🟢 Start">{p.start_date && <>{fd(p.start_date)} {hm(p.start_time)}</>}</Info>
                        <Info label="🏁 Target finish">{p.due_date && <>{fd(p.due_date)} {hm(p.due_time)}</>}</Info>
                        <Info label="Duration">{totalDays !== null && `${totalDays} days`}</Info>
                        <Info label="👤 Client">{p.client}</Info>
                        <Info label="🛠️ Technology">{p.technology}</Info>
                        <Info label="💰 Budget">{p.budget && money(p.budget)}</Info>
                    </div>

                    {p.description && <div className="mt-5"><p className="text-xs text-slate-400">Description</p><p className="mt-1 whitespace-pre-line text-sm text-slate-200">{p.description}</p></div>}
                    {p.notes && <div className="mt-4"><p className="text-xs text-slate-400">Notes</p><p className="mt-1 whitespace-pre-line text-sm text-slate-200">{p.notes}</p></div>}
                </section>

                <section className="fade-up rounded-3xl border border-white/10 bg-white/5 p-5">
                    <h3 className="mb-4 font-bold">🏁 Phases</h3>
                    <ul className="space-y-2">
                        {milestones.map((m) => {
                            const late = !m.is_done && m.due_date && m.due_date < today;
                            return (
                                <li key={m.id} className="group flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-white/10">
                                    <button onClick={() => router.patch(route('milestones.update', m.id), { is_done: !m.is_done }, { preserveScroll: true })}
                                        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-xs transition-all duration-300 ${m.is_done ? 'scale-110 border-emerald-400 bg-emerald-400 text-slate-900' : 'border-slate-500 hover:border-indigo-400'}`}>{m.is_done && '✓'}</button>
                                    <div className="min-w-0 flex-1">
                                        <p className={`truncate text-sm font-medium ${m.is_done ? 'text-slate-500 line-through' : ''}`}>{m.title}</p>
                                        <p className={`text-xs ${late ? 'text-rose-400' : 'text-slate-400'}`}>{m.due_date ? `${late ? '⚠️ ' : '📆 '}${fd(m.due_date)}` : 'No date'}</p>
                                    </div>
                                    <button onClick={() => router.delete(route('milestones.destroy', m.id), { preserveScroll: true })} className="text-xs text-slate-500 opacity-0 transition hover:text-rose-400 group-hover:opacity-100">✕</button>
                                </li>
                            );
                        })}
                    </ul>
                    {!milestones.length && <p className="text-sm text-slate-400">No phases yet.</p>}
                    <AddMilestone project={p} />
                </section>
            </div>
                        {(p.status !== 'completed' || extensions.length > 0) && (
                <section className="fade-up mb-8 rounded-3xl border border-white/10 bg-white/5 p-5">
                    <h3 className="mb-1 font-bold">
                        ⏳ Deadline
                        {p.extensions_count > 0 && <span className="ml-2 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs text-amber-300">extended {p.extensions_count}×</span>}
                    </h3>

                    {p.status !== 'completed' && (
                        <>
                            <p className="mb-3 text-sm text-slate-400">Can't finish in time? Push the target date and note why.</p>
                            <ExtendControls projectId={p.id} today={today} />
                        </>
                    )}

                    {extensions.length > 0 && (
                        <ul className="mt-4 space-y-1.5 text-sm">
                            {extensions.map((e) => (
                                <li key={e.id} className="rounded-xl bg-white/5 px-3 py-2">
                                    <span className="text-slate-300">{fd(e.old_due_date)} → <b>{fd(e.new_due_date)}</b></span>
                                    {e.reason && <span className="ml-2 text-slate-400">· {e.reason}</span>}
                                    <span className="ml-2 text-xs text-slate-500">({fd(e.created_at)})</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            )}

            <section className="fade-up rounded-3xl border border-white/10 bg-white/5 p-5">
                <h3 className="mb-4 font-bold">✅ Tasks in this project</h3>
                <AddTask project={p} today={today} />
                <ul className="space-y-2">
                    {tasks.map((t) => {
                        const done = t.status === 'completed';
                        return (
                            <li key={t.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                                <button onClick={() => patchTask(t, { status: done ? 'pending' : 'completed' })}
                                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-xs transition-all duration-300 ${done ? 'scale-110 border-emerald-400 bg-emerald-400 text-slate-900' : 'border-slate-500 hover:border-indigo-400'}`}>{done && '✓'}</button>
                                <div className="min-w-0 flex-1">
                                    <p className={`truncate text-sm font-medium ${done ? 'text-slate-500 line-through' : ''}`}>{t.title}</p>
                                    <p className="text-xs text-slate-400">{t.task_date ? `📆 ${fd(t.task_date)}` : '💡 Inbox'} {hm(t.start_time) && `· ▶ ${hm(t.start_time)}`} {hm(t.due_time) && `· ⏰ ${hm(t.due_time)}`}</p>
                                </div>
                                <span className={`rounded-full px-2.5 py-0.5 text-xs ${prio[t.priority]}`}>{t.priority}</span>
                            </li>
                        );
                    })}
                </ul>
                {!tasks.length && <p className="text-sm text-slate-400">No tasks yet. Add the first one above.</p>}
            </section>
        </AppLayout>
    );
}
