<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('townships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('state_region_id')->constrained('state_regions')->cascadeOnDelete();
            $table->string('name'); // e.g. Kamayut, Chanayethazan, Taunggyi
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('townships');
    }
};
