package com.example.registration

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class LoginActivity : AppCompatActivity() {
    private lateinit var api: ApiService

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        api = Retrofit.Builder()
            .baseUrl("https://your-api-url.com/") // <-- your backend URL
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)

        val usernameInput = findViewById<EditText>(R.id.usernameInput)
        val passwordInput = findViewById<EditText>(R.id.passwordInput)
        val loginBtn = findViewById<Button>(R.id.loginBtn)
        val msgView = findViewById<TextView>(R.id.loginMsgView)

        loginBtn.setOnClickListener {
            val username = usernameInput.text.toString().trim()
            val password = passwordInput.text.toString().trim()
            if (username.isEmpty() || password.isEmpty()) {
                msgView.text = "Please enter username and password"
                return@setOnClickListener
            }
            CoroutineScope(Dispatchers.Main).launch {
                msgView.text = "Logging in..."
                val res = api.login(LoginRequest(username, password)).body()
                if (res?.success == true) {
                    msgView.text = "Login successful!"
                    // Save token/session as needed
                    startActivity(Intent(this@LoginActivity, AdminActivity::class.java))
                    finish()
                } else {
                    msgView.text = res?.message ?: "Login failed"
                }
            }
        }
    }
}
