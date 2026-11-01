<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('receipt_confirmations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exchange_id')->constrained('exchange_requests')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('condition_notes')->nullable();
            $table->string('evidence')->nullable(); // Arrival photo
            $table->timestamp('confirmed_at');
            $table->unique(['exchange_id', 'user_id']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('receipt_confirmations');
    }
};
