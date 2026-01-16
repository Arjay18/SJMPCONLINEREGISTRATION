package com.example.registration

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
import com.dantsu.escposprinter.connection.bluetooth.BluetoothPrintersConnections
import com.dantsu.escposprinter.EscPosPrinter

class RegistrationActivity : AppCompatActivity() {
    private lateinit var api: ApiService

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_registration)

        api = Retrofit.Builder()
            .baseUrl("https://your-api-url.com/") // <-- your backend URL
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)

        val nameInput = findViewById<EditText>(R.id.fullNameInput)
        val registerBtn = findViewById<Button>(R.id.registerBtn)
        val msgView = findViewById<TextView>(R.id.msgView)

        registerBtn.setOnClickListener {
            val name = nameInput.text.toString().trim()
            if (name.isEmpty()) {
                msgView.text = "Please enter full name"
                return@setOnClickListener
            }
            CoroutineScope(Dispatchers.Main).launch {
                msgView.text = "Searching..."
                val searchRes = api.search(SearchRequest(name)).body()
                when (searchRes?.status) {
                    "not_found" -> msgView.text = "Member not found"
                    "already_registered" -> msgView.text = "Already registered"
                    else -> {
                        msgView.text = "Registering..."
                        val regRes = api.register(RegisterRequest(name)).body()
                        if (regRes?.status == "registered") {
                            msgView.text = "Registration successful!"
                            printCoupon(name, regRes.registered_at ?: "", regRes.coupon_no ?: 0)
                        } else {
                            msgView.text = "Registration failed"
                        }
                    }
                }
            }
        }
    }

    private fun printCoupon(name: String, date: String, id: Int) {
        val printer = EscPosPrinter(
            BluetoothPrintersConnections.selectFirstPaired(),
            203, 58f, 32
        )
        val text = """
            [C]<b>MEMBER REGISTRATION COUPON</b>
            [L]Name: $name
            [L]Date: $date
            [L]Coupon No: $id
            [C]THANK YOU
        """.trimIndent()
        printer.printFormattedText(text)
    }
}
