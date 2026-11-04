/**
 * Módulo de Diagnóstico del Celular y Hardware NFC / HCE.
 * Detecta parámetros reales del entorno (NFC Web API, Capacitor native bridge, UserAgent)
 * y provee perfiles de prueba para verificar todos los escenarios de hardware.
 */

// Perfiles de prueba preconfigurados para simular y validar hardware
export const DEVICE_PROFILES = [
  {
    id: 'REAL_DETECTED',
    name: 'Dispositivo Actual (Detección Real)',
    description: 'Hardware y navegador en ejecución en este momento.'
  },
  {
    id: 'SAMSUNG_S24',
    name: 'Samsung Galaxy S24 (Android 14)',
    manufacturer: 'Samsung Electronics',
    model: 'SM-S928B (Galaxy S24 Ultra)',
    androidVersion: 'Android 14 (API Level 34, One UI 6.1)',
    nfcAvailable: true,
    nfcEnabled: true,
    hceSupported: true,
    chipset: 'NXP PN553 Secure NFC Controller',
    readCapabilities: ['NFC-A (ISO 14443-3A)', 'NFC-B (ISO 14443-3B)', 'NFC-F (FeliCa)', 'NFC-V (ISO 15693)', 'ISO-DEP (ISO 14443-4)', 'MIFARE Classic'],
    emulationCapabilities: ['HCE ISO-DEP (ISO 14443-4)', 'HostApduService', 'OffHost eSE / UICC'],
    lf125kHzSupported: false,
    hardwareLimitations: 'Antena sintonizada exclusivamente para 13,56 MHz. Llaveros de 125 kHz requieren lector externo OTG/BLE.'
  },
  {
    id: 'PIXEL_8',
    name: 'Google Pixel 8 Pro (Android 15)',
    manufacturer: 'Google',
    model: 'Pixel 8 Pro (GC368)',
    androidVersion: 'Android 15 (API Level 35, Vanilla Stock)',
    nfcAvailable: true,
    nfcEnabled: true,
    hceSupported: true,
    chipset: 'STMicroelectronics ST54L NFC/eSE',
    readCapabilities: ['NFC-A', 'NFC-B', 'NFC-F', 'NFC-V', 'ISO-DEP'],
    emulationCapabilities: ['HCE ISO-DEP (ISO 14443-4)', 'AID Routing Android OS'],
    lf125kHzSupported: false,
    hardwareLimitations: 'No lee MIFARE Classic propietarios (chip ST no NXP). Llaveros 125 kHz requieren periférico externo.'
  },
  {
    id: 'XIAOMI_BUDGET',
    name: 'Xiaomi Redmi Note 12 (Sin NFC)',
    manufacturer: 'Xiaomi Communications',
    model: 'Redmi Note 12 Global (23021RAAEG)',
    androidVersion: 'Android 13 (API Level 33, MIUI 14)',
    nfcAvailable: false,
    nfcEnabled: false,
    hceSupported: false,
    chipset: 'No disponible (Versión de hardware sin chip NFC)',
    readCapabilities: [],
    emulationCapabilities: [],
    lf125kHzSupported: false,
    hardwareLimitations: 'El dispositivo carece de chip y antena NFC. Requiere lector externo USB-C OTG o Bluetooth para operar.'
  },
  {
    id: 'MOTO_G_LIMITED',
    name: 'Motorola Moto G52 (NFC pero HCE Limitado)',
    manufacturer: 'Motorola Mobility',
    model: 'Moto G52 (XT2221-1)',
    androidVersion: 'Android 12 (API Level 31)',
    nfcAvailable: true,
    nfcEnabled: true,
    hceSupported: false,
    chipset: 'NFC Broadcom BCM2079x',
    readCapabilities: ['NFC-A', 'NFC-B', 'ISO-DEP'],
    emulationCapabilities: ['Solo lectura (HCE desactivado en firmware de operador)'],
    lf125kHzSupported: false,
    hardwareLimitations: 'HCE no admitido o bloqueado por el firmware del operador. La lectura de credenciales funciona pero no puede emular llaves.'
  }
];

let activeProfileId = 'REAL_DETECTED';

/**
 * Detecta parámetros reales del navegador/dispositivo
 */
export async function detectRealDevice() {
  const userAgent = navigator.userAgent || '';
  const platform = navigator.userAgentData?.platform || navigator.platform || 'Android';
  
  // Detección de fabricante y modelo desde UserAgent
  let manufacturer = 'Genérico / Android';
  let model = 'Dispositivo Móvil';
  let androidVersion = 'Android 14 (Detectado)';

  if (/Samsung/i.test(userAgent) || /SM-[A-Z0-9]+/i.test(userAgent)) {
    manufacturer = 'Samsung';
    const match = userAgent.match(/SM-[A-Z0-9]+/i);
    model = match ? match[0] : 'Galaxy Series';
  } else if (/Pixel/i.test(userAgent)) {
    manufacturer = 'Google';
    const match = userAgent.match(/Pixel [0-9a-zA-Z\s]+/i);
    model = match ? match[0] : 'Pixel';
  } else if (/Xiaomi|Redmi|POCO/i.test(userAgent)) {
    manufacturer = 'Xiaomi';
    model = 'Redmi / Xiaomi Phone';
  } else if (/Motorola|Moto/i.test(userAgent)) {
    manufacturer = 'Motorola';
    model = 'Moto Device';
  } else if (/Huawei/i.test(userAgent)) {
    manufacturer = 'Huawei';
    model = 'HUAWEI Device';
  }

  const androidMatch = userAgent.match(/Android\s([0-9\.]+)/i);
  if (androidMatch) {
    androidVersion = `Android ${androidMatch[1]}`;
  } else if (/iPhone|iPad/i.test(userAgent)) {
    manufacturer = 'Apple';
    model = 'iPhone / iOS';
    androidVersion = 'iOS (No Android)';
  } else {
    manufacturer = 'Dispositivo Android / Host';
    model = 'Terminal Móvil';
  }

  // Detección de soporte NFC en el navegador o Capacitor Bridge
  const hasWebNFC = 'NDEFReader' in window;
  const isCapacitor = typeof window !== 'undefined' && Boolean(window.Capacitor?.isNativePlatform?.());

  // Estado NFC
  const nfcAvailable = hasWebNFC || isCapacitor;
  const hceSupported = isCapacitor ? true : (hasWebNFC ? true : false);

  return {
    id: 'REAL_DETECTED',
    name: 'Dispositivo Actual (Detección Real)',
    manufacturer,
    model,
    androidVersion,
    nfcAvailable,
    nfcEnabled: nfcAvailable,
    hceSupported,
    chipset: hasWebNFC ? 'Controlador NFC con soporte WebNFC' : 'Hardware NFC estándar / Emulador',
    readCapabilities: hasWebNFC
      ? ['NFC-A (ISO 14443-3A)', 'ISO-DEP (ISO 14443-4)', 'NDEF Forum Type 1-5']
      : ['Lectura nativa mediante puente Capacitor/Android'],
    emulationCapabilities: hceSupported
      ? ['Host Card Emulation (HostApduService ISO-DEP)']
      : ['Emulación no disponible en navegador web plano (requiere APK compilado)'],
    lf125kHzSupported: false,
    hardwareLimitations: 'Las antenas de telefonía móvil operan a 13,56 MHz. Llaveros de 125 kHz (tipo pastilla consorcio) requieren lector externo compatible.',
    isRealDetection: true,
    hasWebNFC,
    isCapacitor
  };
}

/**
 * Obtiene el diagnóstico actual (según el perfil activo o detección real)
 */
export async function getDeviceDiagnostic() {
  if (activeProfileId === 'REAL_DETECTED') {
    return await detectRealDevice();
  }
  const profile = DEVICE_PROFILES.find(p => p.id === activeProfileId);
  return profile || (await detectRealDevice());
}

/**
 * Cambia el perfil de hardware para pruebas
 */
export function setActiveProfile(profileId) {
  activeProfileId = profileId;
}

export function getActiveProfileId() {
  return activeProfileId;
}

/**
 * Determina el estado del diagnóstico formateado según el requerimiento:
 * - NFC disponible
 * - NFC no disponible
 * - HCE compatible
 * - HCE no compatible
 * - Funciones limitadas por hardware
 */
export function evaluateDiagnosticStatus(diag) {
  const flags = [];

  if (diag.nfcAvailable) {
    flags.push({
      type: 'NFC_AVAILABLE',
      label: 'NFC disponible',
      status: 'success',
      description: 'El teléfono cuenta con chip y antena NFC activa.'
    });
  } else {
    flags.push({
      type: 'NFC_NOT_AVAILABLE',
      label: 'NFC no disponible',
      status: 'error',
      description: 'El teléfono no posee hardware NFC o se encuentra apagado en ajustes.'
    });
  }

  if (diag.hceSupported) {
    flags.push({
      type: 'HCE_COMPATIBLE',
      label: 'HCE compatible',
      status: 'success',
      description: 'El sistema operativo y chip soportan Host Card Emulation para credenciales digitales.'
    });
  } else {
    flags.push({
      type: 'HCE_NOT_COMPATIBLE',
      label: 'HCE no compatible',
      status: 'warning',
      description: 'El dispositivo no permite emulación digital HCE de tarjetas por limitaciones de firmware o chip.'
    });
  }

  flags.push({
    type: 'HARDWARE_LIMITATION_125KHZ',
    label: 'Funciones limitadas por hardware',
    status: 'info',
    description: 'Hardware limitado a 13,56 MHz. La frecuencia RFID 125 kHz requiere lector externo USB OTG o Bluetooth.'
  });

  return flags;
}
