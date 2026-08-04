<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('placement_jobs', function (Blueprint $table) {
            if (!Schema::hasColumn('placement_jobs', 'employment_type')) {
                $table->string('employment_type')->nullable()->after('location');
            }
            if (!Schema::hasColumn('placement_jobs', 'responsibilities')) {
                $table->text('responsibilities')->nullable()->after('description');
            }
        });
    }

    public function down(): void
    {
        Schema::table('placement_jobs', function (Blueprint $table) {
            if (Schema::hasColumn('placement_jobs', 'employment_type')) {
                $table->dropColumn('employment_type');
            }
            if (Schema::hasColumn('placement_jobs', 'responsibilities')) {
                $table->dropColumn('responsibilities');
            }
        });
    }
};
