import React from 'react';
import { Phone, Code2, Sparkles } from 'lucide-react';

export default function Footer({ className = '' }) {
  return (
    <footer className={`mt-8 pt-6 pb-24 border-t border-gray-800/80 text-center ${className}`}>
      <div className="max-w-md mx-auto px-4 flex flex-col items-center space-y-3">
        {/* Logo / Brand Name */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Code2 className="w-3.5 h-3.5" />
          </div>
          <span className="font-extrabold tracking-wider text-sm sm:text-base text-white neon-glow-blue uppercase">
            CARVI SOFTWARE
          </span>
        </div>

        {/* Subtitle */}
        <p className="text-xs font-medium text-gray-400 tracking-wide">
          Desarrollo de Software
        </p>

        {/* Contact Phone Button */}
        <div className="pt-1">
          <a
            href="tel:3412570106"
            title="Llamar a CARVI SOFTWARE"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gray-950/90 border border-cyan-500/30 hover:border-cyan-400 text-gray-200 hover:text-cyan-300 transition-all duration-200 shadow-lg shadow-black/40 hover:shadow-cyan-500/10 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          >
            <div className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-colors duration-200">
              <Phone className="w-3.5 h-3.5 fill-current" />
            </div>
            <div className="text-left">
              <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block leading-none">
                Contacto
              </span>
              <span className="text-xs sm:text-sm font-bold font-mono text-cyan-400 group-hover:text-white transition-colors duration-200">
                3412570106
              </span>
            </div>
          </a>
        </div>

        {/* Security & Quality Badge */}
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono pt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          <span>Soluciones Móviles & Sistemas de Proximidad NFC</span>
        </div>
      </div>
    </footer>
  );
}
