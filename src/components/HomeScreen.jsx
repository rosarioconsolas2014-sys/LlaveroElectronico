import React from 'react';
import { 
  Radio, 
  WalletCards, 
  Zap, 
  Activity, 
  ShieldCheck, 
  Usb, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';
import FobIcon from './FobIcon.jsx';

export default function HomeScreen({
  keys = [],
  activeKey,
  diagnostic,
  onNavigate,
  onGoToScan,
  onGoToEmulate
}) {
  const isNfcOk = diagnostic?.nfcAvailable && diagnostic?.nfcEnabled;
  const isHceOk = diagnostic?.hceSupported;

  return (
    <div className="space-y-6 pb-4">
      {/* TARJETA DESTACADA: LLAVE DIGITAL ACTIVA */}
      {activeKey ? (
        <div
          className={`relative overflow-hidden rounded-3xl p-6 border transition-all duration-300 ${
            activeKey.canEmulateHCE
              ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 border-cyan-500/40 shadow-2xl shadow-cyan-500/10'
              : 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 border-amber-500/30'
          }`}
        >
          {/* Luz difusa de fondo */}
          <div
            className={`absolute -right-12 -top-12 w-44 h-44 rounded-full blur-3xl pointer-events-none ${
              activeKey.canEmulateHCE ? 'bg-cyan-500/15' : 'bg-amber-500/10'
            }`}
          />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                Llave Seleccionada
              </span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border ${
                  activeKey.canEmulateHCE
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                }`}
              >
                {activeKey.frequencyLabel}
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div
                className={`w-13 h-13 rounded-2xl flex items-center justify-center border shadow-lg ${
                  activeKey.canEmulateHCE
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40 shadow-cyan-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                }`}
              >
                <FobIcon type={activeKey.iconType} frequency={activeKey.frequency} className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-white tracking-tight">{activeKey.name}</h3>
                <p className="text-xs text-gray-400 line-clamp-1">{activeKey.description}</p>
                <span className="text-[11px] font-mono text-cyan-400 mt-0.5 block">
                  {activeKey.protocolName}
                </span>
              </div>
            </div>

            {/* Acción Rápida */}
            <div className="pt-2 flex items-center gap-2">
              {activeKey.canEmulateHCE ? (
                <button
                  onClick={onGoToEmulate}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 hover:opacity-95 transition active:scale-98 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Transmitir Señal (HCE)</span>
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('wallet')}
                  className="flex-1 py-3 rounded-2xl bg-gray-900 border border-gray-800 text-gray-300 font-semibold text-xs hover:text-white transition flex items-center justify-center gap-2"
                >
                  <span>Cambiar por Llave Compatible</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* ESTADO RÁPIDO DEL TELÉFONO */}
      <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Diagnóstico del Sistema
            </h4>
          </div>
          <button
            onClick={() => onNavigate('diagnostic')}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
          >
            Ver Detalle →
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-gray-900/60 border border-gray-800">
            <span className="text-[10px] text-gray-400 block">NFC 13.56MHz</span>
            <span className={`font-bold mt-0.5 block ${isNfcOk ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isNfcOk ? 'Disponible' : 'Inactivo'}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-gray-900/60 border border-gray-800">
            <span className="text-[10px] text-gray-400 block">Android HCE</span>
            <span className={`font-bold mt-0.5 block ${isHceOk ? 'text-blue-400' : 'text-amber-400'}`}>
              {isHceOk ? 'Compatible' : 'Limitado'}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-gray-900/60 border border-gray-800">
            <span className="text-[10px] text-gray-400 block">RFID 125kHz</span>
            <span className="font-bold text-amber-400 mt-0.5 block">Lector Ext.</span>
          </div>
        </div>
      </div>

      {/* ACCESOS DIRECTOS PRINCIPALES */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono font-bold uppercase text-gray-400 tracking-wider">
          Módulos del Sistema
        </h4>

        <div className="grid grid-cols-2 gap-3">
          {/* Identificar Llavero */}
          <button
            onClick={onGoToScan}
            className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-gray-950 border border-cyan-500/30 text-left hover:border-cyan-400 transition group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/40 mb-3 group-hover:scale-105 transition">
              <Radio className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                Identificar Llavero
              </h5>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                Detecta frecuencia (13,56 MHz vs 125 kHz) y analiza el protocolo.
              </p>
            </div>
          </button>

          {/* Billetera de Llaves */}
          <button
            onClick={() => onNavigate('wallet')}
            className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/40 to-gray-950 border border-blue-500/30 text-left hover:border-blue-400 transition group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-500/40 mb-3 group-hover:scale-105 transition">
              <WalletCards className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-white group-hover:text-blue-300 transition">
                Billetera de Llaves
              </h5>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                Administra tus credenciales autorizadas con cifrado AES-256.
              </p>
            </div>
          </button>

          {/* Activar Llave Digital */}
          <button
            onClick={onGoToEmulate}
            className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 to-gray-950 border border-purple-500/30 text-left hover:border-purple-400 transition group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/40 mb-3 group-hover:scale-105 transition">
              <Zap className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-white group-hover:text-purple-300 transition">
                Activar Llave
              </h5>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                Emulación HCE en tiempo real ante cerraduras compatibles.
              </p>
            </div>
          </button>

          {/* Lectores Externos */}
          <button
            onClick={() => onNavigate('external')}
            className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/30 to-gray-950 border border-amber-500/30 text-left hover:border-amber-400 transition group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/40 mb-3 group-hover:scale-105 transition">
              <Usb className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-white group-hover:text-amber-300 transition">
                Lectores Externos
              </h5>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                Módulos USB OTG y BLE para pastillas de 125 kHz de consorcio.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* COMPLIANCE & SEGURIDAD */}
      <div className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800/80 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs">
          <span className="font-bold text-white block">Arquitectura Segura Keystore</span>
          <p className="text-gray-400 text-[11px] leading-relaxed">
            Las credenciales se almacenan cifradas localmente con AES-GCM sin transmisión a servidores externos. No se realiza clonación de llaves protegidas ni extracción de secretos criptográficos.
          </p>
        </div>
      </div>
    </div>
  );
}
