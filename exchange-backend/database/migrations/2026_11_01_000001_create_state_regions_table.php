<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('state_regions', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. Yangon Region, Mandalay Region, Shan State
            $table->string('type')->default('Region'); // Region, State, Union Territory
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('state_regions');
    }
};
