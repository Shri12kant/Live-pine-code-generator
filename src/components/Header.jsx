import React from 'react';
import { MapPin, Sun, Moon, Navigation } from 'lucide-react';

export default function Header({ darkMode, setDarkMode, onDetectLocation, isDetectingLocation }) {
  return (
    <header className="w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-3.5 sm:py-4 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-red-500/25 ring-2 ring-red-400/30">
            <MapPin className="w-6 h-6 animate-bounce [animation-duration:2.5s]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 bg-clip-text text-transparent">
                PIN Finder
              </h1>
              <span className="hidden xs:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                Live Area
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium hidden sm:block">
              Find live postal PIN codes for any city or area instantly
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Location Button */}
          <button
            onClick={onDetectLocation}
            disabled={isDetectingLocation}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/70 border border-red-200/80 dark:border-red-900/50 transition-all cursor-pointer disabled:opacity-50"
            title="Detect my live location"
          >

            <Navigation className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isDetectingLocation ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">My Location</span>
            <span className="sm:hidden">Live</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle Theme"
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
