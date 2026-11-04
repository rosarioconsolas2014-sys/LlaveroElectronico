import React from 'react';
import { CreditCard, KeyRound, Radio, Shield, Tag } from 'lucide-react';

export default function FobIcon({ type = 'fob_pill', className = 'w-6 h-6', frequency = '13.56_MHZ' }) {
  if (type === 'fob_pill') {
    // Pastilla RFID típica de consorcio / portón
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <div className="w-full h-full rounded-full border-2 border-current flex items-center justify-center p-1 bg-current/10">
          <div className="w-2/3 h-2/3 rounded-full border border-dashed border-current flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-current" />
          </div>
        </div>
        {/* Orificio de llavero */}
        <div className="absolute -top-1 w-2 h-2 rounded-full border border-current bg-gray-950" />
      </div>
    );
  }

  if (type === 'fob_round') {
    // Llavero gota / teardrop
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <div className="w-full h-full rounded-[40%_40%_50%_50%] border-2 border-current flex flex-col items-center justify-center p-1 bg-current/10">
          <div className="w-2 h-2 rounded-full border border-current mb-0.5" />
          <Radio className="w-3 h-3 text-current stroke-[2]" />
        </div>
      </div>
    );
  }

  if (type === 'card') {
    return <CreditCard className={className} />;
  }

  if (type === 'badge') {
    return <Shield className={className} />;
  }

  if (type === 'key') {
    return <KeyRound className={className} />;
  }

  return <Tag className={className} />;
}
