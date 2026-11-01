<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('disputes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exchange_id')->constrained('exchange_requests')->cascadeOnDelete();
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->string('reason'); // Damaged Item, Counterfeit Listing, Condition Differs, Missing Parcel
            $table->text('description');
            $table->text('evidence')->nullable(); // JSON or image URLs
            $table->string('status')->default('Open'); // Open, Under Review, Resolved, Rejected
            $table->text('admin_notes')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disputes');
    }
};
