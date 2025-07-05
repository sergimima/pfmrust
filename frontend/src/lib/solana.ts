import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

// Network configuration
export const NETWORKS = {
  'mainnet-beta': clusterApiUrl('mainnet-beta'),
  'testnet': clusterApiUrl('testnet'),  
  'devnet': clusterApiUrl('devnet'),
  'localhost': 'http://localhost:8899'
} as const;

export type NetworkType = keyof typeof NETWORKS;

// Get current network from environment
export const getCurrentNetwork = (): NetworkType => {
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK as NetworkType;
  return network in NETWORKS ? network : 'devnet';
};

// Get RPC URL
export const getRpcUrl = (): string => {
  const customUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
  if (customUrl) return customUrl;
  
  const network = getCurrentNetwork();
  return NETWORKS[network];
};

// Create connection
export const createConnection = (): Connection => {
  const rpcUrl = getRpcUrl();
  return new Connection(rpcUrl, 'confirmed');
};

// Get program ID
export const getProgramId = (): PublicKey | null => {
  const programIdStr = process.env.NEXT_PUBLIC_PROGRAM_ID;
  if (!programIdStr || programIdStr === 'YOUR_PROGRAM_ID_HERE') {
    console.warn('⚠️ Program ID not configured in environment variables');
    return null;
  }
  
  try {
    return new PublicKey(programIdStr);
  } catch (error) {
    console.error('❌ Invalid Program ID format:', error);
    return null;
  }
};

// Connection status
export const checkConnectionStatus = async (connection: Connection): Promise<boolean> => {
  try {
    const version = await connection.getVersion();
    console.log('✅ Solana RPC connected:', version);
    return true;
  } catch (error) {
    console.error('❌ Solana RPC connection failed:', error);
    return false;
  }
};

// Wallet utils
export const formatWalletAddress = (address: string, chars = 4): string => {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

// SOL amount formatting
export const formatSOL = (lamports: number): string => {
  return (lamports / 1_000_000_000).toFixed(4);
};

export const lamportsToSOL = (lamports: number): number => {
  return lamports / 1_000_000_000;
};

export const solToLamports = (sol: number): number => {
  return Math.floor(sol * 1_000_000_000);
};
