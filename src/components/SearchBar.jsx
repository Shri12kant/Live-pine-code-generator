import React from 'react';
import { Search, MapPin, Hash, Globe, X, Navigation, Loader2 } from 'lucide-react';

const COORD_PRESETS = [
  { label: 'Delhi', coords: '28.6139, 77.2090' },
  { label: 'Mumbai', coords: '18.9438, 72.8233' },
  { label: 'Bengaluru', coords: '12.9716, 77.5946' },
  { label: 'Hyderabad', coords: '17.3850, 78.4867' },
  { label: 'Kolkata', coords: '22.5726, 88.3639' },
];

export default function SearchBar({
  query,
  setQuery,
  searchMode,
  setSearchMode,
  onSearch,
  isLoading,
  onDetectLocation,
  isDetectingLocation,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), searchMode);
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  const getPlaceholder = () => {
    if (searchMode === 'area') {
      return "Enter City or Area name (e.g. Bandra, Connaught Place, Indore, Whitefield)...";
    }
    if (searchMode === 'pincode') {
      return "Enter 6-digit PIN code (e.g. 110001, 400050, 560001)...";
    }
    return "Enter Latitude, Longitude (e.g. 28.6139, 77.2090)...";
  };

  const getHint = () => {
    if (searchMode === 'area') {
      return "Enter city, suburb, or locality name to search";
    }
    if (searchMode === 'pincode') {
      return "Enter a 6-digit official postal PIN code";
    }
    return "Enter comma-separated Latitude and Longitude to find PIN code";
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      
      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-center mb-4">
        <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-700/80 shadow-inner flex-wrap justify-center gap-1">
          <button
            type="button"
            onClick={() => {
              setSearchMode('area');
            }}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              searchMode === 'area'
                ? 'bg-white dark:bg-gray-900 text-red-600 dark:text-red-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Area / City</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSearchMode('pincode');
            }}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              searchMode === 'pincode'
                ? 'bg-white dark:bg-gray-900 text-red-600 dark:text-red-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Hash className="w-4 h-4" />
            <span>PIN Code</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSearchMode('coordinates');
            }}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              searchMode === 'coordinates'
                ? 'bg-white dark:bg-gray-900 text-red-600 dark:text-red-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Lat / Long</span>
          </button>
        </div>
      </div>

      {/* Main Search Input Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center rounded-2xl bg-white dark:bg-gray-800 border-2 border-red-500/30 hover:border-red-500/60 focus-within:border-red-500 shadow-xl shadow-red-500/5 dark:shadow-none transition-all overflow-hidden p-1.5 sm:p-2">
          
          <div className="pl-3 sm:pl-4 text-red-500 flex items-center justify-center">
            {searchMode === 'area' && <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />}
            {searchMode === 'pincode' && <Hash className="w-5 h-5 sm:w-6 sm:h-6" />}
            {searchMode === 'coordinates' && <Globe className="w-5 h-5 sm:w-6 sm:h-6" />}
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={getPlaceholder()}
            maxLength={searchMode === 'pincode' ? 6 : 80}
            className="w-full px-3 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 dark:text-white bg-transparent outline-none placeholder-gray-400 dark:placeholder-gray-500 font-medium"
          />

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full cursor-pointer mr-1"
              aria-label="Clear input"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Search Button */}
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden xs:inline">Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Search</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Coordinate Presets (Shown when in coordinates mode) */}
      {searchMode === 'coordinates' && (
        <div className="mt-2.5 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-gray-500 dark:text-gray-400 font-semibold">Try Coordinates:</span>
          {COORD_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setQuery(preset.coords);
                onSearch(preset.coords, 'coordinates');
              }}
              className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 border border-gray-200/80 dark:border-gray-700/80 font-mono text-[11px] cursor-pointer transition-colors"
            >
              {preset.label} ({preset.coords})
            </button>
          ))}
        </div>
      )}

      {/* Live Geolocation Button Strip */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          💡 {getHint()}
        </p>

        <button
          type="button"
          onClick={onDetectLocation}
          disabled={isDetectingLocation}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:underline cursor-pointer transition-colors"
        >
          <Navigation className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : 'animate-pulse'}`} />
          <span>{isDetectingLocation ? 'Reading GPS Lat/Long...' : 'Auto-detect my live GPS coordinates'}</span>
        </button>
      </div>

    </div>
  );
}
