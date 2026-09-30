import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ProjectForm from '@/Components/ProjectForm';

const statusStyle = {
    planning: 'bg-sky-500/20 text-sky-300',
    in_progress: 'bg-indigo-500/20 text-indigo-300',
    completed: 'bg-emerald-500/20 text-emerald-300',
};
const prio = { high: 'text-rose-300', medium: 'text-amber-300', low: 'text-emerald-300' };
const fd = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

function ProjectCard({ p, i }) {
    const overdue = p.status !== 'completed' && p.days_left !== null && p.days_left < 0;
    const bar = p.progress >= 100 ? 'from-emerald-400 to-teal-400' : overdue ? 'from-rose-500 to-orange-400' : 'from-indigo-500 via-fuchsia-500 to-cyan-400';

    return (
        <div className="fade-up card-hover rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <Link href={route('projects.show', p.id)} className="block truncate text-lg font-bold transition hover:text-fuchsia-300">{p.name}</Link>
                    <p className="text-xs text-slate-400">{p.client && <>👤 {p.client} · </>}<span className={prio[p.priority]}>{p.priority} priority</span></p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[p.status]}`}>{p.status.replace('_', ' ')}</span>
            </div>

            <p className="mt-3 text-xs text-slate-400">🗓️ {fd(p.start_date)} → {fd(p.due_date)}</p>

            <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-slate-300">
                    <span>{p.done_count}/{p.tasks_count} tasks · {p.milestones_done}/{p.milestones_count} phases</span><span className="font-bold">{p.progress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                    <div className={`bar-grow h-full rounded-full bg-gradient-to-r ${bar}`} style={{ width: `${p.progress}%` }} />
                </div>
            </div>

            <p className={`mt-4 text-sm font-medium ${overdue ? 'text-rose-400' : 'text-slate-300'}`}>
                {p.status === 'completed' ? `✅ Finished ${fd(p.completed_at)}`
                    : p.days_left === null ? 'No deadline set'
                    : overdue ? `⚠️ OVERDUE by ${Math.abs(p.days_left)} days`
                    : `⏳ ${p.days_left} days remaining`}
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <Link href={route('projects.show', p.id)} className="rounded-lg bg-indigo-500/80 px-3 py-1.5 transition hover:bg-indigo-400">Open</Link>
                {['planning', 'in_progress', 'completed'].filter((s) => s !== p.status).map((s) => (
                    <button key={s} onClick={() => router.patch(route('projects.update', p.id), { status: s }, { preserveScroll: true })}
                        className="rounded-lg bg-white/10 px-3 py-1.5 transition hover:bg-indigo-500/60">→ {s.replace('_', ' ')}</button>
                ))}
            </div>
        </div>
    );
}

export default function Index({ projects }) {
    const [open, setOpen] = useState(false);

    return (
        <AppLayout title="Projects">
            <Head title="Projects" />

            <button onClick={() => setOpen(!open)}
                className="animated-gradient fade-up mb-6 rounded-xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 px-6 py-2.5 text-sm font-bold shadow-lg transition hover:scale-105 active:scale-95">
                {open ? '✕ Close' : '＋ New project'}
            </button>

            {open && <ProjectForm />}

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {projects.map((p, i) => <ProjectCard key={p.id} p={p} i={i} />)}
            </div>
            {!projects.length && <p className="text-slate-400">No projects yet. Click “New project” to create your first one.</p>}
        </AppLayout>
    );
}
