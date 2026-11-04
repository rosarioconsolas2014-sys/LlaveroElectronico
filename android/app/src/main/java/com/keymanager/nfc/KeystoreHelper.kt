package com.keymanager.nfc

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
 * Provee almacenamiento criptográfico protegido por hardware mediante Android Keystore.
 * Las llaves maestras residen en el elemento seguro / TEE (Trusted Execution Environment)
 * del procesador del teléfono y nunca pueden ser extraídas en texto plano.
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
                .setUserAuthenticationRequired(false) // Puede activarse para requerir biometría en cada uso
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

    /**
     * Cifra un texto en plano (ej. credencial o identificador) utilizando AES-256 GCM
     */
    fun encrypt(plainText: String): String {
        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(Cipher.ENCRYPT_MODE, getSecretKey())

        val iv = cipher.iv
        val cipherText = cipher.doFinal(plainText.toByteArray(Charsets.UTF_8))

        // Empaquetar IV (12 bytes) + CipherText
        val combined = ByteArray(iv.size + cipherText.size)
        System.arraycopy(iv, 0, combined, 0, iv.size)
        System.arraycopy(cipherText, 0, combined, iv.size, cipherText.size)

        return Base64.encodeToString(combined, Base64.NO_WRAP)
    }

    /**
     * Descifra datos cifrados previamente con la llave maestra de hardware
     */
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
}
