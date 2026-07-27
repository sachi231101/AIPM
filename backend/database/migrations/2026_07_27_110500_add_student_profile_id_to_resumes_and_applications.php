<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_resumes', function (Blueprint $table) {
            if (!Schema::hasColumn('student_resumes', 'student_profile_id')) {
                $table->foreignId('student_profile_id')->nullable()->after('student_id')->constrained('student_profiles')->nullOnDelete();
            }
        });

        Schema::table('applications', function (Blueprint $table) {
            if (!Schema::hasColumn('applications', 'student_profile_id')) {
                $table->foreignId('student_profile_id')->nullable()->after('student_id')->constrained('student_profiles')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('student_resumes', function (Blueprint $table) {
            if (Schema::hasColumn('student_resumes', 'student_profile_id')) {
                $table->dropForeign(['student_profile_id']);
                $table->dropColumn('student_profile_id');
            }
        });

        Schema::table('applications', function (Blueprint $table) {
            if (Schema::hasColumn('applications', 'student_profile_id')) {
                $table->dropForeign(['student_profile_id']);
                $table->dropColumn('student_profile_id');
            }
        });
    }
};
