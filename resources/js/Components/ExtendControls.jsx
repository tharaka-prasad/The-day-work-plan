import { useState } from 'react';
import { router } from '@inertiajs/react';

const field = 'rounded-xl border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/30';
const chips = [[1, '+1 day'], [2, '+2 days'], [3, '+3 days'], [7, '+1 week']];

export default function ExtendControls({ projectId, today }) {
    const [reason, setReason] = useState('');
    const [date, setDate] = useState('');
    const [busy, setBusy] = useState(false);

    const send = (payload) =>
        router.post(route('projects.extend', projectId), { ...payload, reason }, {
            preserveScroll: true,
            onStart: () => setBusy(true),
            onFinish: () => setBusy(false),
            onSuccess: () => { setReason(''); setDate(''); },
        });

    return (
        <div className="space-y-2">
            <input className={`${field} w-full`} placeholder="Why more time? (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
            <div className="flex flex-wrap items-center gap-2 text-xs">
                {chips.map(([days, label]) => (
                    <button key={days} disabled={busy} onClick={() => send({ days })}
                        className="rounded-lg bg-white/10 px-3 py-1.5 transition hover:bg-indigo-500/70 disabled:opacity-50">{label}</button>
                ))}
                <span className="text-slate-500">or</span>
                <input type="date" className={field} min={today} value={date} onChange={(e) => setDate(e.target.value)} />
                <button disabled={busy || !date} onClick={() => send({ new_date: date })}
                    className="rounded-lg bg-indigo-500 px-3 py-1.5 font-semibold transition hover:bg-indigo-400 disabled:opacity-40">Set date</button>
            </div>
        </div>
    );
}
