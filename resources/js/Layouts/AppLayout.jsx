import { Link, usePage } from "@inertiajs/react";
import ProjectAlerts from "@/Components/ProjectAlerts";

const nav = [
    { label: "Dashboard", href: "/dashboard", match: "dashboard", icon: "🏠" },
    {
        label: "Projects",
        href: "/projects",
        match: "projects.index",
        icon: "🚀",
    },
    { label: "Finance", href: "/finance", match: "finance.index", icon: "💰" },
];
const adminNav = {
    label: "Users",
    href: "/admin/users",
    match: "admin.users.index",
    icon: "🛡️",
};

export default function AppLayout({ title, children }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const current = route().current();
    const items = user?.role === "super_admin" ? [...nav, adminNav] : nav;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100">
            <ProjectAlerts />
            <div className="pointer-events-none fixed -top-32 -left-32 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-3xl float" />
            <div
                className="pointer-events-none fixed bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl float"
                style={{ animationDelay: "2s" }}
            />

            <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-white/10 bg-white/5 p-5 backdrop-blur-xl md:flex">
                <div className="mb-8 flex items-center gap-3">
                    <div className="animated-gradient grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-tr from-indigo-500 via-fuchsia-500 to-cyan-400 text-xl shadow-lg">
                        ✅
                    </div>
                    <div>
                        <p className="font-bold leading-tight">Mathaka</p>
                        <p className="text-xs text-slate-400">
                            Nothing forgotten
                        </p>
                    </div>
                </div>

                <nav className="space-y-1">
                    {items.map((n) => (
                        <Link
                            key={n.href}
                            href={n.href}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                                current === n.match
                                    ? "bg-gradient-to-r from-indigo-500/80 to-fuchsia-500/70 shadow-lg shadow-indigo-500/30"
                                    : "text-slate-300 hover:translate-x-1 hover:bg-white/10"
                            }`}
                        >
                            <span>{n.icon}</span>
                            {n.label}
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="truncate text-sm font-semibold">
                        {user?.name}
                    </p>
                    <div className="mt-2 flex gap-3 text-xs text-slate-400">
                        <Link
                            href={route("profile.edit")}
                            className="hover:text-white"
                        >
                            Profile
                        </Link>
                        <Link
                            href={route("logout")}
                            method="post"
                            as="button"
                            className="hover:text-rose-300"
                        >
                            Log out
                        </Link>
                    </div>
                </div>
            </aside>

            <main className="relative z-10 p-5 md:ml-64 md:p-10">
                <h1 className="fade-up mb-8 text-3xl font-extrabold tracking-tight">
                    {title}
                </h1>
                {children}
            </main>
        </div>
    );
}
