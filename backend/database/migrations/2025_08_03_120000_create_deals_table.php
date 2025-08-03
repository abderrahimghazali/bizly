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
        Schema::create('deals', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('amount', 12, 2);
            $table->decimal('probability', 5, 2)->default(50); // 0-100%
            $table->enum('stage', [
                'qualified', 
                'proposal', 
                'negotiation', 
                'closed_won', 
                'closed_lost'
            ])->default('qualified');
            $table->date('expected_close_date');
            $table->date('actual_close_date')->nullable();
            $table->string('source')->nullable(); // Where the deal came from
            $table->text('notes')->nullable();
            
            // Relationships
            $table->foreignId('lead_id')->nullable()->constrained('leads')->onDelete('set null');
            $table->foreignId('company_id')->nullable()->constrained('companies')->onDelete('set null');
            $table->foreignId('contact_id')->nullable()->constrained('contacts')->onDelete('set null');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['stage', 'expected_close_date']);
            $table->index(['assigned_to', 'stage']);
            $table->index('created_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deals');
    }
};