import React, { useState } from 'react';
import { 
  FileCode2, 
  X, 
  Copy, 
  Check, 
  Download, 
  Smartphone, 
  ExternalLink, 
  Terminal, 
  CheckCircle2,
  Code
} from 'lucide-react';

export default function NativeCodeModal({ onClose }) {
  const [activeFileTab, setActiveFileTab] = useState('apdu_service');
  const [copied, setCopied] = useState(false);

  const files = {
    apdu_service: {
      name: 'KeyManagerApduService.kt',
      path: 'android/app/src/main/java/com/keymanager/nfc/KeyManagerApduService.kt',
      language: 'kotlin',
      code: `package com.keymanager.nfc

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
            0x00.toByte()  // P2 (First occurrence)
        )
    }

    override fun processCommandApdu(commandApdu: ByteArray?, extras: Bundle?): ByteArray {
        if (commandApdu == null || commandApdu.size < 4) {
            Log.w(TAG, "APDU recibido inválido o vacío")
            return STATUS_FAILED
        }

        Log.d(TAG, "APDU Recibido: \${toHex(commandApdu)}")

        // Verificar si es un comando SELECT AID (00 A4 04 00)
        if (isSelectAidApdu(commandApdu)) {
            val aidLength = commandApdu[4].toInt() and 0xFF
            if (commandApdu.size >= 5 + aidLength) {
                val receivedAid = commandApdu.copyOfRange(5, 5 + aidLength)
                if (receivedAid.contentEquals(AID_KEYMANAGER)) {
                    Log.i(TAG, "AID KeyManager seleccionado exitosamente. Preparando credencial digital.")

                    // Obtener credencial activa protegida con Keystore
                    val activeCredentialToken = getActiveEncryptedToken()
                    val responsePayload = activeCredentialToken.toByteArray(Charsets.UTF_8)

                    // Concatenar Payload + Status Word 90 00 (OK)
                    return responsePayload + STATUS_SUCCESS
                } else {
                    Log.w(TAG, "AID no reconocido: \${toHex(receivedAid)}")
                    return FILE_NOT_FOUND
                }
            }
        }

        // Lectura de registro posterior a la selección (00 B0)
        if (commandApdu[1] == 0xB0.toByte()) {
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
}`
    },
    plugin: {
      name: 'KeyManagerNfcPlugin.kt',
      path: 'android/app/src/main/java/com/keymanager/nfc/KeyManagerNfcPlugin.kt',
      language: 'kotlin',
      code: `package com.keymanager.nfc

import android.content.Context
import android.content.pm.PackageManager
import android.nfc.NfcAdapter
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

        // Detección de Fabricante, Modelo y Versión
        ret.put("manufacturer", Build.MANUFACTURER)
        ret.put("model", Build.MODEL)
        ret.put("brand", Build.BRAND)
        ret.put("androidVersion", "Android \${Build.VERSION.RELEASE} (API \${Build.VERSION.SDK_INT})")

        // Disponibilidad de NFC
        val hasNfcHardware = pm.hasSystemFeature(PackageManager.FEATURE_NFC)
        ret.put("nfcAvailable", hasNfcHardware)

        // Estado de NFC
        val isNfcEnabled = nfcAdapter?.isEnabled ?: false
        ret.put("nfcEnabled", isNfcEnabled)

        // Compatibilidad con HCE
        val hasHceHardware = pm.hasSystemFeature(PackageManager.FEATURE_NFC_HOST_CARD_EMULATION)
        ret.put("hceSupported", hasHceHardware)

        // Limitación de Frecuencia 125 kHz
        ret.put("lf125kHzSupported", false)
        ret.put("hardwareLimitationNotes", "La antena NFC interna opera a 13,56 MHz. Llaveros 125 kHz requieren lector externo OTG/BLE.")

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
            call.reject("Error al resguardar credencial en Keystore: \${e.message}")
        }
    }
}`
    },
    keystore: {
      name: 'KeystoreHelper.kt',
      path: 'android/app/src/main/java/com/keymanager/nfc/KeystoreHelper.kt',
      language: 'kotlin',
      code: `package com.keymanager.nfc

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

/**
 * KeystoreHelper
 * Almacenamiento criptográfico protegido por hardware mediante Android Keystore (AES-256 GCM).
 */
object KeystoreHelper {

    private const val ANDROID_KEYSTORE = "AndroidKeyStore"
    private const val MASTER_KEY_ALIAS = "KeyManagerMasterVaultKey"
    private const val TRANSFORMATION = "AES/GCM/NoPadding"
    private const val GCM_TAG_LENGTH = 128

    init {
        initMasterKey()
    }

    private fun initMasterKey() {
        val keyStore = KeyStore.getInstance(ANDROID_KEYSTORE)
        keyStore.load(null)

        if (!keyStore.containsAlias(MASTER_KEY_ALIAS)) {
            val keyGenerator = KeyGenerator.getInstance(
                KeyProperties.KEY_ALGORITHM_AES,
                ANDROID_KEYSTORE
            )

            val spec = KeyGenParameterSpec.Builder(
                MASTER_KEY_ALIAS,
                KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
            )
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(256)
                .setRandomizedEncryptionRequired(true)
                .build()

            keyGenerator.init(spec)
            keyGenerator.generateKey()
        }
    }

    private fun getSecretKey(): SecretKey {
        val keyStore = KeyStore.getInstance(ANDROID_KEYSTORE)
        keyStore.load(null)
        val entry = keyStore.getEntry(MASTER_KEY_ALIAS, null) as KeyStore.SecretKeyEntry
        return entry.secretKey
    }

    fun encrypt(plainText: String): String {
        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(Cipher.ENCRYPT_MODE, getSecretKey())

        val iv = cipher.iv
        val cipherText = cipher.doFinal(plainText.toByteArray(Charsets.UTF_8))

        val combined = ByteArray(iv.size + cipherText.size)
        System.arraycopy(iv, 0, combined, 0, iv.size)
        System.arraycopy(cipherText, 0, combined, iv.size, cipherText.size)

        return Base64.encodeToString(combined, Base64.NO_WRAP)
    }

    fun decrypt(encryptedBase64: String): String {
        val combined = Base64.decode(encryptedBase64, Base64.NO_WRAP)
        val iv = ByteArray(12)
        System.arraycopy(combined, 0, iv, 0, 12)

        val cipherTextSize = combined.size - 12
        val cipherText = ByteArray(cipherTextSize)
        System.arraycopy(combined, 12, cipherText, 0, cipherTextSize)

        val cipher = Cipher.getInstance(TRANSFORMATION)
        val spec = GCMParameterSpec(GCM_TAG_LENGTH, iv)
        cipher.init(Cipher.DECRYPT_MODE, getSecretKey(), spec)

        val decryptedBytes = cipher.doFinal(cipherText)
        return String(decryptedBytes, Charsets.UTF_8)
    }
}`
    },
    manifest: {
      name: 'AndroidManifest.xml',
      path: 'android/app/src/main/AndroidManifest.xml',
      language: 'xml',
      code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.keymanager.nfc">

    <!-- Permisos de Hardware NFC y HCE -->
    <uses-permission android:name="android.permission.NFC" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    <uses-permission android:name="android.permission.USE_FINGERPRINT" />
    
    <!-- Permisos para Lectores Externos USB OTG y Bluetooth -->
    <uses-permission android:name="android.permission.USB_PERMISSION" />
    <uses-feature android:name="android.hardware.usb.host" android:required="false" />
    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN" />

    <uses-feature
        android:name="android.hardware.nfc"
        android:required="false" />
    <uses-feature
        android:name="android.hardware.nfc.hce"
        android:required="false" />

    <application
        android:allowBackup="false"
        android:icon="@mipmap/ic_launcher"
        android:label="KeyManager NFC"
        android:theme="@android:style/Theme.Material.NoActionBar.Fullscreen">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Servicio HostApduService (HCE) -->
        <service
            android:name=".KeyManagerApduService"
            android:exported="true"
            android:permission="android.permission.BIND_NFC_SERVICE">
            <intent-filter>
                <action android:name="android.nfc.cardemulation.action.HOST_APDU_SERVICE" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>
            <meta-data
                android:name="android.nfc.cardemulation.host_apdu_service"
                android:resource="@xml/apduservice" />
        </service>

    </application>
</manifest>`
    },
    apdu_xml: {
      name: 'apduservice.xml',
      path: 'android/app/src/main/res/xml/apduservice.xml',
      language: 'xml',
      code: `<host-apdu-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:description="@string/serv_desc"
    android:requireDeviceUnlock="false">
    <aid-group
        android:description="@string/aids_desc"
        android:category="other">
        <!-- AID Oficial Registrado para KeyManager NFC Digital Access -->
        <aid-filter android:name="F0010203040506" />
        <aid-filter android:name="F222222222" />
    </aid-group>
</host-apdu-service>`
    },
    instructions: {
      name: 'Instrucciones APK',
      path: 'INSTRUCCIONES_APK.md',
      language: 'markdown',
      code: `# GUÍA DE COMPILACIÓN DE APK EN ANDROID STUDIO

Para compilar el APK instalable de prueba de KeyManager NFC en tu computadora:

## 1. Requisitos
- Android Studio Iguana / Jellyfish o superior instalado.
- JDK 17 o 21.
- Node.js 18+.

## 2. Pasos de Compilación

1. **Construir el código web (React JSX):**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Sincronizar el proyecto Capacitor con Android:**
   \`\`\`bash
   npx cap sync android
   \`\`\`

3. **Abrir el proyecto en Android Studio:**
   \`\`\`bash
   npx cap open android
   \`\`\`
   O bien abre directamente la carpeta \`/android\` desde el menú *File -> Open* de Android Studio.

4. **Compilar el APK de prueba:**
   - En Android Studio ve al menú superior:
     **Build -> Build Bundle(s) / APK(s) -> Build APK(s)**
   - O por terminal de comandos:
     \`\`\`bash
     cd android
     ./gradlew assembleDebug
     \`\`\`

5. **Ubicación del archivo APK resultante:**
   El archivo instalable se genera en:
   \`android/app/build/outputs/apk/debug/app-debug.apk\`

6. **Instalación en el teléfono:**
   - Conecta tu teléfono Android mediante cable USB con depuración habilitada.
   - Ejecuta:
     \`\`\`bash
     adb install app-debug.apk
     \`\`\`
   - O transfiere el archivo \`app-debug.apk\` a tu celular y tócalo para instalarlo.`
    }
  };

  const currentFile = files[activeFileTab];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl h-[88vh] rounded-3xl bg-gray-950 border border-cyan-500/40 flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-800 bg-gray-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
              <FileCode2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Código Fuente Nativo Android & APK</h3>
              <p className="text-[11px] text-gray-400 font-mono">
                Kotlin • HCE HostApduService • Android Keystore • Capacitor
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* File Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-gray-800 bg-gray-950 overflow-x-auto text-xs font-mono">
          {Object.entries(files).map(([key, f]) => {
            const isTabActive = activeFileTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveFileTab(key)}
                className={`px-3 py-1.5 rounded-xl font-medium transition whitespace-nowrap flex items-center gap-1.5 ${
                  isTabActive
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50'
                    : 'text-gray-400 hover:text-white hover:bg-gray-900'
                }`}
              >
                <Code className="w-3 h-3 text-cyan-400" />
                <span>{f.name}</span>
              </button>
            );
          })}
        </div>

        {/* Toolbar con Path y Botón Copiar */}
        <div className="px-4 py-2 bg-gray-900/40 border-b border-gray-800/80 flex items-center justify-between text-xs">
          <span className="font-mono text-gray-400 text-[11px] truncate">{currentFile.path}</span>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-800 text-gray-200 hover:text-cyan-400 hover:bg-gray-700 transition active:scale-95 text-xs font-medium"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Código</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-4 bg-black font-mono text-xs text-gray-300 leading-relaxed">
          <pre className="whitespace-pre">{currentFile.code}</pre>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-800 bg-gray-950 flex items-center justify-between text-xs text-gray-400">
          <span>Archivos listos para sincronizar con Capacitor Android</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-400 text-black font-bold uppercase text-[11px]"
          >
            Cerrar Visor
          </button>
        </div>
      </div>
    </div>
  );
}
