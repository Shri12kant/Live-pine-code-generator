import React from 'react';
import { History, Clock } from 'lucide-react';

export default function RecentSearches({ searches, onSelectSearch, onClearSearches }) {
  if (!searches || searches.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mx-auto mt-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
          <History className="w-3.5 h-3.5 text-gray-400" />
          <span>Recent Searches:</span>
        </div>

        <button
          type="button"
          onClick={onClearSearches}
          className="text-[11px] text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
        >
          Clear History
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {searches.map((item, index) => (
          <button
            key={`${item.term}-${index}`}
            type="button"
            onClick={() => onSelectSearch(item.term, item.mode)}
            className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200/60 dark:border-gray-700/60 transition-colors cursor-pointer"
          >
            <Clock className="w-3 h-3 text-gray-400 group-hover:text-red-500" />
            <span>{item.term}</span>
            <span className="text-[10px] text-gray-400 uppercase font-mono px-1 py-0.2 rounded bg-gray-200 dark:bg-gray-700">
              {item.mode}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
