import React from 'react';
import { Home, WalletCards, Radio, Zap, Activity, Settings } from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'wallet', label: 'Mis Llaves', icon: WalletCards },
  { id: 'scan', label: 'Identificar', icon: Radio, highlight: true },
  { id: 'emulate', label: 'Activar', icon: Zap },
  { id: 'diagnostic', label: 'Diagnóstico', icon: Activity },
  { id: 'settings', label: 'Ajustes', icon: Settings },
];

export default function BottomNav({ activeTab, onSelectTab }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-gray-950/95 backdrop-blur-lg border-t border-gray-800/80 px-2 py-1.5 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-6 gap-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.highlight) {
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className="relative flex flex-col items-center justify-center -top-3 group focus:outline-none"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl ${
                    isActive
                      ? 'bg-gradient-to-tr from-cyan-400 to-blue-500 text-black shadow-cyan-500/40 scale-105'
                      : 'bg-gradient-to-tr from-gray-900 to-gray-800 text-cyan-400 border border-cyan-500/40 shadow-black/60 group-hover:border-cyan-400'
                  }`}
                >
                  <Icon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span
                  className={`text-[10px] font-semibold mt-0.5 transition-colors ${
                    isActive ? 'text-cyan-400 font-bold' : 'text-gray-400 group-hover:text-gray-200'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 focus:outline-none ${
                isActive
                  ? 'text-cyan-400 bg-cyan-950/30 font-semibold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/40'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.2]' : 'stroke-1.5'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400"></span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 line-clamp-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
