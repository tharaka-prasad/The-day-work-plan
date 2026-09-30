<?php
namespace App\Models;

use App\Models\ProjectMilestone;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'user_id', 'name', 'client', 'technology', 'budget', 'description', 'notes',
        'start_date', 'start_time', 'due_date', 'due_time', 'completed_at', 'status', 'priority',
    ];

    protected $casts = [
        'start_date'   => 'date:Y-m-d',
        'due_date'     => 'date:Y-m-d',
        'completed_at' => 'date:Y-m-d',
        'budget'       => 'decimal:2',
    ];

    public function tasks()
    {return $this->hasMany(Task::class);}

    public function milestones()
    {return $this->hasMany(ProjectMilestone::class)->orderBy('sort')->orderBy('due_date');}
    public function extensions()
    {return $this->hasMany(ProjectExtension::class);}

}
