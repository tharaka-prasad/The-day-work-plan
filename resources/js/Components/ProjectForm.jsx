import { useForm } from '@inertiajs/react';

const field = 'w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/30';
const standardPhases = ['Planning', 'Development', 'Testing', 'Deployment', 'Documentation'];
const hm = (s) => (s ? s.slice(0, 5) : '');

function L({ label, children, className = '' }) {
    return <label className={`block text-xs text-slate-400 ${className}`}><span className="mb-1 block">{label}</span>{children}</label>;
}

export default function ProjectForm({ project, onDone }) {
    const editing = !!project;
    const { data, setData, post, patch, processing, errors } = useForm({
        name: project?.name ?? '',
        client: project?.client ?? '',
        technology: project?.technology ?? '',
        priority: project?.priority ?? 'medium',
        status: project?.status ?? 'planning',
        budget: project?.budget ?? '',
        start_date: project?.start_date ?? '',
        start_time: hm(project?.start_time),
        due_date: project?.due_date ?? '',
        due_time: hm(project?.due_time),
        description: project?.description ?? '',
        notes: project?.notes ?? '',
        milestones: [],
    });

    const setMs = (i, key, value) => setData('milestones', data.milestones.map((m, x) => (x === i ? { ...m, [key]: value } : m)));

    const submit = (e) => {
        e.preventDefault();
        if (editing) patch(route('projects.update', project.id), { preserveScroll: true, onSuccess: () => onDone?.() });
        else post(route('projects.store'));
    };

    return (
        <form onSubmit={submit} className="fade-up mb-8 space-y-5 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <h3 className="text-lg font-bold">{editing ? '✏️ Edit project' : '🚀 New project'}</h3>

            <div className="grid gap-4 md:grid-cols-3">
                <L label="Project name *" className="md:col-span-2"><input className={field} value={data.name} onChange={(e) => setData('name', e.target.value)} required /></L>
                <L label="Client"><input className={field} value={data.client} onChange={(e) => setData('client', e.target.value)} /></L>
                <L label="Technology"><input className={field} placeholder="Laravel, React, MySQL" value={data.technology} onChange={(e) => setData('technology', e.target.value)} /></L>
                <L label="Priority">
                    <select className={field} value={data.priority} onChange={(e) => setData('priority', e.target.value)}>
                        <option value="high">🔴 High</option><option value="medium">🟠 Medium</option><option value="low">🟢 Low</option>
                    </select>
                </L>
                <L label="Status">
                    <select className={field} value={data.status} onChange={(e) => setData('status', e.target.value)}>
                        <option value="planning">Planning</option><option value="in_progress">In progress</option><option value="completed">Completed</option>
                    </select>
                </L>
                <L label="Budget (Rs.)"><input type="number" min="0" step="0.01" className={field} value={data.budget} onChange={(e) => setData('budget', e.target.value)} /></L>
            </div>

            <div>
                <p className="mb-2 text-sm font-semibold">🗓️ When will it be done?</p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <L label="Start date"><input type="date" className={field} value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} /></L>
                    <L label="Start time"><input type="time" className={field} value={data.start_time} onChange={(e) => setData('start_time', e.target.value)} /></L>
                    <L label="Target finish date"><input type="date" className={field} value={data.due_date} min={data.start_date || undefined} onChange={(e) => setData('due_date', e.target.value)} /></L>
                    <L label="Target finish time"><input type="time" className={field} value={data.due_time} onChange={(e) => setData('due_time', e.target.value)} /></L>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <L label="Description (what and how)"><textarea rows="4" className={field} value={data.description} onChange={(e) => setData('description', e.target.value)} /></L>
                <L label="Notes"><textarea rows="4" className={field} value={data.notes} onChange={(e) => setData('notes', e.target.value)} /></L>
            </div>

            {!editing && (
                <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">🏁 Phases / milestones</p>
                        <button type="button" onClick={() => setData('milestones', standardPhases.map((title) => ({ title, due_date: '' })))}
                            className="rounded-lg bg-white/10 px-3 py-1 text-xs transition hover:bg-indigo-500/60">Use standard phases</button>
                        <button type="button" onClick={() => setData('milestones', [...data.milestones, { title: '', due_date: '' }])}
                            className="rounded-lg bg-white/10 px-3 py-1 text-xs transition hover:bg-indigo-500/60">+ Add phase</button>
                    </div>
                    <div className="space-y-2">
                        {data.milestones.map((m, i) => (
                            <div key={i} className="fade-up flex flex-wrap gap-2">
                                <input className={`${field} min-w-[200px] flex-1`} placeholder="Phase name" value={m.title} onChange={(e) => setMs(i, 'title', e.target.value)} required />
                                <input type="date" className={`${field} w-44`} value={m.due_date} onChange={(e) => setMs(i, 'due_date', e.target.value)} />
                                <button type="button" onClick={() => setData('milestones', data.milestones.filter((_, x) => x !== i))} className="rounded-xl bg-white/10 px-3 transition hover:bg-rose-500/60">✕</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {Object.values(errors).map((e) => <p key={e} className="text-sm text-rose-300">{e}</p>)}

            <div className="flex gap-3">
                <button disabled={processing} className="animated-gradient rounded-xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 px-6 py-2 text-sm font-bold shadow-lg transition hover:scale-105 active:scale-95 disabled:opacity-50">{editing ? 'Save changes' : 'Create project'}</button>
                {editing && <button type="button" onClick={onDone} className="rounded-xl bg-white/10 px-5 py-2 text-sm transition hover:bg-white/20">Cancel</button>}
            </div>
        </form>
    );
}
