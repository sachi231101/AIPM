<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_institutes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_id')->constrained('placement_jobs')->onDelete('cascade');
            $table->foreignId('institute_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['job_id', 'institute_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_institutes');
    }
};
