<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
            $t->string('title');
            $t->text('notes')->nullable();
            $t->date('task_date')->index();
            $t->time('due_time')->nullable();
            $t->string('priority')->default('medium');  // low | medium | high
            $t->string('status')->default('pending');   // pending | in_progress | completed | cancelled
            $t->timestamp('completed_at')->nullable();
            $t->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('tasks'); }
};
