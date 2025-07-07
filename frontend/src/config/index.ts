// Frontend configuration for connecting to deployed smart contracts
export const config = {
  // Solana Network Configuration
  network: 'devnet',
  rpcUrl: 'https://api.devnet.solana.com',
  wsUrl: 'wss://api.devnet.solana.com',
  
  // Deployed Program ID
  programId: '98eSBn9oRdJcPzFUuRMgktewygF6HfkwiCQUJuJBw1z',
  
  // Backend API Configuration  
  apiUrl: 'http://localhost:3001/api',
  
  // Super Admin Configuration
  superAdminWallet: '7bbUeyCQnjUN9R29nRdWUBmqRhghs2soPTb8h4FCxcwy',
  superAdminPda: '4aAi7HvGwsRVf6hBLkuU1xvmhx2ZigfLFMijY5wksMz5',
  
  // Known Test Data (from population)
  testData: {
    user: {
      wallet: '57KaGbs9vDctjgEerwSUZvB7NPhLB2DXnaHjhsdPZST2',
      pda: 'F23Cc4bhy4dQ79qj31HePiQXqS7SnBuDggdvpzhpM777'
    },
    community: {
      name: 'Test Community',
      pda: '5TToNoivV1ATmDeXv2bTm7osAPQmJnWHSC1qPd2jqDPw'
    },
    membership: {
      pda: 'EGwKj3WnXduaz4NqJAmaJMhiwRhDw7euWs4P4ZbQyTg7'
    }
  },
  
  // Wallet Configuration
  walletAdapterConfig: {
    network: 'devnet',
    endpoint: 'https://api.devnet.solana.com'
  },
  
  // Feature Flags
  features: {
    useMockData: false, // 🚨 CAMBIADO A FALSE - SIN MOCKS
    enableEventListeners: true,
    enableRealTimeSync: true,
    enableWalletIntegration: true
  }
};

export default config;
