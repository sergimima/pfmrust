import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';

// Solana connection configuration
export const SOLANA_CONFIG = {
  network: process.env.SOLANA_NETWORK || 'localnet',
  rpcUrl: process.env.SOLANA_RPC_URL || 'http://localhost:8899',
  wsUrl: process.env.SOLANA_WS_URL || 'ws://localhost:8900',
  commitment: 'confirmed' as const,
};

// Program ID (should match your deployed program)
export const VOTING_PROGRAM_ID = new PublicKey('98eSBn9oRdJcPzFUuRMgktewygF6HfkwiCQUJuJBw1z');

// Solana connection instance
let solanaConnection: Connection | null = null;

export function getSolanaConnection(): Connection {
  if (!solanaConnection) {
    solanaConnection = new Connection(
      SOLANA_CONFIG.rpcUrl,
      {
        commitment: SOLANA_CONFIG.commitment,
        wsEndpoint: SOLANA_CONFIG.wsUrl,
      }
    );
  }
  return solanaConnection;
}

// Test Solana connection
export async function testSolanaConnection(): Promise<boolean> {
  try {
    const connection = getSolanaConnection();
    const version = await connection.getVersion();
    console.log(`✅ Solana RPC connected - Version: ${version['solana-core']}`);
    return true;
  } catch (error) {
    console.error('❌ Solana connection failed:', error);
    return false;
  }
}

// Get program instance (will be used for event listeners)
export async function getVotingProgram(): Promise<Program | null> {
  try {
    // TODO: Load IDL and create program instance
    // This will be implemented in 3.1.2 Event Listeners
    console.log('📋 Voting program setup pending - IDL loading required');
    return null;
  } catch (error) {
    console.error('❌ Program setup failed:', error);
    return null;
  }
}
