import { Head, router, useForm } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { useState } from "react";

const money = (n) =>
    "Rs. " +
    Number(n).toLocaleString("en-LK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
const field =
    "rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/30";

const expenseCats = [
    "Food",
    "Transport",
    "Bills",
    "Rent",
    "Internet / Hosting",
    "Shopping",
    "Health",
    "Entertainment",
    "Other",
];
const incomeCats = ["Salary", "Project payment", "Freelance", "Other"];

const shiftMonth = (m, delta) => {
    const [y, mo] = m.split("-").map(Number);
    const d = new Date(y, mo - 1 + delta, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

function Stat({ label, value, sub, gradient, i }) {
    return (
        <div
            className={`fade-up card-hover rounded-3xl bg-gradient-to-br ${gradient} p-5 shadow-xl`}
            style={{ animationDelay: `${i * 90}ms` }}
        >
            <p className="text-sm text-white/80">{label}</p>
            <p
                className="pop mt-1 text-2xl font-black md:text-3xl"
                style={{ animationDelay: `${i * 90 + 200}ms` }}
            >
                {value}
            </p>
            {sub && <p className="mt-1 text-xs text-white/70">{sub}</p>}
        </div>
    );
}

function AddForm({ today }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        type: "expense",
        amount: "",
        category: "Food",
        description: "",
        txn_date: today,
    });
    const [custom, setCustom] = useState(false);
    const isExpense = data.type === "expense";
    const cats = isExpense ? expenseCats : incomeCats;

    const switchType = (type) => {
        setCustom(false);
        setData({
            ...data,
            type,
            category: type === "expense" ? expenseCats[0] : incomeCats[0],
        });
    };

    const pickCategory = (value) => {
        if (value === "__custom") {
            setCustom(true);
            setData("category", "");
        } else {
            setCustom(false);
            setData("category", value);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("finance.store"), {
            preserveScroll: true,
            onSuccess: () => reset("amount", "description"),
        });
    };

    return (
        <form
            onSubmit={submit}
            className="fade-up mb-8 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur"
        >
            <div className="mb-3 inline-flex rounded-xl bg-slate-900/60 p-1 text-sm">
                {["expense", "income"].map((t) => (
                    <button
                        type="button"
                        key={t}
                        onClick={() => switchType(t)}
                        className={`rounded-lg px-4 py-1.5 font-semibold capitalize transition-all duration-300 ${data.type === t ? (t === "expense" ? "bg-rose-500 shadow-lg shadow-rose-500/30" : "bg-emerald-500 shadow-lg shadow-emerald-500/30") : "text-slate-400"}`}
                    >
                        {t === "expense" ? "💸 Expense" : "💵 Income"}
                    </button>
                ))}
            </div>

            <div className="flex flex-wrap gap-3">
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={`${field} w-36`}
                    placeholder="Amount"
                    value={data.amount}
                    onChange={(e) => setData("amount", e.target.value)}
                    required
                />

                <select
                    className={`${field} w-48`}
                    value={custom ? "__custom" : data.category}
                    onChange={(e) => pickCategory(e.target.value)}
                >
                    {cats.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                    <option value="__custom">✏️ Other (type my own)</option>
                </select>

                {custom && (
                    <input
                        className={`${field} w-48`}
                        placeholder="Type category"
                        value={data.category}
                        onChange={(e) => setData("category", e.target.value)}
                        required
                        autoFocus
                    />
                )}

                <input
                    className={`${field} min-w-[220px] flex-1`}
                    placeholder={
                        isExpense
                            ? "What was it for? (e.g. lunch, bus fare, hosting)"
                            : "Where from? (e.g. IMDR payment)"
                    }
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                />
                <input
                    type="date"
                    className={field}
                    value={data.txn_date}
                    onChange={(e) => setData("txn_date", e.target.value)}
                    required
                />
                <button
                    disabled={processing}
                    className="animated-gradient rounded-xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 px-6 py-2 text-sm font-bold shadow-lg transition hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                    + Add
                </button>
            </div>
            {Object.values(errors).map((e) => (
                <p key={e} className="mt-2 text-sm text-rose-300">
                    {e}
                </p>
            ))}
        </form>
    );
}
export default function Index({
    month,
    monthLabel,
    daysInMonth,
    today,
    transactions,
    byCategory,
    totals,
}) {
    const go = (m) =>
        router.get(
            route("finance.index"),
            { month: m },
            { preserveState: true, preserveScroll: true },
        );

    // group by day
    const days = {};
    transactions.forEach((t) => {
        const d = (days[t.txn_date] ??= {
            date: t.txn_date,
            items: [],
            income: 0,
            expense: 0,
        });
        d.items.push(t);
        d[t.type] += Number(t.amount);
    });
    const dayList = Object.values(days).sort((a, b) =>
        a.date < b.date ? 1 : -1,
    );

    const perDay = Array.from(
        { length: daysInMonth },
        (_, i) =>
            days[`${month}-${String(i + 1).padStart(2, "0")}`]?.expense ?? 0,
    );
    const maxDay = Math.max(...perDay, 1);
    const maxCat = byCategory[0]?.total || 1;
    const saved = totals.saved;

    return (
        <AppLayout title="Finance">
            <Head title="Finance" />

            <div className="fade-up mb-6 flex items-center gap-3">
                <button
                    onClick={() => go(shiftMonth(month, -1))}
                    className="rounded-xl bg-white/10 px-4 py-2 transition hover:bg-indigo-500/60"
                >
                    ←
                </button>
                <h2 className="min-w-[160px] text-center text-xl font-bold">
                    {monthLabel}
                </h2>
                <button
                    onClick={() => go(shiftMonth(month, 1))}
                    className="rounded-xl bg-white/10 px-4 py-2 transition hover:bg-indigo-500/60"
                >
                    →
                </button>
            </div>

            <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat
                    i={0}
                    label="Income"
                    value={money(totals.income)}
                    gradient="from-emerald-500 to-teal-600"
                />
                <Stat
                    i={1}
                    label="Spent"
                    value={money(totals.expense)}
                    sub={`Avg ${money(totals.avg_daily)} / day`}
                    gradient="from-rose-500 to-orange-600"
                />
                <Stat
                    i={2}
                    label={saved >= 0 ? "Saved (left over)" : "Overspent"}
                    value={money(Math.abs(saved))}
                    sub={
                        totals.savings_rate !== null
                            ? `${totals.savings_rate}% of income`
                            : null
                    }
                    gradient={
                        saved >= 0
                            ? "from-indigo-500 to-blue-600"
                            : "from-red-600 to-rose-700"
                    }
                />
                <Stat
                    i={3}
                    label="Spent today"
                    value={money(totals.today_spent)}
                    gradient="from-fuchsia-500 to-pink-600"
                />
            </div>

            <AddForm today={today} />

            <div className="mb-8 grid gap-6 lg:grid-cols-2">
                <section className="fade-up rounded-3xl border border-white/10 bg-white/5 p-5">
                    <h3 className="mb-4 font-bold">📊 Daily spending</h3>
                    <div className="flex h-32 items-end gap-[3px]">
                        {perDay.map((v, i) => (
                            <div
                                key={i}
                                title={`Day ${i + 1}: ${money(v)}`}
                                className="flex-1 rounded-t bg-gradient-to-t from-rose-500 to-orange-400 transition-all duration-700 hover:opacity-80"
                                style={{
                                    height: `${(v / maxDay) * 100}%`,
                                    minHeight: v ? 4 : 2,
                                    opacity: v ? 1 : 0.15,
                                }}
                            />
                        ))}
                    </div>
                    <div className="mt-1 flex justify-between text-[10px] text-slate-500">
                        <span>1</span>
                        <span>{daysInMonth}</span>
                    </div>
                </section>

                <section className="fade-up rounded-3xl border border-white/10 bg-white/5 p-5">
                    <h3 className="mb-4 font-bold">🧾 Where the money went</h3>
                    {byCategory.length ? (
                        byCategory.map((c) => (
                            <div key={c.category} className="mb-3">
                                <div className="mb-1 flex justify-between text-xs">
                                    <span>{c.category}</span>
                                    <span className="text-slate-300">
                                        {money(c.total)} ·{" "}
                                        {Math.round(
                                            (c.total / totals.expense) * 100,
                                        )}
                                        %
                                    </span>
                                </div>
                                <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                                    <div
                                        className="bar-grow h-full rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400"
                                        style={{
                                            width: `${(c.total / maxCat) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-slate-400">
                            No expenses this month yet.
                        </p>
                    )}
                </section>
            </div>

            <section className="space-y-5">
                <h3 className="text-lg font-bold">📅 Day by day</h3>
                {dayList.length === 0 && (
                    <p className="text-slate-400">
                        Nothing recorded for {monthLabel}.
                    </p>
                )}
                {dayList.map((d, i) => (
                    <div
                        key={d.date}
                        className="fade-up rounded-3xl border border-white/10 bg-white/5 p-4"
                        style={{ animationDelay: `${i * 50}ms` }}
                    >
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <p className="font-semibold">
                                {new Date(d.date).toLocaleDateString("en-GB", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "short",
                                })}
                            </p>
                            <p className="text-xs">
                                {d.income > 0 && (
                                    <span className="mr-3 text-emerald-300">
                                        + {money(d.income)}
                                    </span>
                                )}
                                {d.expense > 0 && (
                                    <span className="text-rose-300">
                                        − {money(d.expense)}
                                    </span>
                                )}
                            </p>
                        </div>
                        <ul className="space-y-1.5">
                            {d.items.map((t) => (
                                <li
                                    key={t.id}
                                    className="group flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-white/10"
                                >
                                    <span>
                                        {t.type === "income" ? "💵" : "💸"}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {t.description || t.category}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {t.category}
                                        </p>
                                    </div>
                                    <p
                                        className={`text-sm font-bold ${t.type === "income" ? "text-emerald-300" : "text-rose-300"}`}
                                    >
                                        {t.type === "income" ? "+" : "−"}{" "}
                                        {money(t.amount)}
                                    </p>
                                    <button
                                        onClick={() =>
                                            confirm("Delete this entry?") &&
                                            router.delete(
                                                route("finance.destroy", t.id),
                                                { preserveScroll: true },
                                            )
                                        }
                                        className="text-xs text-slate-500 opacity-0 transition hover:text-rose-400 group-hover:opacity-100"
                                    >
                                        ✕
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </section>
        </AppLayout>
    );
}
