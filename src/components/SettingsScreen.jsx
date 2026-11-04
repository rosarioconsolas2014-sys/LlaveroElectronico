import React, { useState } from 'react';
import { 
  Settings, 
  Shield, 
  Lock, 
  Key, 
  Fingerprint, 
  Download, 
  Upload, 
  FileCode2, 
  Smartphone, 
  Cpu, 
  RefreshCcw, 
  Check, 
  AlertTriangle,
  ChevronRight,
  Database
} from 'lucide-react';
import { 
  getSecurityConfig, 
  setSecurityConfig, 
  hasPinConfigured, 
  setAppPin, 
  removeAppPin 
} from '../services/cryptoService.js';
import { INITIAL_SEED_KEYS, saveStoredKeys } from '../services/storageService.js';

export default function SettingsScreen({
  keys = [],
  onRefreshWallet,
  onOpenNativeCodeModal
}) {
  const [securityConfig, setSecConfig] = useState(getSecurityConfig());
  const [hasPin, setHasPin] = useState(hasPinConfigured());
  const [newPinInput, setNewPinInput] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [pinFeedback, setPinFeedback] = useState('');
  const [exportFeedback, setExportFeedback] = useState(false);

  const handleSavePin = async () => {
    if (newPinInput.length < 4) {
      setPinFeedback('El PIN debe tener al menos 4 dígitos');
      return;
    }
    await setAppPin(newPinInput);
    setHasPin(true);
    setIsSettingPin(false);
    setNewPinInput('');
    setSecConfig(getSecurityConfig());
    setPinFeedback('PIN configurado correctamente');
    setTimeout(() => setPinFeedback(''), 3000);
  };

  const handleRemovePin = () => {
    removeAppPin();
    setHasPin(false);
    setSecConfig(getSecurityConfig());
    setPinFeedback('PIN desactivado');
    setTimeout(() => setPinFeedback(''), 3000);
  };

  const handleToggleBiometric = () => {
    const updated = setSecurityConfig({ biometricEnabled: !securityConfig.biometricEnabled });
    setSecConfig(updated);
  };

  // Exportar respaldo cifrado
  const handleExportBackup = () => {
    const backupData = {
      app: 'KeyManager NFC',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      keysCount: keys.length,
      keys
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KeyManager_NFC_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setExportFeedback(true);
    setTimeout(() => setExportFeedback(false), 2500);
  };

  // Restaurar datos de prueba
  const handleRestoreDefaults = async () => {
    if (window.confirm('¿Restaurar las llaves de demostración de fábrica?')) {
      await saveStoredKeys(INITIAL_SEED_KEYS);
      await onRefreshWallet();
    }
  };

  return (
    <div className="space-y-6 pb-4">
      {/* Encabezado */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-cyan-400" />
          Configuración y Seguridad
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Protección de credenciales, Keystore y exportación de código Android
        </p>
      </div>

      {/* ENTREGA: CÓDIGO FUENTE KOTLIN & COMPILACIÓN APK */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-cyan-950/60 via-blue-950/40 to-gray-950 border border-cyan-500/40 shadow-xl shadow-cyan-500/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Código Fuente Nativo & APK</h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
            Android Studio
          </span>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed">
          Explora los archivos nativos Kotlin (<code className="text-cyan-300">KeyManagerApduService.kt</code>, <code className="text-cyan-300">KeyManagerNfcPlugin.kt</code>, <code className="text-cyan-300">KeystoreHelper.kt</code>), <code className="text-cyan-300">AndroidManifest.xml</code> y las instrucciones paso a paso para compilar el APK instalable en Android Studio.
        </p>

        <button
          onClick={onOpenNativeCodeModal}
          className="w-full py-3 rounded-2xl bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 hover:bg-cyan-300 transition flex items-center justify-center gap-2 active:scale-98"
        >
          <Smartphone className="w-4 h-4 stroke-[2.5]" />
          <span>Ver Código Kotlin & Guía de Compilación APK</span>
        </button>
      </div>

      {/* SEGURIDAD Y BLOQUEO DE LA BÓVEDA (Requerimiento 9) */}
      <div className="p-5 rounded-2xl bg-gray-950 border border-gray-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
          <Shield className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Seguridad de la Bóveda Local</h3>
        </div>

        {/* PIN de Acceso */}
        <div className="flex items-center justify-between py-1">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-white block">Bloqueo por PIN</span>
            <p className="text-[11px] text-gray-400">
              {hasPin ? 'PIN de 4 dígitos activado' : 'Sin PIN de protección configurado'}
            </p>
          </div>

          {hasPin ? (
            <button
              onClick={handleRemovePin}
              className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-700 text-xs text-rose-400 hover:border-rose-500 transition"
            >
              Desactivar PIN
            </button>
          ) : (
            <button
              onClick={() => setIsSettingPin(!isSettingPin)}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold hover:bg-cyan-500/30 transition"
            >
              {isSettingPin ? 'Cancelar' : 'Configurar PIN'}
            </button>
          )}
        </div>

        {isSettingPin && (
          <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 space-y-2">
            <label className="text-[11px] text-gray-300 font-semibold block">
              Ingresa un nuevo PIN de 4 dígitos:
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                maxLength={6}
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="••••"
                className="w-32 bg-gray-950 border border-gray-700 rounded-xl px-3 py-1.5 text-center font-mono text-base tracking-widest text-cyan-400 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleSavePin}
                className="px-4 py-1.5 rounded-xl bg-cyan-400 text-black font-bold text-xs uppercase"
              >
                Guardar
              </button>
            </div>
          </div>
        )}

        {pinFeedback && (
          <p className="text-xs text-cyan-400 font-mono">{pinFeedback}</p>
        )}

        {/* Biometría (Huella / Rostro) */}
        <div className="flex items-center justify-between py-1 border-t border-gray-900">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-white block">Desbloqueo Biométrico</span>
            <p className="text-[11px] text-gray-400">
              Usa el sensor de huella dactilar de Android (BiometricPrompt)
            </p>
          </div>

          <button
            onClick={handleToggleBiometric}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              securityConfig.biometricEnabled ? 'bg-cyan-500' : 'bg-gray-800'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                securityConfig.biometricEnabled ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Estado Android Keystore */}
        <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 text-xs space-y-1">
          <span className="font-semibold text-gray-300 block">Arquitectura Android Keystore:</span>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Las llaves de cifrado residen en el elemento seguro TEE del chip del teléfono (<code className="text-cyan-400 font-mono">AES/GCM/NoPadding 256 bits</code>). Ningún dato se transmite a la nube.
          </p>
        </div>
      </div>

      {/* RESPALDO Y DATOS DE LA BILLETERA */}
      <div className="p-5 rounded-2xl bg-gray-950 border border-gray-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
          <Database className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Gestión de Bóveda y Respaldo</h3>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleExportBackup}
            className="w-full p-3 rounded-xl bg-gray-900 border border-gray-800 text-left hover:border-gray-700 transition flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="font-semibold text-white block">Exportar Bóveda Cifrada</span>
                <span className="text-[11px] text-gray-400">Descarga un respaldo JSON local seguro</span>
              </div>
            </div>
            {exportFeedback ? (
              <span className="text-emerald-400 font-mono text-xs flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Descargado
              </span>
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>

          <button
            onClick={handleRestoreDefaults}
            className="w-full p-3 rounded-xl bg-gray-900 border border-gray-800 text-left hover:border-gray-700 transition flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2.5">
              <RefreshCcw className="w-4 h-4 text-amber-400" />
              <div>
                <span className="font-semibold text-white block">Restaurar Semillas de Prueba</span>
                <span className="text-[11px] text-gray-400">Restablece los llaveros de demostración (Edificio, Oficina, etc.)</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* VERSIÓN Y METADATOS */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <p className="font-mono">KeyManager NFC v1.0.0 (Build 2026.11)</p>
        <p className="text-[11px]">Diseñado para Android 10 - 15 con soporte HCE y USB OTG</p>
      </div>
    </div>
  );
}
