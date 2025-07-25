'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Clock, Users, Hash, CheckCircle, AlertTriangle, ArrowLeft, Share2, Trophy, Target } from 'lucide-react';
import VotingResultsVisualization from '@/components/voting/VotingResultsVisualization';
import { useVoting } from '@/hooks/useProgram';
import { useWallet } from '@solana/wallet-adapter-react';
import useBlockchain from '@/hooks/useBlockchain';

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
    'Reduce fees by 50%',
    'Reduce fees by 25%',
    'Keep current fees',
    'Increase fees by 10%'
  ],
  results: [156, 98, 67, 26],
  participants: 347,
  quorum: {
    required: 200,
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
  const { connected, publicKey } = useWallet();
  const { castVote, isConnected } = useVoting();
  const { getVotingInfo, convertPDAsToPublicKeys, loading: blockchainLoading } = useBlockchain();

  const [voting, setVoting] = useState<VotingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeView, setActiveView] = useState<'vote' | 'results'>('vote');

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      const mockVoting = getMockVoting(votingId);
      setVoting(mockVoting);
      
      // Si el usuario ya votó o la votación terminó, mostrar resultados por defecto
      if (mockVoting.userVoted || mockVoting.status !== 'Active') {
        setActiveView('results');
        setShowResults(true);
      }
      
      setLoading(false);
    }, 500);
  }, [votingId]);

  const handleVote = async () => {
    if (selectedOption === null || !voting || !connected || !publicKey) {
      alert('❌ Por favor selecciona una opción y asegúrate de que tu wallet esté conectado');
      return;
    }

    // Verificar conexión con smart contract
    if (!isConnected) {
      alert('❌ No se puede conectar con el programa Solana. Verifica tu conexión.');
      return;
    }

    setIsVoting(true);
    try {
      console.log('🗳️ Iniciando votación REAL con smart contract...');
      console.log('📋 Parámetros:', {
        votingId,
        selectedOption,
        wallet: publicKey.toString()
      });

      // 1. OBTENER PDAs REALES del backend
      console.log('🔍 Paso 1: Obteniendo PDAs del backend...');
      const votingInfo = await getVotingInfo(votingId, publicKey.toString());
      
      if (!votingInfo) {
        throw new Error('❌ No se pudieron obtener los PDAs del backend');
      }
      
      console.log('✅ Paso 1 completado: PDAs obtenidos', votingInfo.blockchain.pdas);
      
      // 2. CONVERTIR PDAs a PublicKeys
      console.log('🔄 Paso 2: Convirtiendo PDAs a PublicKeys...');
      const pdaKeys = convertPDAsToPublicKeys(votingInfo.blockchain.pdas);
      
      console.log('✅ Paso 2 completado: PublicKeys preparados', {
        vote: pdaKeys.vote.toString(),
        user: pdaKeys.user.toString(),
        membership: pdaKeys.membership.toString(),
        participation: pdaKeys.participation.toString()
      });
      
      // 3. LLAMAR AL SMART CONTRACT REAL
      console.log('🚀 Paso 3: Llamando cast_vote() en blockchain...');
      console.log('⚠️ Esta transacción requerirá firma de wallet');
      
      const result = await castVote(pdaKeys.vote, selectedOption);
      
      console.log('🎉 ¡ÉXITO! Voto registrado en blockchain:', result);
      
      // 4. ACTUALIZAR UI
      setVoting(prev => prev ? {
        ...prev,
        userVoted: true,
        userVote: selectedOption,
        participants: prev.participants + 1,
        results: prev.results.map((result, index) => 
          index === selectedOption ? result + 1 : result
        )
      } : null);

      setActiveView('results');
      setShowResults(true);
      
      alert(
        '🎉 ¡VOTO REGISTRADO EXITOSAMENTE EN BLOCKCHAIN!\n\n' +
        `✅ Transaction: ${result.transaction}\n` +
        '⭐ +1 punto de reputación ganado\n' +
        '🔗 Verificable en Solana devnet'
      );
      
    } catch (error: any) {
      console.error('❌ Error voting:', error);
      
      // Mostrar error específico al usuario
      if (error.message.includes('User rejected')) {
        alert('❌ Transacción cancelada por el usuario');
      } else if (error.message.includes('Insufficient funds')) {
        alert('❌ Fondos insuficientes para pagar la transacción');
      } else if (error.message.includes('Voting not found')) {
        alert('❌ Votación no encontrada en la base de datos');
      } else {
        alert(
          `❌ Error al registrar el voto:\n\n` +
          `${error.message}\n\n` +
          'Por favor, verifica tu conexión y vuelve a intentar.'
        );
      }
    } finally {
      setIsVoting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      case 'AwaitingReveal': return 'bg-purple-100 text-purple-800';
      case 'ConfidenceVoting': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'Finance': return '💰';
      case 'Technology': return '💻';
      case 'Gaming': return '🎮';
      case 'Art': return '🎨';
      case 'Education': return '📚';
      case 'General': return '💬';
      default: return '🏘️';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'Knowledge' ? '🧠' : '💭';
  };

  const formatDescription = (description: string) => {
    return description.split('\\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < description.split('\\n').length - 1 && <br />}
      </span>
    ));
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
        <div className="flex items-center space-x-4 mb-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </button>
          <div className="text-sm text-gray-500">
            <Link href="/user/voting" className="hover:text-gray-700">Votings</Link>
            <span className="mx-2">/</span>
            <span>{voting.title}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-2xl">{getTypeIcon(voting.type)}</span>
                <span className="text-2xl">{getCategoryEmoji(voting.community.category)}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(voting.priority)}`}>
                  {voting.priority.toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(voting.status)}`}>
                  {voting.status}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  {voting.type}
                </span>
                {voting.userVoted && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    ✅ Voted
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{voting.title}</h1>
              
              <div className="prose prose-sm max-w-none text-gray-700 mb-6">
                {formatDescription(voting.description)}
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <span className="flex items-center">
                  <Hash className="w-4 h-4 mr-1" />
                  in {voting.community.name}
                </span>
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  by {voting.createdBy}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(voting.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="ml-6 flex flex-col space-y-2">
              <button
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Participants</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-1">{voting.participants}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Quorum</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mt-1">{voting.quorum.required}</p>
              <p className="text-xs text-green-600">
                {voting.quorum.reached ? '✅ Reached' : '⏳ Needed'}
              </p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Time Left</span>
              </div>
              <p className="text-lg font-bold text-orange-900 mt-1">{voting.timeLeft}</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Fee</span>
              </div>
              <p className="text-lg font-bold text-purple-900 mt-1">{voting.fee} SOL</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveView('vote')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeView === 'vote'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              disabled={voting.userVoted || voting.status !== 'Active'}
            >
              Cast Your Vote
            </button>
            <button
              onClick={() => setActiveView('results')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeView === 'results'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              View Results
              {!voting.userVoted && voting.status === 'Active' && (
                <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  Vote to see
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeView === 'vote' && !voting.userVoted && voting.status === 'Active' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Wallet Connection Warning */}
          {!connected && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
                <div>
                  <h4 className="font-medium text-yellow-900">Wallet no conectado</h4>
                  <p className="text-yellow-700">
                    Necesitas conectar tu wallet Solana para poder votar.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Smart Contract Connection Status */}
          {connected && (
            <div className={`mb-6 border rounded-lg p-4 ${
              isConnected 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div>
                  <h4 className={`font-medium ${
                    isConnected ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {isConnected ? 'Smart Contract Conectado' : 'Smart Contract Desconectado'}
                  </h4>
                  <p className={isConnected ? 'text-green-700' : 'text-red-700'}>
                    {isConnected 
                      ? 'Listo para votar en blockchain Solana' 
                      : 'No se puede conectar con el programa Solana'
                    }
                  </p>
                  {!isConnected && (
                    <p className="text-xs text-red-600 mt-1">
                      Programa: 98eSBn9oRdJcPzFUuRMgktewygF6HfkwiCQUJuJBw1z
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <h3 className="text-lg font-semibold text-gray-900 mb-6">Select your option:</h3>
          
          <div className="space-y-3 mb-8">
            {voting.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedOption === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="voting-option"
                  value={index}
                  checked={selectedOption === index}
                  onChange={() => setSelectedOption(index)}
                  className="mr-4 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-gray-900 font-medium">{option}</span>
              </label>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>By voting, you'll earn +1 reputation point.</p>
              <p>Voting fee: {voting.fee} SOL</p>
            </div>
            
            <button
              onClick={handleVote}
              disabled={selectedOption === null || isVoting || !connected || !isConnected || blockchainLoading}
              className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isVoting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Procesando en Blockchain...</span>
                </>
              ) : blockchainLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Obteniendo PDAs...</span>
                </>
              ) : !connected ? (
                <>
                  <AlertTriangle className="w-5 h-5" />
                  <span>Connect Wallet</span>
                </>
              ) : !isConnected ? (
                <>
                  <AlertTriangle className="w-5 h-5" />
                  <span>Smart Contract Error</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Vote on Blockchain</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div>
          {voting.userVoted && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-900">Your vote has been recorded</h4>
                  <p className="text-green-700">
                    You voted for: "{voting.options[voting.userVote!]}"
                  </p>
                  <p className="text-sm text-green-600 mt-1">+1 reputation point earned</p>
                </div>
              </div>
            </div>
          )}

          {/* Results Visualization Component */}
          <VotingResultsVisualization 
            votingId={votingId}
            showUserVote={voting.userVoted}
            showDemographics={true}
            showParticipationTrend={true}
          />
        </div>
      )}

      {/* Community Link */}
      <div className="mt-8 text-center">
        <Link
          href={`/user/communities/${voting.community.id}`}
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <span>View {voting.community.name} Community</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
