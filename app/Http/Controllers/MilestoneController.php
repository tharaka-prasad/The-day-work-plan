<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectMilestone;
use Illuminate\Http\Request;

class MilestoneController extends Controller
{
    public function store(Request $r, Project $project)
    {
        abort_unless($project->user_id === $r->user()->id, 403);

        $data = $r->validate([
            'title' => 'required|string|max:255',
            'due_date' => 'nullable|date',
        ]);

        $project->milestones()->create($data + ['sort' => ($project->milestones()->max('sort') ?? -1) + 1]);
        return back();
    }

    public function update(Request $r, ProjectMilestone $milestone)
    {
        abort_unless($milestone->project->user_id === $r->user()->id, 403);

        $milestone->update($r->validate([
            'title' => 'sometimes|string|max:255',
            'due_date' => 'sometimes|nullable|date',
            'is_done' => 'sometimes|boolean',
        ]));

        return back();
    }

    public function destroy(Request $r, ProjectMilestone $milestone)
    {
        abort_unless($milestone->project->user_id === $r->user()->id, 403);
        $milestone->delete();
        return back();
    }
}
