<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectMilestone extends Model
{
    protected $fillable = ['project_id', 'title', 'due_date', 'is_done', 'sort'];

    protected $casts = ['due_date' => 'date:Y-m-d', 'is_done' => 'boolean'];

    public function project() { return $this->belongsTo(Project::class); }
}
