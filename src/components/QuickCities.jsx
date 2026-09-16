import React from 'react';
import { Flame } from 'lucide-react';

const POPULAR_CITIES = [
  { name: 'Delhi', query: 'New Delhi' },
  { name: 'Mumbai', query: 'Mumbai' },
  { name: 'Bengaluru', query: 'Bangalore' },
  { name: 'Hyderabad', query: 'Hyderabad' },
  { name: 'Pune', query: 'Pune' },
  { name: 'Kolkata', query: 'Kolkata' },
  { name: 'Chennai', query: 'Chennai' },
  { name: 'Ahmedabad', query: 'Ahmedabad' },
  { name: 'Jaipur', query: 'Jaipur' },
  { name: 'Lucknow', query: 'Lucknow' },
  { name: 'Indore', query: 'Indore' },
  { name: 'Bandra', query: 'Bandra' },
  { name: 'Connaught Place', query: 'Connaught Place' },
  { name: 'Whitefield', query: 'Whitefield' },
  { name: 'Patna', query: 'Patna' },
  { name: 'Chandigarh', query: 'Chandigarh' },
];

export default function QuickCities({ onSelectCity, activeQuery }) {
  return (
    <div className="w-full max-w-3xl mx-auto mt-5">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
        <Flame className="w-3.5 h-3.5 text-orange-500" />
        <span>Popular Cities & Localities:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {POPULAR_CITIES.map((city) => {
          const isActive = activeQuery.toLowerCase() === city.query.toLowerCase();
          return (
            <button
              key={city.name}
              type="button"
              onClick={() => onSelectCity(city.query)}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-400/50'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-red-400 dark:hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 shadow-xs'
              }`}
            >
              {city.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
