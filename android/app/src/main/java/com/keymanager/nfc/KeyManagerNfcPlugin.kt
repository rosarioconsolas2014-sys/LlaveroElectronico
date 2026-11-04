package com.keymanager.nfc

import android.content.Context
import android.content.pm.PackageManager
import android.nfc.NfcAdapter
import android.nfc.cardemulation.CardEmulation
import android.os.Build
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

/**
 * KeyManagerNfcPlugin
 * Plugin de Capacitor que expone las APIs nativas de NFC, diagnóstico de hardware
 * y configuración del servicio HCE a la interfaz de usuario en React.
 */
@CapacitorPlugin(name = "KeyManagerNfc")
class KeyManagerNfcPlugin : Plugin() {

    private var nfcAdapter: NfcAdapter? = null

    override fun load() {
        super.load()
        nfcAdapter = NfcAdapter.getDefaultAdapter(context)
    }

    @PluginMethod
    fun getHardwareDiagnostics(call: PluginCall) {
        val ret = JSObject()
        val pm = context.packageManager

        // 1. Detección de Fabricante, Modelo y Versión
        ret.put("manufacturer", Build.MANUFACTURER)
        ret.put("model", Build.MODEL)
        ret.put("brand", Build.BRAND)
        ret.put("androidVersion", "Android ${Build.VERSION.RELEASE} (API ${Build.VERSION.SDK_INT})")

        // 2. Disponibilidad de NFC
        val hasNfcHardware = pm.hasSystemFeature(PackageManager.FEATURE_NFC)
        ret.put("nfcAvailable", hasNfcHardware)

        // 3. Estado de NFC
        val isNfcEnabled = nfcAdapter?.isEnabled ?: false
        ret.put("nfcEnabled", isNfcEnabled)

        // 4. Compatibilidad con HCE (Host Card Emulation)
        val hasHceHardware = pm.hasSystemFeature(PackageManager.FEATURE_NFC_HOST_CARD_EMULATION)
        ret.put("hceSupported", hasHceHardware)

        // 5. Soporte HCE Off-Host (eSE / SIM)
        val hasOffHostHce = pm.hasSystemFeature(PackageManager.FEATURE_NFC_OFF_HOST_CARD_EMULATION_UICC) ||
                pm.hasSystemFeature(PackageManager.FEATURE_NFC_OFF_HOST_CARD_EMULATION_ESE)
        ret.put("offHostHceSupported", hasOffHostHce)

        // 6. Capacidades y Limitaciones
        ret.put("lf125kHzSupported", false) // Físicamente imposible con la antena estándar de 13,56 MHz
        ret.put("hardwareLimitationNotes", "La antena NFC interna opera exclusivamente a 13,56 MHz. Llaveros de 125 kHz requieren lector externo OTG/BLE.")

        call.resolve(ret)
    }

    @PluginMethod
    fun setActiveCredentialForHce(call: PluginCall) {
        val credentialId = call.getString("credentialId")
        val tokenData = call.getString("tokenData") ?: "KM_TOKEN_AUTH"

        if (credentialId == null) {
            call.reject("El ID de la credencial es requerido")
            return
        }

        // Cifrar el token con Android Keystore antes de pasarlo a la memoria compartida del servicio
        try {
            val encryptedToken = KeystoreHelper.encrypt(tokenData)
            val prefs = context.getSharedPreferences("KeyManagerPrefs", Context.MODE_PRIVATE)
            prefs.edit()
                .putString("ACTIVE_CREDENTIAL_ID", credentialId)
                .putString("ACTIVE_CREDENTIAL_PAYLOAD", tokenData)
                .putString("ACTIVE_CREDENTIAL_ENCRYPTED", encryptedToken)
                .apply()

            val ret = JSObject()
            ret.put("success", true)
            ret.put("activeCredentialId", credentialId)
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("Error al resguardar credencial en Keystore: ${e.message}")
        }
    }
}
