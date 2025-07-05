'use client';

interface SortOptionsProps {
  value: string;
  onChange: (value: string) => void;
}

const sortOptions = [
  { id: 'members', name: 'Most Members', icon: '👥' },
  { id: 'activity', name: 'Most Active', icon: '🔥' },
  { id: 'newest', name: 'Newest', icon: '✨' },
  { id: 'votings', name: 'Most Votings', icon: '🗳️' },
  { id: 'name', name: 'Alphabetical', icon: '🔤' }
];

export default function SortOptions({ value, onChange }: SortOptionsProps) {
  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium text-gray-700">Sort by:</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {sortOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.icon} {option.name}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Quick sort buttons for mobile */}
      <div className="flex md:hidden space-x-1">
        {sortOptions.slice(0, 3).map((option) => (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`
              px-3 py-2 rounded-md text-xs font-medium transition-colors
              ${value === option.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {option.icon}
          </button>
        ))}
      </div>
    </div>
  );
}