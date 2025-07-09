// frontend/src/hooks/useProgram.ts - IMPLEMENTACIÓN REAL CON ANCHOR
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider, Program, BN } from '@coral-xyz/anchor';
import { useMemo } from 'react';
import { IDL } from '@/lib/idl';
import { SystemProgram, PublicKey } from '@solana/web3.js';

// Program ID del smart contract deployado
const PROGRAM_ID = new PublicKey('98eSBn9oRdJcPzFUuRMgktewygF6HfkwiCQUJuJBw1z');

export const useProgram = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const program: Program<any> | null = useMemo(() => {
    try {
      if (!wallet) {
        console.log('❌ Wallet no conectada');
        return null;
      }

      console.log('🔄 Inicializando programa Anchor REAL...');
      
      // Crear provider de Anchor REAL
      const provider = new AnchorProvider(
        connection,
        wallet,
        { commitment: 'confirmed' }
      );
      
      console.log('🔑 Usando Program ID:', PROGRAM_ID.toString());
      
      // Crear programa Anchor REAL con IDL
      const program = new Program(IDL as any, PROGRAM_ID, provider);
      
      console.log('✅ Programa Anchor REAL inicializado exitosamente');
      return program;
      
    } catch (error) {
      console.error('❌ Error inicializando programa Anchor:', error);
      return null;
    }
  }, [connection, wallet]);

  return {
    program,
    isConnected: !!program,
    wallet,
    connection,
    programId: PROGRAM_ID
  };
};

// Hook para manejar usuarios
export const useUser = () => {
  const { program, isConnected, wallet } = useProgram();

  const createUser = async () => {
    if (!program || !wallet?.publicKey) {
      throw new Error('❌ Wallet no conectado o programa no disponible');
    }

    console.log('👤 Creando usuario REAL en blockchain...');
    
    try {
      // Derivar PDA para el usuario
      const [userPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user'), wallet.publicKey.toBuffer()],
        program.programId
      );

      console.log('📝 User PDA:', userPda.toString());
      console.log('🔐 Wallet requiere FIRMA para crear usuario');

      // Llamar a create_user del smart contract REAL
      const tx = await program.methods
        .createUser()
        .accounts({
          user: userPda,
          wallet: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('✅ Usuario creado exitosamente en blockchain');
      console.log('🔗 Transaction signature:', tx);
      
      return { userPda, transaction: tx };
    } catch (error: any) {
      console.error('❌ Error creando usuario en blockchain:', error);
      throw new Error(`Error creando usuario: ${error.message}`);
    }
  };

  const getUserPDA = () => {
    if (!wallet?.publicKey) return null;
    
    const [userPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('user'), wallet.publicKey.toBuffer()],
      PROGRAM_ID
    );
    
    return userPda;
  };

  const fetchUser = async () => {
    if (!program || !wallet?.publicKey) return null;

    try {
      const userPda = getUserPDA();
      if (!userPda) return null;

      const userAccount = await program.account.user.fetch(userPda);
      console.log('✅ Usuario obtenido desde blockchain:', userAccount);
      
      return {
        address: userPda,
        ...(userAccount as Record<string, any>)
      };
    } catch (error) {
      console.log('ℹ️ Usuario no existe en blockchain:', error);
      return null;
    }
  };

  return {
    createUser,
    fetchUser,
    getUserPDA,
    isConnected,
    wallet
  };
};

// Hook para manejar comunidades
export const useCommunity = () => {
  const { program, isConnected, wallet } = useProgram();

  const createCommunity = async (params: {
    name: string;
    category: number;
    quorumPercentage: number;
    requiresApproval: boolean;
  }) => {
    if (!program || !wallet?.publicKey) {
      throw new Error('❌ Wallet no conectado o programa no disponible');
    }

    console.log('🏘️ Creando comunidad REAL en blockchain...', params);
    
    try {
      // Derivar PDA para la comunidad
      const [communityPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('community'),
          wallet.publicKey.toBuffer(),
          Buffer.from(params.name)
        ],
        program.programId
      );

      console.log('📝 Community PDA:', communityPda.toString());
      console.log('🔐 Wallet requiere FIRMA para crear comunidad');

      // Llamar a create_community del smart contract REAL
      const tx = await program.methods
        .createCommunity(
          params.name,
          params.category,
          params.quorumPercentage,
          params.requiresApproval
        )
        .accounts({
          community: communityPda,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('✅ Comunidad creada exitosamente en blockchain');
      console.log('🔗 Transaction signature:', tx);
      
      return { communityPda, transaction: tx };
    } catch (error: any) {
      console.error('❌ Error creando comunidad en blockchain:', error);
      throw new Error(`Error creando comunidad: ${error.message}`);
    }
  };

  const joinCommunity = async (communityPda: PublicKey) => {
    if (!program || !wallet?.publicKey) {
      throw new Error('❌ Wallet no conectado o programa no disponible');
    }

    console.log('🤝 Uniéndose REAL a comunidad...', communityPda.toString());
    
    try {
      // Derivar PDA para membership
      const [membershipPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('membership'),
          communityPda.toBuffer(),
          wallet.publicKey.toBuffer()
        ],
        program.programId
      );

      // Obtener PDA del usuario
      const [userPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user'), wallet.publicKey.toBuffer()],
        program.programId
      );

      console.log('📝 Membership PDA:', membershipPda.toString());
      console.log('🔐 Wallet requiere FIRMA para unirse');

      // Llamar a join_community del smart contract REAL
      const tx = await program.methods
        .joinCommunity()
        .accounts({
          membership: membershipPda,
          community: communityPda,
          user: userPda,
          member: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('✅ Unido a comunidad exitosamente en blockchain');
      console.log('🔗 Transaction signature:', tx);
      
      return { membershipPda, transaction: tx };
    } catch (error: any) {
      console.error('❌ Error uniéndose a comunidad en blockchain:', error);
      throw new Error(`Error uniéndose a comunidad: ${error.message}`);
    }
  };

  return {
    createCommunity,
    joinCommunity,
    isConnected,
    wallet
  };
};

// Hook para manejar votaciones
export const useVoting = () => {
  const { program, isConnected, wallet } = useProgram();

  const createVoting = async (params: {
    question: string;
    options: string[];
    voteType: 'Opinion' | 'Knowledge';
    correctAnswer?: number;
    deadlineHours: number;
    quorumRequired: number;
    communityPda: PublicKey;
  }) => {
    if (!program || !wallet?.publicKey) {
      throw new Error('❌ Wallet no conectado o programa no disponible');
    }

    console.log('✨ Creando votación REAL en blockchain...', params);
    
    try {
      // Derivar PDA para la votación
      const [votePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('vote'),
          params.communityPda.toBuffer(),
          wallet.publicKey.toBuffer()
        ],
        program.programId
      );

      // Obtener PDA del usuario
      const [userPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user'), wallet.publicKey.toBuffer()],
        program.programId
      );

      // Fee pool PDA
      const [feePoolPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('fee_pool')],
        program.programId
      );

      console.log('📝 Vote PDA:', votePda.toString());
      console.log('🔐 Wallet requiere FIRMA para crear votación');

      // Convertir tipo de voto
      const voteTypeEnum = params.voteType === 'Knowledge' ? { knowledge: {} } : { opinion: {} };

      // Llamar a create_voting del smart contract REAL
      const tx = await program.methods
        .createVoting(
          params.question,
          params.options,
          voteTypeEnum,
          params.correctAnswer || null,
          params.deadlineHours,
          new BN(params.quorumRequired),
          null, // quorum_percentage
          false // use_percentage_quorum
        )
        .accounts({
          vote: votePda,
          community: params.communityPda,
          user: userPda,
          creator: wallet.publicKey,
          feePool: feePoolPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('✅ Votación creada exitosamente en blockchain');
      console.log('🔗 Transaction signature:', tx);
      
      return { votePda, transaction: tx };
    } catch (error: any) {
      console.error('❌ Error creando votación en blockchain:', error);
      throw new Error(`Error creando votación: ${error.message}`);
    }
  };

  const castVote = async (votePda: PublicKey, selectedOption: number) => {
    if (!program || !wallet?.publicKey) {
      throw new Error('❌ Wallet no conectado o programa no disponible');
    }

    console.log('🗳️ Votando REAL en blockchain...', { votePda: votePda.toString(), selectedOption });
    
    try {
      // Derivar PDA para participación
      const [participationPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('participation'),
          votePda.toBuffer(),
          wallet.publicKey.toBuffer()
        ],
        program.programId
      );

      // Obtener PDA del usuario
      const [userPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user'), wallet.publicKey.toBuffer()],
        program.programId
      );

      // Obtener la votación para saber la comunidad
      const voteAccount = await program.account.vote.fetch(votePda);
      const community = (voteAccount as any).community;
      
      // Derivar PDA para membership
      const [membershipPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('membership'),
          community.toBuffer(),
          wallet.publicKey.toBuffer()
        ],
        program.programId
      );

      console.log('📝 Participation PDA:', participationPda.toString());
      console.log('📝 Membership PDA:', membershipPda.toString());
      console.log('🔐 Wallet requiere FIRMA para votar');

      // Llamar a cast_vote del smart contract REAL
      const tx = await program.methods
        .castVote(selectedOption)
        .accounts({
          participation: participationPda,
          vote: votePda,
          membership: membershipPda,
          user: userPda,
          voter: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('✅ Voto registrado exitosamente en blockchain');
      console.log('🔗 Transaction signature:', tx);
      
      return { participationPda, transaction: tx };
    } catch (error: any) {
      console.error('❌ Error votando en blockchain:', error);
      throw new Error(`Error votando: ${error.message}`);
    }
  };

  return {
    createVoting,
    castVote,
    isConnected,
    wallet
  };
};

// Utilidades para derivar PDAs
export const getPDAForUser = (userWallet: PublicKey): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('user'), userWallet.toBuffer()],
    PROGRAM_ID
  );
};

export const getPDAForCommunity = (authority: PublicKey, name: string): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('community'), authority.toBuffer(), Buffer.from(name)],
    PROGRAM_ID
  );
};

export const getPDAForVoting = (community: PublicKey, creator: PublicKey): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vote'), community.toBuffer(), creator.toBuffer()],
    PROGRAM_ID
  );
};

export const getPDAForMembership = (community: PublicKey, user: PublicKey): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('membership'), community.toBuffer(), user.toBuffer()],
    PROGRAM_ID
  );
};
