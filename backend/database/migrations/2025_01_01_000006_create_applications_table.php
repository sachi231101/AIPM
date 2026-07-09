<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('job_id')->constrained('placement_jobs')->onDelete('cascade');
            $table->string('resume_path')->nullable();
            $table->timestamp('applied_at')->useCurrent();
            $table->enum('status', ['applied', 'shortlisted', 'rejected'])->default('applied');
            $table->timestamps();

            // Prevent duplicate applications
            $table->unique(['student_id', 'job_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
