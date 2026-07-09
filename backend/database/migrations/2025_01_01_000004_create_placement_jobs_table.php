<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('placement_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');

            $table->string('title');
            $table->text('description');
            $table->text('eligibility')->nullable();
            $table->json('skills')->nullable();       // ["React", "Node.js"]
            $table->string('experience')->nullable();
            $table->string('salary')->nullable();
            $table->string('location')->nullable();
            $table->unsignedSmallInteger('openings')->default(1);
            $table->date('last_date')->nullable();

            // Admin-managed status
            $table->enum('status', ['pending', 'approved', 'rejected', 'published', 'closed'])
                  ->default('pending');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('placement_jobs');
    }
};
