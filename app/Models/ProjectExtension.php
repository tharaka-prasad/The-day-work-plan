<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectExtension extends Model
{
    protected $fillable = ['project_id', 'old_due_date', 'new_due_date', 'reason'];

    protected $casts = ['old_due_date' => 'date:Y-m-d', 'new_due_date' => 'date:Y-m-d'];
}
