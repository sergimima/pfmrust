'use client';

import { FC, ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { checkConnectionStatus, getProgramId } from '@/lib/solana';
import type { SolanaContextState } from '@/types';

interface Props {
  children: ReactNode;
}

const SolanaContext = createContext<SolanaContextState>({
  connection: null,
  network: 'devnet',
  programId: null,
  isConnected: false,
});

export const SolanaProvider: FC<Props> = ({ children }) => {
  const { connection } = useConnection();
  const [isConnected, setIsConnected] = useState(false);
  const [programId, setProgramId] = useState<PublicKey | null>(null);

  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';

  // Check connection status on mount and connection change
  useEffect(() => {
    const checkConnection = async () => {
      if (connection) {
        const status = await checkConnectionStatus(connection);
        setIsConnected(status);
        
        if (status) {
          console.log('✅ Solana connection established');
        }
      }
    };

    checkConnection();
  }, [connection]);

  // Load program ID
  useEffect(() => {
    const loadProgramId = () => {
      const id = getProgramId();
      setProgramId(id);
      
      if (id) {
        console.log('✅ Program ID loaded:', id.toString());
      } else {
        console.warn('⚠️ Program ID not configured');
      }
    };

    loadProgramId();
  }, []);

  const contextValue: SolanaContextState = {
    connection,
    network,
    programId,
    isConnected,
  };

  return (
    <SolanaContext.Provider value={contextValue}>
      {children}
    </SolanaContext.Provider>
  );
};

// Custom hook to use Solana context
export const useSolana = (): SolanaContextState => {
  const context = useContext(SolanaContext);
  if (!context) {
    throw new Error('useSolana must be used within a SolanaProvider');
  }
  return context;
};
