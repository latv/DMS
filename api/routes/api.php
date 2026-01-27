<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FileController;

Route::post('/login', [AuthController::class, 'login'])->name('login');

Route::middleware('auth:sanctum')->group(function () {
    // user authentication routes
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // file management routes
    Route::get('/file', [FileController::class, 'index']);
    Route::post('/file', [FileController::class, 'store']);
    Route::post('/folder', [FileController::class, 'createFolder']);
});
