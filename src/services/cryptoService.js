/**
 * Servicio de Seguridad Criptográfica y Keystore
 * Implementa cifrado simétrico AES-GCM (256-bit) con derivación PBKDF2
 * y gestión de PIN de seguridad / autenticación biométrica.
 */

const SALT_STORAGE_KEY = 'km_nfc_salt_v1';
const PIN_HASH_STORAGE_KEY = 'km_nfc_pin_hash_v1';
const SECURITY_CONFIG_KEY = 'km_nfc_sec_cfg_v1';

// Genera o recupera la sal criptográfica única del dispositivo
function getOrCreateSalt() {
  let saltHex = localStorage.getItem(SALT_STORAGE_KEY);
  if (!saltHex) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
    localStorage.setItem(SALT_STORAGE_KEY, saltHex);
  }
  const match = saltHex.match(/.{1,2}/g) || [];
  return new Uint8Array(match.map(byte => parseInt(byte, 16)));
}

// Deriva una llave AES-GCM de 256 bits a partir de una contraseña/PIN y la sal
async function deriveKey(passphrase, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Cifra un payload JSON usando AES-GCM
export async function encryptPayload(data, passphrase = 'KEYMANAGER_INTERNAL_VAULT_SEED') {
  try {
    const salt = getOrCreateSalt();
    const key = await deriveKey(passphrase, salt);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const encoded = enc.encode(JSON.stringify(data));

    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    const result = {
      iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''),
      data: Array.from(new Uint8Array(ciphertext)).map(b => b.toString(16).padStart(2, '0')).join(''),
      timestamp: Date.now()
    };

    return JSON.stringify(result);
  } catch (error) {
    console.error('Error en cifrado AES-GCM:', error);
    throw new Error('Fallo al cifrar datos en la bóveda segura.');
  }
}

// Descifra un payload cifrado con AES-GCM
export async function decryptPayload(encryptedString, passphrase = 'KEYMANAGER_INTERNAL_VAULT_SEED') {
  try {
    if (!encryptedString) return null;
    const parsed = JSON.parse(encryptedString);
    if (!parsed.iv || !parsed.data) return null;

    const salt = getOrCreateSalt();
    const key = await deriveKey(passphrase, salt);

    const ivMatch = parsed.iv.match(/.{1,2}/g) || [];
    const iv = new Uint8Array(ivMatch.map(b => parseInt(b, 16)));

    const dataMatch = parsed.data.match(/.{1,2}/g) || [];
    const ciphertext = new Uint8Array(dataMatch.map(b => parseInt(b, 16)));

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return JSON.parse(dec.decode(decrypted));
  } catch (error) {
    console.error('Error al descifrar datos AES-GCM:', error);
    return null;
  }
}

// Gestión del PIN de bloqueo
export async function hashPin(pin) {
  const enc = new TextEncoder();
  const data = enc.encode(pin + '_SALT_NFC_PIN_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function setAppPin(pin) {
  if (!pin || pin.length < 4) throw new Error('El PIN debe tener al menos 4 dígitos');
  const hashed = await hashPin(pin);
  localStorage.setItem(PIN_HASH_STORAGE_KEY, hashed);
  setSecurityConfig({ pinEnabled: true });
  return true;
}

export async function verifyAppPin(pin) {
  const storedHash = localStorage.getItem(PIN_HASH_STORAGE_KEY);
  if (!storedHash) return true; // No hay PIN configurado
  const computedHash = await hashPin(pin);
  return storedHash === computedHash;
}

export function hasPinConfigured() {
  return Boolean(localStorage.getItem(PIN_HASH_STORAGE_KEY));
}

export function removeAppPin() {
  localStorage.removeItem(PIN_HASH_STORAGE_KEY);
  setSecurityConfig({ pinEnabled: false, biometricEnabled: false });
}

// Configuración de Seguridad
export function getSecurityConfig() {
  try {
    const raw = localStorage.getItem(SECURITY_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(e);
  }
  return {
    pinEnabled: false,
    biometricEnabled: false,
    autoLockSeconds: 60,
    confirmBeforeDelete: true,
    maskedUIDs: false
  };
}

export function setSecurityConfig(partial) {
  const current = getSecurityConfig();
  const updated = { ...current, ...partial };
  localStorage.setItem(SECURITY_CONFIG_KEY, JSON.stringify(updated));
  return updated;
}
