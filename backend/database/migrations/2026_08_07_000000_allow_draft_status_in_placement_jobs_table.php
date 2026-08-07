<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Alter status column in placement_jobs to string/varchar or updated enum so 'draft' status is accepted
        try {
            DB::statement("ALTER TABLE placement_jobs MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'pending'");
        } catch (\Throwable $e) {
            // Fallback for drivers if needed
            Schema::table('placement_jobs', function (Blueprint $table) {
                $table->string('status', 50)->default('pending')->change();
            });
        }
    }

    public function down(): void
    {
        try {
            DB::statement("ALTER TABLE placement_jobs MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'published', 'closed', 'draft') DEFAULT 'pending'");
        } catch (\Throwable $e) {
            // Ignore on rollback
        }
    }
};
