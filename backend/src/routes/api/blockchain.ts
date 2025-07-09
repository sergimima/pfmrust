// backend/src/routes/api/blockchain.ts - Endpoints para interacción blockchain
import { Router } from 'express';
import { PublicKey } from '@solana/web3.js';

const router = Router();

// Program ID del smart contract
const PROGRAM_ID = new PublicKey('98eSBn9oRdJcPzFUuRMgktewygF6HfkwiCQUJuJBw1z');

/**
 * Derivar PDA para un usuario
 * GET /api/blockchain/user-pda/:wallet
 */
router.get('/user-pda/:wallet', async (req, res) => {
  try {
    const { wallet } = req.params;
    
    // Validar que la wallet sea una PublicKey válida
    const walletPubkey = new PublicKey(wallet);
    
    // Derivar PDA para usuario
    const [userPda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from('user'), walletPubkey.toBuffer()],
      PROGRAM_ID
    );
    
    res.json({
      success: true,
      data: {
        wallet: wallet,
        userPda: userPda.toString(),
        bump: bump,
        programId: PROGRAM_ID.toString()
      }
    });
    
  } catch (error: any) {
    console.error('Error derivando User PDA:', error);
    res.status(400).json({
      success: false,
      error: 'Invalid wallet address or error deriving PDA',
      details: error.message
    });
  }
});

/**
 * Derivar PDA para una votación
 * GET /api/blockchain/vote-pda/:community/:creator
 */
router.get('/vote-pda/:community/:creator', async (req, res) => {
  try {
    const { community, creator } = req.params;
    
    // Validar que sean PublicKeys válidas
    const communityPubkey = new PublicKey(community);
    const creatorPubkey = new PublicKey(creator);
    
    // Derivar PDA para votación
    const [votePda, bump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('vote'),
        communityPubkey.toBuffer(),
        creatorPubkey.toBuffer()
      ],
      PROGRAM_ID
    );
    
    res.json({
      success: true,
      data: {
        community: community,
        creator: creator,
        votePda: votePda.toString(),
        bump: bump,
        programId: PROGRAM_ID.toString()
      }
    });
    
  } catch (error: any) {
    console.error('Error derivando Vote PDA:', error);
    res.status(400).json({
      success: false,
      error: 'Invalid community or creator address',
      details: error.message
    });
  }
});

/**
 * Obtener información completa para votar
 * POST /api/blockchain/voting-info
 * Body: { votingId: string, voterWallet: string }
 */
router.post('/voting-info', async (req, res) => {
  try {
    const { votingId, voterWallet } = req.body;
    
    if (!votingId || !voterWallet) {
      return res.status(400).json({
        success: false,
        error: 'votingId and voterWallet are required'
      });
    }
    
    // Importar Prisma
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      // 1. Obtener la votación de la base de datos
      console.log('🔍 Buscando votación ID:', votingId);
      
      const voting = await prisma.voting.findUnique({
        where: {
          id: BigInt(votingId)
        },
        include: {
          community: true
        }
      });
      
      if (!voting) {
        return res.status(404).json({
          success: false,
          error: 'Voting not found',
          votingId: votingId
        });
      }
      
      console.log('✅ Votación encontrada:', {
        id: voting.id.toString(),
        question: voting.question,
        creatorPubkey: voting.creatorPubkey,
        communityId: voting.communityId.toString()
      });
      
      // 2. Convertir pubkeys a PublicKey de Solana
      const voterPubkey = new PublicKey(voterWallet);
      const creatorPubkey = new PublicKey(voting.creatorPubkey);
      
      // 3. Para la comunidad, necesitamos derivar su PDA también
      // Asumiendo que tenemos el adminPubkey y name en la tabla community
      const communityAdminPubkey = new PublicKey(voting.community.adminPubkey);
      const communityName = voting.community.name;
      
      // Derivar PDA para la comunidad
      const [communityPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('community'),
          communityAdminPubkey.toBuffer(),
          Buffer.from(communityName)
        ],
        PROGRAM_ID
      );
      
      // 4. Derivar todos los PDAs necesarios
      
      // Vote PDA
      const [votePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('vote'),
          communityPda.toBuffer(),
          creatorPubkey.toBuffer()
        ],
        PROGRAM_ID
      );
      
      // User PDA
      const [userPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('user'),
          voterPubkey.toBuffer()
        ],
        PROGRAM_ID
      );
      
      // Membership PDA
      const [membershipPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('membership'),
          communityPda.toBuffer(),
          voterPubkey.toBuffer()
        ],
        PROGRAM_ID
      );
      
      // Participation PDA
      const [participationPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('participation'),
          votePda.toBuffer(),
          voterPubkey.toBuffer()
        ],
        PROGRAM_ID
      );
      
      console.log('📍 PDAs derivados exitosamente:', {
        votePda: votePda.toString(),
        userPda: userPda.toString(),
        membershipPda: membershipPda.toString(),
        participationPda: participationPda.toString()
      });
      
      // 5. Respuesta con todos los PDAs necesarios
      res.json({
        success: true,
        data: {
          voting: {
            id: voting.id.toString(),
            question: voting.question,
            status: voting.status,
            deadline: voting.deadline,
            totalVotes: voting.totalVotes
          },
          blockchain: {
            programId: PROGRAM_ID.toString(),
            network: 'devnet',
            pdas: {
              vote: votePda.toString(),
              user: userPda.toString(),
              membership: membershipPda.toString(),
              participation: participationPda.toString(),
              community: communityPda.toString()
            },
            accounts: {
              voter: voterWallet,
              creator: voting.creatorPubkey,
              communityAdmin: voting.community.adminPubkey
            }
          },
          ready: true,
          message: 'All PDAs derived successfully. Ready to call cast_vote()'
        }
      });
      
    } finally {
      await prisma.$disconnect();
    }
    
  } catch (error: any) {
    console.error('❌ Error obteniendo voting info:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * Obtener estado del programa y configuración
 * GET /api/blockchain/info
 */
router.get('/info', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        programId: PROGRAM_ID.toString(),
        network: 'devnet',
        rpcUrl: 'https://api.devnet.solana.com',
        availableEndpoints: {
          userPda: '/api/blockchain/user-pda/:wallet',
          votePda: '/api/blockchain/vote-pda/:community/:creator',
          votingInfo: 'POST /api/blockchain/voting-info'
        },
        instructions: {
          totalImplemented: 27,
          mainFunctions: [
            'create_user',
            'create_community', 
            'create_voting',
            'join_community',
            'cast_vote'
          ]
        }
      }
    });
  } catch (error: any) {
    console.error('Error obteniendo blockchain info:', error);
    res.status(500).json({
      success: false,
      error: 'Error getting blockchain info',
      details: error.message
    });
  }
});

export default router;
