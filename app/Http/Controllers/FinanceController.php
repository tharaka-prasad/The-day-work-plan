<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FinanceController extends Controller
{
    public function index(Request $r)
    {
        $uid = $r->user()->id;

        try {
            $start = Carbon::createFromFormat('!Y-m', (string) $r->query('month', today()->format('Y-m')))->startOfMonth();
        } catch (\Throwable) {
            $start = today()->startOfMonth();
        }
        $end = $start->copy()->endOfMonth();

        $transactions = Transaction::where('user_id', $uid)
            ->whereBetween('txn_date', [$start->toDateString(), $end->toDateString()])
            ->orderByDesc('txn_date')->orderByDesc('id')->get();

        $income = (float) $transactions->where('type', 'income')->sum('amount');
        $expense = (float) $transactions->where('type', 'expense')->sum('amount');
        $saved = $income - $expense;

        $daysElapsed = $start->isSameMonth(today()) ? today()->day : $start->daysInMonth;

        $byCategory = $transactions->where('type', 'expense')->groupBy('category')
            ->map(fn ($g, $cat) => ['category' => $cat, 'total' => (float) $g->sum('amount')])
            ->sortByDesc('total')->values();

        $todaySpent = (float) Transaction::where('user_id', $uid)->where('type', 'expense')
            ->whereDate('txn_date', today())->sum('amount');

        return Inertia::render('Finance/Index', [
            'month' => $start->format('Y-m'),
            'monthLabel' => $start->format('F Y'),
            'daysInMonth' => $start->daysInMonth,
            'today' => today()->toDateString(),
            'transactions' => $transactions,
            'byCategory' => $byCategory,
            'totals' => [
                'income' => $income,
                'expense' => $expense,
                'saved' => $saved,
                'savings_rate' => $income > 0 ? round($saved / $income * 100) : null,
                'avg_daily' => $daysElapsed ? round($expense / $daysElapsed, 2) : 0,
                'today_spent' => $todaySpent,
            ],
        ]);
    }

    public function store(Request $r)
    {
        $data = $r->validate([
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0.01|max:9999999999',
            'category' => 'required|string|max:60',
            'description' => 'nullable|string|max:255',
            'txn_date' => 'required|date',
        ]);

        Transaction::create($data + ['user_id' => $r->user()->id]);
        return back();
    }

    public function destroy(Request $r, Transaction $transaction)
    {
        abort_unless($transaction->user_id === $r->user()->id, 403);
        $transaction->delete();
        return back();
    }
}
