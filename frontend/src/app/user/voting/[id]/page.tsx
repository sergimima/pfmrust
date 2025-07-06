'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Clock, Users, Hash, CheckCircle, AlertTriangle, ArrowLeft, Share2 } from 'lucide-react';

interface VotingDetails {
  id: string;
  title: string;
  description: string;
  community: {
    id: string;
    name: string;
    category: string;
  };
  type: 'Opinion' | 'Knowledge';
  status: 'Active' | 'Completed' | 'Failed' | 'AwaitingReveal' | 'ConfidenceVoting';
  deadline: string;
  timeLeft: string;
  createdAt: string;
  createdBy: string;
  options: string[];
  results: number[];
  weightedResults?: number[];
  correctAnswer?: string;
  revealed?: boolean;
  participants: number;
  quorum: {
    required: number;
    reached: boolean;
    type: 'absolute' | 'percentage';
  };
  userVoted: boolean;
  userVote?: number;
  priority: 'high' | 'medium' | 'low';
  fee: number;
}

// Mock data - en producción vendría de la API/blockchain
const getMockVoting = (id: string): VotingDetails => ({
  id,
  title: 'Should we implement a new fee structure for DeFi protocols?',
  description: 'This proposal aims to reduce transaction fees by 50% while maintaining protocol sustainability through alternative revenue streams. The new structure would include:\n\n• Reduced base fees from 0.3% to 0.15%\n• Introduction of premium features with separate pricing\n• Revenue sharing model with liquidity providers\n• Quarterly fee adjustment mechanism based on usage\n\nThis change would make our platform more competitive while ensuring long-term viability.',
  community: {
    id: '1',
    name: 'DeFi Governance Hub',
    category: 'Finance'
  },
  type: 'Opinion',
  status: 'Active',
  deadline: '2025-07-08T14:30:00Z',
  timeLeft: '2 days 4 hours',
  createdAt: '2025-07-03T10:00:00Z',
  createdBy: 'alice.sol',
  options: [
    'Reduce fees by 50% as proposed',
    'Reduce fees by 25% only',
    'Keep current fee structure',
    'Increase fees by 10% for sustainability'
  ],
  results: [45, 23, 12, 8],
  participants: 88,
  quorum: {
    required: 50,
    reached: true,
    type: 'absolute'
  },
  userVoted: false,
  priority: 'high',
  fee: 0.01
});

export default function VotingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const votingId = params.id as string;

  const [voting, setVoting] = useState<VotingDetails | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setVoting(getMockVoting(votingId));
      setLoading(false);
    }, 500);
  }, [votingId]);

  const handleVote = async () => {
    if (selectedOption === null || !voting) return;

    setIsVoting(true);
    try {
      // TODO: Llamar a smart contract cast_vote()
      console.log('Voting for option:', selectedOption);
      
      // Simular transacción
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Actualizar estado local
      setVoting(prev => prev ? {
        ...prev,
        userVoted: true,
        userVote: selectedOption,
        participants: prev.participants + 1,
        results: prev.results.map((count, index) => 
          index === selectedOption ? count + 1 : count
        )
      } : null);

      setShowResults(true);
      alert('¡Voto registrado exitosamente!');
    } catch (error) {
      console.error('Error voting:', error);
      alert('Error al votar. Intenta de nuevo.');
    } finally {
      setIsVoting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'AwaitingReveal': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ConfidenceVoting': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getResultPercentage = (optionIndex: number) => {
    if (!voting) return 0;
    const total = voting.results.reduce((sum, count) => sum + count, 0);
    return total > 0 ? (voting.results[optionIndex] / total) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading voting details...</span>
      </div>
    );
  }

  if (!voting) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❓</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Voting not found</h3>
        <p className="text-gray-600 mb-6">The voting you're looking for doesn't exist or has been removed.</p>
        <Link href="/user/voting" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
          Back to Votings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </button>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(voting.status)}`}>
              {voting.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(voting.priority)}`}>
              {voting.priority.toUpperCase()}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {voting.type}
            </span>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Hash className="w-5 h-5 text-gray-400" />
              <Link 
                href={`/user/communities/${voting.community.id}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {voting.community.name}
              </Link>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{voting.community.category}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{voting.title}</h1>
          </div>
          
          <button className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Time Left</span>
          </div>
          <p className="text-lg font-bold text-gray-900 mt-1">{voting.timeLeft}</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Participants</span>
          </div>
          <p className="text-lg font-bold text-gray-900 mt-1">{voting.participants}</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            {voting.quorum.reached ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            )}
            <span className="text-sm font-medium text-gray-600">Quorum</span>
          </div>
          <p className="text-lg font-bold text-gray-900 mt-1">
            {voting.quorum.required}{voting.quorum.type === 'percentage' ? '%' : ''} 
            {voting.quorum.reached && <span className="text-green-600 ml-1">✓</span>}
          </p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Created by</span>
          </div>
          <p className="text-lg font-bold text-gray-900 mt-1">{voting.createdBy}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Description & Voting */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-line">{voting.description}</p>
            </div>
          </div>

          {/* Voting Section */}
          {voting.status === 'Active' && !voting.userVoted && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Cast Your Vote</h2>
              <div className="space-y-3">
                {voting.options.map((option, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedOption === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedOption(index)}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        checked={selectedOption === index}
                        onChange={() => setSelectedOption(index)}
                        className="text-blue-600"
                      />
                      <span className="text-gray-900">{option}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Fee: {voting.fee} SOL • Your vote is final and cannot be changed
                </div>
                <button
                  onClick={handleVote}
                  disabled={selectedOption === null || isVoting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isVoting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Voting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Submit Vote</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Already Voted Message */}
          {voting.userVoted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">You have voted!</span>
              </div>
              <p className="text-green-700">
                Your vote: <strong>{voting.options[voting.userVote || 0]}</strong>
              </p>
              <button
                onClick={() => setShowResults(!showResults)}
                className="mt-3 text-green-600 hover:text-green-800 text-sm font-medium"
              >
                {showResults ? 'Hide Results' : 'View Current Results'}
              </button>
            </div>
          )}
        </div>

        {/* Right Column - Results & Info */}
        <div className="space-y-6">
          {/* Results */}
          {(showResults || voting.status === 'Completed' || voting.userVoted) && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Results</h3>
              <div className="space-y-4">
                {voting.options.map((option, index) => {
                  const percentage = getResultPercentage(index);
                  const isWinning = Math.max(...voting.results) === voting.results[index] && voting.results[index] > 0;
                  
                  return (
                    <div key={index} className="relative">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm font-medium ${isWinning ? 'text-green-700' : 'text-gray-700'}`}>
                          {option} {isWinning && '🏆'}
                        </span>
                        <span className="text-sm text-gray-600">
                          {voting.results[index]} votes ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isWinning ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                Total votes: {voting.results.reduce((sum, count) => sum + count, 0)}
              </div>
            </div>
          )}

          {/* Voting Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Voting Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{voting.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">{new Date(voting.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deadline:</span>
                <span className="font-medium">{new Date(voting.deadline).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fee:</span>
                <span className="font-medium">{voting.fee} SOL</span>
              </div>
            </div>
          </div>

          {/* Community Link */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Community</h3>
            <Link 
              href={`/user/communities/${voting.community.id}`}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {voting.community.name}
            </Link>
            <p className="text-blue-700 text-sm mt-1">{voting.community.category}</p>
            <div className="mt-3">
              <Link 
                href={`/user/communities/${voting.community.id}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View all community votings →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}