import React from 'react';
import { Navigation, Copy, Check, ExternalLink, X } from 'lucide-react';

export default function LiveLocationBanner({
  locationData,
  onDismiss,
  onCopyPin,
  copiedPin,
  onViewDetails,
}) {
  if (!locationData) return null;

  const isCopied = copiedPin === locationData.pincode;

  return (
    <div className="w-full max-w-3xl mx-auto mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-blue-950/40 border-2 border-emerald-500/30 dark:border-emerald-500/20 shadow-lg shadow-emerald-500/5 relative overflow-hidden transition-all animate-in fade-in slide-in-from-top-2">
      
      {/* Background glow decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                Live Location Detected
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Via GPS Reverse-Geocode
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-1">
              {locationData.areaName ? `${locationData.areaName}, ` : ''}
              {locationData.city ? `${locationData.city}, ` : ''}
              {locationData.state}
            </h3>

            {locationData.pincode && (
              <div className="mt-2 flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-xl border border-emerald-300 dark:border-emerald-700/60 shadow-xs">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Your PIN:</span>
                  <span className="text-xl font-black tracking-widest text-emerald-600 dark:text-emerald-400 font-mono">
                    {locationData.pincode}
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => onCopyPin(locationData.pincode)}
                    className="p-1 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                    title="Copy PIN Code"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onViewDetails(locationData.pincode)}
                  className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View full area post offices</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg transition-colors cursor-pointer"
          aria-label="Close live banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
