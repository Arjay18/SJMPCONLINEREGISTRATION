<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $username = $request->input('username');
        $password = $request->input('password');
        // For demo: hardcoded admin, use real auth in production
        if ($username === 'admin' && $password === 'admin123') {
            return response()->json(['success' => true, 'token' => 'demo-token']);
        }
        return response()->json(['success' => false, 'message' => 'Invalid credentials']);
    }
}
