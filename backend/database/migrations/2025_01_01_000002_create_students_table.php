<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('institute_id')->nullable()->constrained('institutes')->nullOnDelete();

            // Registration fields
            $table->string('student_id_card')->unique();
            $table->string('mobile', 15)->unique();
            $table->string('other_institute_name')->nullable(); // if institute = "Other"

            // Personal info (completed later)
            $table->string('profile_photo')->nullable();
            $table->date('dob')->nullable();
            $table->enum('gender', ['Male', 'Female', 'Other'])->nullable();
            $table->text('address')->nullable();

            // Academic info
            $table->string('course')->nullable();
            $table->string('branch')->nullable();
            $table->string('batch')->nullable();
            $table->string('passing_year', 4)->nullable();
            $table->decimal('cgpa', 4, 2)->nullable();

            // Professional
            $table->json('skills')->nullable();         // ["React", "Python"]
            $table->string('resume_path')->nullable();

            // Social links
            $table->string('linkedin')->nullable();
            $table->string('github')->nullable();
            $table->string('portfolio')->nullable();

            // Computed field
            $table->unsignedTinyInteger('profile_completion')->default(0); // 0–100

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
