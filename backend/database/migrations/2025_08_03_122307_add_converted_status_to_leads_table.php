<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add 'converted' to the status enum using raw SQL
        DB::statement("ALTER TABLE leads MODIFY COLUMN status ENUM('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'converted') DEFAULT 'new'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove 'converted' from the status enum
        DB::statement("ALTER TABLE leads MODIFY COLUMN status ENUM('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost') DEFAULT 'new'");
    }
}; 