<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // email, call, meeting, note
            $table->string('subject');
            $table->text('description')->nullable();
            $table->morphs('activityable'); // For polymorphic relationship
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamp('activity_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
