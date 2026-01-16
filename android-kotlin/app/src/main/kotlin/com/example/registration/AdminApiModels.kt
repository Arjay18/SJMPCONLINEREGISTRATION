package com.example.registration

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

// Add these to ApiService

data class ExportResponse(val success: Boolean, val fileUrl: String?, val message: String?)
data class ResetResponse(val success: Boolean, val message: String?)

interface ApiService {
    // ...existing endpoints...
    @POST("login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>
    @POST("admin/export")
    suspend fun exportMembers(): Response<ExportResponse>
    @POST("admin/reset")
    suspend fun resetRegistrations(): Response<ResetResponse>
}
