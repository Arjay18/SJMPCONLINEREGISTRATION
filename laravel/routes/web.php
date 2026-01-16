<?php

use Illuminate\Support\Facades\Route;

Route::get('/', [App\Http\Controllers\RegistrationController::class, 'showForm']);
Route::post('/register', [App\Http\Controllers\RegistrationController::class, 'register']);
// Add admin routes as needed

Route::post('/api/login', [App\Http\Controllers\Api\AuthController::class, 'login']);
Route::post('/api/search', [App\Http\Controllers\Api\MemberController::class, 'search']);
Route::post('/api/register', [App\Http\Controllers\Api\MemberController::class, 'register']);
Route::post('/api/admin/export', [App\Http\Controllers\Api\AdminController::class, 'export']);
Route::post('/api/admin/reset', [App\Http\Controllers\Api\AdminController::class, 'reset']);
