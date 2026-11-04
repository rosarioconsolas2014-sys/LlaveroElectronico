import React, { useState, useEffect } from 'react';
import { 
  Usb, 
  Bluetooth, 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Radio, 
  Save, 
  Play,
  ArrowRight,
  Sliders,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  getAvailableReaderProfiles, 
  getConnectedReaders, 
  connectReader, 
  disconnectReader, 
  simulateExternalScan 
} from '../services/externalReadersService.js';
import FobIcon from './FobIcon.jsx';

export default function ExternalReadersScreen({ onSaveToWallet }) {
  const [readers, setReaders] = useState(getAvailableReaderProfiles());
  const [scanStream, setScanStream] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    setReaders(getAvailableReaderProfiles());
  }, []);

  const handleToggleConnection = (readerId, isConnected) => {
    if (isConnected) {
      disconnectReader(readerId);
    } else {
      connectReader(readerId);
    }
    setReaders(getAvailableReaderProfiles());
  };

  const handleSimulate125kHzScan = (protocol = 'EM4100') => {
    setIsSimulating(true);
    if (navigator.vibrate) navigator.vibrate([40, 60, 40]);

    setTimeout(() => {
      const scanResult = simulateExternalScan(protocol);
      setScanStream((prev) => [scanResult, ...prev]);
      setIsSimulating(false);
    }, 600);
  };

  const handleSaveScannedFob = async (scan) => {
    await onSaveToWallet({
      name: `Pastilla Edificio (${scan.protocol})`,
      description: `Capturado con ${scan.readerName}`,
      technologyType: 'RFID_125_KHZ',
      protocolId: scan.protocol,
      protocolName: `${scan.protocol} (125 kHz)`,
      frequency: '125_KHZ',
      identifier: scan.uid,
      wiegandId: scan.wiegandId,
      compatibilityStatus: 'REQUIRES_EXTERNAL_READER',
      compatibilityLabel: 'Requiere Lector Externo (125 kHz)',
      canEmulateHCE: false,
      colorTheme: 'amber',
      iconType: 'fob_pill'
    });
  };

  return (
    <div className="space-y-6 pb-4">
      {/* Encabezado */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Usb className="w-6 h-6 text-cyan-400" />
          Lectores Externos
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Arquitectura modular para periféricos USB OTG y Bluetooth (125 kHz & 13,56 MHz)
        </p>
      </div>

      {/* Nota de Arquitectura */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-gray-950 border border-cyan-500/30 space-y-2">
        <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Ampliación para Frecuencia 125 kHz</span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          Para leer o programar llaveros tipo pastilla de <strong className="text-white">125 kHz</strong>, KeyManager NFC integra soporte para lectores externos conectados por el puerto <strong className="text-cyan-400">USB-C OTG</strong> o enlace <strong className="text-cyan-400">Bluetooth BLE</strong>.
        </p>
      </div>

      {/* LISTADO DE PERFILES DE HARDWARE EXTERNO */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          Hardware Externo Soportado
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {readers.map((reader) => {
            const isConnected = reader.status === 'CONNECTED';
            const isBle = reader.type === 'BLUETOOTH';

            return (
              <div
                key={reader.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isConnected
                    ? 'bg-gradient-to-br from-gray-950 to-cyan-950/30 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                    : 'bg-gray-950/80 border-gray-800/80 text-gray-400'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                        isConnected
                          ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                          : 'bg-gray-900 text-gray-500 border-gray-800'
                      }`}
                    >
                      {isBle ? <Bluetooth className="w-5 h-5" /> : <Usb className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{reader.name}</h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            isConnected
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                              : 'bg-gray-900 text-gray-400 border border-gray-800'
                          }`}
                        >
                          {isConnected ? 'CONECTADO' : 'DESCONECTADO'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{reader.manufacturer} • {reader.interface}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleConnection(reader.id, isConnected)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      isConnected
                        ? 'bg-rose-950/60 text-rose-400 border border-rose-800 hover:bg-rose-900/80'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
                    }`}
                  >
                    {isConnected ? 'Desconectar' : 'Conectar'}
                  </button>
                </div>

                {/* Especificaciones y Frecuencias */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-gray-800/80">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-mono">Frecuencias</span>
                    <span className="text-gray-200 font-semibold">{reader.supportedFrequencies.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-mono">Velocidad / Interfaz</span>
                    <span className="text-cyan-400 font-mono">{reader.baudRate}</span>
                  </div>
                </div>

                {/* Capacidades */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {reader.capabilities.map((cap, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-gray-900 text-gray-300 border border-gray-800 text-[10px]">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BANCO DE PRUEBAS DE LECTURA 125 KHZ */}
      <div className="p-5 rounded-2xl bg-gray-950 border border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Simulador de Lectura Externa (125 kHz)</h3>
          </div>
          <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
            LF 125 kHz
          </span>
        </div>

        <p className="text-xs text-gray-400">
          Prueba la captura en tiempo real de una pastilla de edificio o portón a través del periférico conectado:
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSimulate125kHzScan('EM4100')}
            disabled={isSimulating}
            className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold hover:bg-amber-500/30 transition flex items-center gap-1.5 active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Leer Pastilla EM4100 (Edificio)</span>
          </button>

          <button
            onClick={() => handleSimulate125kHzScan('T5577')}
            disabled={isSimulating}
            className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 text-xs font-semibold hover:text-white transition flex items-center gap-1.5"
          >
            <span>Leer Llavero T5577 (Portón)</span>
          </button>
        </div>

        {/* Stream de Lecturas Recientes */}
        {scanStream.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-gray-800">
            <span className="text-[10px] font-mono uppercase text-gray-400 block">Lecturas Recibidas:</span>
            {scanStream.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <FobIcon type="fob_pill" className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">{item.protocol} • {item.uid}</span>
                    <span className="text-[10px] text-gray-400">{item.wiegandId} • {item.readerName}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleSaveScannedFob(item)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 text-black font-bold text-[11px] uppercase tracking-wider hover:bg-cyan-400 transition flex items-center gap-1"
                >
                  <Save className="w-3 h-3" />
                  <span>Guardar</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
