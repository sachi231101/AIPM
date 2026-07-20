<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_resumes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->string('resume_key');
            $table->string('title')->default('Master Resume');
            $table->json('content');
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->unique(['student_id', 'resume_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_resumes');
    }
};
