package com.example.registration

import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class AdminActivity : AppCompatActivity() {
    private lateinit var api: ApiService

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_admin)

        api = Retrofit.Builder()
            .baseUrl("https://your-api-url.com/") // <-- your backend URL
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)

        val exportBtn = findViewById<Button>(R.id.exportBtn)
        val resetBtn = findViewById<Button>(R.id.resetBtn)
        val adminMsgView = findViewById<TextView>(R.id.adminMsgView)

        exportBtn.setOnClickListener {
            CoroutineScope(Dispatchers.Main).launch {
                adminMsgView.text = "Exporting..."
                val res = api.exportMembers().body()
                if (res != null && res.success) {
                    adminMsgView.text = "Exported: " + (res.fileUrl ?: "")
                } else {
                    adminMsgView.text = res?.message ?: "Export failed"
                }
            }
        }

        resetBtn.setOnClickListener {
            CoroutineScope(Dispatchers.Main).launch {
                adminMsgView.text = "Resetting..."
                val res = api.resetRegistrations().body()
                if (res != null && res.success) {
                    adminMsgView.text = "All registrations reset!"
                } else {
                    adminMsgView.text = res?.message ?: "Reset failed"
                }
            }
        }
    }
}
