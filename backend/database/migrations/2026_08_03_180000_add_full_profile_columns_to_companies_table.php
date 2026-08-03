<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            if (!Schema::hasColumn('companies', 'password')) {
                $table->string('password')->nullable();
            }
            if (!Schema::hasColumn('companies', 'office_address')) {
                $table->text('office_address')->nullable();
            }
            if (!Schema::hasColumn('companies', 'city')) {
                $table->string('city')->nullable();
            }
            if (!Schema::hasColumn('companies', 'state')) {
                $table->string('state')->nullable();
            }
            if (!Schema::hasColumn('companies', 'about_company')) {
                $table->text('about_company')->nullable();
            }
            if (!Schema::hasColumn('companies', 'status')) {
                $table->string('status')->default('approved');
            }
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['password', 'office_address', 'city', 'state', 'about_company', 'status']);
        });
    }
};
