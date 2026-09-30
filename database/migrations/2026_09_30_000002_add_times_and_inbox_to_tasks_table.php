<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $t) {
            $t->date('task_date')->nullable()->change();   // null = still in the Inbox
            $t->time('start_time')->nullable()->after('task_date');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $t) {
            $t->dropColumn('start_time');
        });
    }
};
