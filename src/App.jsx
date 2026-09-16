import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import QuickCities from './components/QuickCities';
import LiveLocationBanner from './components/LiveLocationBanner';
import Filters from './components/Filters';
import PincodeCard from './components/PincodeCard';
import RecentSearches from './components/RecentSearches';
import SavedPincodes from './components/SavedPincodes';
import Toast from './components/Toast';
import {
  searchByArea,
  searchByPincode,
  getLiveLocationPinCode,
} from './services/pincodeApi';
import {
  MapPin,
  Compass,
  ShieldCheck,
  Zap,
  AlertTriangle,
} from 'lucide-react';


export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('pin_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Search states
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState('area'); // 'area' | 'pincode'
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Live Location states
  const [liveLocation, setLiveLocation] = useState(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Storage states
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pin_recent_searches')) || [];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pin_favorites')) || [];
    } catch {
      return [];
    }
  });

  // Filter states
  const [selectedState, setSelectedState] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [filterText, setFilterText] = useState('');

  // UI feedback states
  const [copiedPin, setCopiedPin] = useState(null);
  const [toast, setToast] = useState(null);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pin_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pin_theme', 'light');
    }
  }, [darkMode]);

  // Sync recent searches to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pin_recent_searches', JSON.stringify(recentSearches));
    } catch (e) {
      console.error(e);
    }
  }, [recentSearches]);

  // Sync favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pin_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  // Show toast utility
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Copy PIN Code to clipboard
  const handleCopyPin = async (pincode) => {
    try {
      await navigator.clipboard.writeText(pincode);
      setCopiedPin(pincode);
      showToast(`PIN Code ${pincode} copied to clipboard!`, 'success');
      setTimeout(() => setCopiedPin(null), 2000);
    } catch {
      showToast('Failed to copy PIN code', 'error');
    }
  };

  // Toggle bookmark / favorite
  const handleToggleFavorite = (item) => {
    const exists = favorites.some(
      (f) => f.pincode === item.pincode && f.name === item.name
    );
    if (exists) {
      setFavorites(
        favorites.filter(
          (f) => !(f.pincode === item.pincode && f.name === item.name)
        )
      );
      showToast(`Removed ${item.name} from saved`, 'info');
    } else {
      setFavorites([item, ...favorites]);
      showToast(`Saved PIN ${item.pincode} (${item.name})!`, 'success');
    }
  };

  const handleRemoveFavorite = (item) => {
    setFavorites(
      favorites.filter(
        (f) => !(f.pincode === item.pincode && f.name === item.name)
      )
    );
    showToast(`Removed from saved`, 'info');
  };

  // Add to recent search
  const addToRecent = (term, mode) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (i) => i.term.toLowerCase() !== trimmed.toLowerCase()
      );
      return [{ term: trimmed, mode }, ...filtered].slice(0, 8);
    });
  };

  // Core Search Action
  const executeSearch = async (searchTerm, mode = searchMode) => {
    const cleanTerm = searchTerm.trim();
    if (!cleanTerm) return;

    setIsLoading(true);
    setHasSearched(true);
    setActiveSearchTerm(cleanTerm);
    setErrorMessage('');
    
    // Reset filters on new search
    setSelectedState('all');
    setSelectedDistrict('all');
    setDeliveryFilter('all');
    setFilterText('');

    let res;
    if (mode === 'pincode' || /^\d{6}$/.test(cleanTerm)) {
      res = await searchByPincode(cleanTerm);
    } else {
      res = await searchByArea(cleanTerm);
    }

    setIsLoading(false);

    if (res.success && res.data.length > 0) {
      setResults(res.data);
      addToRecent(cleanTerm, mode);
    } else {
      setResults([]);
      setErrorMessage(
        res.message || `No results found for "${cleanTerm}". Please try another search term.`
      );
    }
  };

  // Live Location Detector
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }

    setIsDetectingLocation(true);
    showToast('Detecting your GPS location...', 'info');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const liveResult = await getLiveLocationPinCode(latitude, longitude);
        setIsDetectingLocation(false);

        if (liveResult.success) {
          setLiveLocation(liveResult);
          showToast(`Found your area PIN: ${liveResult.pincode}!`, 'success');

          // If we got post office records, auto display them
          if (liveResult.details && liveResult.details.length > 0) {
            setResults(liveResult.details);
            setHasSearched(true);
            setActiveSearchTerm(liveResult.pincode || liveResult.areaName);
            setQuery(liveResult.pincode || liveResult.areaName);
            if (liveResult.pincode) setSearchMode('pincode');
          }
        } else {
          showToast(
            liveResult.message || 'Could not detect your exact area PIN. Try searching manually.',
            'error'
          );
        }
      },
      (error) => {
        setIsDetectingLocation(false);
        let msg = 'Could not access location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please search your area manually.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is unavailable on this network.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please try again.';
        }
        showToast(msg, 'error');
      },
      { timeout: 12000, enableHighAccuracy: true }
    );
  };

  // Compute available states and districts for filters
  const availableStates = useMemo(() => {
    const set = new Set();
    results.forEach((r) => {
      if (r.state) set.add(r.state);
    });
    return Array.from(set).sort();
  }, [results]);

  const availableDistricts = useMemo(() => {
    const set = new Set();
    results.forEach((r) => {
      if (selectedState === 'all' || r.state === selectedState) {
        if (r.district) set.add(r.district);
      }
    });
    return Array.from(set).sort();
  }, [results, selectedState]);

  // Filtered results
  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      // State filter
      if (selectedState !== 'all' && item.state !== selectedState) return false;

      // District filter
      if (selectedDistrict !== 'all' && item.district !== selectedDistrict) return false;

      // Delivery Status filter
      if (deliveryFilter === 'delivery') {
        const isDel = item.deliveryStatus?.toLowerCase().includes('delivery') && !item.deliveryStatus?.toLowerCase().includes('non');
        if (!isDel) return false;
      }
      if (deliveryFilter === 'non-delivery') {
        const isNonDel = item.deliveryStatus?.toLowerCase().includes('non');
        if (!isNonDel) return false;
      }

      // Filter text in results
      if (filterText.trim()) {
        const term = filterText.toLowerCase();
        const matchesName = item.name?.toLowerCase().includes(term);
        const matchesPin = item.pincode?.includes(term);
        const matchesDist = item.district?.toLowerCase().includes(term);
        if (!matchesName && !matchesPin && !matchesDist) return false;
      }

      return true;
    });
  }, [results, selectedState, selectedDistrict, deliveryFilter, filterText]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors flex flex-col justify-between">
      
      {/* Toast popup */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div>
        {/* Top Navbar */}
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onDetectLocation={handleDetectLocation}
          isDetectingLocation={isDetectingLocation}
        />

        {/* Hero & Search Section */}
        <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
          
          <div className="text-center mb-8 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/60 mb-3">
              <Zap className="w-3.5 h-3.5 fill-current" />
              Live Indian Postal Code Finder
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
              Find PIN Code for Any <span className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 bg-clip-text text-transparent">City & Area</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Enter any city, locality, or area name to instantly discover its official 6-digit postal PIN code.
            </p>

          </div>

          {/* Search Bar Input */}
          <SearchBar
            query={query}
            setQuery={setQuery}
            searchMode={searchMode}
            setSearchMode={setSearchMode}
            onSearch={(term, mode) => executeSearch(term, mode)}
            isLoading={isLoading}
            onDetectLocation={handleDetectLocation}
            isDetectingLocation={isDetectingLocation}
          />

          {/* Live Detected Location Banner */}
          <div className="mt-6">
            <LiveLocationBanner
              locationData={liveLocation}
              onDismiss={() => setLiveLocation(null)}
              onCopyPin={handleCopyPin}
              copiedPin={copiedPin}
              onViewDetails={(pin) => {
                setQuery(pin);
                setSearchMode('pincode');
                executeSearch(pin, 'pincode');
              }}
            />
          </div>

          {/* Recent Searches Strip */}
          <RecentSearches
            searches={recentSearches}
            onSelectSearch={(term, mode) => {
              setQuery(term);
              setSearchMode(mode);
              executeSearch(term, mode);
            }}
            onClearSearches={() => setRecentSearches([])}
          />

          {/* Quick Popular Cities */}
          <QuickCities
            activeQuery={activeSearchTerm}
            onSelectCity={(cityName) => {
              setQuery(cityName);
              setSearchMode('area');
              executeSearch(cityName, 'area');
            }}
          />

          {/* Results Area */}
          <div className="mt-10">
            {/* Loading Skeleton */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 animate-pulse space-y-3"
                  >
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3" />
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    <div className="h-16 bg-gray-100 dark:bg-gray-900 rounded-xl mt-4" />
                  </div>
                ))}
              </div>
            )}

            {/* Error / Not Found Message */}
            {!isLoading && hasSearched && results.length === 0 && (
              <div className="max-w-md mx-auto p-6 rounded-2xl bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-center">
                <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-2" />
                <h4 className="text-base font-bold text-red-800 dark:text-red-300">
                  No PIN Codes Found
                </h4>
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 mt-1">
                  {errorMessage || `No post office records found for "${activeSearchTerm}".`}
                </p>
                <div className="mt-4 p-3 rounded-xl bg-white/70 dark:bg-gray-900/70 text-left text-xs text-gray-600 dark:text-gray-300 space-y-1">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Helpful Tips:</p>
                  <p>• Check your spelling (e.g. "Connaught" or "Indore")</p>
                  <p>• If a specific locality is not found, try searching the city or parent area</p>
                  <p>• Switch to PIN code mode to search directly with a 6-digit number</p>
                </div>

              </div>
            )}

            {/* Results Display */}
            {!isLoading && results.length > 0 && (
              <div>
                {/* Result header & Filters */}
                <Filters
                  states={availableStates}
                  districts={availableDistricts}
                  selectedState={selectedState}
                  setSelectedState={setSelectedState}
                  selectedDistrict={selectedDistrict}
                  setSelectedDistrict={setSelectedDistrict}
                  deliveryFilter={deliveryFilter}
                  setDeliveryFilter={setDeliveryFilter}
                  filterText={filterText}
                  setFilterText={setFilterText}
                  totalResults={results.length}
                  filteredCount={filteredResults.length}
                  onReset={() => {
                    setSelectedState('all');
                    setSelectedDistrict('all');
                    setDeliveryFilter('all');
                    setFilterText('');
                  }}
                />

                {/* Cards Grid */}
                {filteredResults.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <p className="text-sm">Filter matches zero results. Try resetting filters.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredResults.map((item, idx) => {
                      const isFav = favorites.some(
                        (f) => f.pincode === item.pincode && f.name === item.name
                      );
                      const isCopied = copiedPin === item.pincode;

                      return (
                        <PincodeCard
                          key={`${item.pincode}-${item.name}-${idx}`}
                          item={item}
                          onCopyPin={handleCopyPin}
                          isCopied={isCopied}
                          isFavorite={isFav}
                          onToggleFavorite={handleToggleFavorite}
                          onSelectPincode={(pin) => {
                            setQuery(pin);
                            setSearchMode('pincode');
                            executeSearch(pin, 'pincode');
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Initial Welcome State (Before any search) */}
            {!hasSearched && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center shadow-xs">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">Area & City Search</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Search by locality, colony, or city name to discover postal PIN codes.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center shadow-xs">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Compass className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">Auto GPS PIN Finder</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Click "Auto-detect" to automatically locate your current area PIN code via GPS.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center shadow-xs">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">Official Postal Data</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Direct India Post directory data with branch type, delivery status, and district details.
                  </p>

                </div>
              </div>
            )}

            {/* Saved PIN Codes Section */}
            <SavedPincodes
              favorites={favorites}
              onRemoveFavorite={handleRemoveFavorite}
              onSelectPincode={(pin) => {
                setQuery(pin);
                setSearchMode('pincode');
                executeSearch(pin, 'pincode');
              }}
            />

          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 py-6 mt-12 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Live Area & City PIN Code Finder • Pure React Frontend • Powered by India Post API & OpenStreetMap
        </p>
      </footer>

    </div>
  );
}
