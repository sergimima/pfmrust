'use client';

interface VotingFiltersProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
  typeFilter: string;
  onTypeChange: (type: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  showOnlyJoined: boolean;
  onJoinedToggle: (joined: boolean) => void;
}

export default function VotingFilters({
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  sortBy,
  onSortChange,
  showOnlyJoined,
  onJoinedToggle
}: VotingFiltersProps) {
  const statusOptions = [
    { id: 'all', name: 'All Status', icon: '🌐' },
    { id: 'active', name: 'Active', icon: '🟢' },
    { id: 'completed', name: 'Completed', icon: '✅' },
    { id: 'failed', name: 'Failed', icon: '🔴' }
  ];

  const typeOptions = [
    { id: 'all', name: 'All Types', icon: '🌐' },
    { id: 'opinion', name: 'Opinion', icon: '💭' },
    { id: 'knowledge', name: 'Knowledge', icon: '🧠' }
  ];

  const sortOptions = [
    { id: 'deadline', name: 'Deadline', icon: '⏰' },
    { id: 'participants', name: 'Most Participants', icon: '👥' },
    { id: 'newest', name: 'Newest', icon: '✨' },
    { id: 'priority', name: 'Priority', icon: '🔥' },
    { id: 'community', name: 'Community', icon: '🏘️' }
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-700 self-center mr-2">Status:</span>
        {statusOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onStatusChange(option.id)}
            className={`
              flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200
              ${statusFilter === option.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <span>{option.icon}</span>
            <span>{option.name}</span>
          </button>
        ))}
      </div>

      {/* Type Filter */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-700 self-center mr-2">Type:</span>
        {typeOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onTypeChange(option.id)}
            className={`
              flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200
              ${typeFilter === option.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <span>{option.icon}</span>
            <span>{option.name}</span>
          </button>
        ))}
      </div>

      {/* Sort & Toggle Options */}
      <div className="flex items-center space-x-4">
        {/* Sort Dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.icon} {option.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Joined Communities Toggle */}
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showOnlyJoined}
            onChange={(e) => onJoinedToggle(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">My communities only</span>
        </label>
      </div>
    </div>
  );
}