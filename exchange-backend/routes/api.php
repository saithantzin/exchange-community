<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ExchangeRequestController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\SmartMatchController;
use App\Http\Middleware\EnsureAdmin;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Community-Based Item Exchange Platform
|--------------------------------------------------------------------------
*/

// Public Routes (Browse, Search, Auth & Locations)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/upload-avatar', [AuthController::class, 'uploadAvatar']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/admin/login', [AuthController::class, 'adminLogin']);
Route::get('/locations', [AuthController::class, 'getLocations']);

// Dynamic Categories & Items (Public)
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/items', [ItemController::class, 'index']);
Route::get('/items/{id}', [ItemController::class, 'show']);
Route::get('/smart-matches', [SmartMatchController::class, 'index']);

// Authenticated Member Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Dynamic Profile Management
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    // Dynamic Item Management
    Route::post('/items', [ItemController::class, 'store']);
    Route::post('/items/upload-image', [ItemController::class, 'uploadImage']);
    Route::put('/items/{id}', [ItemController::class, 'update']);
    Route::delete('/items/{id}', [ItemController::class, 'destroy']);
    Route::get('/my-items', [ItemController::class, 'myItems']);

    // Dynamic Exchange Requests Management & Real History
    Route::get('/exchange-requests', [ExchangeRequestController::class, 'index']);
    Route::post('/exchange-requests', [ExchangeRequestController::class, 'store']);
    Route::get('/exchange-requests/{id}', [ExchangeRequestController::class, 'show']);
    Route::post('/exchange-requests/{id}/accept', [ExchangeRequestController::class, 'accept']);
    Route::post('/exchange-requests/{id}/reject', [ExchangeRequestController::class, 'reject']);
    Route::post('/exchange-requests/{id}/cancel', [ExchangeRequestController::class, 'cancel']);
    Route::post('/exchange-requests/{id}/deposit', [ExchangeRequestController::class, 'submitDeposit']);
    Route::post('/exchanges/{id}/deposit', [ExchangeRequestController::class, 'submitDeposit']);
    Route::get('/exchange-history', [ExchangeRequestController::class, 'history']);
    Route::post('/exchange-requests/{id}/review', [ExchangeRequestController::class, 'submitReview']);
});

// Admin Protected Subtree (Authenticated via Sanctum or Admin Token)
Route::middleware(EnsureAdmin::class)->prefix('admin')->group(function () {
    Route::get('/verify', function () {
        return response()->json([
            'success' => true,
            'message' => 'Admin token is valid',
            'admin' => auth()->user(),
        ]);
    });

    // Dynamic Admin Stats & Category Management
    Route::get('/dashboard-stats', [AdminController::class, 'dashboardStats']);
    Route::get('/exchanges', [ExchangeRequestController::class, 'adminIndex']);
    Route::get('/exchanges/{id}', [ExchangeRequestController::class, 'adminShow']);
    Route::post('/exchanges/{id}/deposit/approve', [ExchangeRequestController::class, 'adminApproveDeposit']);
    Route::post('/exchanges/{id}/deposit/reject', [ExchangeRequestController::class, 'adminRejectDeposit']);
    Route::post('/exchanges/{id}/refund/process', [ExchangeRequestController::class, 'adminProcessRefund']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
});
