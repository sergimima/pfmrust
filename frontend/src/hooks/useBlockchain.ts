// frontend/src/hooks/useBlockchain.ts - Hook para obtener PDAs del backend
import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { API_CONFIG } from '../config/api';

interface VotingPDAs {
  vote: string;
  user: string;
  membership: string;
  participation: string;
  community: string;
}

interface BlockchainVotingInfo {
  voting: {
    id: string;
    question: string;
    status: string;
    deadline: string;
    totalVotes: number;
  };
  blockchain: {
    programId: string;
    network: string;
    pdas: VotingPDAs;
    accounts: {
      voter: string;
      creator: string;
      communityAdmin: string;
    };
  };
  ready: boolean;
  message: string;
}

export const useBlockchain = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getVotingInfo = async (votingId: string, voterWallet: string): Promise<BlockchainVotingInfo | null> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Obteniendo PDAs para votación:', { votingId, voterWallet });

      // Verificar que los parámetros sean válidos
      if (!votingId || !voterWallet) {
        console.error('❌ votingId o voterWallet inválidos:', { votingId, voterWallet });
        throw new Error('votingId y voterWallet son requeridos');
      }
      
      // Verificar que el votingId sea un número válido para BigInt
      try {
        // Intentar convertir a BigInt para validar
        BigInt(votingId);
        console.log('✅ votingId es válido para BigInt:', votingId);
      } catch (error) {
        console.error('❌ votingId no es válido para BigInt:', { votingId, error });
        throw new Error(`El ID de votación '${votingId}' no es un número válido`);
      }

      // Mostrar la URL completa para depuración
      const url = `${API_CONFIG.BASE_URL}/blockchain/voting-info`;
      console.log('🌐 Haciendo petición a:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          votingId,
          voterWallet
        })
      });

      console.log('📡 Respuesta recibida:', { status: response.status, statusText: response.statusText });

      // Intentar parsear la respuesta como JSON
      let result;
      try {
        result = await response.json();
        console.log('📊 Datos de respuesta:', result);
      } catch (parseError: any) {
        console.error('❌ Error parseando respuesta JSON:', parseError);
        const text = await response.text();
        console.error('📝 Contenido de respuesta:', text.substring(0, 200) + '...');
        throw new Error(`Error parseando respuesta: ${parseError.message || 'Error desconocido'}`);
      }

      if (!response.ok) {
        console.error('❌ Respuesta no exitosa:', { status: response.status, error: result?.error });
        throw new Error(result?.error || `HTTP error! status: ${response.status}`);
      }

      if (!result?.success) {
        console.error('❌ Operación no exitosa:', { success: result?.success, error: result?.error });
        throw new Error(result?.error || 'Failed to get voting info');
      }

      console.log('✅ PDAs obtenidos exitosamente:', result.data);
      return result.data;

    } catch (err: any) {
      console.error('❌ Error obteniendo voting info:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const convertPDAsToPublicKeys = (pdas: VotingPDAs) => {
    try {
      return {
        vote: new PublicKey(pdas.vote),
        user: new PublicKey(pdas.user),
        membership: new PublicKey(pdas.membership),
        participation: new PublicKey(pdas.participation),
        community: new PublicKey(pdas.community)
      };
    } catch (err) {
      console.error('❌ Error convirtiendo PDAs a PublicKeys:', err);
      throw new Error('Invalid PDA format received from backend');
    }
  };

  const getUserPDA = async (wallet: string): Promise<string | null> => {
    try {
      console.log('👤 Obteniendo User PDA para:', wallet);

      const response = await fetch(`${API_CONFIG.BASE_URL}/blockchain/user-pda/${wallet}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to get user PDA');
      }

      console.log('✅ User PDA obtenido:', result.data.userPda);
      return result.data.userPda;

    } catch (err: any) {
      console.error('❌ Error obteniendo User PDA:', err);
      setError(err.message);
      return null;
    }
  };

  const getVotePDA = async (community: string, creator: string): Promise<string | null> => {
    try {
      console.log('🗳️ Obteniendo Vote PDA para:', { community, creator });

      const response = await fetch(`${API_CONFIG.BASE_URL}/blockchain/vote-pda/${community}/${creator}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to get vote PDA');
      }

      console.log('✅ Vote PDA obtenido:', result.data.votePda);
      return result.data.votePda;

    } catch (err: any) {
      console.error('❌ Error obteniendo Vote PDA:', err);
      setError(err.message);
      return null;
    }
  };

  const getBlockchainInfo = async () => {
    try {
      console.log('ℹ️ Obteniendo información del blockchain...');

      const response = await fetch(`${API_CONFIG.BASE_URL}/blockchain/info`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to get blockchain info');
      }

      console.log('✅ Blockchain info obtenida:', result.data);
      return result.data;

    } catch (err: any) {
      console.error('❌ Error obteniendo blockchain info:', err);
      setError(err.message);
      return null;
    }
  };

  return {
    getVotingInfo,
    convertPDAsToPublicKeys,
    getUserPDA,
    getVotePDA,
    getBlockchainInfo,
    loading,
    error
  };
};

export default useBlockchain;
