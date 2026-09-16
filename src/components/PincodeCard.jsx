import React from 'react';
import { Copy, Check, MapPin, ExternalLink, Bookmark, BookmarkCheck, Building2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PincodeCard({
  item,
  onCopyPin,
  isCopied,
  isFavorite,
  onToggleFavorite,
  onSelectPincode,
}) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${item.name} Post Office ${item.district} ${item.state} ${item.pincode} India`
  )}`;

  const isDelivery = item.deliveryStatus?.toLowerCase().includes('delivery') && !item.deliveryStatus?.toLowerCase().includes('non');

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/90 dark:border-gray-700/80 p-5 shadow-sm hover:shadow-md hover:border-red-400 dark:hover:border-red-500/80 transition-all duration-200 flex flex-col justify-between">
      
      {/* Top Row: PIN Code + Copy + Favorite */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          
          {/* Prominent PIN Code Badge */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectPincode?.(item.pincode)}
              title="Click to view all areas under this PIN"
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-mono font-black text-xl sm:text-2xl tracking-widest shadow-md shadow-red-500/20 cursor-pointer transition-transform group-hover:scale-105"
            >
              {item.pincode}
            </button>

            {/* Quick Copy Button */}
            <button
              type="button"
              onClick={() => onCopyPin(item.pincode)}
              title="Copy PIN Code"
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isCopied
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400'
                  : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'
              }`}
            >
              {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Bookmark / Favorite Button */}
          <button
            type="button"
            onClick={() => onToggleFavorite(item)}
            title={isFavorite ? 'Remove from saved' : 'Save this PIN code'}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isFavorite
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400'
                : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            }`}
          >
            {isFavorite ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>

        {/* Post Office Name */}
        <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-snug mb-2">
          {item.name}
        </h4>

        {/* Status & Type Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {/* Branch Type Badge */}
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Building2 className="w-3 h-3" />
            {item.branchType || 'Branch'}
          </span>

          {/* Delivery Status Badge */}
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
              isDelivery
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
            }`}
          >
            {isDelivery ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            {item.deliveryStatus || 'Delivery'}
          </span>
        </div>

        {/* Address & Region Details */}
        <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 dark:text-gray-500 font-medium">District:</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">{item.district || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 dark:text-gray-500 font-medium">State:</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">{item.state || 'N/A'}</span>
          </div>
          {item.division && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 dark:text-gray-500 font-medium">Division:</span>
              <span className="text-gray-700 dark:text-gray-300">{item.division}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions: View on Google Maps */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
        <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
          India Post Directory
        </span>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <MapPin className="w-3.5 h-3.5 text-red-500" />
          <span>Google Maps</span>
          <ExternalLink className="w-3 h-3 text-gray-400" />
        </a>
      </div>

    </div>
  );
}
