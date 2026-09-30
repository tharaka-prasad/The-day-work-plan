<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->string('name');
            $t->string('client')->nullable();
            $t->text('description')->nullable();
            $t->date('start_date')->nullable();
            $t->date('due_date')->nullable();
            $t->date('completed_at')->nullable();
            $t->string('status')->default('in_progress'); // planning | in_progress | completed
            $t->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('projects'); }
};
