package com.keymanager.nfc

import android.content.Intent
import android.nfc.NfcAdapter
import android.nfc.Tag
import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(KeyManagerNfcPlugin::class.java)
        super.onCreate(savedInstanceState)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        // Intercepta tags físicos aproximados cuando la app está en primer plano
        if (NfcAdapter.ACTION_TAG_DISCOVERED == intent.action ||
            NfcAdapter.ACTION_TECH_DISCOVERED == intent.action ||
            NfcAdapter.ACTION_NDEF_DISCOVERED == intent.action
        ) {
            val tag: Tag? = intent.getParcelableExtra(NfcAdapter.EXTRA_TAG)
            tag?.let {
                val tagId = it.id?.joinToString(":") { b -> "%02X".format(b) }
                // Notificar al bridge de Capacitor si hay oyentes registrados
            }
        }
    }
}
