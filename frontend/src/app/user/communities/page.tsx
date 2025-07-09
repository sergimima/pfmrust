'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import CategoryFilter from '@/components/user/categories/CategoryFilter';
import CommunityGrid from '@/components/user/categories/CommunityGrid';
import SearchBar from '@/components/user/categories/SearchBar';
import SortOptions from '@/components/user/categories/SortOptions';
import { apiClient } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';

interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  activeVotings: number;
  isJoined: boolean;
  image?: string;
  tags: string[];
  lastActivity: string;
  createdAt: string;
  admin: string;
}

const categories = [
  { id: 'all', name: 'Todas las Categorías', icon: '🌐', count: 156 },
  { id: 'technology', name: 'Tecnología', icon: '💻', count: 45 },
  { id: 'finance', name: 'Finanzas', icon: '💰', count: 34 },
  { id: 'gaming', name: 'Gaming', icon: '🎮', count: 28 },
  { id: 'art', name: 'Arte y Creatividad', icon: '🎨', count: 23 },
  { id: 'education', name: 'Educación', icon: '📚', count: 19 },
  { id: 'sports', name: 'Deportes', icon: '⚽', count: 15 },
  { id: 'music', name: 'Música', icon: '🎵', count: 12 },
  { id: 'science', name: 'Ciencia', icon: '🔬', count: 10 },
  { id: 'politics', name: 'Política', icon: '🏛️', count: 8 },
  { id: 'general', name: 'General', icon: '💬', count: 26 }
];

// Mantenemos los datos mock como fallback
const mockCommunities: Community[] = [
  {
    id: '1',
    name: 'DeFi Governance Hub',
    description: 'Decentralized finance governance and protocol decisions',
    category: 'finance',
    memberCount: 1245,
    activeVotings: 8,
    isJoined: true,
    tags: ['DeFi', 'Governance', 'Yield'],
    lastActivity: '2 hours ago',
    createdAt: '2024-01-15',
    admin: 'alice.sol'
  },
  {
    id: '2',
    name: 'Solana Developers',
    description: 'Technical discussions and development updates for Solana ecosystem',
    category: 'technology',
    memberCount: 2341,
    activeVotings: 12,
    isJoined: true,
    tags: ['Solana', 'Development', 'Smart Contracts'],
    lastActivity: '1 hour ago',
    createdAt: '2024-02-01',
    admin: 'dev.sol'
  },
  {
    id: '3',
    name: 'NFT Artists Collective',
    description: 'Supporting digital artists and NFT creators in the Solana ecosystem',
    category: 'art',
    memberCount: 892,
    activeVotings: 5,
    isJoined: false,
    tags: ['NFT', 'Art', 'Creators'],
    lastActivity: '3 hours ago',
    createdAt: '2024-01-20',
    admin: 'artist.sol'
  },
  {
    id: '4',
    name: 'GameFi Alliance',
    description: 'Gaming and GameFi projects coordination and governance',
    category: 'gaming',
    memberCount: 1567,
    activeVotings: 6,
    isJoined: false,
    tags: ['GameFi', 'P2E', 'Gaming'],
    lastActivity: '5 hours ago',
    createdAt: '2024-03-01',
    admin: 'gamer.sol'
  },
  {
    id: '5',
    name: 'Web3 Education',
    description: 'Learning resources and educational content about Web3 and blockchain',
    category: 'education',
    memberCount: 723,
    activeVotings: 3,
    isJoined: true,
    tags: ['Education', 'Web3', 'Learning'],
    lastActivity: '1 day ago',
    createdAt: '2024-02-15',
    admin: 'teacher.sol'
  },
  {
    id: '6',
    name: 'Crypto Trading Signals',
    description: 'Community-driven trading insights and market analysis',
    category: 'finance',
    memberCount: 1834,
    activeVotings: 4,
    isJoined: false,
    tags: ['Trading', 'Signals', 'Analysis'],
    lastActivity: '30 minutes ago',
    createdAt: '2024-01-10',
    admin: 'trader.sol'
  }
];

export default function CommunitiesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [communities, setCommunities] = useState<Community[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'members');
  const [loading, setLoading] = useState(false);

  // Fetch communities from backend
  useEffect(() => {
    const fetchCommunities = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.getCommunities();
        const transformedCommunities: Community[] = response.data.map((community: any) => ({
          id: community.id.toString(),
          name: community.name,
          description: community.description,
          category: community.category.toLowerCase(),
          memberCount: community.totalMembers || 0,
          activeVotings: community.totalVotes || 0,
          isJoined: false, // Por defecto, asumimos que no estamos unidos
          tags: community.tags || [],
          lastActivity: formatRelativeTime(community.updatedAt),
          createdAt: community.createdAt,
          admin: community.authority
        }));

        setCommunities(transformedCommunities);
      } catch (err) {
        console.error('Error fetching communities:', err);
        setError('No se pudieron cargar las comunidades. Por favor, inténtalo de nuevo más tarde.');
        // Fallback a datos mock solo si no hay datos reales
        setCommunities(mockCommunities);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  useEffect(() => {
    let filtered = [...communities];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(community => community.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(community =>
        community.name.toLowerCase().includes(query) ||
        community.description.toLowerCase().includes(query) ||
        (community.tags && community.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'activity':
          return a.lastActivity.localeCompare(b.lastActivity);
        case 'votes':
          return b.activeVotings - a.activeVotings;
        case 'members':
        default:
          return b.memberCount - a.memberCount;
      }
    });

    setFilteredCommunities(filtered);

    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (searchQuery) params.set('search', searchQuery);
    if (sortBy !== 'members') params.set('sort', sortBy);

    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.replace(`/user/communities${newUrl}`, { scroll: false });
  }, [communities, selectedCategory, searchQuery, sortBy, router]);

  const handleJoinCommunity = async (communityId: string) => {
    setLoading(true);
    try {
      // TODO: Call smart contract join_community()
      setCommunities(prev =>
        prev.map(community =>
          community.id === communityId
            ? { ...community, isJoined: true, memberCount: community.memberCount + 1 }
            : community
        )
      );
    } catch (error) {
      console.error('Error joining community:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveCommunity = async (communityId: string) => {
    setLoading(true);
    try {
      // TODO: Call smart contract leave_community()
      setCommunities(prev => 
        prev.map(community => 
          community.id === communityId 
            ? { ...community, isJoined: false, memberCount: community.memberCount - 1 }
            : community
        )
      );
    } catch (error) {
      console.error('Error leaving community:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Communities</h1>
        <p className="text-gray-600 mt-2">
          Discover and join communities that match your interests
        </p>
      </div>

      {/* Filters and Search */}
      <div className="mb-8 space-y-6">
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search communities by name, description, or tags..."
        />

        {/* Category Filter & Sort Options */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          
          <SortOptions
            value={sortBy}
            onChange={setSortBy}
          />
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredCommunities.length} of {communities.length} communities
            {selectedCategory !== 'all' && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                {categories.find(cat => cat.id === selectedCategory)?.name}
              </span>
            )}
          </div>
          
          {(selectedCategory !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Community Grid */}
      <CommunityGrid
        communities={filteredCommunities}
        onJoin={handleJoinCommunity}
        onLeave={handleLeaveCommunity}
        loading={loading}
      />

      {/* Empty State */}
      {filteredCommunities.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No communities found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Be the first to create a community in this category'
            }
          </p>
          <div className="flex justify-center space-x-4">
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Clear Filters
              </button>
            )}
            <Link href="/user/communities/create" className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">
              Create Community
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}