<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->string('type');                       // income | expense
            $t->decimal('amount', 12, 2);
            $t->string('category', 60);
            $t->string('description')->nullable();    // what it was for
            $t->date('txn_date')->index();
            $t->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('transactions'); }
};
