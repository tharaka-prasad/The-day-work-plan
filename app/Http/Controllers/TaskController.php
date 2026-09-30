<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    public function store(Request $r)
    {
        $data = $r->validate([
            'title' => 'required|string|max:255',
            'task_date' => 'nullable|date',                 // null = Inbox
            'start_time' => 'nullable|date_format:H:i',
            'due_time' => 'nullable|date_format:H:i',
            'priority' => 'required|in:low,medium,high',
            'project_id' => ['nullable', Rule::exists('projects', 'id')->where('user_id', $r->user()->id)],
            'notes' => 'nullable|string',
        ]);

        $r->user()->tasks()->create($data);
        return back();
    }

    public function update(Request $r, Task $task)
    {
        abort_unless($task->user_id === $r->user()->id, 403);

        $data = $r->validate([
            'title' => 'sometimes|string|max:255',
            'task_date' => 'sometimes|nullable|date',
            'start_time' => 'sometimes|nullable|date_format:H:i',
            'due_time' => 'sometimes|nullable|date_format:H:i',
            'priority' => 'sometimes|in:low,medium,high',
            'status' => 'sometimes|in:pending,in_progress,completed,cancelled',
        ]);

        if (isset($data['status'])) {
            $data['completed_at'] = $data['status'] === 'completed' ? now() : null;
        }

        $task->update($data);
        return back();
    }

    public function destroy(Request $r, Task $task)
    {
        abort_unless($task->user_id === $r->user()->id, 403);
        $task->delete();
        return back();
    }
}
