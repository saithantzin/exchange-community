<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('exchange_payments')
            ->where('payment_status', 'Unpaid')
            ->update(['payment_status' => 'Pending Payment']);
    }

    public function down(): void
    {
        DB::table('exchange_payments')
            ->where('payment_status', 'Pending Payment')
            ->update(['payment_status' => 'Unpaid']);
    }
};
