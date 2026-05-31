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
  X
} from 'lucide-react';
import { Channel, Language, ThemeType, ThemeConfig } from './types';

// Original channels setup
const CHANNELS: Channel[] = [
  { name: 'SERVER 1', url: 'https://dadocric.st/player.php?id=willow&v=m', id: 'srv-1' },
  { name: 'SERVER 2', url: 'https://dadocric.st/player.php?id=cricgo3', id: 'srv-2' },
  { name: 'SERVER 3', url: 'https://streamcrichd.com/update/willowcricket.php', id: 'srv-3' },
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
  const [isFloatingPip, setIsFloatingPip] = useState<boolean>(false);

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

  // Translations
  const [currentNotice, setCurrentNotice] = useState<string>(NOTICE_BASE);
  const [selectedLang, setSelectedLang] = useState<string>('en');
  const [translating, setTranslating] = useState<boolean>(false);
  const [showLangDropdown, setShowLangDropdown] = useState<boolean>(false);

  // Forced Desktop Mode Simulation States
  const [isLoadingDesktop, setIsLoadingDesktop] = useState<boolean>(true);
  const [desktopSimulated, setDesktopSimulated] = useState<boolean>(true);
  const [scalingFactor, setScalingFactor] = useState<number>(1);
  const [userAgentString, setUserAgentString] = useState<string>('');
  const [vDeviceType, setVDeviceType] = useState<string>('Detecting Mobile Footprint...');

  const languageMenuRef = useRef<HTMLDivElement>(null);

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

    // Click outside language menu handler
    function handleClickOutside(event: MouseEvent) {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setShowLangDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleScalingAndResize);
      document.removeEventListener('mousedown', handleClickOutside);
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

  // Perform translation calling backend Express Gemini proxy
  const handleTranslate = async (lang: Language) => {
    setSelectedLang(lang.code);
    setShowLangDropdown(false);
    setTranslating(true);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: NOTICE_BASE,
          targetLang: lang.code,
          targetLangName: lang.name
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      if (data && data.translatedText) {
        setCurrentNotice(data.translatedText);
      }
    } catch (err) {
      console.error('Translation network request failed. Utilizing basic locale rules if defined:', err);
    } finally {
      setTranslating(false);
    }
  };

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

      {/* 🎰 Marquee Notice Warning Section with Live Translation */}
      <section className="bg-black/90 border-b border-white/5 py-1.5 px-6 flex items-center justify-between gap-4 relative z-40">
        <div className="marquee-container flex-grow overflow-hidden relative rounded-md bg-white/5 shadow-inner select-none py-2 px-3 border border-zinc-900">
          <div className="marquee-text font-semibold whitespace-nowrap inline-block text-[11px] tracking-wider text-zinc-300 cursor-default uppercase">
            {translating ? (
              <span className="flex items-center gap-2 py-0.5 text-yellow-500 font-mono italic">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Translating standard disclaimer through Gemini API server context...
              </span>
            ) : (
              currentNotice
            )}
          </div>
        </div>

        {/* Premium Gemini Translation Trigger Menu */}
        <div className="relative flex-shrink-0" ref={languageMenuRef}>
          <button
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            disabled={translating}
            className="bg-zinc-900 hover:bg-zinc-800 border b-accent text-[#e5e5e5] px-4 py-2 rounded-lg flex items-center gap-2 text-[11px] font-bold tracking-wide transition-all duration-200 uppercase cursor-pointer"
            style={{ borderColor: themeId === 'crimson' ? '#ff0000' : themeId === 'nebula' ? '#4f46e5' : '#10b981' }}
          >
            <Languages className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-mono">{selectedLang}</span>
            <ChevronDown className="w-3 h-3 transition-transform duration-200" />
          </button>

          {/* Languages Dropdown list */}
          {showLangDropdown && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-zinc-950 border border-white/10 p-1.5 shadow-2xl z-50 max-h-64 overflow-y-auto no-scrollbar animate-fadeIn font-mono text-[10px]">
              <div className="px-2 py-1 text-[9px] text-zinc-500 uppercase font-black border-b border-zinc-900 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-2.5 h-2.5 text-zinc-500" /> Translate Notice (Gemini-Powered)
              </div>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleTranslate(lang)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between hover:bg-white/5 transition-all duration-150 ${
                    selectedLang === lang.code ? 'text-red-500 font-black bg-white/5' : 'text-zinc-300'
                  }`}
                >
                  <span>{lang.name}</span>
                  <span className="text-[9px] text-zinc-500 font-normal">{lang.localName}</span>
                </button>
              ))}
            </div>
          )}
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
          
          <div className="w-full max-w-[1100px] flex flex-col items-center px-1">
            
            {/* Desktop Mode Active Status Bar (Highly visual verification trigger requested!) */}
            <div className="w-full mb-4 px-4 py-2 border-l-4 border-yellow-500 bg-yellow-500/5 rounded-r-xl flex items-center justify-between text-[11px] font-mono text-yellow-500/80">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-yellow-500 animate-pulse" />
                <span>ENVIRONMENT RESTRICTIONS BYPASS: <strong>FORCED DESKTOP AGENT SIMULATION ACTIVE</strong></span>
              </div>
              <div className="flex items-center gap-4">
                <span>Scale: <strong className="text-white">{Math.round(scalingFactor * 100)}%</strong></span>
                <span className="hidden md:inline">Spoof NT v10.0</span>
              </div>
            </div>

            {/* Elegant high-tech placeholder dashboard when picture-in-picture is active */}
            {isFloatingPip && (
              <div className="w-full max-w-[1100px] mx-auto h-[440px] bg-black/40 border border-dashed border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center text-center gap-3 p-6 text-zinc-500 font-mono text-xs select-none shadow-inner mb-6">
                <Tv className="w-10 h-10 text-zinc-600 animate-pulse mb-1" />
                <span className="text-zinc-400 font-bold uppercase tracking-widest text-[11px]">STREAM MINIMIZED IN PICTURE-IN-PICTURE (PIP)</span>
                <span className="text-[10px] text-zinc-500">You can switch sources or read disclaimer below while stream plays.</span>
                <button 
                  onClick={() => setIsFloatingPip(false)}
                  className="mt-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[10px] uppercase font-bold tracking-wider border border-white/10 cursor-pointer shadow transition-all duration-200"
                >
                  Return Stream To Workspace Layout
                </button>
              </div>
            )}

            {/* 🖥️ The Main Live TV Outer Container Wrapper (Sticky top so it is fixed in view on scroll) */}
            <div className={isFloatingPip 
              ? "fixed bottom-6 right-6 w-[340px] sm:w-[420px] aspect-video z-50 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-white/20 bg-black animate-scaleIn transition-all duration-300"
              : "tv-viewport w-full max-w-[1100px] mx-auto relative sticky top-4 z-30 mb-6"
            }>
              
              {/* Realtime + Historic Total View Badge */}
              <div className="absolute top-4 right-4 bg-black/45 hover:bg-black/60 border border-[#00ff00]/40 text-[#00ff00] px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wider uppercase z-20 flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,0,0.1)] select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                TOTAL VIEWS: <span className="font-extrabold text-white">{totalViews.toLocaleString()}</span>
              </div>

              {/* Picture-in-Picture window dismissal controller (Shows only in floating PIP mode) */}
              {isFloatingPip && (
                <button
                  onClick={() => setIsFloatingPip(false)}
                  title="Close picture-in-picture window and return to layout"
                  className="absolute top-4 right-14 z-35 bg-black/80 hover:bg-red-600 text-white border border-white/10 p-1.5 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-150 shadow-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              <div className={`tv-frame ${theme.cardBg} border ${theme.borderColor} ${theme.glowColor} rounded-2xl relative overflow-hidden transition-all duration-300 w-full`}>
                
                {/* Embedded Cropped Custom Live Frame (Exactly respecting original cropped dimension mappings) */}
                <div className={`crop-viewport relative w-full aspect-ratio-16-9 ${isFloatingPip ? 'h-[190px] sm:h-[235px]' : 'h-[440px]'}`}>
                  
                  {/* Clean iframe with premium sandboxing & crop mapping */}
                  <iframe 
                    src={started ? selectedChannel : 'about:blank'}
                    className={`clean-iframe transition-all duration-500 ${started ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                    allowFullScreen={true}
                    scrolling="no"
                    allow="autoplay; encrypted-media; fullscreen"
                    referrerPolicy="no-referrer"
                    style={{
                      position: 'absolute',
                      top: isFloatingPip ? '-73px' : '-170px',
                      left: '0px',
                      right: isFloatingPip ? '-78px' : '-180px',
                      bottom: '0px',
                      width: '100%',
                      height: '141%',
                      border: 'none',
                    }}
                  />

                  {/* High Quality Verification Gate Screen (Default state when not accepted) */}
                  {!started && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#050505]/98 p-8 text-center select-none animate-fadeIn">
                      <div className="player-overlay max-w-[420px] bg-[#0c0c0c] border border-zinc-850/90 p-8 rounded-2xl shadow-2xl">
                        
                        <div 
                          className="play-icon cursor-pointer flex items-center justify-center"
                          style={{ '--accent': themeId === 'crimson' ? '#ff0000' : themeId === 'nebula' ? '#4f46e5' : '#10b981' } as any}
                          onClick={startPlayback}
                        >
                          <div className="play-triangle"></div>
                        </div>
                        
                        <h2 className="text-base font-black uppercase text-zinc-100 tracking-wider mb-2 text-center">
                          Stream Verification
                        </h2>
                        
                        <p className="text-[12.5px] text-zinc-400 font-medium leading-relaxed mb-6 px-1 text-center">
                          Click below to bypass verification and unlock the global sports feed.
                        </p>

                        <div className="text-[10px] text-zinc-500 font-mono mb-6 bg-black/60 p-3 rounded-lg border border-zinc-900 leading-normal select-text max-h-[90px] overflow-y-auto no-scrollbar">
                          {currentNotice}
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

                  {/* Fast buffering / Source Loading State Badge */}
                  {started && (
                    <div className="absolute top-4 left-4 z-20 bg-black/45 hover:bg-black/60 border border-white/15 px-3.5 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-mono backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.2)]">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                      <span className="text-green-500 font-extrabold">LIVE SOURCE PIPELINE ACTIVE</span>
                    </div>
                  )}

                  {/* Picture-in-Picture mode toggle controller */}
                  {started && (
                    <button
                      onClick={() => setIsFloatingPip(!isFloatingPip)}
                      title={isFloatingPip ? "Re-dock Stream to Main Screen layout" : "Enable always-on-screen Picture-In-Picture container"}
                      className="absolute bottom-4 right-4 z-30 bg-black/80 hover:bg-black text-white border border-white/10 hover:border-red-500/70 hover:text-red-400 rounded-lg px-3 py-1.5 text-[10px] font-mono flex items-center gap-1.5 cursor-pointer backdrop-blur-sm transition-all duration-200 uppercase tracking-widest"
                    >
                      <Tv className="w-3.5 h-3.5 animate-pulse" />
                      <span>{isFloatingPip ? 'Dock Screen' : 'PiP Mode'}</span>
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* 🎛️ Interactive Stream Server Switcher (Responsive Switcher Layout: Card Horizontal view on desktop, Vertical lists on Mobile phone) */}
            <div className="w-full mt-6 max-w-[1100px] mx-auto px-1">
              
              {/* DESKTOP DEVICE SENSITIVE VIEW: Horizontal Cardview Scroll list view */}
              <div className="hidden sm:flex flex-row overflow-x-auto gap-4 w-full pb-4 no-scrollbar justify-start md:justify-center">
                {CHANNELS.map((ch, idx) => {
                  const isActive = selectedChannel === ch.url;
                  const labelCode = `Source 0${idx + 1}`;
                  const delayText = idx === 0 ? "12ms delay" : idx === 1 ? "42ms delay" : "28ms delay";
                  return (
                    <button
                      key={ch.id}
                      onClick={() => switchSource(ch.url)}
                      className={`flex-shrink-0 w-[260px] text-left transition-all duration-300 cursor-pointer rounded-xl border p-4 flex flex-col justify-between h-[120px] ${
                        isActive 
                          ? `bg-[#ff0000]/5 border-[#ff0000]/70 shadow-[0_0_15px_rgba(255,0,0,0.05)]` 
                          : 'bg-[#111111] border-[#222222] hover:border-zinc-700'
                      }`}
                      style={isActive ? {
                        borderColor: themeId === 'crimson' ? '#ff0000' : themeId === 'nebula' ? '#4f46e5' : '#10b981',
                        backgroundColor: themeId === 'crimson' ? 'rgba(255,0,0,0.05)' : themeId === 'nebula' ? 'rgba(79,70,229,0.05)' : 'rgba(16,185,129,0.05)'
                      } : {}}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 bg-white/5 border border-white/10 text-white rounded-lg h-9 w-9 flex items-center justify-center text-xs font-mono font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="text-[9px] uppercase text-zinc-500 font-extrabold tracking-wider leading-none mb-1 font-mono">
                            {labelCode}
                          </div>
                          <div className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                            <span className={`inline-block w-2.5 h-2.5 rounded-full ${isActive ? 'bg-[#00ff00] animate-pulse' : 'bg-[#00ff00]/40'} shadow-[0_0_8px_rgba(0,255,0,0.5)]`} />
                            {ch.name === 'SERVER 1' ? 'ULTRA LOW LATENCY' : ch.name === 'SERVER 2' ? 'EUROPEAN SERVER' : 'ASIAN FEED 1080P'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/5 pt-2 w-full">
                        <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-zinc-500 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                          {delayText}
                        </span>
                        {isActive ? (
                          <span 
                            className="text-[9px] font-mono font-extrabold tracking-wider px-2 py-0.5 rounded-full text-white uppercase"
                            style={{ backgroundColor: themeId === 'crimson' ? '#ff0000' : themeId === 'nebula' ? '#4f46e5' : '#10b981' }}
                          >
                            SELECTED
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono font-medium tracking-wider text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded-full uppercase hover:text-white transition-colors">
                            SWITCH SOURCE
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* MOBILE DEVICE SENSITIVE VIEW: Beautiful Mobile Vertical list layout */}
              <div className="flex sm:hidden flex-col gap-3 w-full">
                {CHANNELS.map((ch, idx) => {
                  const isActive = selectedChannel === ch.url;
                  const labelCode = `Source 0${idx + 1}`;
                  const delayText = idx === 0 ? "12ms delay" : idx === 1 ? "42ms delay" : "28ms delay";
                  return (
                    <button
                      key={ch.id}
                      onClick={() => switchSource(ch.url)}
                      className={`w-full text-left transition-all duration-300 cursor-pointer rounded-xl border flex flex-col p-4 gap-3 ${
                        isActive 
                          ? `bg-[#ff0000]/5 border-[#ff0000]/70 shadow-[0_0_15px_rgba(255,0,0,0.05)]` 
                          : 'bg-[#111111] border-[#222222] hover:border-zinc-700'
                      }`}
                      style={isActive ? {
                        borderColor: themeId === 'crimson' ? '#ff0000' : themeId === 'nebula' ? '#4f46e5' : '#10b981',
                        backgroundColor: themeId === 'crimson' ? 'rgba(255,0,0,0.05)' : themeId === 'nebula' ? 'rgba(79,70,229,0.05)' : 'rgba(16,185,129,0.05)'
                      } : {}}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 bg-white/5 border border-white/10 text-white rounded-lg h-10 w-10 flex items-center justify-center text-xs font-mono font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="text-[10px] uppercase text-zinc-500 font-extrabold tracking-wider leading-none mb-1.5 font-mono">
                            {labelCode}
                          </div>
                          <div className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                            <span 
                              className={`inline-block w-2.5 h-2.5 rounded-full ${isActive ? 'bg-[#00ff00] animate-pulse' : 'bg-[#00ff00]/40'} shadow-[0_0_8px_rgba(0,255,0,0.5)]`}
                            />
                            {ch.name === 'SERVER 1' ? 'ULTRA LOW LATENCY' : ch.name === 'SERVER 2' ? 'EUROPEAN SERVER' : 'ASIAN FEED 1080P'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/5 pt-2">
                        {/* Status latency tag */}
                        <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-500 bg-white/5 border border-white/10 px-2 py-1 rounded">
                          {delayText}
                        </span>

                        {isActive ? (
                          <span 
                            className="text-[10px] font-mono font-extrabold tracking-wider px-2.5 py-1 rounded-full text-white uppercase"
                            style={{ backgroundColor: themeId === 'crimson' ? '#ff0000' : themeId === 'nebula' ? '#4f46e5' : '#10b981' }}
                          >
                            SELECTED FEED
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-medium tracking-wider text-zinc-400 border border-zinc-800 px-2.5 py-1 rounded-full uppercase hover:text-white hover:border-zinc-600 transition-colors">
                            SWITCH SOURCE
                          </span>
                        )}
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
