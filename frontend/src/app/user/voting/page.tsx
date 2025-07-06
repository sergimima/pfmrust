'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import CategoryFilter from '@/components/user/categories/CategoryFilter';
import SearchBar from '@/components/user/categories/SearchBar';
import VotingGrid from '@/components/user/categories/VotingGrid';
import VotingFilters from '@/components/user/categories/VotingFilters';
import VotingStats from '@/components/voting/VotingStats';
import { BarChart3, Grid3X3 } from 'lucide-react';

interface Voting {
  id: string;
  title: string;
  description: string;
  community: string;
  category: string;
  type: 'Opinion' | 'Knowledge';
  status: 'Active' | 'Completed' | 'Failed';
  timeLeft: string;
  deadline: string;
  participantCount: number;
  quorumReached: boolean;
  userVoted: boolean;
  priority: 'high' | 'medium' | 'low';
  options: string[];
  correctAnswer?: string;
  createdBy: string;
  createdAt: string;
}

const categories = [
  { id: 'all', name: 'All Categories', icon: '🌐', count: 89 },
  { id: 'technology', name: 'Technology', icon: '💻', count: 23 },
  { id: 'finance', name: 'Finance', icon: '💰', count: 18 },
  { id: 'gaming', name: 'Gaming', icon: '🎮', count: 12 },
  { id: 'art', name: 'Art & Creative', icon: '🎨', count: 8 },
  { id: 'education', name: 'Education', icon: '📚', count: 10 },
  { id: 'general', name: 'General', icon: '💬', count: 18 }
];

const mockVotings: Voting[] = [
  {
    id: '1',
    title: 'Should we implement a new fee structure for DeFi protocols?',
    description: 'Proposal to reduce transaction fees by 50% while maintaining protocol sustainability through alternative revenue streams.',
    community: 'DeFi Governance Hub',
    category: 'finance',
    type: 'Opinion',
    status: 'Active',
    timeLeft: '2 days 4 hours',
    deadline: '2025-07-08T14:30:00Z',
    participantCount: 156,
    quorumReached: true,
    userVoted: false,
    priority: 'high',
    options: ['Reduce fees by 50%', 'Reduce fees by 25%', 'Keep current fees', 'Increase fees by 10%'],
    createdBy: 'alice.sol',
    createdAt: '2025-07-03T10:00:00Z'
  },
  {
    id: '2',
    title: 'What is the optimal block time for maximum network efficiency?',
    description: 'Technical question about blockchain performance optimization. Correct answer will be revealed after voting period.',
    community: 'Solana Developers',
    category: 'technology',
    type: 'Knowledge',
    status: 'Active',
    timeLeft: '5 hours 23 mins',
    deadline: '2025-07-06T02:23:00Z',
    participantCount: 89,
    quorumReached: false,
    userVoted: false,
    priority: 'medium',
    options: ['400ms', '600ms', '800ms', '1000ms'],
    correctAnswer: '400ms',
    createdBy: 'dev.sol',
    createdAt: '2025-07-05T15:00:00Z'
  },
  {
    id: '3',
    title: 'Community Event Theme Selection',
    description: 'Choose the theme for our next virtual community event. The winning theme will be implemented next month.',
    community: 'NFT Artists Collective',
    category: 'art',
    type: 'Opinion',
    status: 'Active',
    timeLeft: '1 day 12 hours',
    deadline: '2025-07-07T08:00:00Z',
    participantCount: 234,
    quorumReached: true,
    userVoted: true,
    priority: 'low',
    options: ['Digital Renaissance', 'Cyberpunk Future', 'Abstract Expressions', 'Nature & Tech'],
    createdBy: 'artist.sol',
    createdAt: '2025-07-04T12:00:00Z'
  },
  {
    id: '4',
    title: 'GameFi Token Distribution Model',
    description: 'Decide on the token distribution mechanism for our upcoming play-to-earn game launch.',
    community: 'GameFi Alliance',
    category: 'gaming',
    type: 'Opinion',
    status: 'Active',
    timeLeft: '3 days 8 hours',
    deadline: '2025-07-09T16:00:00Z',
    participantCount: 67,
    quorumReached: false,
    userVoted: false,
    priority: 'high',
    options: ['Linear distribution', 'Exponential rewards', 'Skill-based allocation', 'Random drops'],
    createdBy: 'gamer.sol',
    createdAt: '2025-07-02T09:00:00Z'
  },
  {
    id: '5',
    title: 'Web3 Education Curriculum Update',
    description: 'What new topics should we include in our comprehensive Web3 education program?',
    community: 'Web3 Education',
    category: 'education',
    type: 'Opinion',
    status: 'Completed',
    timeLeft: 'Completed',
    deadline: '2025-07-04T18:00:00Z',
    participantCount: 145,
    quorumReached: true,
    userVoted: true,
    priority: 'medium',
    options: ['DeFi Protocols', 'NFT Development', 'DAO Governance', 'Smart Contract Security'],
    createdBy: 'teacher.sol',
    createdAt: '2025-07-01T14:00:00Z'
  }
];

export default function VotingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [votings, setVotings] = useState<Voting[]>(mockVotings);
  const [filteredVotings, setFilteredVotings] = useState<Voting[]>(mockVotings);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'deadline');
  const [showOnlyJoined, setShowOnlyJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'stats'>('grid');

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (searchQuery) params.set('search', searchQuery);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (typeFilter !== 'all') params.set('type', typeFilter);
    if (sortBy !== 'deadline') params.set('sort', sortBy);
    
    const queryString = params.toString();
    const newUrl = queryString ? `/user/voting?${queryString}` : '/user/voting';
    router.replace(newUrl);
  }, [selectedCategory, searchQuery, statusFilter, typeFilter, sortBy, router]);

  // Filter and sort votings
  useEffect(() => {
    let filtered = [...votings];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(voting => voting.category === selectedCategory);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(voting => voting.status.toLowerCase() === statusFilter);
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(voting => voting.type.toLowerCase() === typeFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(voting => 
        voting.title.toLowerCase().includes(query) ||
        voting.description.toLowerCase().includes(query) ||
        voting.community.toLowerCase().includes(query)
      );
    }

    // Filter by joined communities only
    if (showOnlyJoined) {
      const joinedCommunities = ['DeFi Governance Hub', 'Web3 Education']; // Mock data
      filtered = filtered.filter(voting => joinedCommunities.includes(voting.community));
    }

    // Sort votings
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          if (a.status === 'Completed' && b.status !== 'Completed') return 1;
          if (b.status === 'Completed' && a.status !== 'Completed') return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'participants':
          return b.participantCount - a.participantCount;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'community':
          return a.community.localeCompare(b.community);
        default:
          return 0;
      }
    });

    setFilteredVotings(filtered);
  }, [votings, selectedCategory, searchQuery, statusFilter, typeFilter, sortBy, showOnlyJoined]);

  const handleVote = async (votingId: string, optionIndex: number) => {
    setLoading(true);
    try {
      // TODO: Call smart contract cast_vote()
      setVotings(prev => 
        prev.map(voting => 
          voting.id === votingId 
            ? { ...voting, userVoted: true, participantCount: voting.participantCount + 1 }
            : voting
        )
      );
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Active Votings</h1>
            <p className="text-gray-600 mt-2">
              Participate in community decisions and earn reputation points
            </p>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              <span>Grid View</span>
            </button>
            <button
              onClick={() => setViewMode('stats')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'stats'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Statistics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content - Conditional Rendering */}
      {viewMode === 'grid' ? (
        <>
          {/* Filters and Search */}
          <div className="mb-8 space-y-6">
            {/* Search Bar */}
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search votings by title, description, or community..."
            />

            {/* Category Filter */}
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />

            {/* Additional Filters */}
            <VotingFilters
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
              showOnlyJoined={showOnlyJoined}
              onJoinedToggle={setShowOnlyJoined}
            />
          </div>

          {/* Results Summary */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {filteredVotings.length} of {votings.length} votings
                {selectedCategory !== 'all' && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {categories.find(cat => cat.id === selectedCategory)?.name}
                  </span>
                )}
              </div>
              
              {(selectedCategory !== 'all' || searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Voting Grid */}
          <VotingGrid
            votings={filteredVotings}
            onVote={handleVote}
            loading={loading}
          />

          {/* Empty State */}
          {filteredVotings.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🗳️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No votings found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || selectedCategory !== 'all' || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Join communities to participate in their votings'
                }
              </p>
              <div className="flex justify-center space-x-4">
                {(searchQuery || selectedCategory !== 'all' || statusFilter !== 'all' || typeFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                      setStatusFilter('all');
                      setTypeFilter('all');
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                  >
                    Clear Filters
                  </button>
                )}
                <Link href="/user/voting/create" className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">
                  Create Voting
                </Link>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Statistics View */
        <VotingStats 
          timeframe="month"
          showTrends={true}
          showCategories={true}
          compact={false}
        />
      )}
    </div>
  );
}