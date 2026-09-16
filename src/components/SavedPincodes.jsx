import React from 'react';
import { Bookmark, Trash2 } from 'lucide-react';

export default function SavedPincodes({ favorites, onRemoveFavorite, onSelectPincode }) {
  if (!favorites || favorites.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto mt-10 p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 text-sm font-bold text-amber-900 dark:text-amber-300">
          <Bookmark className="w-4 h-4 fill-current text-amber-600" />
          <span>Saved PIN Codes ({favorites.length})</span>
        </div>
        <span className="text-xs text-amber-700/80 dark:text-amber-400">Saved in this browser</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {favorites.map((fav) => (
          <div
            key={`${fav.pincode}-${fav.name}`}
            className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xs"
          >
            <div
              className="cursor-pointer"
              onClick={() => onSelectPincode(fav.pincode)}
              title="Click to search this PIN code"
            >
              <div className="font-mono font-bold text-base text-red-600 dark:text-red-400">
                {fav.pincode}
              </div>
              <div className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[150px]">
                {fav.name}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                {fav.district}, {fav.state}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onRemoveFavorite(fav)}
              className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
              title="Remove from saved"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
