<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exchange_id')->constrained('exchange_requests')->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('receiver_id')->constrained('users')->cascadeOnDelete();
            $table->string('courier_name'); // e.g. Royal Express Courier, Elite Cargo Express
            $table->string('tracking_number'); // e.g. RX-8921-MY
            $table->string('shipping_proof')->nullable(); // Slip / Waybill photo URL
            $table->date('shipping_date')->nullable();
            $table->string('shipping_status')->default('Dispatched'); // Pending, Dispatched, In Transit, Delivered
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
