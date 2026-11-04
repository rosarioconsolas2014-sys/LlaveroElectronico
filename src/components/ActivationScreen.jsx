import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  Clock, 
  Terminal, 
  Volume2, 
  Lock, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  StopCircle,
  KeyRound
} from 'lucide-react';
import FobIcon from './FobIcon.jsx';

export default function ActivationScreen({
  keys = [],
  activeKeyId,
  diagnostic,
  onSetActiveKey,
  onGoToScan,
  onGoToExternalReaders
}) {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSecondsRemaining, setBroadcastSecondsRemaining] = useState(60);
  const [apduLogs, setApduLogs] = useState([]);

  // Llave actualmente seleccionada
  const activeKey = keys.find((k) => k.id === activeKeyId) || keys[0];

  // Temporizador de emisión activa de 60 segundos por seguridad
  useEffect(() => {
    let interval = null;
    if (isBroadcasting && broadcastSecondsRemaining > 0) {
      interval = setInterval(() => {
        setBroadcastSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsBroadcasting(false);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isBroadcasting) {
      setBroadcastSecondsRemaining(60);
    }
    return () => clearInterval(interval);
  }, [isBroadcasting, broadcastSecondsRemaining]);

  // Generador de telemetría de tramas APDU ISO 7816-4 simuladas durante la emisión activa
  useEffect(() => {
    if (!isBroadcasting || !activeKey) return;

    // Log inicial de activación
    setApduLogs([
      { time: new Date().toLocaleTimeString(), type: 'SYS', text: `HCE Activado para AID: F0 01 02 03 04 05 06` },
      { time: new Date().toLocaleTimeString(), type: 'SYS', text: `Esperando aproximación al lector de la cerradura...` }
    ]);

    // Simular lectura de cerradura a los 3 segundos
    const timer = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate([40, 80, 40]);
      setApduLogs((prev) => [
        ...prev,
        { time: new Date().toLocaleTimeString(), type: 'IN', text: `>>> SELECT AID: F0 01 02 03 04 05 06` },
        { time: new Date().toLocaleTimeString(), type: 'OUT', text: `<<< RESP: [${activeKey.identifier}] 90 00 (OK)` },
        { time: new Date().toLocaleTimeString(), type: 'IN', text: `>>> READ AUTH_CHALLENGE (AES-256)` },
        { time: new Date().toLocaleTimeString(), type: 'OUT', text: `<<< TOKEN FIRMADO: KM-HCE-VERIFIED 90 00` },
        { time: new Date().toLocaleTimeString(), type: 'SUCCESS', text: `✓ ACCESO CONCEDIDO POR EL LECTOR` }
      ]);
    }, 3200);

    return () => clearTimeout(timer);
  }, [isBroadcasting, activeKey]);

  const handleStartBroadcast = () => {
    if (!activeKey?.canEmulateHCE) return;
    if (navigator.vibrate) navigator.vibrate(50);
    setIsBroadcasting(true);
  };

  const handleStopBroadcast = () => {
    setIsBroadcasting(false);
    setBroadcastSecondsRemaining(60);
  };

  if (!activeKey) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-gray-400">No hay llaves en la billetera.</p>
        <button
          onClick={onGoToScan}
          className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs"
        >
          Escanear una llave primero
        </button>
      </div>
    );
  }

  const is125 = activeKey.frequency === '125_KHZ';

  return (
    <div className="space-y-6 pb-4">
      {/* Encabezado */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="w-6 h-6 text-cyan-400" />
          Activar Llave Digital
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Emulación Host Card Emulation (HCE) ISO/IEC 14443-4
        </p>
      </div>

      {/* SELECTOR RÁPIDO DE CREDENCIALES (Carousel/Pills) */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-400">Seleccionar Llave:</label>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {keys.map((k) => {
            const isSel = k.id === activeKey.id;
            return (
              <button
                key={k.id}
                onClick={() => {
                  onSetActiveKey(k.id);
                  setIsBroadcasting(false);
                }}
                className={`px-3 py-2 rounded-2xl border text-left transition flex items-center gap-2.5 whitespace-nowrap ${
                  isSel
                    ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-gray-950/80 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    k.canEmulateHCE ? 'bg-cyan-500/20 text-cyan-300' : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  <FobIcon type={k.iconType} frequency={k.frequency} className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold block">{k.name}</span>
                  <span className="text-[10px] font-mono text-gray-400">{k.frequencyLabel}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* TARJETA VISUAL DE LA LLAVE ACTIVA */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 border transition-all duration-300 ${
          activeKey.canEmulateHCE
            ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 border-cyan-500/40 shadow-2xl shadow-cyan-500/10'
            : 'bg-gradient-to-br from-gray-950 via-amber-950/20 to-gray-950 border-amber-500/30'
        }`}
      >
        {/* Glow de Fondo */}
        <div
          className={`absolute -right-16 -top-16 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
            activeKey.canEmulateHCE ? 'bg-cyan-500/15' : 'bg-amber-500/10'
          }`}
        />

        <div className="relative z-10 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg ${
                  activeKey.canEmulateHCE
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40 shadow-cyan-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                }`}
              >
                <FobIcon type={activeKey.iconType} frequency={activeKey.frequency} className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">
                  {activeKey.protocolName}
                </span>
                <h3 className="text-lg font-extrabold text-white tracking-tight">{activeKey.name}</h3>
                <p className="text-xs text-gray-400">{activeKey.description}</p>
              </div>
            </div>

            {/* Frecuencia Badge */}
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
                activeKey.canEmulateHCE
                  ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40'
                  : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
              }`}
            >
              {activeKey.frequencyLabel}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 font-mono text-xs flex items-center justify-between">
            <span className="text-gray-400">Identificador / Token:</span>
            <span className="font-bold text-cyan-400 truncate max-w-[200px]">
              {activeKey.identifier}
            </span>
          </div>

          {/* VERIFICACIÓN ESTRICTA ANTI-CONFUSIÓN (Requerimiento 5 y 6) */}
          {!activeKey.canEmulateHCE ? (
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Credencial No Emulable por Hardware del Celular</span>
              </div>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                {is125 ? (
                  <>
                    Esta credencial opera en frecuencia <strong className="text-white">RFID 125 kHz</strong> (baja frecuencia). Las antenas de los teléfonos inteligentes están diseñadas únicamente para <strong>13,56 MHz (NFC)</strong>.
                  </>
                ) : (
                  <>
                    Esta credencial utiliza un chip <strong className="text-white">MIFARE Classic con cifrado Crypto-1 propietario</strong>. El subsistema de seguridad de Android (HCE) prohíbe la modificación de bajo nivel del UID del chip por razones de seguridad.
                  </>
                )}
              </p>
              <div className="pt-1">
                <button
                  onClick={onGoToExternalReaders}
                  className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
                >
                  Conectar Lector Externo USB OTG / BLE →
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">Credencial Autorizada ISO-DEP (AID Oficial)</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Lista</span>
            </div>
          )}
        </div>
      </div>

      {/* ZONA DE EMISIÓN ACTIVA HCE */}
      {activeKey.canEmulateHCE && (
        <div className="space-y-4">
          {!isBroadcasting ? (
            <button
              onClick={handleStartBroadcast}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 text-black font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-cyan-500/30 hover:opacity-95 transition active:scale-98 flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>Activar Credencial Digital (HCE)</span>
            </button>
          ) : (
            <div className="p-5 rounded-3xl bg-gray-950 border border-cyan-400/80 shadow-2xl shadow-cyan-500/20 space-y-4">
              {/* Radar de Emisión Activa */}
              <div className="flex flex-col items-center justify-center text-center space-y-3">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-60"></div>
                  <div className="absolute inset-2 rounded-full border border-cyan-500 animate-pulse"></div>
                  <div className="w-16 h-16 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-lg shadow-cyan-400/50">
                    <Radio className="w-8 h-8 animate-pulse stroke-[2.5]" />
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-white flex items-center justify-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                    Emitiendo Señal HCE Activa
                  </h4>
                  <p className="text-xs text-cyan-300/80 mt-0.5">
                    Acerca la parte trasera del teléfono al lector de la cerradura
                  </p>
                </div>

                {/* Temporizador de Seguridad */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-900 border border-gray-800 text-xs font-mono text-gray-300">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Desconexión automática en: <strong>{broadcastSecondsRemaining}s</strong></span>
                </div>
              </div>

              {/* Terminal de Telemetría APDU ISO 7816-4 en Vivo */}
              <div className="p-3.5 rounded-2xl bg-black border border-gray-800 font-mono text-[11px] space-y-1 max-h-36 overflow-y-auto">
                <div className="flex items-center justify-between text-gray-500 text-[10px] pb-1 border-b border-gray-900 mb-1">
                  <span className="flex items-center gap-1">
                    <Terminal className="w-3 h-3 text-cyan-400" />
                    Telemetría APDU HostApduService
                  </span>
                  <span>ISO 7816-4</span>
                </div>
                {apduLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`leading-tight ${
                      log.type === 'IN'
                        ? 'text-cyan-400'
                        : log.type === 'OUT'
                        ? 'text-blue-300'
                        : log.type === 'SUCCESS'
                        ? 'text-emerald-400 font-bold'
                        : 'text-gray-500'
                    }`}
                  >
                    <span className="text-[9px] opacity-60 mr-1.5">[{log.time}]</span>
                    {log.text}
                  </div>
                ))}
              </div>

              {/* Botón Detener */}
              <button
                onClick={handleStopBroadcast}
                className="w-full py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-gray-300 text-xs font-bold uppercase tracking-wider hover:text-white transition flex items-center justify-center gap-2"
              >
                <StopCircle className="w-4 h-4 text-rose-400" />
                <span>Detener Emisión</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
