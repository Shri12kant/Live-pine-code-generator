import React from 'react';
import { Filter, X } from 'lucide-react';

export default function Filters({
  states,
  districts,
  selectedState,
  setSelectedState,
  selectedDistrict,
  setSelectedDistrict,
  deliveryFilter,
  setDeliveryFilter,
  filterText,
  setFilterText,
  totalResults,
  filteredCount,
  onReset,
}) {
  const hasActiveFilters =
    selectedState !== 'all' ||
    selectedDistrict !== 'all' ||
    deliveryFilter !== 'all' ||
    filterText.trim() !== '';

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-800/60 p-3.5 sm:p-4 rounded-2xl border border-gray-200 dark:border-gray-700/80 mb-6">
      
      {/* Top row: Title and active counts */}
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">
            Filter Results
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium">
            Showing {filteredCount} of {totalResults}
          </span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Filter Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* Quick Search Within Results */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Search in results
          </label>
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter by name..."
            className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 outline-none focus:border-red-500"
          />
        </div>

        {/* State Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
            State ({states.length})
          </label>
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedDistrict('all'); // Reset district when state changes
            }}
            className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="all">All States</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* District Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
            District ({districts.length})
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="all">All Districts</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Delivery Status Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Delivery Status
          </label>
          <select
            value={deliveryFilter}
            onChange={(e) => setDeliveryFilter(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="delivery">Delivery Post Office</option>
            <option value="non-delivery">Non-Delivery Post Office</option>
          </select>
        </div>

      </div>

    </div>
  );
}
