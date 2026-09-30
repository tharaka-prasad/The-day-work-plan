import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

const APP_NAME = 'Mathaka'; // change the name here

const features = [
    ['📅', 'Plan every day', "See today's work, time by time"],
    ['⚠️', 'Nothing forgotten', 'Unfinished work carries forward automatically'],
    ['🚀', 'Track projects', 'Deadlines, phases and progress in one place'],
    ['💰', 'Know your money', 'Daily spending and monthly savings'],
];

const input =
    'w-full rounded-xl border border-white/10 bg-slate-900/60 py-3 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/30';

export default function Login({ status, canResetPassword }) {
    const [show, setShow] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({ email: '', password: '', remember: false });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-4 text-slate-100">
            <Head title="Log in" />

            <div className="float pointer-events-none absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-fuchsia-600/25 blur-3xl" />
            <div className="float pointer-events-none absolute -bottom-40 -right-32 h-[30rem] w-[30rem] rounded-full bg-cyan-500/15 blur-3xl" style={{ animationDelay: '2s' }} />
            <div className="float pointer-events-none absolute right-1/3 top-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" style={{ animationDelay: '4s' }} />

            <div className="pop relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-indigo-950/60 backdrop-blur-xl lg:grid-cols-2">
                {/* brand side */}
                <div className="animated-gradient relative hidden flex-col justify-between bg-gradient-to-br from-indigo-600/80 via-fuchsia-600/70 to-cyan-500/60 p-10 lg:flex">
                    <div className="flex items-center gap-3">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 text-2xl shadow-lg backdrop-blur">🧠</div>
                        <p className="text-2xl font-extrabold tracking-tight">{APP_NAME}</p>
                    </div>

                    <div>
                        <h2 className="fade-up text-4xl font-black leading-tight">
                            Nothing<br />forgotten.
                        </h2>
                        <p className="fade-up mt-3 max-w-xs text-white/80" style={{ animationDelay: '120ms' }}>
                            Your work, projects and money in one calm place.
                        </p>

                        <ul className="mt-8 space-y-4">
                            {features.map(([icon, title, text], i) => (
                                <li key={title} className="fade-up flex items-start gap-3" style={{ animationDelay: `${250 + i * 120}ms` }}>
                                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/20 text-lg">{icon}</span>
                                    <div>
                                        <p className="text-sm font-bold">{title}</p>
                                        <p className="text-xs text-white/75">{text}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <p className="text-xs text-white/60">© {new Date().getFullYear()} {APP_NAME}</p>
                </div>

                {/* form side */}
                <div className="p-8 sm:p-12">
                    <div className="mb-8 flex items-center gap-3 lg:hidden">
                        <div className="animated-gradient grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-tr from-indigo-500 via-fuchsia-500 to-cyan-400 text-xl shadow-lg">🧠</div>
                        <p className="text-xl font-extrabold">{APP_NAME}</p>
                    </div>

                    <h1 className="fade-up text-3xl font-extrabold tracking-tight">Welcome back 👋</h1>
                    <p className="fade-up mt-2 text-sm text-slate-400" style={{ animationDelay: '80ms' }}>Log in to see what's planned for today.</p>

                    {status && (
                        <div className="fade-up mt-5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{status}</div>
                    )}

                    <form onSubmit={submit} className="mt-8 space-y-5">
                        <div className="fade-up" style={{ animationDelay: '160ms' }}>
                            <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-slate-300">Email</label>
                            <div className="relative">
                                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">✉️</span>
                                <input id="email" type="email" name="email" value={data.email} autoComplete="username" autoFocus required
                                    placeholder="you@example.com" className={input} onChange={(e) => setData('email', e.target.value)} />
                            </div>
                            {errors.email && <p className="mt-1.5 text-xs text-rose-300">{errors.email}</p>}
                        </div>

                        <div className="fade-up" style={{ animationDelay: '240ms' }}>
                            <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-slate-300">Password</label>
                            <div className="relative">
                                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔒</span>
                                <input id="password" type={show ? 'text' : 'password'} name="password" value={data.password} autoComplete="current-password" required
                                    placeholder="••••••••" className={`${input} pr-12`} onChange={(e) => setData('password', e.target.value)} />
                                <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm text-slate-400 transition hover:bg-white/10 hover:text-white">
                                    {show ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1.5 text-xs text-rose-300">{errors.password}</p>}
                        </div>

                        <div className="fade-up flex items-center justify-between text-sm" style={{ animationDelay: '320ms' }}>
                            <label className="flex cursor-pointer items-center gap-2 text-slate-300">
                                <input type="checkbox" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)}
                                    className="h-4 w-4 rounded border-white/20 bg-slate-900 accent-fuchsia-500" />
                                Remember me
                            </label>
                            {canResetPassword && (
                                <Link href={route('password.request')} className="text-slate-400 transition hover:text-fuchsia-300">Forgot password?</Link>
                            )}
                        </div>

                        <button disabled={processing}
                            className="animated-gradient fade-up flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 py-3 text-sm font-bold shadow-lg shadow-fuchsia-500/20 transition hover:scale-[1.02] hover:shadow-fuchsia-500/40 active:scale-95 disabled:opacity-60"
                            style={{ animationDelay: '400ms' }}>
                            {processing && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
                            {processing ? 'Logging in…' : 'Log in'}
                        </button>
                    </form>

                    <p className="fade-up mt-8 text-center text-xs text-slate-500" style={{ animationDelay: '480ms' }}>
                        Need an account? Ask your administrator.
                    </p>
                </div>
            </div>
        </div>
    );
}
