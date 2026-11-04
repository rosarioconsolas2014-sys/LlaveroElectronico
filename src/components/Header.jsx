import React from 'react';
import { Shield, Radio, Cpu, Lock, Unlock, Usb } from 'lucide-react';

export default function Header({ diagnostic, isLocked, onToggleLock, onOpenExternalReaders, onGoToDiagnostic }) {
  const isNfcOk = diagnostic?.nfcAvailable && diagnostic?.nfcEnabled;
  const isHceOk = diagnostic?.hceSupported;

  return (
    <header className="sticky top-0 z-40 bg-gray-950/85 backdrop-blur-md border-b border-gray-800/80 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/20">
            <Radio className="w-5 h-5 text-gray-950 stroke-[2.5]" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-white text-base">KEYMANAGER</span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold tracking-wider rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                NFC
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium">Billetera Digital de Llaveros</p>
          </div>
        </div>

        {/* Quick Diagnostic Status Indicators */}
        <div className="flex items-center gap-2">
          {/* NFC Status Indicator */}
          <button
            onClick={onGoToDiagnostic}
            title={`NFC: ${isNfcOk ? 'Disponible y Activo' : 'No Disponible'}`}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono font-semibold transition border ${
              isNfcOk
                ? 'bg-cyan-950/40 text-cyan-400 border-cyan-800/50 hover:border-cyan-600'
                : 'bg-rose-950/40 text-rose-400 border-rose-800/50 hover:border-rose-600'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isNfcOk ? 'bg-cyan-400 animate-pulse' : 'bg-rose-400'}`}></span>
            <span>NFC</span>
          </button>

          {/* HCE Status Indicator */}
          <button
            onClick={onGoToDiagnostic}
            title={`HCE: ${isHceOk ? 'Compatible' : 'No Compatible'}`}
            className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono font-semibold transition border ${
              isHceOk
                ? 'bg-blue-950/40 text-blue-400 border-blue-800/50 hover:border-blue-600'
                : 'bg-amber-950/40 text-amber-400 border-amber-800/50 hover:border-amber-600'
            }`}
          >
            <Cpu className="w-3 h-3" />
            <span>HCE</span>
          </button>

          {/* External Readers Shortcut */}
          <button
            onClick={onOpenExternalReaders}
            title="Lectores Externos USB / BLE"
            className="p-1.5 rounded-lg bg-gray-900 text-gray-300 hover:text-cyan-400 hover:bg-gray-800 border border-gray-800 transition"
          >
            <Usb className="w-4 h-4" />
          </button>

          {/* Security Lock Toggle */}
          <button
            onClick={onToggleLock}
            title={isLocked ? 'Bóveda Bloqueada' : 'Bloquear Bóveda con PIN'}
            className={`p-1.5 rounded-lg transition border ${
              isLocked
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-gray-900 text-gray-400 hover:text-white border-gray-800'
            }`}
          >
            {isLocked ? <Lock className="w-4 h-4 text-amber-400" /> : <Unlock className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
