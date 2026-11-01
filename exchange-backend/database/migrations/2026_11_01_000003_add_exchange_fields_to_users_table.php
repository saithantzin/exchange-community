<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->nullable()->unique()->after('name');
            $table->string('phone')->nullable()->after('email');
            $table->string('profile_image')->nullable()->after('phone');
            $table->foreignId('state_region_id')->nullable()->after('profile_image')->constrained('state_regions')->nullOnDelete();
            $table->foreignId('township_id')->nullable()->after('state_region_id')->constrained('townships')->nullOnDelete();
            $table->text('address')->nullable()->after('township_id');
            $table->string('role')->default('user')->after('address'); // user, admin
            $table->string('account_status')->default('Active')->after('role'); // Active, Suspended
            $table->text('suspension_reason')->nullable()->after('account_status');
            $table->text('bio')->nullable()->after('suspension_reason');
            $table->decimal('rating', 3, 2)->default(5.00)->after('bio');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['state_region_id']);
            $table->dropForeign(['township_id']);
            $table->dropColumn([
                'username',
                'phone',
                'profile_image',
                'state_region_id',
                'township_id',
                'address',
                'role',
                'account_status',
                'suspension_reason',
                'bio',
                'rating',
            ]);
        });
    }
};
