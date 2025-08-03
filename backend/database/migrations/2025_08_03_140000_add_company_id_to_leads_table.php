<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            // Add company_id foreign key relationship
            $table->foreignId('company_id')->nullable()->after('company')->constrained('companies')->onDelete('set null');
            
            // Keep the company string field for now (we can migrate data and remove it later)
            // $table->dropColumn('company'); // We'll do this in a separate migration after data migration
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
            $table->dropColumn('company_id');
        });
    }
};