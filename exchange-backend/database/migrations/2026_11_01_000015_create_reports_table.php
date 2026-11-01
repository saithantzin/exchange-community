<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('reported_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('reported_item_id')->nullable()->constrained('items')->nullOnDelete();
            $table->foreignId('exchange_id')->nullable()->constrained('exchange_requests')->nullOnDelete();
            $table->string('type'); // Misleading Description, Prohibited Item, Inappropriate Behavior, etc.
            $table->text('description');
            $table->text('evidence')->nullable();
            $table->string('status')->default('Open'); // Open, Under Review, Resolved, Dismissed
            $table->text('admin_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
