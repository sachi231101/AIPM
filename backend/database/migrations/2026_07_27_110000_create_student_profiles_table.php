<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->string('profile_name')->default('Primary Profile');
            $table->string('professional_title')->nullable()->default('Software Engineer');
            $table->string('target_role')->nullable();
            $table->text('summary')->nullable();

            // Academic details
            $table->string('course')->nullable();
            $table->string('branch')->nullable();
            $table->string('batch')->nullable();
            $table->string('passing_year', 4)->nullable();
            $table->decimal('cgpa', 4, 2)->nullable();

            // Skills & PDF Resume
            $table->json('skills')->nullable();
            $table->json('soft_skills')->nullable();
            $table->string('resume_path')->nullable();

            // Links
            $table->string('linkedin')->nullable();
            $table->string('github')->nullable();
            $table->string('portfolio')->nullable();

            // Status & Flags
            $table->unsignedTinyInteger('profile_completion')->default(0);
            $table->boolean('is_default')->default(false);
            $table->enum('status', ['active', 'archived'])->default('active');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_profiles');
    }
};
