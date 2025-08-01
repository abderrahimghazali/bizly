<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'sometimes|string|in:' . implode(',', UserRole::values()),
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Get default role (employee)
        $defaultRole = Role::where('name', 'employee')->first();
        
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $defaultRole->id,
            'status' => 'active', // New users are active by default
            'email_verified_at' => now(), // Auto-verify new users
        ]);

        $user->load('role.permissions');
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully',
            'user' => new UserResource($user),
            'token' => $token
        ], 201);
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $user = Auth::user()->load('role.permissions');
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => new UserResource($user),
            'token' => $token
        ]);
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request)
    {
        $user = $request->user()->load('role.permissions');
        return response()->json([
            'user' => new UserResource($user)
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Get all users (Admin only)
     */
    public function getAllUsers(Request $request)
    {
        $users = User::with('role.permissions')->orderBy('created_at', 'desc')->get();

        return response()->json([
            'users' => UserResource::collection($users)
        ]);
    }

    /**
     * Get a specific user (Admin only)
     */
    public function getUser(User $user)
    {
        $user->load('role.permissions');
        return response()->json([
            'user' => new UserResource($user)
        ]);
    }

    /**
     * Update a user (Admin only)
     */
    public function updateUser(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'sometimes|string|exists:roles,name',
            'status' => 'sometimes|string|in:active,pending,suspended',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $updateData = $request->only(['name', 'email', 'status']);
        
        // Handle role update separately
        if ($request->has('role')) {
            $role = Role::where('name', $request->role)->first();
            $updateData['role_id'] = $role->id;
        }
        
        // Prevent users from changing their own status to avoid permission issues
        if ($user->id === auth()->id() && $request->has('status')) {
            unset($updateData['status']);
        }

        $user->update($updateData);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => new UserResource($user->fresh(['role.permissions']))
        ]);
    }

    /**
     * Delete a user (Admin only)
     */
    public function deleteUser(User $user)
    {
        // Prevent admin from deleting themselves
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'You cannot delete your own account'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }
}
