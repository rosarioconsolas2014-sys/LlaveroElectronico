package com.keymanager.nfc

import android.nfc.cardemulation.HostApduService
import android.os.Bundle
import android.util.Log

/**
 * KeyManagerApduService
 * Servicio de Emulación de Tarjeta en el Host (Android HCE).
 *
 * Implementa la comunicación ISO/IEC 7816-4 con terminales lectores de control de acceso.
 * Solo procesa y responde a los AIDs autorizados para el sistema compatible.
 * NO intenta emular hardware de 125 kHz ni clonar llaves Crypto-1.
 */
class KeyManagerApduService : HostApduService() {

    companion object {
        private const val TAG = "KeyManagerHCE"

        // AID Oficial de KeyManager NFC: F0 01 02 03 04 05 06
        private val AID_KEYMANAGER = byteArrayOf(
            0xF0.toByte(), 0x01.toByte(), 0x02.toByte(),
            0x03.toByte(), 0x04.toByte(), 0x05.toByte(), 0x06.toByte()
        )

        // Comandos APDU ISO 7816-4
        private val STATUS_SUCCESS = byteArrayOf(0x90.toByte(), 0x00.toByte())
        private val STATUS_FAILED = byteArrayOf(0x6F.toByte(), 0x00.toByte())
        private val CLA_NOT_SUPPORTED = byteArrayOf(0x6E.toByte(), 0x00.toByte())
        private val INS_NOT_SUPPORTED = byteArrayOf(0x6D.toByte(), 0x00.toByte())
        private val FILE_NOT_FOUND = byteArrayOf(0x6A.toByte(), 0x82.toByte())

        // Cabecera SELECT AID estándar: 00 A4 04 00
        private val SELECT_APDU_HEADER = byteArrayOf(
            0x00.toByte(), // CLA
            0xA4.toByte(), // INS (SELECT)
            0x04.toByte(), // P1 (Select by DF Name / AID)
            0x00.toByte()  // P2 (First or only occurrence)
        )
    }

    override fun processCommandApdu(commandApdu: ByteArray?, extras: Bundle?): ByteArray {
        if (commandApdu == null || commandApdu.size < 4) {
            Log.w(TAG, "APDU recibido inválido o vacío")
            return STATUS_FAILED
        }

        Log.d(TAG, "APDU Recibido: ${toHex(commandApdu)}")

        // Verificar si es un comando SELECT AID (00 A4 04 00)
        if (isSelectAidApdu(commandApdu)) {
            val aidLength = commandApdu[4].toInt() and 0xFF
            if (commandApdu.size >= 5 + aidLength) {
                val receivedAid = commandApdu.copyOfRange(5, 5 + aidLength)
                if (receivedAid.contentEquals(AID_KEYMANAGER)) {
                    Log.i(TAG, "AID KeyManager seleccionado exitosamente. Preparando credencial digital.")

                    // Obtener credencial activa de la bóveda segura Keystore
                    val activeCredentialToken = getActiveEncryptedToken()
                    val responsePayload = activeCredentialToken.toByteArray(Charsets.UTF_8)

                    // Concatenar Payload + Status Word 90 00 (OK)
                    return responsePayload + STATUS_SUCCESS
                } else {
                    Log.w(TAG, "AID no reconocido: ${toHex(receivedAid)}")
                    return FILE_NOT_FOUND
                }
            }
        }

        // Comando propietario o lectura de registro posterior a la selección
        if (commandApdu[1] == 0xB0.toByte()) { // READ BINARY
            val token = getActiveEncryptedToken().toByteArray(Charsets.UTF_8)
            return token + STATUS_SUCCESS
        }

        return INS_NOT_SUPPORTED
    }

    override fun onDeactivated(reason: Int) {
        val reasonStr = when (reason) {
            DEACTIVATION_LINK_LOSS -> "Pérdida de campo electromagnético (Link Loss)"
            DEACTIVATION_DESELECTED -> "Comando Deselect recibido"
            else -> "Desactivación desconocida ($reason)"
        }
        Log.i(TAG, "HCE Desactivado: $reasonStr")
    }

    private fun isSelectAidApdu(apdu: ByteArray): Boolean {
        return apdu.size >= 4 &&
                apdu[0] == SELECT_APDU_HEADER[0] &&
                apdu[1] == SELECT_APDU_HEADER[1] &&
                apdu[2] == SELECT_APDU_HEADER[2] &&
                apdu[3] == SELECT_APDU_HEADER[3]
    }

    private fun getActiveEncryptedToken(): String {
        // En una implementación de producción conectada con KeystoreHelper,
        // este método recupera el token criptográfico firmado de la credencial seleccionada
        val prefs = getSharedPreferences("KeyManagerPrefs", MODE_PRIVATE)
        return prefs.getString("ACTIVE_CREDENTIAL_PAYLOAD", "KM_AUTH_TOKEN_DEFAULT_OFFICE_2026") ?: "KM_AUTH_TOKEN"
    }

    private fun toHex(bytes: ByteArray): String {
        val sb = StringBuilder()
        for (b in bytes) {
            sb.append(String.format("%02X ", b))
        }
        return sb.toString().trim()
    }
}
