package com.example.registration

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val userBtn = findViewById<Button>(R.id.userBtn)
        val adminBtn = findViewById<Button>(R.id.adminBtn)

        userBtn.setOnClickListener {
            startActivity(Intent(this, RegistrationActivity::class.java))
        }
        adminBtn.setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
        }
    }
}
