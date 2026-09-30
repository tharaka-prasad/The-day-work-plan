<?php

namespace App\Http\Middleware;

use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'alerts' => fn () => $request->user() ? $this->alerts($request->user()->id) : null,
        ];
    }

    private function alerts(int $userId): array
    {
        $today = today();

        $projects = Project::where('user_id', $userId)
            ->where('status', '!=', 'completed')
            ->whereNotNull('due_date')
            ->whereDate('due_date', '<=', $today)
            ->orderBy('due_date')
            ->get(['id', 'name', 'status', 'priority', 'due_date', 'due_time'])
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'status' => $p->status,
                'priority' => $p->priority,
                'due_date' => $p->due_date->toDateString(),
                'due_time' => $p->due_time ? substr($p->due_time, 0, 5) : null,
                'days_overdue' => abs((int) $p->due_date->diffInDays($today, false)),
            ]);

        return [
            'today' => $today->toDateString(),
            'due_today' => $projects->where('days_overdue', 0)->values(),
            'overdue' => $projects->where('days_overdue', '>', 0)->values(),
        ];
    }
}
