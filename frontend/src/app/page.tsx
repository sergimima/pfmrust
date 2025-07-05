'use client';

import { WalletButton, WalletInfo, WalletStatus } from '@/components/ui/WalletComponents';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSolana } from '@/components/providers/SolanaProvider';

export default function HomePage() {
  const { connected } = useWallet();
  const { network, isConnected } = useSolana();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with Wallet */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">
                🗳️ Solana Voting System
              </h1>
              <span className="text-sm text-gray-500 capitalize">({network})</span>
            </div>
            <div className="flex items-center space-x-4">
              <WalletStatus />
              <WalletButton />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        {/* Main Content */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Decentralized Governance Platform
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Built on Solana blockchain with hybrid architecture for optimal performance
          </p>
        </div>

        {/* Wallet Info Section */}
        {connected && (
          <div className="max-w-md mx-auto mb-16">
            <WalletInfo />
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="card">
            <div className="text-3xl mb-4">🏛️</div>
            <h3 className="text-xl font-semibold mb-2">Community Governance</h3>
            <p className="text-gray-600">
              Create and manage decentralized communities with transparent voting mechanisms
            </p>
          </div>

          <div className="card">
            <div className="text-3xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold mb-2">Gamification</h3>
            <p className="text-gray-600">
              Earn reputation points, level up, and unlock rewards for active participation
            </p>
          </div>

          <div className="card">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
            <p className="text-gray-600">
              Live voting results and community activity with WebSocket integration
            </p>
          </div>

          <div className="card">
            <div className="text-3xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold mb-2">Secure & Decentralized</h3>
            <p className="text-gray-600">
              Smart contracts on Solana ensure transparency and immutability
            </p>
          </div>

          <div className="card">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
            <p className="text-gray-600">
              Comprehensive dashboard with real-time metrics and insights
            </p>
          </div>

          <div className="card">
            <div className="text-3xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold mb-2">Reputation System</h3>
            <p className="text-gray-600">
              Dynamic voting weight based on reputation and community engagement
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-x-4">
          {connected ? (
            <>
              <button className="btn-primary">
                🏛️ Browse Communities
              </button>
              <button className="btn-secondary">
                📊 View Dashboard
              </button>
            </>
          ) : (
            <>
              <button className="btn-secondary">
                👆 Connect wallet to get started
              </button>
              <button className="btn-secondary">
                📖 Learn More
              </button>
            </>
          )}
        </div>

        {/* Status */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              connected && isConnected ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-sm font-medium">
              {connected && isConnected ? 'Fully Connected' : 
               connected ? 'Wallet Connected' :
               'System Online'}
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}
