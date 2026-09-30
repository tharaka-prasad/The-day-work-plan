<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = [
        'user_id', 'project_id', 'title', 'notes', 'task_date', 'start_time', 'due_time',
        'priority', 'status', 'completed_at',
    ];

    protected $casts = ['task_date' => 'date:Y-m-d', 'completed_at' => 'datetime'];

    public function project() { return $this->belongsTo(Project::class); }
}
