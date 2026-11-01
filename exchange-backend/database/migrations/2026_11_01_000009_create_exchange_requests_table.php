<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exchange_requests', function (Blueprint $table) {
            $table->id();
            $table->string('exchange_code')->unique(); // e.g. EXC-8801
            $table->foreignId('requester_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('offered_item_id')->constrained('items')->cascadeOnDelete();
            $table->foreignId('requested_item_id')->constrained('items')->cascadeOnDelete();
            $table->string('exchange_type')->default('Intercity Courier Delivery'); // In-Person Meetup, Intercity Courier Delivery
            $table->string('status')->default('Pending'); // Pending, Accepted, Deposit Review, Shipping, Completed, Rejected, Cancelled, Disputed
            $table->string('meetup_location')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exchange_requests');
    }
};
