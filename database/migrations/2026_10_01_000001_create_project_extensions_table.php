<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('project_extensions', function (Blueprint $t) {
            $t->id();
            $t->foreignId('project_id')->constrained()->cascadeOnDelete();
            $t->date('old_due_date')->nullable();
            $t->date('new_due_date');
            $t->string('reason')->nullable();
            $t->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('project_extensions'); }
};
