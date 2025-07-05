export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🗳️ Solana Voting System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Decentralized governance platform built on Solana blockchain
          </p>
        </div>

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
        </div>

        {/* Action Buttons */}
        <div className="text-center space-x-4">
          <button className="btn-primary">
            Connect Wallet
          </button>
          <button className="btn-secondary">
            Explore Communities
          </button>
        </div>

        {/* Status */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">System Online</span>
          </div>
        </div>
      </div>
    </main>
  )
}
