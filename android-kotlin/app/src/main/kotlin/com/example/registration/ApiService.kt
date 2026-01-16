package com.example.registration

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

data class RegisterRequest(val full_name: String)
data class RegisterResponse(val status: String, val registered_at: String?, val coupon_no: Int?)
data class SearchRequest(val full_name: String)
data class SearchResponse(val status: String)

interface ApiService {
    @POST("register")
    suspend fun register(@Body request: RegisterRequest): Response<RegisterResponse>
    @POST("search")
    suspend fun search(@Body request: SearchRequest): Response<SearchResponse>
}
