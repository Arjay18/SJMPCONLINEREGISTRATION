package com.example.registration

data class LoginRequest(val username: String, val password: String)
data class LoginResponse(val success: Boolean, val message: String?, val token: String?)
