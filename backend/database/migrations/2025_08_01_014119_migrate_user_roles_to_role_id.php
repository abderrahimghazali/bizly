<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Get all roles for mapping
        $roles = Role::all()->keyBy('name');
        
        // Update existing users with role_id based on their current role enum value
        $users = DB::table('users')->select('id', 'role')->get();
        
        foreach ($users as $user) {
            if ($user->role && isset($roles[$user->role])) {
                DB::table('users')
                    ->where('id', $user->id)
                    ->update(['role_id' => $roles[$user->role]->id]);
            }
        }
        
        // Now drop the old role column since we have role_id
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Add back the role enum column
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'manager', 'employee', 'client'])->nullable();
        });
        
        // Get all roles for reverse mapping
        $roles = Role::all()->keyBy('id');
        
        // Update users with enum role based on role_id
        $users = DB::table('users')->select('id', 'role_id')->get();
        
        foreach ($users as $user) {
            if ($user->role_id && isset($roles[$user->role_id])) {
                DB::table('users')
                    ->where('id', $user->id)
                    ->update(['role' => $roles[$user->role_id]->name]);
            }
        }
    }
};
