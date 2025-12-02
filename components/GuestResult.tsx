import React, { useEffect } from 'react';
import { Guest } from '../types';
import confetti from 'canvas-confetti';
import { Share2, RotateCcw } from 'lucide-react';

interface GuestResultProps {
  guest: Guest;
  onReset: () => void;
}

export const GuestResult: React.FC<GuestResultProps> = ({ guest, onReset }) => {
  
  useEffect(() => {
    // Fire confetti on mount
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#60a5fa', '#facc15', '#f472b6']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#60a5fa', '#facc15', '#f472b6']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-slide-up">
      <div className="mb-4 text-blue-300 uppercase tracking-widest text-sm font-bold">
        Chào mừng
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
        {guest.name}
      </h1>

      <div className="relative w-full max-w-sm bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-8 shadow-2xl mb-8 overflow-hidden group">
        <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col items-center">
            <span className="text-xs text-indigo-300 uppercase font-bold tracking-wider mb-1">TEAM CỦA BẠN</span>
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg ring-4 ring-indigo-900">
              <span className="text-6xl font-black text-white">{guest.team}</span>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs text-yellow-500 uppercase font-bold tracking-wider mb-1">Số May Mắn</span>
            <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-yellow-500/50 flex items-center justify-center shadow-inner">
              <span className="text-4xl font-mono font-bold text-yellow-400">#{guest.raffleNumber}</span>
            </div>
          </div>
        </div>

        {guest.aiSlogan && (
          <div className="bg-black/30 rounded-lg p-4 backdrop-blur-sm border border-white/10">
            <p className="text-lg text-indigo-100 italic font-medium leading-relaxed">
              "{guest.aiSlogan}"
            </p>
          </div>
        )}
      </div>

      <button
        onClick={onReset}
        className="flex items-center gap-2 px-8 py-4 bg-white text-indigo-900 rounded-full font-bold text-lg hover:bg-gray-100 hover:scale-105 transition-all shadow-lg active:scale-95"
      >
        <RotateCcw size={20} />
        Quét Người Tiếp Theo
      </button>

      <div className="mt-8 text-xs text-slate-500">
        Hãy chụp màn hình lại để lưu số thứ tự của bạn!
      </div>
    </div>
  );
};