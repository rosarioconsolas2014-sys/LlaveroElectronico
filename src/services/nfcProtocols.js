/**
 * Base de conocimientos técnicos de frecuencias, protocolos y compatibilidad
 * para llaveros RFID / NFC y sistemas de control de acceso.
 */

export const FREQUENCIES = {
  HF_13_56_MHZ: {
    id: '13.56_MHZ',
    name: 'NFC / RFID Alta Frecuencia (13,56 MHz)',
    shortName: '13,56 MHz',
    range: '1 a 4 cm',
    supportedByPhoneNFC: true,
    description: 'Frecuencia estándar internacional compatible con antenas NFC de smartphones modernos.',
  },
  LF_125_KHZ: {
    id: '125_KHZ',
    name: 'RFID Baja Frecuencia (125 kHz)',
    shortName: '125 kHz',
    range: '2 a 10 cm',
    supportedByPhoneNFC: false,
    requiresExternalReader: true,
    description: 'Muy común en llaveros tipo pastilla de edificios antiguos, portones y garajes. Las antenas NFC de los teléfonos operan a 13,56 MHz y NO pueden resonar a 125 kHz. Requiere lector externo USB OTG o Bluetooth.',
  },
  UNKNOWN: {
    id: 'UNKNOWN',
    name: 'Frecuencia o Tecnología Desconocida',
    shortName: 'Desconocido',
    supportedByPhoneNFC: false,
    description: 'Etiqueta o señal no reconocida por los protocolos estándar.',
  }
};

export const PROTOCOLS = {
  // 13.56 MHz HF Protocols
  MIFARE_CLASSIC_1K: {
    id: 'MIFARE_CLASSIC_1K',
    name: 'MIFARE Classic 1K',
    frequency: '13.56_MHZ',
    standard: 'ISO/IEC 14443-3 Type A',
    memorySize: '1024 bytes (16 sectores de 4 bloques)',
    uidLength: '4 bytes (Single Size UID)',
    encryption: 'Crypto-1 (Propietario NXP, vulnerado)',
    securityLevel: 'Baja (Clonable con hardware dedicado)',
    hceEmulable: false,
    hceReason: 'Android HCE no permite emulación de bajo nivel con Crypto-1 ni modificación arbitraria del UID de hardware por restricciones del stack NXP/Broadcom.',
    typicalUsage: 'Llaveros de edificios residenciales, estacionamientos, tarjetas de transporte antiguas.'
  },
  MIFARE_CLASSIC_4K: {
    id: 'MIFARE_CLASSIC_4K',
    name: 'MIFARE Classic 4K',
    frequency: '13.56_MHZ',
    standard: 'ISO/IEC 14443-3 Type A',
    memorySize: '4096 bytes (40 sectores)',
    uidLength: '4 bytes o 7 bytes',
    encryption: 'Crypto-1',
    securityLevel: 'Baja',
    hceEmulable: false,
    hceReason: 'Restricciones de hardware en el chip NFC de Android. HCE sólo opera a nivel ISO-DEP (ISO 14443-4).',
    typicalUsage: 'Accesos corporativos multiarea, campus universitarios.'
  },
  MIFARE_ULTRALIGHT: {
    id: 'MIFARE_ULTRALIGHT',
    name: 'MIFARE Ultralight / NTAG213',
    frequency: '13.56_MHZ',
    standard: 'ISO/IEC 14443-3 Type A (NFC Forum Type 2)',
    memorySize: '64 a 144 bytes',
    uidLength: '7 bytes (Double Size UID)',
    encryption: 'Sin cifrado (Protección por contraseña OTP opcional)',
    securityLevel: 'Media / Baja',
    hceEmulable: false,
    hceReason: 'Android HCE sólo enruta tramas ISO 14443-4 (ISO-DEP) con AID; no emula etiquetas Type 2 de bajo nivel.',
    typicalUsage: 'Llaveros de eventos, entradas de cine, micropagos.'
  },
  MIFARE_DESFIRE: {
    id: 'MIFARE_DESFIRE',
    name: 'MIFARE DESFire EV1 / EV2 / EV3',
    frequency: '13.56_MHZ',
    standard: 'ISO/IEC 14443-4 Type A (ISO-DEP)',
    memorySize: '2K / 4K / 8K bytes',
    uidLength: '7 bytes',
    encryption: 'Hardware 3DES / AES-128 criptográfico avanzado',
    securityLevel: 'Muy Alta (Grado Bancario / Tránsito Masivo)',
    hceEmulable: false,
    hceReason: 'Las llaves criptográficas maestras residen dentro del silicio seguro y nunca pueden ser extraídas ni clonadas.',
    typicalUsage: 'Sistemas de alta seguridad gubernamental, transporte metropolitano (SUBE, BIP, Metro).'
  },
  ISO_DEP_DIGITAL: {
    id: 'ISO_DEP_DIGITAL',
    name: 'Credencial Digital Autorizada ISO-DEP',
    frequency: '13.56_MHZ',
    standard: 'ISO/IEC 14443-4 (ISO-DEP) con APDU ISO 7816-4',
    memorySize: 'Dinámica según aplicación HCE',
    uidLength: 'Aleatorio / Gestionado por el Host',
    encryption: 'AES-256 GCM / Token Digital PKI',
    securityLevel: 'Alta (Validada criptográficamente por AID)',
    hceEmulable: true,
    hceReason: '100% compatible con Android Host Card Emulation oficial mediante HostApduService y AID registrado.',
    typicalUsage: 'Credenciales corporativas de nueva generación, billeteras digitales de acceso, cerraduras inteligentes.'
  },
  
  // 125 kHz LF Protocols (Requieren lector externo)
  EM4100: {
    id: 'EM4100',
    name: 'EM4100 / EM4200 (Pastilla Clásica)',
    frequency: '125_KHZ',
    standard: 'RFID LF 125 kHz Manchester 64-bit',
    memorySize: '64 bits (Solo lectura UID)',
    uidLength: '5 bytes (10 dígitos hexadecimales)',
    encryption: 'Ninguna (Transmisión en texto plano)',
    securityLevel: 'Muy Baja (Fácilmente duplicable con grabadores físicos 125kHz)',
    hceEmulable: false,
    hceReason: 'Incompatibilidad física de frecuencia. El celular emite a 13,56 MHz; un lector 125 kHz no puede energizar ni leer el celular. Requiere pastilla física o lector externo.',
    typicalUsage: 'Llavero tipo pastilla azul/negro de la mayoría de edificios, portones vehiculares y consorcios.'
  },
  T5577: {
    id: 'T5577',
    name: 'Atmel T5577 / EM4305 (Pastilla Regrabable)',
    frequency: '125_KHZ',
    standard: 'RFID LF 125 kHz Regrabable Multi-modo',
    memorySize: '330 bits (10 bloques de 32 bits)',
    uidLength: 'Configurable (Emula EM4100, HID, Indala)',
    encryption: 'Protección por contraseña de 32 bits opcional',
    securityLevel: 'Baja',
    hceEmulable: false,
    hceReason: 'Incompatibilidad física de hardware (125 kHz vs 13,56 MHz).',
    typicalUsage: 'Pastillas duplicadas en cerrajerías para edificios y garajes.'
  },
  HID_PROX: {
    id: 'HID_PROX',
    name: 'HID ProxCard II / ProxKey',
    frequency: '125_KHZ',
    standard: 'Wiegand 26-bit / 37-bit FSK 125 kHz',
    memorySize: 'Wiegand Facility Code + Card ID',
    uidLength: '3 a 5 bytes',
    encryption: 'Propietario HID Global',
    securityLevel: 'Media / Baja',
    hceEmulable: false,
    hceReason: 'Frecuencia LF 125 kHz incompatible con el hardware NFC del celular.',
    typicalUsage: 'Llaveros corporativos de acceso para oficinas y plantas industriales.'
  },
  INDALA: {
    id: 'INDALA',
    name: 'Motorola / HID Indala',
    frequency: '125_KHZ',
    standard: 'PSK 125 kHz Propietario',
    memorySize: '26 a 44 bits',
    uidLength: 'Variable',
    encryption: 'Codificación Pseudo-random PSK',
    securityLevel: 'Media',
    hceEmulable: false,
    hceReason: 'Frecuencia LF 125 kHz incompatible con NFC.',
    typicalUsage: 'Accesos empresariales y barreras automáticas de estacionamientos.'
  }
};

/**
 * Clasificador inteligente de resultados de diagnóstico
 */
export function classifyScanResult(tagData) {
  if (!tagData) {
    return {
      category: 'UNKNOWN',
      title: 'Tecnología desconocida',
      badgeColor: 'gray',
      frequency: FREQUENCIES.UNKNOWN,
      canEmulateHCE: false,
      advice: 'No se detectó ninguna señal de modulación reconocible en el campo electromagnético.'
    };
  }

  // Si fue detectado mediante lector externo de 125 kHz
  if (tagData.frequency === '125_KHZ' || (tagData.protocol && tagData.protocol.startsWith('EM') || tagData.protocol === 'T5577' || tagData.protocol === 'HID_PROX' || tagData.protocol === 'INDALA')) {
    return {
      category: 'RFID_125_KHZ',
      title: 'RFID 125 kHz (Llavero Pastilla LF)',
      badgeColor: 'amber',
      frequency: FREQUENCIES.LF_125_KHZ,
      canEmulateHCE: false,
      requiresExternalReader: true,
      advice: 'Este llavero opera a 125 kHz. Las antenas NFC de los teléfonos solo emiten a 13,56 MHz. Esta credencial puede guardarse en la billetera como registro o para programar un lector externo USB OTG/Bluetooth, pero NO puede ser transmitida directamente desde el teléfono.'
    };
  }

  // Si es Mifare DESFire o protegida con AES/3DES
  if (tagData.protocol === 'MIFARE_DESFIRE' || tagData.isProtected) {
    return {
      category: 'PROTECTED_CREDENTIAL',
      title: 'Credencial Protegida (Grado Seguridad)',
      badgeColor: 'purple',
      frequency: FREQUENCIES.HF_13_56_MHZ,
      canEmulateHCE: false,
      advice: 'Llavero con procesador criptográfico seguro (DESFire / AES). La extracción de llaves privadas está bloqueada por hardware contra clonación. Para usarla digitalmente se requiere que el emisor provea un token digital HCE autorizado.'
    };
  }

  // Si es una credencial digital oficialmente compatible con HCE (ISO-DEP)
  if (tagData.protocol === 'ISO_DEP_DIGITAL' || tagData.isHCEAuthorized) {
    return {
      category: 'HCE_AUTHORIZED',
      title: 'Credencial Digital Autorizada (HCE)',
      badgeColor: 'cyan',
      frequency: FREQUENCIES.HF_13_56_MHZ,
      canEmulateHCE: true,
      advice: '100% compatible con la emulación Android HCE. Puede ser activada y emitida mediante la antena NFC del teléfono para interactuar con cerraduras y receptores compatibles.'
    };
  }

  // Si es NFC 13.56 MHz estándar pero no emulable por HCE (ej. Mifare Classic o NTAG)
  return {
    category: 'NFC_13_56_MHZ',
    title: 'NFC 13,56 MHz (Estándar HF)',
    badgeColor: 'blue',
    frequency: FREQUENCIES.HF_13_56_MHZ,
    canEmulateHCE: false,
    advice: 'Llavero de alta frecuencia detectable por el sensor NFC del teléfono. Sin embargo, debido a que Android HCE bloquea la emulación de UID arbitrarios y cifrado Crypto-1, no puede ser emulado directamente como llave de paso sin soporte de sistema abierto.'
  };
}
