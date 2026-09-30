<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $uid = auth()->id();
        $today = today();
        $open = ['pending', 'in_progress'];

        $base = fn () => Task::with('project:id,name')->where('user_id', $uid);

        // tasks with a time first (earliest first), tasks without a time last
        $order = "COALESCE(start_time, due_time) IS NULL, COALESCE(start_time, due_time), FIELD(priority,'high','medium','low')";

        // Older tasks that were never finished
        $carried = $base()->whereIn('status', $open)->whereDate('task_date', '<', $today)
            ->orderBy('task_date')->orderByRaw($order)->get();

        $todayTasks = $base()->whereDate('task_date', $today)->where('status', '!=', 'cancelled')
            ->orderByRaw($order)->get();

        $tomorrow = $base()->whereDate('task_date', $today->copy()->addDay())->where('status', '!=', 'cancelled')
            ->orderByRaw($order)->get();

        $upcoming = $base()->whereIn('status', $open)
            ->whereDate('task_date', '>', $today->copy()->addDay())
            ->whereDate('task_date', '<=', $today->copy()->addDays(7))
            ->orderBy('task_date')->orderByRaw($order)->get();

        // remembered today, no date yet
        $inbox = $base()->whereNull('task_date')->whereIn('status', $open)->latest()->get();

        return Inertia::render('Dashboard', [
            'today' => $today->toDateString(),
            'carried' => $carried,
            'todayTasks' => $todayTasks,
            'tomorrow' => $tomorrow,
            'upcoming' => $upcoming,
            'inbox' => $inbox,
            'projects' => Project::where('user_id', $uid)->where('status', '!=', 'completed')->get(['id', 'name']),
        ]);
    }
}
