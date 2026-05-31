import { useState } from 'react';

const CHANNELS = [
  { name: 'SERVER 1', url: 'https://dadocric.st/player.php?id=willow&v=m' },
  { name: 'SERVER 2', url: 'https://dadocric.st/player.php?id=cricgo3' },
];

const FB_URL = "/";
const NOTICE = "⚠️ Warning: This website is for sports viewing only. Gambling/Betting strictly prohibited. Stay safe.";

export default function App() {
  const [selected, setSelected] = useState(CHANNELS[0].url);
  const [started, setStarted] = useState(false);

  const startPlayback = () => {
    window.open(FB_URL, '_blank');
    setStarted(true);
  };

  const switchSource = (url: string) => {
    setStarted(false);
    setSelected(url);
  };

  return (
    <div className="min-h-screen py-10 flex flex-col items-center pb-20 bg-[#050505]">
      {/* Marquee Notice Bar */}
      <div className="marquee-container">
        <div className="marquee-text">{NOTICE}</div>
      </div>

      {/* Primary Ad Unit Box */}
      <div className="w-full max-w-[645px] h-[70px] bg-white/5 border border-dashed border-white/10 rounded-xl my-4 text-[10px] flex items-center justify-center opacity-20 uppercase">
        Advertising Space
      </div>

      {/* Desktop Mode Suggestion */}
      <span className="mobile-hint">Best view in Desktop Mode</span>

      {/* Main TV Frame Container */}
      <div className="tv-outer-container">
        <div className="tv-frame shadow-2xl relative">
          <iframe
            src={started ? selected : 'about:blank'}
            className={`clean-iframe transition-opacity duration-500 ${started ? 'opacity-100' : 'opacity-0'}`}
            allowFullScreen
            scrolling="no"
            allow="autoplay; encrypted-media; fullscreen"
            referrerPolicy="no-referrer"
          />

          {!started && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/98 p-6 text-center">
              <p className="text-red-500 font-black text-xs uppercase mb-4 tracking-widest">Verification</p>
              <p className="text-[12px] text-gray-400 font-bold mb-8 px-2 max-h-[150px] overflow-y-auto no-scrollbar">{NOTICE}</p>
              <button
                onClick={startPlayback}
                className="bg-red-600 text-white font-black py-4 px-12 rounded-full flex items-center gap-4 text-[10px] tracking-widest uppercase hover:bg-white hover:text-black transition-all cursor-pointer"
              >
                Accept & Watch Live
                <div className="loading-ring" />
              </button>
            </div>
          )}
        </div>
        <div className="mx-auto block" style={{ width: '80px', height: '6px', background: '#111', borderRadius: '0 0 10px 10px' }} />
      </div>

      {/* Servers Selection */}
      <div className="w-full max-w-[650px] mt-10 px-4">
        <h3 className="text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-4 text-center">Switch Servers</h3>
        <div className="scroll-container no-scrollbar">
          {CHANNELS.map((ch) => (
            <button
              key={ch.name}
              onClick={() => switchSource(ch.url)}
              className={`flex-shrink-0 transition-all cursor-pointer ${selected === ch.url ? 'opacity-100 scale-105' : 'opacity-25'}`}
            >
              <div className={`px-10 py-5 rounded-2xl border-2 flex flex-col items-center min-w-[150px] ${selected === ch.url ? 'border-red-600 bg-red-600/5' : 'border-white/5 bg-white/5'}`}>
                <span className="text-[9px] font-black text-gray-700 tracking-widest mb-1 uppercase">Live Source</span>
                <span className="text-[11px] font-black uppercase">{ch.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Ad Unit Box */}
      <div className="w-full max-w-[645px] h-[70px] bg-white/5 border border-dashed border-white/10 rounded-xl mt-6 text-[10px] flex items-center justify-center opacity-20 uppercase">
        Advertising Space
      </div>
    </div>
  );
}

