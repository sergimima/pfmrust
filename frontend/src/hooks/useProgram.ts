// frontend/src/hooks/useProgram.ts
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider, Program, web3 } from '@coral-xyz/anchor';
import { useMemo } from 'react';
import { getProgramId } from '@/lib/solana';

// Program ID del smart contract deployado
const PROGRAM_ID = '98eSBn9oRdJcPzFUuRMgktewygF6HfkwiCQUJuJBw1z';

// Tipos TypeScript para el programa (generar con anchor build)
export interface VotingSystemProgram {
  // Definir tipos del programa aquí
  rpc: {
    createUser: (params: any) => Promise<string>;
    createCommunity: (params: any) => Promise<string>;
    castVote: (params: any) => Promise<string>;
    createVoting: (params: any) => Promise<string>;
  };
  account: {
    user: {
      fetch: (pubkey: web3.PublicKey) => Promise<any>;
    };
    community: {
      fetch: (pubkey: web3.PublicKey) => Promise<any>;
    };
    voting: {
      fetch: (pubkey: web3.PublicKey) => Promise<any>;
    };
  };
}

export const useProgram = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const program = useMemo(() => {
    if (!wallet) return null;

    try {
      const provider = new AnchorProvider(
        connection,
        wallet,
        { commitment: 'confirmed' }
      );

      // Por ahora, returnar un objeto básico
      // En producción, usar: new Program(IDL, PROGRAM_ID, provider)
      const programId = new web3.PublicKey(PROGRAM_ID);
      
      return {
        programId,
        provider,
        connected: true,
        // Funciones mock que serán reemplazadas por Anchor
        createUser: async (params: any) => {
          console.log('🔧 createUser llamado:', params);
          throw new Error('Función createUser no implementada - requiere IDL');
        },
        createCommunity: async (params: any) => {
          console.log('🔧 createCommunity llamado:', params);
          throw new Error('Función createCommunity no implementada - requiere IDL');
        },
        createVoting: async (params: any) => {
          console.log('🔧 createVoting llamado:', params);
          throw new Error('Función createVoting no implementada - requiere IDL');
        },
        castVote: async (voteParams: {
          votingId: string;
          selectedOption: number;
          userWallet: web3.PublicKey;
        }) => {
          console.log('🚨 INTENTO DE VOTO DETECTADO:', voteParams);
          console.log('⚠️ Esta función requiere implementación completa de Anchor');
          
          // Simular el proceso de firma
          console.log('🔐 Solicitando firma de wallet...');
          
          // En implementación real:
          // return await program.rpc.castVote(...)
          
          throw new Error(
            `❌ Función castVote no implementada completamente.\n` +
            `🔧 Se requiere:\n` +
            `1. IDL del programa Solana\n` +
            `2. Configuración completa de Anchor\n` +
            `3. Derivación de PDAs correctas\n` +
            `4. Manejo de firmas de wallet\n\n` +
            `📋 Parámetros recibidos:\n` +
            `- Voting ID: ${voteParams.votingId}\n` +
            `- Option: ${voteParams.selectedOption}\n` +
            `- Wallet: ${voteParams.userWallet.toString()}`
          );
        }
      };
    } catch (error) {
      console.error('❌ Error inicializando programa:', error);
      return null;
    }
  }, [connection, wallet]);

  return {
    program,
    isConnected: !!program,
    wallet,
    connection
  };
};

// Hook para manejar votaciones específicamente
export const useVoting = () => {
  const { program, isConnected, wallet } = useProgram();

  const castVote = async (votingId: string, selectedOption: number) => {
    if (!program || !wallet?.publicKey) {
      throw new Error('❌ Wallet no conectado o programa no disponible');
    }

    console.log('🗳️ Iniciando proceso de votación...');
    console.log('📊 Voting ID:', votingId);
    console.log('✅ Opción seleccionada:', selectedOption);
    console.log('👤 Wallet:', wallet.publicKey.toString());

    try {
      // Llamar a la función del programa
      const result = await program.castVote({
        votingId,
        selectedOption,
        userWallet: wallet.publicKey
      });

      console.log('✅ Voto registrado exitosamente');
      return result;
    } catch (error: any) {
      console.error('❌ Error al votar:', error);
      
      // Mostrar error detallado al usuario
      if (error.message.includes('no implementada')) {
        throw new Error(
          `🚧 Sistema en desarrollo\n\n` +
          `El sistema de votación con smart contracts está en desarrollo.\n` +
          `Por favor, contacta al equipo de desarrollo para completar la integración.\n\n` +
          `Error técnico: ${error.message}`
        );
      }
      
      throw error;
    }
  };

  const createVoting = async (votingData: any) => {
    if (!program || !wallet?.publicKey) {
      throw new Error('❌ Wallet no conectado o programa no disponible');
    }

    console.log('✨ Creando nueva votación...', votingData);
    
    try {
      const result = await program.createVoting(votingData);
      console.log('✅ Votación creada exitosamente');
      return result;
    } catch (error: any) {
      console.error('❌ Error creando votación:', error);
      throw new Error(
        `🚧 Sistema en desarrollo\n\n` +
        `La creación de votaciones con smart contracts está en desarrollo.\n` +
        `Error técnico: ${error.message}`
      );
    }
  };

  return {
    castVote,
    createVoting,
    isConnected,
    wallet
  };
};

// Utilidades para derivar PDAs (Program Derived Addresses)
export const getPDAForUser = (userWallet: web3.PublicKey): [web3.PublicKey, number] => {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from('user'), userWallet.toBuffer()],
    new web3.PublicKey(PROGRAM_ID)
  );
};

export const getPDAForVoting = (votingId: string): [web3.PublicKey, number] => {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from('voting'), Buffer.from(votingId)],
    new web3.PublicKey(PROGRAM_ID)
  );
};

export const getPDAForCommunity = (communityId: string): [web3.PublicKey, number] => {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from('community'), Buffer.from(communityId)],
    new web3.PublicKey(PROGRAM_ID)
  );
};
