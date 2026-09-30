import { useEffect, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import ExtendControls from '@/Components/ExtendControls';

const fd = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const setStatus = (id, status) => router.patch(route('projects.update', id), { status }, { preserveScroll: true });

function AlertCard({ p, kind, today, onNavigate }) {
    const overdue = kind === 'overdue';

    return (
        <div className={`fade-up rounded-2xl border p-4 ${overdue ? 'border-rose-400/40 bg-rose-500/10' : 'border-amber-400/40 bg-amber-500/10'}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                    <Link href={route('projects.show', p.id)} onClick={onNavigate} className="block truncate font-bold transition hover:text-fuchsia-300">{p.name}</Link>
                    <p className="text-xs text-slate-300">🏁 {fd(p.due_date)}{p.due_time && ` at ${p.due_time}`} · {p.status.replace('_', ' ')}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${overdue ? 'bg-rose-500/25 text-rose-300' : 'bg-amber-500/25 text-amber-300'}`}>
                    {overdue ? `Overdue by ${p.days_overdue} day${p.days_overdue > 1 ? 's' : ''}` : 'Due today'}
                </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <button onClick={() => setStatus(p.id, 'completed')}
                    className="rounded-lg bg-emerald-500 px-3 py-1.5 font-semibold text-slate-950 transition hover:scale-105 hover:bg-emerald-400">✅ Mark completed</button>
                <select value={p.status} onChange={(e) => setStatus(p.id, e.target.value)}
                    className="rounded-lg border border-white/10 bg-slate-900/70 px-2 py-1.5 outline-none focus:border-fuchsia-400">
                    <option value="planning">Planning</option>
                    <option value="in_progress">In progress</option>
                </select>
            </div>

            <div className="mt-3 border-t border-white/10 pt-3">
                <p className="mb-2 text-xs font-semibold text-slate-300">Need more time?</p>
                <ExtendControls projectId={p.id} today={today} />
            </div>
        </div>
    );
}

export default function ProjectAlerts() {
    const alerts = usePage().props.alerts;
    const overdue = alerts?.overdue ?? [];
    const dueToday = alerts?.due_today ?? [];
    const count = overdue.length + dueToday.length;
    const [open, setOpen] = useState(false);

    // open the popup automatically once per session, and again only when a NEW project becomes due/overdue
    useEffect(() => {
        if (!alerts || count === 0) return;
        const ids = [...overdue, ...dueToday].map((p) => p.id);
        const key = `project-alert-seen-${alerts.today}`;
        try {
            const seen = JSON.parse(sessionStorage.getItem(key) || '[]');
            if (ids.some((id) => !seen.includes(id))) {
                sessionStorage.setItem(key, JSON.stringify([...new Set([...seen, ...ids])]));
                setOpen(true);
            }
        } catch {
            setOpen(true);
        }
    }, []);

    // close by itself once everything is sorted out
    useEffect(() => { if (open && count === 0) setOpen(false); }, [count, open]);

    if (!alerts) return null;

    return (
        <>
            <button onClick={() => setOpen(true)} aria-label="Project alerts"
                className="fixed right-5 top-5 z-40 grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/10 text-lg shadow-lg backdrop-blur transition hover:scale-110 md:right-10">
                🔔
                {count > 0 && (
                    <span className="pulse-ring absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-rose-500 px-1 text-[11px] font-bold">{count}</span>
                )}
            </button>

            {open && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
                    <div onClick={(e) => e.stopPropagation()}
                        className="pop max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-6 text-slate-100 shadow-2xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-xl font-extrabold">🔔 Project alerts</h2>
                            <button onClick={() => setOpen(false)} className="rounded-lg bg-white/10 px-3 py-1 transition hover:bg-white/20">✕</button>
                        </div>

                        {count === 0 && <p className="text-slate-400">All clear. No project is due today or overdue. 🎉</p>}

                        {overdue.length > 0 && (
                            <div className="mb-5 space-y-3">
                                <h3 className="text-sm font-bold text-rose-300">⚠️ Missed the date · {overdue.length}</h3>
                                {overdue.map((p) => <AlertCard key={p.id} p={p} kind="overdue" today={alerts.today} onNavigate={() => setOpen(false)} />)}
                            </div>
                        )}

                        {dueToday.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-amber-300">📅 Must finish today · {dueToday.length}</h3>
                                {dueToday.map((p) => <AlertCard key={p.id} p={p} kind="today" today={alerts.today} onNavigate={() => setOpen(false)} />)}
                            </div>
                        )}

                        {count > 0 && (
                            <button onClick={() => setOpen(false)} className="mt-5 w-full rounded-xl bg-white/10 py-2 text-sm transition hover:bg-white/20">Remind me later</button>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
