<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $t) {
            $t->string('priority')->default('medium')->after('status');   // low | medium | high
            $t->string('technology')->nullable()->after('client');
            $t->decimal('budget', 12, 2)->nullable()->after('technology');
            $t->time('start_time')->nullable()->after('start_date');
            $t->time('due_time')->nullable()->after('due_date');
            $t->text('notes')->nullable()->after('description');
        });

        Schema::create('project_milestones', function (Blueprint $t) {
            $t->id();
            $t->foreignId('project_id')->constrained()->cascadeOnDelete();
            $t->string('title');
            $t->date('due_date')->nullable();
            $t->boolean('is_done')->default(false);
            $t->unsignedSmallInteger('sort')->default(0);
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_milestones');
        Schema::table('projects', function (Blueprint $t) {
            $t->dropColumn(['priority', 'technology', 'budget', 'start_time', 'due_time', 'notes']);
        });
    }
};
