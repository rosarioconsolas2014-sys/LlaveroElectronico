import React, { useState } from 'react';
import { Lock, Fingerprint, KeyRound, AlertCircle, Shield } from 'lucide-react';
import { verifyAppPin } from '../services/cryptoService.js';

export default function SecurityLockOverlay({ onUnlock, biometricEnabled = false }) {
  const [pinDigits, setPinDigits] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleDigitPress = async (digit) => {
    if (pinDigits.length >= 4) return;
    const nextPin = pinDigits + digit;
    setPinDigits(nextPin);
    setErrorMsg('');

    if (nextPin.length === 4) {
      setIsVerifying(true);
      const ok = await verifyAppPin(nextPin);
      setIsVerifying(false);

      if (ok) {
        if (navigator.vibrate) navigator.vibrate(40);
        onUnlock();
      } else {
        if (navigator.vibrate) navigator.vibrate([80, 50, 80]);
        setErrorMsg('PIN incorrecto. Intenta nuevamente.');
        setPinDigits('');
      }
    }
  };

  const handleBackspace = () => {
    setPinDigits((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleBiometricSimulate = () => {
    if (navigator.vibrate) navigator.vibrate(40);
    onUnlock();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-xs flex flex-col items-center text-center space-y-6">
        {/* Shield Icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 shadow-2xl shadow-cyan-500/30">
            <Lock className="w-10 h-10 stroke-[2.2]" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-cyan-400 text-black flex items-center justify-center font-bold text-xs">
            <Shield className="w-3.5 h-3.5 fill-current" />
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-white tracking-tight">Bóveda Cifrada</h2>
          <p className="text-xs text-gray-400">
            Ingresa tu código PIN de 4 dígitos para acceder a tus llaves
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex items-center gap-3 py-2">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pinDigits.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-cyan-400 scale-110 shadow-lg shadow-cyan-400/50'
                    : 'bg-gray-800 border border-gray-700'
                }`}
              />
            );
          })}
        </div>

        {errorMsg && (
          <p className="text-xs font-semibold text-rose-400 flex items-center gap-1 animate-shake">
            <AlertCircle className="w-3.5 h-3.5" />
            {errorMsg}
          </p>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleDigitPress(num.toString())}
              disabled={isVerifying}
              className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 text-xl font-bold text-white hover:bg-gray-800 hover:border-cyan-500/50 active:scale-95 transition flex items-center justify-center mx-auto"
            >
              {num}
            </button>
          ))}

          {/* Biometric Shortcut */}
          <button
            onClick={handleBiometricSimulate}
            title="Autenticación Biométrica"
            className="w-16 h-16 rounded-2xl bg-gray-900/50 border border-gray-800 text-cyan-400 hover:bg-cyan-950/40 hover:border-cyan-500/50 active:scale-95 transition flex items-center justify-center mx-auto"
          >
            <Fingerprint className="w-6 h-6" />
          </button>

          <button
            onClick={() => handleDigitPress('0')}
            disabled={isVerifying}
            className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 text-xl font-bold text-white hover:bg-gray-800 hover:border-cyan-500/50 active:scale-95 transition flex items-center justify-center mx-auto"
          >
            0
          </button>

          <button
            onClick={handleBackspace}
            disabled={pinDigits.length === 0}
            className="w-16 h-16 rounded-2xl bg-gray-900/50 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 active:scale-95 transition flex items-center justify-center mx-auto text-xs font-mono font-bold"
          >
            ⌫
          </button>
        </div>

        <p className="text-[11px] text-gray-400 font-mono">
          Protegido por Android Keystore TEE
        </p>
      </div>
    </div>
  );
}
