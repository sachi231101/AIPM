<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            if (!Schema::hasColumn('students', 'approval_status')) {
                $table->enum('approval_status', ['pending', 'approved', 'rejected', 'hold'])->default('approved')->after('profile_completion');
            }
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            if (Schema::hasColumn('students', 'approval_status')) {
                $table->dropColumn('approval_status');
            }
        });
    }
};
