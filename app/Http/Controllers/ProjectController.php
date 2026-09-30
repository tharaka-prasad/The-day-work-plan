<?php
namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class ProjectController extends Controller
{
    private function rules(bool $partial = false): array
    {
        $s = $partial ? 'sometimes|' : '';

        return [
            'name'        => $s . 'required|string|max:255',
            'client'      => 'nullable|string|max:255',
            'technology'  => 'nullable|string|max:255',
            'budget'      => 'nullable|numeric|min:0|max:9999999999',
            'description' => 'nullable|string',
            'notes'       => 'nullable|string',
            'start_date'  => 'nullable|date',
            'start_time'  => 'nullable|date_format:H:i',
            'due_date'    => 'nullable|date|after_or_equal:start_date',
            'due_time'    => 'nullable|date_format:H:i',
            'priority'    => $s . 'required|in:low,medium,high',
            'status'      => $s . 'required|in:planning,in_progress,completed',
        ];
    }

    private const COUNTS = [
        'tasks',
        'tasks as done_count'           => null, // replaced below
        'milestones',
        'milestones as milestones_done' => null,
    ];

    private function counts(): array
    {
        return [
            'tasks',
            'tasks as done_count'           => fn($q)           => $q->where('status', 'completed'),
            'milestones',
            'milestones as milestones_done' => fn($q) => $q->where('is_done', true),
            'extensions',
        ];
    }

    private function decorate(Project $p): Project
    {
        $total = $p->tasks_count + $p->milestones_count;
        $done  = $p->done_count + $p->milestones_done;

        $p->progress  = $total ? round($done / $total * 100) : 0;
        $p->days_left = $p->due_date ? (int) today()->diffInDays($p->due_date, false) : null;

        return $p;
    }

    public function index(Request $r)
    {
        $projects = Project::where('user_id', $r->user()->id)
            ->withCount($this->counts())
            ->orderByRaw("status = 'completed'")->orderBy('due_date')->get()
            ->map(fn($p) => $this->decorate($p));

        return Inertia::render('Projects/Index', ['projects' => $projects]);
    }

    public function show(Request $r, Project $project)
    {
        abort_unless($project->user_id === $r->user()->id, 403);

        $project->loadCount($this->counts());
        $this->decorate($project);

        return Inertia::render('Projects/Show', [
            'project'    => $project,
            'milestones' => $project->milestones()->get(),
            'tasks'      => $project->tasks()->orderByRaw("status = 'completed'")->orderBy('task_date')->get(),
            'today'      => today()->toDateString(),
            'extensions' => $project->extensions()->latest('id')->get(),
        ]);
    }

    public function store(Request $r)
    {
        $data = $r->validate($this->rules() + [
            'milestones'            => 'nullable|array|max:30',
            'milestones.*.title'    => 'required|string|max:255',
            'milestones.*.due_date' => 'nullable|date',
        ]);

        $milestones = $data['milestones'] ?? [];
        unset($data['milestones']);

        $project = $r->user()->projects()->create($data);

        foreach (array_values($milestones) as $i => $m) {
            $project->milestones()->create([
                'title'    => $m['title'],
                'due_date' => $m['due_date'] ?? null,
                'sort'     => $i,
            ]);
        }

        return redirect()->route('projects.show', $project);
    }

    public function update(Request $r, Project $project)
    {
        abort_unless($project->user_id === $r->user()->id, 403);

        $data = $r->validate($this->rules(partial: true));

        if (isset($data['status'])) {
            $data['completed_at'] = $data['status'] === 'completed' ? today() : null;
        }

        $project->update($data);
        return back();
    }

        public function extend(Request $r, Project $project)
    {
        abort_unless($project->user_id === $r->user()->id, 403);

        $data = $r->validate([
            'days' => 'required_without:new_date|nullable|integer|min:1|max:365',
            'new_date' => 'required_without:days|nullable|date|after_or_equal:today',
            'reason' => 'nullable|string|max:255',
        ]);

        if (! empty($data['new_date'])) {
            $newDate = Carbon::parse($data['new_date']);
        } else {
            // overdue or due today: count from today. Deadline still in the future: count from that deadline.
            $base = $project->due_date && $project->due_date->gt(today()) ? $project->due_date->copy() : today();
            $newDate = $base->addDays((int) $data['days']);
        }

        $project->extensions()->create([
            'old_due_date' => $project->due_date,
            'new_due_date' => $newDate,
            'reason' => $data['reason'] ?? null,
        ]);

        $project->update(['due_date' => $newDate]);

        return back();
    }

    public function destroy(Request $r, Project $project)
    {
        abort_unless($project->user_id === $r->user()->id, 403);
        $project->delete();
        return redirect()->route('projects.index');
    }
}
