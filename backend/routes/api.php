<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\DocumentController;

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Authentication routes
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    
    // Company routes with role-based access
    Route::middleware(['role:admin,manager,employee'])->group(function () {
        Route::get('/companies', [CompanyController::class, 'index']);
        Route::get('/companies/{company}', [CompanyController::class, 'show']);
    });
    
    Route::middleware(['permission:create_company'])->group(function () {
        Route::post('/companies', [CompanyController::class, 'store']);
    });
    
    Route::middleware(['permission:edit_company'])->group(function () {
        Route::put('/companies/{company}', [CompanyController::class, 'update']);
    });
    
    Route::middleware(['role:admin,manager'])->group(function () {
        Route::delete('/companies/{company}', [CompanyController::class, 'destroy']);
    });
    
    // Contact routes with role-based access
    Route::middleware(['role:admin,manager,employee'])->group(function () {
        Route::get('/contacts', [ContactController::class, 'index']);
        Route::get('/contacts/{contact}', [ContactController::class, 'show']);
    });
    
    Route::middleware(['permission:create_contact'])->group(function () {
        Route::post('/contacts', [ContactController::class, 'store']);
    });
    
    Route::middleware(['permission:edit_contact'])->group(function () {
        Route::put('/contacts/{contact}', [ContactController::class, 'update']);
    });
    
    Route::middleware(['role:admin,manager'])->group(function () {
        Route::delete('/contacts/{contact}', [ContactController::class, 'destroy']);
    });
    
    // Document routes with role-based access
    Route::middleware(['role:admin,manager,employee'])->group(function () {
        Route::get('/documents', [DocumentController::class, 'index']);
        Route::get('/documents/{document}', [DocumentController::class, 'show']);
    });
    
    Route::middleware(['permission:create_document'])->group(function () {
        Route::post('/documents', [DocumentController::class, 'store']);
    });
    
    Route::middleware(['permission:edit_document'])->group(function () {
        Route::put('/documents/{document}', [DocumentController::class, 'update']);
    });
    
    Route::middleware(['role:admin,manager'])->group(function () {
        Route::delete('/documents/{document}', [DocumentController::class, 'destroy']);
    });
    
    // Admin-only routes
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/admin/users', [AuthController::class, 'getAllUsers']);
        Route::get('/admin/users/{user}', [AuthController::class, 'getUser']);
        Route::put('/admin/users/{user}', [AuthController::class, 'updateUser']);
        Route::delete('/admin/users/{user}', [AuthController::class, 'deleteUser']);
        
        Route::post('/admin/users/{user}/assign-role', function () {
            return response()->json(['message' => 'Role assigned successfully']);
        });
        
        // Role management routes
        Route::apiResource('roles', \App\Http\Controllers\Api\RoleController::class);
        Route::get('permissions', [\App\Http\Controllers\Api\RoleController::class, 'permissions']);
        Route::get('permissions-matrix', [\App\Http\Controllers\Api\RoleController::class, 'permissionsMatrix']);
        Route::post('roles/{role}/permissions', [\App\Http\Controllers\Api\RoleController::class, 'updatePermissions']);
    });
    
    // Manager and Admin routes
    Route::middleware(['role:admin,manager'])->group(function () {
        Route::get('/manager/team', function () {
            return response()->json(['message' => 'Team management endpoint']);
        });
    });
});