import React from 'react';
import { Shield, FileCheck, Layers, RotateCcw, Terminal } from 'lucide-react';

interface NavbarProps {
  currentTab: 'applicant' | 'reviewer' | 'architecture';
  setCurrentTab: (tab: 'applicant' | 'reviewer' | 'architecture') => void;
  pendingReviewCount: number;
  onReseed: () => void;
  isReseeding: boolean;
  onOpenInspector: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  pendingReviewCount,
  onReseed,
  isReseeding,
  onOpenInspector
}) => {
  return (
    <header className="bg-dark-950/90 backdrop-blur-md text-white border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          
          {/* Logo brand with user-provided Logo.png */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group select-none" 
            onClick={() => setCurrentTab('applicant')}
          >
            <div className="h-10 w-auto flex items-center justify-center">
              <img 
                src="/Logo.png" 
                alt="ClearGov Logo" 
                className="h-9 w-auto max-w-[140px] object-contain rounded-lg"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-base font-bold tracking-tight text-white uppercase">ClearGov</span>
              <span className="w-1.5 h-1.5 rounded-full bg-lime-accent" />
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">Decision Engine</span>
            </div>
          </div>

          {/* Two Users Role Switcher & Navigation */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setCurrentTab('applicant')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                currentTab === 'applicant'
                  ? 'bg-lime-accent text-dark-950 shadow-md scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>User 1: Applicant Journey</span>
            </button>

            <button
              onClick={() => setCurrentTab('reviewer')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold transition-all relative ${
                currentTab === 'reviewer'
                  ? 'bg-lime-accent text-dark-950 shadow-md scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Shield className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>User 2: Reviewer Portal</span>
              {pendingReviewCount > 0 && (
                <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  currentTab === 'reviewer'
                    ? 'bg-dark-950 text-lime-accent'
                    : 'bg-purple-500/30 text-purple-300 border border-purple-400/40'
                }`}>
                  {pendingReviewCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('architecture')}
              className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
                currentTab === 'architecture'
                  ? 'bg-white/20 text-white font-bold shadow-inner'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              System Chain
            </button>
          </nav>

          {/* Secondary Utilities */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={onOpenInspector}
              title="Inspect System State JSON"
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-full bg-white/5 hover:bg-white/10 text-slate-300 transition border border-white/10"
            >
              <Terminal className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
              <span className="font-mono text-[11px]">Audit JSON</span>
            </button>

            <button
              onClick={onReseed}
              disabled={isReseeding}
              title="Reset Sample Applications"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-full bg-white/5 hover:bg-white/10 text-slate-300 transition border border-white/10 disabled:opacity-40"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-slate-400 ${isReseeding ? 'animate-spin' : ''}`} strokeWidth={1.75} />
              <span className="hidden lg:inline text-[11px]">Reset Data</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
