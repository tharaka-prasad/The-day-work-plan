import { useEffect, useRef, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const prio = {
    high: 'bg-rose-500/20 text-rose-300 ring-rose-400/40',
    medium: 'bg-amber-500/20 text-amber-300 ring-amber-400/40',
    low: 'bg-emerald-500/20 text-emerald-300 ring-emerald-400/40',
};
const field = 'rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/30';

const addDays = (d, n) => { const x = new Date(d); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const hm = (s) => (s ? s.slice(0, 5) : null);
const toMin = (s) => { const [h, m] = s.split(':'); return Number(h) * 60 + Number(m); };
const patch = (t, data) => router.patch(route('tasks.update', t.id), data, { preserveScroll: true });
const doneAt = (t) => (t.completed_at ? new Date(t.completed_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : null);
const timeLabel = (t) => {
    const s = hm(t.start_time), d = hm(t.due_time);
    if (s && d) return `⏰ ${s} → ${d}`;
    if (s) return `▶ starts ${s}`;
    if (d) return `⏰ due ${d}`;
    return null;
};

function Stat({ label, value, gradient, i }) {
    return (
        <div className={`fade-up card-hover rounded-3xl bg-gradient-to-br ${gradient} p-5 shadow-xl`} style={{ animationDelay: `${i * 90}ms` }}>
            <p className="text-sm text-white/80">{label}</p>
            <p className="pop mt-1 text-4xl font-black" style={{ animationDelay: `${i * 90 + 200}ms` }}>{value}</p>
        </div>
    );
}

function TaskRow({ t, i, today, nowMin, kind }) {
    const done = t.status === 'completed';
    const main = hm(t.start_time) || hm(t.due_time);
    const late = kind === 'carried' || (kind === 'today' && !done && t.due_time && toMin(hm(t.due_time)) < nowMin);
    const soon = kind === 'today' && !done && !late && main && toMin(main) - nowMin >= 0 && toMin(main) - nowMin <= 30;
    const label = timeLabel(t);

    return (
        <li className={`fade-up group flex flex-wrap items-center gap-3 rounded-2xl border p-3 transition hover:bg-white/10 ${late && !done ? 'border-rose-400/40 bg-rose-500/5' : soon ? 'border-amber-400/50 bg-amber-500/10' : 'border-white/10 bg-white/5 hover:border-indigo-400/50'}`}
            style={{ animationDelay: `${i * 60}ms` }}>
            <button onClick={() => patch(t, { status: done ? 'pending' : 'completed' })}
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-xs transition-all duration-300 ${done ? 'scale-110 border-emerald-400 bg-emerald-400 text-slate-900' : 'border-slate-500 hover:border-indigo-400'}`}>
                {done && '✓'}
            </button>

            <div className="min-w-0 flex-1">
                <p className={`truncate font-medium transition ${done ? 'text-slate-500 line-through' : ''}`}>{t.title}</p>
                <p className="text-xs text-slate-400">
                    {t.project?.name && <span className="mr-2">📁 {t.project.name}</span>}
                    {label && <span className="mr-2">{label}</span>}
                    {kind === 'carried' && <span className="text-amber-300">planned {t.task_date}</span>}
                    {kind === 'later' && <span className="text-sky-300">📆 {t.task_date}</span>}
                    {done && doneAt(t) && <span className="text-emerald-300">✔ Done at {doneAt(t)}</span>}
                </p>
            </div>

            {!done && late && kind === 'today' && <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-xs font-bold text-rose-300">Late</span>}
            {!done && kind === 'carried' && <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-xs font-bold text-rose-300">Missed</span>}
            {soon && <span className="pulse-ring rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-300">Due soon</span>}
            <span className={`rounded-full px-2.5 py-0.5 text-xs ring-1 ${prio[t.priority]}`}>{t.priority}</span>

            <div className="flex gap-1 text-xs opacity-0 transition group-hover:opacity-100">
                {kind !== 'today' && <button onClick={() => patch(t, { task_date: today })} className="rounded-lg bg-indigo-500/80 px-2 py-1 hover:bg-indigo-400">Today</button>}
                {kind !== 'tomorrow' && <button onClick={() => patch(t, { task_date: addDays(today, 1) })} className="rounded-lg bg-white/10 px-2 py-1 hover:bg-white/20">Tomorrow</button>}
                <button onClick={() => patch(t, { task_date: null })} className="rounded-lg bg-white/10 px-2 py-1 hover:bg-white/20">Inbox</button>
                <button onClick={() => patch(t, { status: 'cancelled' })} className="rounded-lg bg-white/10 px-2 py-1 hover:bg-rose-500/60">Cancel</button>
            </div>
        </li>
    );
}

function InboxRow({ t, i, today }) {
    const [date, setDate] = useState(addDays(today, 1));
    const [time, setTime] = useState('');

    return (
        <li className="fade-up rounded-2xl border border-violet-400/30 bg-violet-500/10 p-3" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center gap-3">
                <p className="min-w-0 flex-1 truncate font-medium">💡 {t.title}</p>
                <span className={`rounded-full px-2.5 py-0.5 text-xs ring-1 ${prio[t.priority]}`}>{t.priority}</span>
                <button onClick={() => patch(t, { status: 'cancelled' })} className="text-xs text-slate-500 transition hover:text-rose-400">✕</button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-300">Finish on</span>
                <input type="date" className={`${field} py-1`} value={date} min={today} onChange={(e) => setDate(e.target.value)} />
                <input type="time" className={`${field} py-1`} value={time} onChange={(e) => setTime(e.target.value)} />
                <button onClick={() => patch(t, { task_date: date, ...(time ? { due_time: time } : {}) })}
                    className="rounded-lg bg-violet-500 px-3 py-1.5 font-semibold transition hover:scale-105 hover:bg-violet-400">Schedule</button>
            </div>
        </li>
    );
}

function QuickAdd({ today, projects }) {
    const { data, setData, post, processing, reset, transform } = useForm({
        title: '', mode: 'today', pick: today, start_time: '', due_time: '', priority: 'medium', project_id: '',
    });

    transform((d) => ({
        title: d.title,
        task_date: d.mode === 'inbox' ? null : d.mode === 'today' ? today : d.mode === 'tomorrow' ? addDays(today, 1) : d.pick,
        start_time: d.start_time,
        due_time: d.due_time,
        priority: d.priority,
        project_id: d.project_id,
    }));

    const submit = (e) => {
        e.preventDefault();
        post(route('tasks.store'), { preserveScroll: true, onSuccess: () => reset('title', 'start_time', 'due_time') });
    };

    return (
        <form onSubmit={submit} className="fade-up mb-8 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <div className="flex flex-wrap gap-3">
                <input className={`${field} min-w-[220px] flex-1`} placeholder="✨ What needs doing? (or something you just remembered)" value={data.title} onChange={(e) => setData('title', e.target.value)} required />
                <select className={field} value={data.mode} onChange={(e) => setData('mode', e.target.value)}>
                    <option value="today">📅 Today</option>
                    <option value="tomorrow">🌅 Tomorrow</option>
                    <option value="date">📆 Pick a date</option>
                    <option value="inbox">💡 Inbox (decide later)</option>
                </select>
                {data.mode === 'date' && <input type="date" className={field} value={data.pick} onChange={(e) => setData('pick', e.target.value)} />}
                {data.mode !== 'inbox' && <>
                    <label className="flex items-center gap-2 text-xs text-slate-400">Start <input type="time" className={field} value={data.start_time} onChange={(e) => setData('start_time', e.target.value)} /></label>
                    <label className="flex items-center gap-2 text-xs text-slate-400">Due <input type="time" className={field} value={data.due_time} onChange={(e) => setData('due_time', e.target.value)} /></label>
                </>}
                <select className={field} value={data.priority} onChange={(e) => setData('priority', e.target.value)}>
                    <option value="high">🔴 High</option><option value="medium">🟠 Medium</option><option value="low">🟢 Low</option>
                </select>
                <select className={field} value={data.project_id} onChange={(e) => setData('project_id', e.target.value)}>
                    <option value="">No project</option>
                    {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <button disabled={processing} className="animated-gradient rounded-xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 px-6 py-2 text-sm font-bold shadow-lg transition hover:scale-105 active:scale-95 disabled:opacity-50">+ Add</button>
            </div>
        </form>
    );
}

export default function Dashboard({ today, carried, todayTasks, tomorrow, upcoming, inbox, projects }) {
    // clock, refreshed every 30 seconds so Late / Due soon update by themselves
    const [now, setNow] = useState(new Date());
    useEffect(() => { const id = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(id); }, []);
    const nowMin = now.getHours() * 60 + now.getMinutes();

    // browser reminders (only while this page is open)
    const [perm, setPerm] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'denied');
    const notified = useRef(new Set());
    useEffect(() => {
        if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
        todayTasks.forEach((t) => {
            const time = hm(t.start_time) || hm(t.due_time);
            if (t.status === 'completed' || !time || notified.current.has(t.id)) return;
            const diff = toMin(time) - nowMin;
            if (diff <= 10 && diff >= -5) {
                notified.current.add(t.id);
                new Notification(`⏰ ${t.title}`, { body: `Scheduled at ${time}` });
            }
        });
    }, [now, todayTasks]);

    const done = todayTasks.filter((t) => t.status === 'completed').length;
    const lateCount = carried.length + todayTasks.filter((t) => t.status !== 'completed' && t.due_time && toMin(hm(t.due_time)) < nowMin).length;
    const pretty = new Date(today).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const later = upcoming.reduce((a, t) => { (a[t.task_date] ??= []).push(t); return a; }, {});

    return (
        <AppLayout title={`Today — ${pretty}`}>
            <Head title="Dashboard" />

            <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat i={0} label="Today's work" value={todayTasks.length} gradient="from-indigo-500 to-blue-600" />
                <Stat i={1} label="Completed" value={done} gradient="from-emerald-500 to-teal-600" />
                <Stat i={2} label="Late / missed" value={lateCount} gradient="from-rose-500 to-orange-600" />
                <Stat i={3} label="In Inbox" value={inbox.length} gradient="from-violet-500 to-fuchsia-600" />
            </div>

            {perm === 'default' && (
                <button onClick={() => Notification.requestPermission().then(setPerm)}
                    className="fade-up mb-4 rounded-xl bg-white/10 px-4 py-2 text-sm transition hover:bg-indigo-500/60">🔔 Enable reminders for timed tasks</button>
            )}

            <QuickAdd today={today} projects={projects} />

            {carried.length > 0 && (
                <section className="mb-8 rounded-3xl border border-amber-400/30 bg-amber-500/10 p-5">
                    <h2 className="pulse-ring mb-4 inline-block rounded-full bg-amber-500/20 px-4 py-1 text-sm font-bold text-amber-300">⚠️ Not finished earlier · {carried.length}</h2>
                    <ul className="space-y-2">{carried.map((t, i) => <TaskRow key={t.id} t={t} i={i} today={today} nowMin={nowMin} kind="carried" />)}</ul>
                </section>
            )}

            <div className="grid gap-8 lg:grid-cols-2">
                <section>
                    <h2 className="mb-3 text-lg font-bold">📅 Today's plan</h2>
                    <ul className="space-y-2">
                        {todayTasks.length ? todayTasks.map((t, i) => <TaskRow key={t.id} t={t} i={i} today={today} nowMin={nowMin} kind="today" />)
                            : <p className="text-slate-400">Nothing planned yet. Add something above 👆</p>}
                    </ul>
                </section>

                <div className="space-y-8">
                    <section>
                        <h2 className="mb-3 text-lg font-bold">💡 Inbox <span className="text-sm font-normal text-slate-400">— remembered, not scheduled yet</span></h2>
                        <ul className="space-y-2">
                            {inbox.length ? inbox.map((t, i) => <InboxRow key={t.id} t={t} i={i} today={today} />)
                                : <p className="text-slate-400">Inbox is empty. Choose “Inbox” when adding something you just remembered.</p>}
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-bold">🌅 Tomorrow</h2>
                        <ul className="space-y-2">
                            {tomorrow.length ? tomorrow.map((t, i) => <TaskRow key={t.id} t={t} i={i} today={today} nowMin={nowMin} kind="tomorrow" />)
                                : <p className="text-slate-400">Nothing planned for tomorrow.</p>}
                        </ul>
                    </section>

                    {Object.keys(later).length > 0 && (
                        <section>
                            <h2 className="mb-3 text-lg font-bold">📆 Next 7 days</h2>
                            <ul className="space-y-2">
                                {Object.values(later).flat().map((t, i) => <TaskRow key={t.id} t={t} i={i} today={today} nowMin={nowMin} kind="later" />)}
                            </ul>
                        </section>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
