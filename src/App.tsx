/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Tv, 
  Languages, 
  Laptop, 
  RefreshCw, 
  Play, 
  CheckCircle, 
  ShieldAlert, 
  Sparkles, 
  ChevronDown, 
  Flame, 
  Compass, 
  Cpu, 
  Loader2,
  Moon,
  Sun,
  X,
  Bell
} from 'lucide-react';
import Hls from 'hls.js';
import { Channel, Language, ThemeType, ThemeConfig } from './types';

// Original channels setup with integrated test M3U8 stream
const CHANNELS: Channel[] = [
  { name: 'SERVER 1', url: 'https://dadocric.st/player.php?id=willow&v=m', id: 'srv-1' },
  { name: 'SERVER 2', url: 'https://dadocric.st/player.php?id=cricgo3', id: 'srv-2' },
  { name: 'SERVER 3', url: 'https://streamcrichd.com/update/willowcricket.php', id: 'srv-3' },
  { name: 'BDTS SAMPLE PORT (M3U8)', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', id: 'srv-4' },
];

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', localName: 'English' },
  { code: 'bn', name: 'Bengali', localName: 'বাংলা' },
  { code: 'es', name: 'Spanish', localName: 'Español' },
  { code: 'fr', name: 'French', localName: 'Français' },
  { code: 'hi', name: 'Hindi', localName: 'हिन्दी' },
  { code: 'ar', name: 'Arabic', localName: 'العربية' },
  { code: 'ur', name: 'Urdu', localName: 'اردو' },
  { code: 'ja', name: 'Japanese', localName: '日本語' },
  { code: 'de', name: 'German', localName: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', localName: 'Português' },
];

const NOTICE_BASE = "⚠️ Warning: This website is for sports viewing only. Gambling/Betting strictly prohibited. Stay safe.";

// Dual dark modes styling definitions with Sleek Carbon additions
const THEMES: Record<ThemeType, ThemeConfig> = {
  crimson: {
    id: 'crimson',
    name: 'Midnight Crimson (Sleek)',
    bg: 'bg-[#050505]',
    cardBg: 'bg-[#111111]',
    accent: 'bg-[#ff0000]',
    accentHover: 'hover:bg-[#cc0000]',
    text: 'text-[#e5e5e5]',
    borderColor: 'border-[#222222]',
    glowColor: 'shadow-[0_0_40px_rgba(255,0,0,0.12)]',
    bannerBg: 'bg-[rgba(255,0,0,0.05)]',
    bannerText: 'text-red-500 border-red-950/40 border'
  },
  nebula: {
    id: 'nebula',
    name: 'Cyber Nebula (Interstellar)',
    bg: 'bg-[#04050e]',
    cardBg: 'bg-[#090b1c]',
    accent: 'bg-indigo-600',
    accentHover: 'hover:bg-indigo-700',
    text: 'text-slate-100',
    borderColor: 'border-indigo-950/80',
    glowColor: 'shadow-[0_0_40px_rgba(99,102,241,0.18)]',
    bannerBg: 'bg-indigo-950/20',
    bannerText: 'text-indigo-400 border-indigo-950/50 border'
  },
  carbon: {
    id: 'carbon',
    name: 'Sleek Carbon (Tech Slate)',
    bg: 'bg-[#0a0a0a]',
    cardBg: 'bg-[#161616]',
    accent: 'bg-emerald-600',
    accentHover: 'hover:bg-emerald-700',
    text: 'text-zinc-100',
    borderColor: 'border-zinc-800',
    glowColor: 'shadow-[0_0_40px_rgba(16,185,129,0.12)]',
    bannerBg: 'bg-emerald-950/15',
    bannerText: 'text-emerald-400 border-emerald-950/40 border'
  }
};

export default function App() {
  // Theme Toggle
  const [themeId, setThemeId] = useState<ThemeType>('crimson');
  const theme = THEMES[themeId];

  // Channel Selection
  const [selectedChannel, setSelectedChannel] = useState<string>(CHANNELS[0].url);
  const [started, setStarted] = useState<boolean>(false);

  // Realtime Live and Historic View States (Retrieved directly from active backend server for authentic tracking)
  const [totalViews, setTotalViews] = useState<number>(2483900);

  useEffect(() => {
    const fetchViews = async () => {
      try {
        const res = await fetch('/api/views');
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.totalViews === 'number') {
            setTotalViews(data.totalViews);
          }
        }
      } catch (e) {
        console.error("Error fetching views from the backend API:", e);
      }
    };

    const incrementViewsOnServer = async () => {
      try {
        const res = await fetch('/api/views/increment', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.totalViews === 'number') {
            setTotalViews(data.totalViews);
          }
        }
      } catch (e) {
        console.error("Error incrementing views on the backend API:", e);
      }
    };

    // Record visit on initial mount and load initial state
    incrementViewsOnServer();

    // Poll the backend views regularly to synchronize with all live active connections
    const interval = setInterval(() => {
      fetchViews();
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Google Translate Widget Initialization
  useEffect(() => {
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        },
        'google_translate_element'
      );
    };

    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.id = 'google-translate-script';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Forced Desktop Mode Simulation States
  const [isLoadingDesktop, setIsLoadingDesktop] = useState<boolean>(true);
  const [desktopSimulated, setDesktopSimulated] = useState<boolean>(true);
  const [scalingFactor, setScalingFactor] = useState<number>(1);
  const [userAgentString, setUserAgentString] = useState<string>('');
  const [vDeviceType, setVDeviceType] = useState<string>('Detecting Mobile Footprint...');

  // Detect mobile, load user agent spoofing info, and configure desktop scale
  useEffect(() => {
    // Determine active User Agent parameters
    const checkUserAgent = navigator.userAgent;
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(checkUserAgent);
    
    setVDeviceType(isMobileDevice ? 'Mobile Device (System Forcing Bypasses Desktop limits)' : 'Desktop Device (Native Display verified)');
    setUserAgentString(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 [SPOOFED_BY_BYPASS]"
    );

    // Bootloader Simulator timer
    const timer = setTimeout(() => {
      setIsLoadingDesktop(false);
    }, 1800);

    // Scaling system to physical mobile width
    function handleScalingAndResize() {
      if (window.innerWidth < 1180) {
        // Calculate scaling factor to compress the desktop 1180px widescreen view directly inside the mobile bounds
        const factor = window.innerWidth / 1180;
        setScalingFactor(Math.max(0.32, factor));
      } else {
        setScalingFactor(1);
      }
    }

    handleScalingAndResize();
    window.addEventListener('resize', handleScalingAndResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleScalingAndResize);
    };
  }, []);

  // Accept and watch action (keeping user's original logic redirect)
  const startPlayback = () => {
    window.open('/', '_blank');
    setStarted(true);
  };

  // Channel Source switching
  const switchSource = (url: string) => {
    setStarted(false);
    setSelectedChannel(url);
  };

  // Reference hooks for the direct video player pipeline
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const isM3U8Url = (url: string) => {
    if (!url) return false;
    return url.toLowerCase().includes('.m3u8') || url.toLowerCase().includes('m3u8') || url.toLowerCase().includes('.ts');
  };

  // Video renderer observer
  useEffect(() => {
    if (!started || !isM3U8Url(selectedChannel) || !videoRef.current) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      return;
    }

    const videoElement = videoRef.current;

    // Terminate existing streams to prevent audio leaking
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxMaxBufferLength: 10,
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;
      hls.loadSource(selectedChannel);
      hls.attachMedia(videoElement);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoElement.play().catch(err => {
          console.log("Play interrupted or failed on manifest load:", err);
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("Fatal network error detected in HLS, attempting stream recovery...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("Fatal media error detected in HLS, attempting recovery...");
              hls.recoverMediaError();
              break;
            default:
              console.log("Fatal unrecoverable error encountered in source channel:", data);
              break;
          }
        }
      });
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = selectedChannel;
      videoElement.addEventListener('loadedmetadata', () => {
        videoElement.play().catch(err => {
          console.log("Play failed natively:", err);
        });
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [selectedChannel, started]);


  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} transition-colors duration-500 overflow-x-hidden pb-12 flex flex-col font-sans select-none relative`}>
      
      {/* 🚀 Simulator Bootloader Overlay (Desktop Mode Verifier) */}
      {isLoadingDesktop && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-6 text-center select-none font-mono">
          <div className="max-w-md w-full border border-zinc-800 bg-[#0a0a0a] p-8 rounded-2xl relative shadow-2xl">
            <div className="absolute top-3 left-4 flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 animate-ping"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
            </div>
            
            <div className="mb-6 flex justify-center">
              <Laptop className="w-14 h-14 text-red-500 animate-pulse" />
            </div>

            <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-widest mb-1">
              Forcing Desktop Environment
            </h2>
            <div className="text-[10px] text-zinc-500 mb-6 uppercase tracking-wider">
              {vDeviceType}
            </div>

            {/* Sandbox progress indicators */}
            <div className="space-y-2 text-left mb-6 font-mono text-[11px] text-zinc-400 bg-black/60 p-4 border border-zinc-900 rounded-lg">
              <div className="flex justify-between items-center text-zinc-500">
                <span>[INFO] Spoofing userAgent:</span>
                <span className="text-zinc-400">WIN_NT_10_X64</span>
              </div>
              <div className="flex justify-between items-center text-zinc-500">
                <span>[INFO] Rendering viewport:</span>
                <span className="text-zinc-400">Widescreen 1200px</span>
              </div>
              <div className="flex justify-between items-center text-red-400">
                <span>STATUS:</span>
                <span className="animate-pulse">Loading Live TV Sandbox...</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-red-500" />
              <span className="text-[11px] font-bold text-red-500 uppercase tracking-widest animate-pulse">
                Initializing desktop bypass...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 🎰 Marquee Notice Warning Section integrated with Google Translate */}
      <section className="bg-black/95 border-b border-zinc-800 py-1.5 px-3 md:px-6 flex items-center justify-between gap-3 relative z-40 shadow-[0_2px_15px_rgba(0,0,0,0.5)] min-h-[44px]">
        
        {/* Left Side: Elegant Live Alert Notification Badge */}
        <div className="flex items-center gap-1.5 bg-red-950/20 border border-red-500/30 rounded-lg px-2 py-1 select-none flex-shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
          </span>
          <Bell className="w-3.5 h-3.5 text-red-500 animate-bounce" />
          <span className="text-[10px] font-black text-red-500 tracking-wider font-mono uppercase">LIVE ALERT</span>
        </div>

        {/* High visibility Marquee display with dynamic color cycle and reduced height */}
        <div className="marquee-container flex-grow overflow-hidden relative rounded-lg bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] select-none py-1 px-3 border border-zinc-800 max-w-[calc(100%-240px)]">
          <div className="marquee-text font-black whitespace-nowrap inline-block text-[11px] tracking-wider cursor-default uppercase">
            {NOTICE_BASE}
          </div>
        </div>

        {/* Right Side: Interactive, animated micro-sized Translation Icon */}
        <div className="relative group/translate flex items-center justify-center h-8 w-8 flex-shrink-0">
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-[#0c0c0e] border border-white/5 text-zinc-400 group-hover/translate:text-red-500 transition-all duration-300 pointer-events-none animated-translate-btn">
            <Languages className="w-3.5 h-3.5 animate-spin-slow text-red-400" />
          </div>
          {/* Cover fully with transparent native dropdown for reliable click actions */}
          <div className="absolute inset-0 opacity-0 cursor-pointer overflow-hidden rounded-lg google-translate-overlay-wrapper">
            <div id="google_translate_element" />
          </div>
        </div>
      </section>

      {/* 🖥️ Force Widescreen Simulated Container Wrapper (Checks screen width, and applies transform scaling if smaller) */}
      <main className="flex-grow flex flex-col items-center p-4 md:p-8 select-none">
        
        {/* Responsive scaling wrapper that forces the app's high-performance layout correctly on desktop and mobile */}
        <div 
          className="transition-transform duration-300 origin-top flex flex-col items-center"
          style={{ 
            width: window.innerWidth < 1180 ? '1180px' : '100%',
            transform: window.innerWidth < 1180 ? `scale(${scalingFactor})` : 'none',
            marginBottom: window.innerWidth < 1180 ? `-${(1180 - 1180 * scalingFactor) * (started ? 0.72 : 0.65)}px` : '0px'
          }}
        >
          
          <div className="w-full max-w-[850px] flex flex-col items-center px-1">
            
            {/* Desktop Mode Active Status Bar (Highly visual verification trigger requested!) */}
            <div className="w-full mb-4 px-4 py-2 border-l-4 border-yellow-500 bg-yellow-500/5 rounded-r-xl flex items-center justify-between text-[11px] font-mono text-yellow-500/80">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-yellow-500 animate-pulse" />
                <span>ENVIRONMENT RESTRICTIONS BYPASS: <strong>FORCED DESKTOP AGENT SIMULATION ACTIVE</strong></span>
              </div>
            </div>

            {/* 🖥️ The Main Live TV Outer Container Wrapper */}
            <div className="tv-viewport w-full max-w-[850px] mx-auto relative mb-6">
              
              {/* Realtime + Historic Total View Badge - Swapped position to top-left */}
              <div className="absolute top-4 left-4 bg-black/45 hover:bg-black/60 border border-white/15 text-zinc-350 px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wider uppercase z-20 flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,0,0,0.2)] select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                TOTAL VIEWS: <span className="font-extrabold text-white">{totalViews.toLocaleString()}</span>
              </div>

              {/* Fast buffering / Source Loading State Badge - Swapped position to top-right */}
              {started && (
                <div className="absolute top-4 right-4 bg-black/45 hover:bg-black/60 border border-[#00ff00]/40 text-[#00ff00] px-3.5 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-mono backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,0,0.1)] z-20 select-none">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                  <span className="text-green-500 font-extrabold">LIVE SOURCE PIPELINE ACTIVE</span>
                </div>
              )}

              <div className={`tv-frame ${theme.cardBg} border ${theme.borderColor} ${theme.glowColor} rounded-2xl relative overflow-hidden transition-all duration-300 w-full`}>
                
                {/* Embedded Cropped Custom Live Frame / Direct Video Tag (Respects original cropped mappings for iframes, standard fits for M3U8 lists) */}
                <div className="crop-viewport relative w-full aspect-video bg-black">
                  
                  {isM3U8Url(selectedChannel) ? (
                    <video 
                      ref={videoRef}
                      className={`w-full h-full object-contain transition-all duration-500 ${started ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                      controls
                      autoPlay
                      playsInline
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none',
                      }}
                    />
                  ) : (
                    /* Clean iframe with premium sandboxing & crop mapping */
                    <iframe 
                      src={started ? selectedChannel : 'about:blank'}
                      className={`clean-iframe transition-all duration-500 ${started ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                      allowFullScreen={true}
                      scrolling="no"
                      allow="autoplay; encrypted-media; fullscreen"
                      referrerPolicy="no-referrer"
                      style={{
                        position: 'absolute',
                        top: '-49%',
                        left: '-445px',
                        right: '1%',
                        bottom: '1px',
                        width: '210%',
                        height: '150%',
                        border: 'none',
                      }}
                    />
                  )}
                </div>

                {/* High Quality Verification Gate Screen (Default state when not accepted) */}
                {!started && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#050505]/98 p-8 text-center select-none animate-fadeIn">
                    <div className="player-overlay max-w-[420px] bg-[#0c0c0c] border border-zinc-850/90 p-8 rounded-2xl shadow-2xl">
                      
                      <div className="text-[10.5px] text-zinc-450 font-mono mb-6 bg-black/60 p-4 rounded-xl border border-zinc-900 leading-relaxed select-text max-h-[110px] overflow-y-auto no-scrollbar">
                        {NOTICE_BASE}
                      </div>
                      
                      <button 
                        onClick={startPlayback}
                        className="w-full text-white font-black py-4 px-8 rounded-full cursor-pointer shadow-lg shadow-black/80 flex items-center justify-center gap-3 text-[11px] tracking-widest uppercase transition-all duration-300 transform hover:scale-[1.03] active:scale-95"
                        style={{ backgroundColor: themeId === 'crimson' ? '#ff0000' : themeId === 'nebula' ? '#4f46e5' : '#10b981' }}
                      >
                        Accept & Watch Live
                        <span className="loading-ring inline-block" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* 🎛️ Interactive Stream Server Switcher (Vertically Scrollable Gridview) */}
            <div className="w-full mt-6 max-w-[850px] mx-auto px-1 select-none">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[380px] overflow-y-auto pr-2 no-scrollbar scroll-smooth">
                {CHANNELS.map((ch, idx) => {
                  const isActive = selectedChannel === ch.url;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => switchSource(ch.url)}
                      className={`w-full text-left transition-all duration-300 cursor-pointer rounded-xl border p-4 flex flex-row items-center gap-3 relative overflow-hidden group/btn ${
                        isActive 
                          ? `bg-[#ff0000]/5 border-[#ff0000]/70 shadow-[0_0_15px_rgba(255,0,0,0.05)]` 
                          : 'bg-[#111111] border-[#222222] hover:border-zinc-700'
                      }`}
                      style={isActive ? {
                        borderColor: themeId === 'crimson' ? '#ff0000' : themeId === 'nebula' ? '#4f46e5' : '#10b981',
                        backgroundColor: themeId === 'crimson' ? 'rgba(255,0,0,0.05)' : themeId === 'nebula' ? 'rgba(79,70,229,0.05)' : 'rgba(16,185,129,0.05)'
                      } : {}}
                    >
                      <div className="flex-shrink-0 bg-white/5 border border-white/10 text-white rounded-lg h-9 w-9 flex items-center justify-center text-xs font-mono font-bold font-mono">
                        {idx + 1}
                      </div>
                      <div className="flex-grow">
                        <div className="text-sm font-bold text-zinc-100 flex items-center gap-1.5 truncate pr-2">
                          <span className={`inline-block w-2.5 h-2.5 rounded-full ${isActive ? 'bg-[#00ff00] animate-pulse' : 'bg-[#00ff00]/40'} shadow-[0_0_8px_rgba(0,255,0,0.5)]`} />
                          <span className="truncate">
                            {ch.name === 'SERVER 1' ? 'ULTRA LOW LATENCY' : ch.name === 'SERVER 2' ? 'EUROPEAN SERVER' : ch.name === 'SERVER 3' ? 'ASIAN FEED 1080P' : ch.name}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* 🛡️ Secure footer with terms and standard items */}
      <footer className="mt-auto border-t border-white/5 py-5 px-6 text-center text-[10px] font-mono text-zinc-500 select-none">
        <div>
          &copy; 2026 Live Sports Arena Decryptor Sandbox. All rights reserved. 
        </div>
        <div className="mt-1 flex justify-center gap-4 text-[9px] text-zinc-600">
          <span>Desktop Mode Simulation v2.10</span>
          <span>&bull;</span>
          <span>Secure Stream Protocol</span>
          <span>&bull;</span>
          <span>Sports Viewing Only</span>
        </div>
      </footer>

    </div>
  );
}
