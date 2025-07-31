<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\DocumentController;

// Test routes
Route::get('/test', function () {
    return response()->json([
        'message' => 'API is working!',
        'laravel_version' => app()->version(),
        'php_version' => PHP_VERSION,
    ]);
});

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    // Resource routes
    Route::apiResource('companies', CompanyController::class);
    Route::apiResource('contacts', ContactController::class);
    Route::apiResource('documents', DocumentController::class);

    // Nested routes
    Route::prefix('companies/{company}')->group(function () {
        Route::get('/contacts', [CompanyController::class, 'contacts']);
        Route::get('/documents', [CompanyController::class, 'documents']);
        Route::get('/activities', [CompanyController::class, 'activities']);
    });
});
