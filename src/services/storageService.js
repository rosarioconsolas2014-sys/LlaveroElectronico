/**
 * Gestor de Almacenamiento Cifrado de la Billetera de Llaves.
 * Maneja persistencia, encriptación AES-GCM, llaves predeterminadas y estado activo.
 */

import { encryptPayload, decryptPayload } from './cryptoService.js';
import { PROTOCOLS, FREQUENCIES } from './nfcProtocols.js';

const STORAGE_KEY = 'km_nfc_wallet_vault_v1';
const ACTIVE_KEY_ID_KEY = 'km_nfc_active_fob_id_v1';
const DEFAULT_KEY_ID_KEY = 'km_nfc_default_fob_id_v1';

// Semilla inicial representativa con diversos tipos de tecnologías reales
export const INITIAL_SEED_KEYS = [
  {
    id: 'fob_seed_1',
    name: 'Edificio Residencial',
    description: 'Pastilla de acceso al portón peatonal y ascensor principal',
    technologyType: 'RFID_125_KHZ',
    protocolId: 'EM4100',
    protocolName: 'EM4100 / EM4200 (125 kHz)',
    frequency: '125_KHZ',
    frequencyLabel: '125 kHz LF',
    identifier: '04:A2:8F:C1:90',
    wiegandId: 'FC: 114 / ID: 48921',
    registeredAt: '2026-02-14T10:30:00Z',
    compatibilityStatus: 'REQUIRES_EXTERNAL_READER',
    compatibilityLabel: 'Requiere Lector Externo (125 kHz)',
    canEmulateHCE: false,
    isActive: false,
    isDefault: false,
    colorTheme: 'blue',
    iconType: 'fob_pill',
    securityNotes: 'Llavero tipo pastilla azul de consorcio. Antena NFC del celular opera a 13,56 MHz y no emite en 125 kHz. Guardado en billetera como referencia técnica o programación con lector externo.'
  },
  {
    id: 'fob_seed_2',
    name: 'Oficina Central (Credencial Digital)',
    description: 'Pase corporativo emitido por el sistema de control de acceso corporativo',
    technologyType: 'HCE_AUTHORIZED',
    protocolId: 'ISO_DEP_DIGITAL',
    protocolName: 'Credencial Digital ISO-DEP (13,56 MHz)',
    frequency: '13.56_MHZ',
    frequencyLabel: '13,56 MHz HF',
    identifier: 'AID: F0:01:02:03:04:05:06',
    tokenData: 'KM-SEC-8921-AF00-HCE-AUTH-2026',
    registeredAt: '2026-03-01T08:15:00Z',
    compatibilityStatus: 'HCE_COMPATIBLE',
    compatibilityLabel: '100% Emulable con Android HCE',
    canEmulateHCE: true,
    isActive: true,
    isDefault: true,
    colorTheme: 'cyan',
    iconType: 'card',
    securityNotes: 'Credencial autorizada provisionada oficialmente. Totalmente compatible con Host Card Emulation de Android para interactuar con cerraduras electrónicas compatibles.'
  },
  {
    id: 'fob_seed_3',
    name: 'Mi Casa - Cerradura Inteligente',
    description: 'Llavero tag de la cerradura biométrica de la puerta principal',
    technologyType: 'NFC_13_56_MHZ',
    protocolId: 'MIFARE_CLASSIC_1K',
    protocolName: 'MIFARE Classic 1K (13,56 MHz)',
    frequency: '13.56_MHZ',
    frequencyLabel: '13,56 MHz HF',
    identifier: '5D:91:20:F4',
    registeredAt: '2026-03-10T14:40:00Z',
    compatibilityStatus: 'NFC_READ_ONLY',
    compatibilityLabel: 'NFC Solo Lectura (Crypto-1 Propietario)',
    canEmulateHCE: false,
    isActive: false,
    isDefault: false,
    colorTheme: 'purple',
    iconType: 'fob_round',
    securityNotes: 'Lectura soportada por hardware NFC. No emulable mediante HCE estándar de Android debido a que el sistema bloquea emulación de UIDs fijos y criptografía propietaria Crypto-1.'
  },
  {
    id: 'fob_seed_4',
    name: 'Portón Vehicular',
    description: 'Llavero duplicado tipo pastilla negra T5577 para barrera de cochera',
    technologyType: 'RFID_125_KHZ',
    protocolId: 'T5577',
    protocolName: 'Atmel T5577 (125 kHz Regrabable)',
    frequency: '125_KHZ',
    frequencyLabel: '125 kHz LF',
    identifier: '00:1E:83:B7:44',
    wiegandId: 'FC: 082 / ID: 19842',
    registeredAt: '2026-03-22T19:00:00Z',
    compatibilityStatus: 'REQUIRES_EXTERNAL_READER',
    compatibilityLabel: 'Requiere Lector Externo (125 kHz)',
    canEmulateHCE: false,
    isActive: false,
    isDefault: false,
    colorTheme: 'amber',
    iconType: 'fob_pill',
    securityNotes: 'Frecuencia de 125 kHz incompatible físicamente con NFC de smartphones.'
  }
];

// Notificador reactivo para componentes
const listeners = new Set();
export function subscribeToWallet(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}
function notifyChange() {
  listeners.forEach(fn => fn());
}

/**
 * Obtiene todas las llaves almacenadas descifradas
 */
export async function getStoredKeys() {
  try {
    const rawVault = localStorage.getItem(STORAGE_KEY);
    if (!rawVault) {
      // Guardar semilla inicial cifrada si es la primera vez
      await saveStoredKeys(INITIAL_SEED_KEYS);
      return INITIAL_SEED_KEYS;
    }
    const decrypted = await decryptPayload(rawVault);
    if (Array.isArray(decrypted)) {
      return decrypted;
    }
    return INITIAL_SEED_KEYS;
  } catch (error) {
    console.error('Error cargando llaves de la billetera:', error);
    return INITIAL_SEED_KEYS;
  }
}

/**
 * Guarda las llaves cifrándolas con AES-GCM
 */
export async function saveStoredKeys(keys) {
  try {
    const encrypted = await encryptPayload(keys);
    localStorage.setItem(STORAGE_KEY, encrypted);
    notifyChange();
    return true;
  } catch (error) {
    console.error('Error guardando llaves:', error);
    return false;
  }
}

/**
 * Agrega una nueva credencial a la billetera
 */
export async function addKey(newKeyData) {
  const keys = await getStoredKeys();
  const id = 'fob_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  
  const fob = {
    id,
    name: newKeyData.name || 'Nueva Llave',
    description: newKeyData.description || 'Llavero de proximidad registrado',
    technologyType: newKeyData.technologyType || 'NFC_13_56_MHZ',
    protocolId: newKeyData.protocolId || 'ISO_DEP_DIGITAL',
    protocolName: newKeyData.protocolName || 'Protocolo Estándar',
    frequency: newKeyData.frequency || '13.56_MHZ',
    frequencyLabel: newKeyData.frequency === '125_KHZ' ? '125 kHz LF' : '13,56 MHz HF',
    identifier: newKeyData.identifier || 'NO_LEIBLE',
    wiegandId: newKeyData.wiegandId || null,
    tokenData: newKeyData.tokenData || null,
    registeredAt: new Date().toISOString(),
    compatibilityStatus: newKeyData.compatibilityStatus || (newKeyData.canEmulateHCE ? 'HCE_COMPATIBLE' : 'NFC_READ_ONLY'),
    compatibilityLabel: newKeyData.compatibilityLabel || (newKeyData.canEmulateHCE ? '100% Emulable con Android HCE' : 'NFC Solo Lectura'),
    canEmulateHCE: Boolean(newKeyData.canEmulateHCE),
    isActive: Boolean(newKeyData.isActive),
    isDefault: Boolean(newKeyData.isDefault),
    colorTheme: newKeyData.colorTheme || 'blue',
    iconType: newKeyData.iconType || 'fob_pill',
    securityNotes: newKeyData.securityNotes || 'Credencial almacenada en bóveda local cifrada.'
  };

  keys.unshift(fob);
  await saveStoredKeys(keys);

  if (fob.isDefault) {
    setDefaultKeyId(fob.id);
  }
  if (fob.isActive) {
    setActiveKeyId(fob.id);
  }

  return fob;
}

/**
 * Actualiza una credencial existente
 */
export async function updateKey(id, updates) {
  const keys = await getStoredKeys();
  const index = keys.findIndex(k => k.id === id);
  if (index === -1) return null;

  keys[index] = { ...keys[index], ...updates };
  await saveStoredKeys(keys);
  return keys[index];
}

/**
 * Elimina una credencial de la billetera
 */
export async function deleteKey(id) {
  const keys = await getStoredKeys();
  const filtered = keys.filter(k => k.id !== id);
  await saveStoredKeys(filtered);

  if (getActiveKeyId() === id) {
    localStorage.removeItem(ACTIVE_KEY_ID_KEY);
  }
  if (getDefaultKeyId() === id) {
    localStorage.removeItem(DEFAULT_KEY_ID_KEY);
  }

  notifyChange();
  return true;
}

/**
 * Gestión de Llave Activa y Llave Predeterminada
 */
export function getActiveKeyId() {
  return localStorage.getItem(ACTIVE_KEY_ID_KEY) || 'fob_seed_2';
}

export function setActiveKeyId(id) {
  localStorage.setItem(ACTIVE_KEY_ID_KEY, id);
  notifyChange();
}

export function getDefaultKeyId() {
  return localStorage.getItem(DEFAULT_KEY_ID_KEY) || 'fob_seed_2';
}

export function setDefaultKeyId(id) {
  localStorage.setItem(DEFAULT_KEY_ID_KEY, id);
  notifyChange();
}

/**
 * Obtiene la llave actualmente activa
 */
export async function getActiveKey() {
  const keys = await getStoredKeys();
  const activeId = getActiveKeyId();
  return keys.find(k => k.id === activeId) || keys.find(k => k.canEmulateHCE) || keys[0] || null;
}
