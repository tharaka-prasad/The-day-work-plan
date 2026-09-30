<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = ['user_id', 'type', 'amount', 'category', 'description', 'txn_date'];

    protected $casts = ['txn_date' => 'date:Y-m-d', 'amount' => 'decimal:2'];
}
