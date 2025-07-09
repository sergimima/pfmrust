'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Users, Hash, Calendar, Shield, Globe, MessageSquare, 
  UserPlus, UserMinus, Settings, Flag, Share2, Trophy, TrendingUp 
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface CommunityDetails {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  activeVotings: number;
  totalVotings: number;
  isJoined: boolean;
  userRole: 'Member' | 'Moderator' | 'Admin' | null;
  tags: string[];
  createdAt: string;
  admin: string;
  moderators: string[];
  isPrivate: boolean;
  requiresApproval: boolean;
  minReputationToJoin: number;
  rules?: string;
  socialLinks: {
    website?: string;
    discord?: string;
    twitter?: string;
  };
  stats: {
    totalMembers: number;
    activeMembers: number;
    completedVotings: number;
    avgParticipation: number;
  };
}

interface VotingPreview {
  id: string;
  title: string;
  type: 'Opinion' | 'Knowledge';
  status: 'Active' | 'Completed' | 'Failed';
  timeLeft: string;
  participants: number;
  quorumReached: boolean;
  userVoted: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface Member {
  wallet: string;
  displayName: string;
  reputation: number;
  level: number;
  role: 'Member' | 'Moderator' | 'Admin';
  joinedAt: string;
  lastActive: string;
  votingParticipation: number;
}

// Mock data - en producción vendría de la API/blockchain
const getMockCommunity = (id: string): CommunityDetails => ({
  id,
  name: id === '1' ? 'DeFi Governance Hub' : id === '2' ? 'Solana Developers' : `Community ${id}`,
  description: id === '1' 
    ? 'A community focused on decentralized finance governance, protocol decisions, and yield farming strategies.'
    : id === '2' 
    ? 'Technical discussions and development updates for Solana ecosystem developers and builders.'
    : `Description for community ${id}`,
  category: id === '1' ? 'Finance' : id === '2' ? 'Technology' : 'General',
  memberCount: id === '1' ? 1245 : id === '2' ? 2341 : 500,
  activeVotings: Math.floor(Math.random() * 10) + 1,
  totalVotings: Math.floor(Math.random() * 100) + 20,
  isJoined: id === '1' || id === '2',
  userRole: id === '1' ? 'Member' : id === '2' ? 'Moderator' : null,
  tags: id === '1' ? ['DeFi', 'Governance', 'Yield', 'DAO', 'Finance'] : 
        id === '2' ? ['Solana', 'Development', 'Smart Contracts', 'Rust'] :
        ['General', 'Community'],
  createdAt: '2024-01-15T00:00:00Z',
  admin: 'alice.sol',
  moderators: ['bob.sol', 'charlie.sol'],
  isPrivate: false,
  requiresApproval: false,
  minReputationToJoin: id === '1' ? 100 : id === '2' ? 200 : 0,
  rules: `Welcome to ${id === '1' ? 'DeFi Governance Hub' : id === '2' ? 'Solana Developers' : `Community ${id}`}!

Please follow these guidelines:
1. Stay on topic and be respectful
2. No spam or promotional content
3. Help fellow community members
4. Participate actively in governance decisions`,
  socialLinks: {
    website: `https://community-${id}.example.com`,
    discord: `https://discord.gg/community-${id}`,
    twitter: `https://twitter.com/community_${id}`
  },
  stats: {
    totalMembers: id === '1' ? 1245 : id === '2' ? 2341 : 500,
    activeMembers: id === '1' ? 892 : id === '2' ? 1876 : 350,
    completedVotings: id === '1' ? 119 : id === '2' ? 234 : 45,
    avgParticipation: id === '1' ? 67.8 : id === '2' ? 74.5 : 45.2
  }
});

const getMockVotings = (communityId: string): VotingPreview[] => [
  {
    id: '1',
    title: communityId === '1' ? 'Should we implement a new fee structure for DeFi protocols?' : 'Solana runtime optimization proposal',
    type: 'Opinion',
    status: 'Active',
    timeLeft: '2 days 4 hours',
    participants: 156,
    quorumReached: true,
    userVoted: false,
    priority: 'high'
  },
  {
    id: '2',
    title: communityId === '1' ? 'What is the optimal APY for sustainable yield farming?' : 'Next.js integration with Solana wallet',
    type: 'Knowledge',
    status: 'Active',
    timeLeft: '5 hours 23 mins',
    participants: 89,
    quorumReached: false,
    userVoted: false,
    priority: 'medium'
  }
];

const getMockMembers = (): Member[] => [
  {
    wallet: 'alice.sol',
    displayName: 'Alice',
    reputation: 2450,
    level: 12,
    role: 'Admin',
    joinedAt: '2024-01-15T00:00:00Z',
    lastActive: '2 hours ago',
    votingParticipation: 95.2
  },
  {
    wallet: 'bob.sol',
    displayName: 'Bob',
    reputation: 1875,
    level: 9,
    role: 'Moderator',
    joinedAt: '2024-01-20T00:00:00Z',
    lastActive: '1 hour ago',
    votingParticipation: 87.5
  },
  {
    wallet: 'charlie.sol',
    displayName: 'Charlie',
    reputation: 1650,
    level: 8,
    role: 'Member',
    joinedAt: '2024-02-01T00:00:00Z',
    lastActive: '30 minutes ago',
    votingParticipation: 82.1
  }
];

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = params.id as string;

  const [community, setCommunity] = useState<CommunityDetails | null>(null);
  const [votings, setVotings] = useState<VotingPreview[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'votings' | 'members' | 'rules'>('overview');
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const fetchCommunityData = async () => {
      setLoading(true);
      try {
        // Obtener datos de la comunidad
        const communityResponse = await apiClient.getCommunity(communityId);
        
        if (communityResponse.data) {
          // Transformar los datos al formato esperado
          const communityData: CommunityDetails = {
            id: communityResponse.data.id.toString(),
            name: communityResponse.data.name,
            description: communityResponse.data.description,
            category: communityResponse.data.category || 'General',
            memberCount: communityResponse.data.memberCount || 0,
            activeVotings: communityResponse.data.activeVotings || 0,
            totalVotings: communityResponse.data.totalVotings || 0,
            isJoined: communityResponse.data.isJoined || false,
            userRole: communityResponse.data.userRole || null,
            tags: communityResponse.data.tags || [],
            createdAt: communityResponse.data.createdAt,
            admin: communityResponse.data.admin || 'Unknown',
            moderators: communityResponse.data.moderators || [],
            isPrivate: communityResponse.data.isPrivate || false,
            requiresApproval: communityResponse.data.requiresApproval || false,
            minReputationToJoin: communityResponse.data.minReputationToJoin || 0,
            rules: communityResponse.data.rules || '',
            socialLinks: communityResponse.data.socialLinks || {},
            stats: communityResponse.data.stats || {
              totalMembers: communityResponse.data.memberCount || 0,
              activeMembers: 0,
              completedVotings: 0,
              avgParticipation: 0
            }
          };
          setCommunity(communityData);
          
          // Intentar obtener votaciones relacionadas con esta comunidad
          try {
            const votingsResponse = await apiClient.getVotes({ communityId });
            if (votingsResponse.data && Array.isArray(votingsResponse.data)) {
              const votingsData: VotingPreview[] = votingsResponse.data.map((voting: any) => ({
                id: voting.id.toString(),
                title: voting.title,
                type: voting.type as 'Opinion' | 'Knowledge',
                status: voting.status as 'Active' | 'Completed' | 'Failed',
                timeLeft: voting.timeLeft || 'Finalizado',
                participants: voting.participants || 0,
                quorumReached: voting.quorumReached || false,
                userVoted: voting.userVoted || false,
                priority: voting.priority as 'high' | 'medium' | 'low'
              }));
              setVotings(votingsData);
            }
          } catch (error) {
            console.error('Error al obtener votaciones:', error);
            // Fallback a datos vacíos si hay error
            setVotings([]);
          }
          
          // Intentar obtener miembros de la comunidad
          try {
            // Aquí iría la llamada a un endpoint para obtener miembros
            // Por ahora usamos datos mock como fallback
            setMembers(getMockMembers());
          } catch (error) {
            console.error('Error al obtener miembros:', error);
            setMembers([]);
          }
        } else {
          // Si no hay datos, redirigir a la página de comunidades
          router.push('/user/communities');
        }
      } catch (error) {
        console.error('Error al obtener datos de la comunidad:', error);
        // Si hay error, usar datos mock como fallback
        setCommunity(getMockCommunity(communityId));
        setVotings(getMockVotings(communityId));
        setMembers(getMockMembers());
      } finally {
        setLoading(false);
      }
    };
    
    fetchCommunityData();
  }, [communityId, router]);

  const handleJoinCommunity = async () => {
    if (!community) return;

    setIsJoining(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setCommunity(prev => prev ? {
        ...prev,
        isJoined: true,
        userRole: 'Member',
        memberCount: prev.memberCount + 1
      } : null);

      alert('¡Te has unido a la comunidad exitosamente!');
    } catch (error) {
      console.error('Error joining community:', error);
      alert('Error al unirse a la comunidad. Intenta de nuevo.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveCommunity = async () => {
    if (!community || !confirm('¿Estás seguro de que quieres dejar esta comunidad?')) return;

    setIsJoining(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setCommunity(prev => prev ? {
        ...prev,
        isJoined: false,
        userRole: null,
        memberCount: prev.memberCount - 1
      } : null);

      alert('Has dejado la comunidad.');
    } catch (error) {
      console.error('Error leaving community:', error);
      alert('Error al dejar la comunidad. Intenta de nuevo.');
    } finally {
      setIsJoining(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-purple-100 text-purple-800';
      case 'Moderator': return 'bg-blue-100 text-blue-800';
      case 'Member': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading community details...</span>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❓</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Community not found</h3>
        <p className="text-gray-600 mb-6">The community you're looking for doesn't exist or has been removed.</p>
        <Link href="/user/communities" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
          Back to Communities
        </Link>
      </div>
    );
  }

  const categoryIcon = community.category === 'Finance' ? '💰' : 
                      community.category === 'Technology' ? '💻' : '🏘️';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="text-4xl">{categoryIcon}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{community.name}</h1>
                  {community.isPrivate && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded">Private</span>
                  )}
                  {community.requiresApproval && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">Approval Required</span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center">
                    <Hash className="w-4 h-4 mr-1" />
                    {community.category}
                  </span>
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {community.memberCount} members
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Created {new Date(community.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-gray-700 mb-4">{community.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {community.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center space-x-4">
                  {community.socialLinks.website && (
                    <a href={community.socialLinks.website} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:text-blue-800">
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                  {community.socialLinks.discord && (
                    <a href={community.socialLinks.discord} target="_blank" rel="noopener noreferrer" 
                       className="text-indigo-600 hover:text-indigo-800">
                      <MessageSquare className="w-5 h-5" />
                    </a>
                  )}
                  {community.socialLinks.twitter && (
                    <a href={community.socialLinks.twitter} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-400 hover:text-blue-600">
                      <Share2 className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              {community.isJoined ? (
                <>
                  {community.userRole && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(community.userRole)}`}>
                      {community.userRole}
                    </span>
                  )}
                  <Link 
                    href="/user/voting/create"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-center"
                  >
                    Create Voting
                  </Link>
                  <button
                    onClick={handleLeaveCommunity}
                    disabled={isJoining}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-1"
                  >
                    <UserMinus className="w-4 h-4" />
                    <span>Leave</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleJoinCommunity}
                  disabled={isJoining}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                >
                  {isJoining ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Joining...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Join Community</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Total Members</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{community.stats.totalMembers}</p>
          <p className="text-sm text-gray-500">{community.stats.activeMembers} active</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Hash className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Active Votings</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{community.activeVotings}</p>
          <p className="text-sm text-gray-500">{community.totalVotings} total</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-gray-600">Completed</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{community.stats.completedVotings}</p>
          <p className="text-sm text-gray-500">votings</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Avg Participation</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{community.stats.avgParticipation}%</p>
          <p className="text-sm text-gray-500">of members</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: Hash },
              { id: 'votings', name: 'Votings', icon: MessageSquare },
              { id: 'members', name: 'Members', icon: Users },
              { id: 'rules', name: 'Rules', icon: Shield }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {activeTab === 'overview' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Overview</h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 mb-6">{community.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Admin</h4>
                  <p className="text-gray-600">{community.admin}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Moderators</h4>
                  <div className="space-y-1">
                    {community.moderators.map(mod => (
                      <p key={mod} className="text-gray-600">{mod}</p>
                    ))}
                  </div>
                </div>
                
                {community.minReputationToJoin > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Minimum Reputation</h4>
                    <p className="text-gray-600">{community.minReputationToJoin} points required</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'votings' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Community Votings</h3>
              {community.isJoined && (
                <Link 
                  href="/user/voting/create"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Voting
                </Link>
              )}
            </div>
            
            <div className="space-y-4">
              {votings.map(voting => (
                <div key={voting.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(voting.status)}`}>
                          {voting.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(voting.priority)}`}>
                          {voting.priority.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {voting.type}
                        </span>
                        {voting.userVoted && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            ✅ Voted
                          </span>
                        )}
                      </div>
                      
                      <h4 className="font-medium text-gray-900 mb-2">{voting.title}</h4>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>⏰ {voting.timeLeft}</span>
                        <span>👥 {voting.participants} participants</span>
                        <span>
                          {voting.quorumReached ? '✅ Quorum reached' : '⏳ Needs more votes'}
                        </span>
                      </div>
                    </div>

                    <div className="ml-4">
                      <Link
                        href={`/user/voting/${voting.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        {voting.userVoted ? 'View Results' : 'Vote Now'}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {votings.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🗳️</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No votings yet</h4>
                <p className="text-gray-600 mb-4">Be the first to create a voting for this community</p>
                {community.isJoined && (
                  <Link 
                    href="/user/voting/create"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Create First Voting
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Community Members</h3>
            
            <div className="space-y-4">
              {members.map(member => (
                <div key={member.wallet} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                      {member.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{member.displayName}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                          {member.role}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>⭐ {member.reputation} reputation</span>
                        <span>🏆 Level {member.level}</span>
                        <span>📊 {member.votingParticipation}% participation</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Joined {new Date(member.joinedAt).toLocaleDateString()} • Last active {member.lastActive}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {member.wallet.slice(0, 4)}...{member.wallet.slice(-4)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Community Rules</h3>
            
            {community.rules ? (
              <div className="prose prose-sm max-w-none">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-gray-700 font-sans">{community.rules}</pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📋</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No rules defined</h4>
                <p className="text-gray-600">This community hasn't set up specific rules yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}