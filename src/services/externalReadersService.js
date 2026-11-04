/**
 * Módulo de Arquitectura Modular de Lectores Externos (USB OTG & Bluetooth).
 * Permite identificar hardware externo conectado, sus frecuencias compatibles
 * y captura de llaveros de 125 kHz.
 */

export const SUPPORTED_READER_PROFILES = [
  {
    id: 'CHAMELEON_ULTRA_BLE',
    name: 'Chameleon Ultra (Bluetooth BLE)',
    type: 'BLUETOOTH',
    manufacturer: 'Proxgrind RFID',
    interface: 'BLE 5.0 GATT Service',
    supportedFrequencies: ['125 kHz LF', '13,56 MHz HF'],
    supportedProtocols: ['EM4100', 'T5577', 'HID Prox', 'MIFARE Classic', 'Ultralight', 'ISO 14443-4'],
    capabilities: ['Lectura 125 kHz', 'Grabación 125 kHz', 'Lectura 13,56 MHz', 'Emulación de Hardware'],
    status: 'DISCONNECTED',
    baudRate: '115200 bps',
    batteryLevel: 92,
    icon: 'bluetooth'
  },
  {
    id: 'GENERIC_125KHZ_USB',
    name: 'Lector USB OTG 125 kHz (Pastillas Consorcio)',
    type: 'USB_OTG',
    manufacturer: 'Generic USB HID Micro-Reader',
    interface: 'USB-C / USB Type-A (USB HID Keyboard Emulation)',
    supportedFrequencies: ['125 kHz LF'],
    supportedProtocols: ['EM4100', 'EM4200', 'TK4100', 'T5577 (Solo lectura)'],
    capabilities: ['Lectura instantánea de UIDs 125 kHz en teléfonos sin antena LF'],
    status: 'CONNECTED',
    baudRate: 'USB Full Speed (12 Mbps)',
    batteryLevel: null,
    icon: 'usb'
  },
  {
    id: 'ACR122U_USB',
    name: 'ACS ACR122U USB-C OTG',
    type: 'USB_OTG',
    manufacturer: 'Advanced Card Systems',
    interface: 'USB CCID / PC/SC',
    supportedFrequencies: ['13,56 MHz HF'],
    supportedProtocols: ['ISO 14443 Type A & B', 'MIFARE Classic 1K/4K', 'FeliCa', 'NFC Forum Tags'],
    capabilities: ['Lectura HF de alta potencia', 'Lectura de sectores protegidos con llaves'],
    status: 'DISCONNECTED',
    baudRate: '424 kbps',
    batteryLevel: null,
    icon: 'usb'
  },
  {
    id: 'PROXMARK3_EASY',
    name: 'Proxmark3 Easy (USB OTG)',
    type: 'USB_OTG',
    manufacturer: 'Elechouse / Open Source',
    interface: 'USB CDC ACM Serial',
    supportedFrequencies: ['125 kHz LF', '13,56 MHz HF'],
    supportedProtocols: ['EM4100', 'T5577', 'HID Prox', 'Indala', 'MIFARE Classic', 'DESFire', 'iClass'],
    capabilities: ['Diagnóstico espectral de RF', 'Decodificación Wiegand', 'Snoop / Sniffing'],
    status: 'DISCONNECTED',
    baudRate: '115200 baud',
    batteryLevel: null,
    icon: 'cpu'
  }
];

let connectedReaders = [SUPPORTED_READER_PROFILES[1]]; // Por defecto el USB OTG 125kHz como conectado para demostración
const listeners = new Set();

export function subscribeToReaders(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notify() {
  listeners.forEach(fn => fn(getConnectedReaders()));
}

export function getAvailableReaderProfiles() {
  return SUPPORTED_READER_PROFILES.map(r => {
    const isConn = connectedReaders.some(c => c.id === r.id);
    return {
      ...r,
      status: isConn ? 'CONNECTED' : 'DISCONNECTED'
    };
  });
}

export function getConnectedReaders() {
  return connectedReaders;
}

export function connectReader(readerId) {
  const profile = SUPPORTED_READER_PROFILES.find(r => r.id === readerId);
  if (!profile) return false;
  if (!connectedReaders.some(r => r.id === readerId)) {
    connectedReaders.push({ ...profile, status: 'CONNECTED', connectedAt: new Date().toISOString() });
    notify();
  }
  return true;
}

export function disconnectReader(readerId) {
  connectedReaders = connectedReaders.filter(r => r.id !== readerId);
  notify();
  return true;
}

/**
 * Simula la recepción de una lectura directa desde el lector externo 125 kHz
 */
export function simulateExternalScan(protocol = 'EM4100') {
  const randomHex = Math.floor(Math.random() * 0xFFFFFFFFFF).toString(16).padStart(10, '0').toUpperCase();
  const pairs = randomHex.match(/.{1,2}/g) || [];
  const uid = pairs.join(':');

  return {
    source: 'EXTERNAL_READER_125KHZ',
    readerName: connectedReaders[0]?.name || 'Lector USB OTG 125 kHz',
    rawFrequency: '125_KHZ',
    protocol,
    uid,
    wiegandId: `FC: ${Math.floor(Math.random() * 255)} / ID: ${Math.floor(Math.random() * 65535)}`,
    techList: ['RFID.LF.125kHz.Manchester64'],
    standard: 'RFID LF 125 kHz',
    memorySize: '64 bits (Read Only)',
    isProtected: false,
    timestamp: new Date().toISOString()
  };
}
