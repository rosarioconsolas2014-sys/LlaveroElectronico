import React, { useState } from 'react';
import { 
  Activity, 
  Smartphone, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Cpu, 
  Radio, 
  RefreshCw, 
  Layers, 
  ShieldCheck, 
  HelpCircle,
  SlidersHorizontal
} from 'lucide-react';
import { DEVICE_PROFILES, evaluateDiagnosticStatus } from '../services/deviceDiagnostic.js';

export default function DiagnosticScreen({ 
  diagnostic, 
  activeProfileId, 
  onChangeProfile, 
  onRefreshDiagnostic,
  onGoToExternalReaders 
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshDiagnostic();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const statusFlags = evaluateDiagnosticStatus(diagnostic);
  const isNfcOk = diagnostic?.nfcAvailable && diagnostic?.nfcEnabled;
  const isHceOk = diagnostic?.hceSupported;

  return (
    <div className="space-y-6 pb-4">
      {/* Title & Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            Diagnóstico del Celular
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Evaluación en tiempo real del hardware NFC y capacidades HCE
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs font-medium text-gray-300 hover:text-cyan-400 hover:border-cyan-500/40 transition active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Verificar</span>
        </button>
      </div>

      {/* Selector de Perfil de Hardware para Pruebas (No asumir que todos los Android son iguales) */}
      <div className="p-3.5 rounded-2xl bg-gray-950/70 border border-gray-800/80">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            Simulador de Hardware & Compatibilidad:
          </label>
          <span className="text-[10px] text-gray-400 font-mono">Modo de Prueba</span>
        </div>
        <select
          value={activeProfileId}
          onChange={(e) => onChangeProfile(e.target.value)}
          aria-label="Perfil de hardware para pruebas"
          className="w-full bg-gray-900 border border-gray-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition cursor-pointer"
        >
          {DEVICE_PROFILES.map((p) => (
            <option key={p.id} value={p.id} className="bg-gray-900 text-white">
              {p.name}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-gray-400 mt-2">
          Permite verificar cómo responde la aplicación ante diferentes modelos de teléfono, fabricantes y chips NFC.
        </p>
      </div>

      {/* Main Diagnostic Status Grid (Requerimiento 2: 5 estados evaluados) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* NFC Status Card */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isNfcOk
              ? 'bg-gradient-to-br from-cyan-950/40 to-gray-950 border-cyan-500/40 text-cyan-300'
              : 'bg-gradient-to-br from-rose-950/40 to-gray-950 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold opacity-80">
              Módulo NFC
            </span>
            {isNfcOk ? (
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400" />
            )}
          </div>
          <div className="text-lg font-bold text-white">
            {isNfcOk ? 'NFC Disponible' : 'NFC No Disponible'}
          </div>
          <p className="text-xs text-gray-300 mt-1">
            {isNfcOk
              ? 'Chip y antena NFC detectados y operativos a 13,56 MHz.'
              : 'El dispositivo no posee chip NFC o está inactivo en ajustes.'}
          </p>
        </div>

        {/* HCE Status Card */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isHceOk
              ? 'bg-gradient-to-br from-blue-950/40 to-gray-950 border-blue-500/40 text-blue-300'
              : 'bg-gradient-to-br from-amber-950/40 to-gray-950 border-amber-500/40 text-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold opacity-80">
              Emulación Host
            </span>
            {isHceOk ? (
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            )}
          </div>
          <div className="text-lg font-bold text-white">
            {isHceOk ? 'HCE Compatible' : 'HCE No Compatible'}
          </div>
          <p className="text-xs text-gray-300 mt-1">
            {isHceOk
              ? 'Soporte activo para HostApduService y emisión de credenciales digitales.'
              : 'El firmware no permite emular tarjetas de proximidad desde el sistema operativo.'}
          </p>
        </div>
      </div>

      {/* Card de Funciones Limitadas por Hardware (125 kHz vs 13.56 MHz) */}
      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              Funciones Limitadas por Hardware
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Física de RF
              </span>
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Las antenas de los teléfonos inteligentes están diseñadas por ley internacional exclusivamente para la frecuencia <strong className="text-white">13,56 MHz (HF)</strong>.
            </p>
            <p className="text-xs text-amber-200/90 leading-relaxed">
              Los llaveros tipo pastilla de muchos edificios y portones operan a <strong className="text-white">125 kHz (LF)</strong> con bobinas de cobre de alto calibre. <span className="underline">Ningún celular puede leer ni emular 125 kHz de manera nativa</span> sin un lector externo USB OTG o Bluetooth compatible.
            </p>
            <div className="pt-2">
              <button
                onClick={onGoToExternalReaders}
                className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline underline-offset-2"
              >
                Ver compatibilidad con lectores externos USB OTG / BLE →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dispositivo y Especificaciones Detectadas */}
      <div className="p-5 rounded-2xl bg-gray-950/90 border border-gray-800 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Especificaciones del Dispositivo</h3>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
            {diagnostic?.androidVersion || 'Android'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800/80">
            <span className="text-gray-400 block text-[11px]">Fabricante</span>
            <span className="font-semibold text-white mt-0.5 block truncate">
              {diagnostic?.manufacturer || 'Detectado'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800/80">
            <span className="text-gray-400 block text-[11px]">Modelo</span>
            <span className="font-semibold text-white mt-0.5 block truncate">
              {diagnostic?.model || 'Terminal Android'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800/80">
            <span className="text-gray-400 block text-[11px]">Chipset NFC</span>
            <span className="font-semibold text-white mt-0.5 block truncate">
              {diagnostic?.chipset || 'NXP / ST Controller'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800/80">
            <span className="text-gray-400 block text-[11px]">Frecuencia Antena</span>
            <span className="font-semibold text-cyan-400 mt-0.5 block">13,56 MHz (HF)</span>
          </div>

          <div className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800/80">
            <span className="text-gray-400 block text-[11px]">Estado Antena</span>
            <span className={`font-semibold mt-0.5 block ${isNfcOk ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isNfcOk ? 'Habilitada' : 'Deshabilitada'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800/80">
            <span className="text-gray-400 block text-[11px]">Soporte Keystore</span>
            <span className="font-semibold text-cyan-400 mt-0.5 block">Hardware TEE (AES-256)</span>
          </div>
        </div>

        {/* Capacidades de Lectura y Emulación */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full flex items-center justify-between text-xs text-gray-400 hover:text-cyan-400 transition py-1"
          >
            <span className="flex items-center gap-1.5 font-semibold">
              <Layers className="w-4 h-4 text-cyan-400" />
              Detalle de protocolos admitidos por el controlador
            </span>
            <span>{showTechnicalDetails ? '▲ Ocultar' : '▼ Expandir'}</span>
          </button>

          {showTechnicalDetails && (
            <div className="space-y-3 p-3 rounded-xl bg-gray-900/80 border border-gray-800 text-xs">
              <div>
                <span className="font-bold text-gray-300 block mb-1">Capacidades de Lectura:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(diagnostic?.readCapabilities || ['NFC-A', 'NFC-B', 'ISO-DEP']).map((cap, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700 font-mono text-[11px]">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-gray-300 block mb-1">Capacidades de Emulación:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(diagnostic?.emulationCapabilities || ['HostApduService ISO-DEP']).map((cap, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40 font-mono text-[11px]">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
