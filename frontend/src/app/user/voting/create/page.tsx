'use client';

import CreateVoting from '@/components/voting/CreateVoting';

export default function CreateVotingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.history.back()}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Voting</h1>
                <p className="text-gray-600">Design a voting proposal for your community</p>
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                Step 1: Create Voting
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8">
        <CreateVoting />
      </div>

      {/* Help Section */}
      <div className="max-w-4xl mx-auto px-6 pb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips for Creating Effective Votings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">📝 Writing Guidelines:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Keep titles clear and concise</li>
                <li>Provide detailed context in description</li>
                <li>Use neutral, unbiased language</li>
                <li>Include relevant background information</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">⚙️ Configuration Tips:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Set appropriate deadlines (not too short/long)</li>
                <li>Consider community size for quorum</li>
                <li>Use Knowledge type for factual questions</li>
                <li>Test with 2-3 clear options first</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}