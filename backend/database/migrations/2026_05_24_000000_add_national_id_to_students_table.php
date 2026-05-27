<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            // Moroccan CIN (Carte d'Identité Nationale): 1-2 letters + 5-6 digits, e.g. BE789012.
            // Nullable in schema so existing rows are preserved; the form request enforces presence + format.
            $table->string('national_id', 10)->nullable()->unique()->after('last_name');
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropUnique(['national_id']);
            $table->dropColumn('national_id');
        });
    }
};
