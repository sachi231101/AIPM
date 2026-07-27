<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_resumes', function (Blueprint $table) {
            $table->dropForeign(['student_id']);
            $table->dropUnique('student_resumes_student_id_resume_key_unique');
            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('student_resumes', function (Blueprint $table) {
            $table->unique(['student_id', 'resume_key']);
        });
    }
};
