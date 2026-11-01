<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exchange_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exchange_id')->constrained('exchange_requests')->cascadeOnDelete();
            $table->foreignId('payer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->decimal('deposit_amount', 12, 2);
            $table->string('payment_method')->nullable(); // KBZPay, WavePay, AYA Pay, CB Pay
            $table->string('reference_number')->nullable();
            $table->string('payment_proof')->nullable(); // Screenshot image URL
            $table->string('payment_status')->default('Unpaid'); // Unpaid, Payment Submitted, Verified, Rejected
            $table->text('rejection_reason')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exchange_payments');
    }
};
