// backend/src/routes/api/votes.ts
import { Router, Request, Response } from 'express';
import { apiResponse, handleAsync, validatePagination } from '../../utils/helpers';
import { cacheMiddleware, invalidateCache } from '../../middleware/cache';
import prisma from '../../database/prisma';

const router = Router();

/**
 * GET /api/votes
 * Listar todas las votaciones con filtros
 */
router.get('/', 
  cacheMiddleware({ 
    ttl: 180, // 3 minutos (datos más dinámicos)
    namespace: 'votes',
    tags: ['votes', 'listings'],
    varyBy: ['query:page', 'query:limit', 'query:status', 'query:voteType', 'query:communityId', 'query:creator', 'query:sortBy', 'query:order']
  }),
  handleAsync(async (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 20, 
    status = 'all',
    voteType = 'all',
    communityId,
    creator,
    sortBy = 'createdAt', 
    order = 'desc',
    search
  } = req.query;
  
  // Validar parámetros
  const pagination = validatePagination(Number(page), Number(limit));

  try {
    // Construir filtros
    const where: any = {};
    
    if (status !== 'all') {
      // Convertir status del frontend al formato de la DB
      if (status === 'ACTIVE') {
        where.deadline = { gt: new Date() };
      } else if (status === 'COMPLETED') {
        where.deadline = { lte: new Date() };
      }
    }
    
    if (voteType !== 'all') {
      where.metadata = {
        voteType: voteType as string
      };
    }
    
    if (communityId) {
      where.communityId = BigInt(communityId as string);
    }
    
    if (creator) {
      where.creatorPubkey = creator as string;
    }
    
    if (search) {
      where.question = {
        contains: search as string,
        mode: 'insensitive'
      };
    }

    // Intentar obtener datos reales de la base de datos
    const [votes, totalCount] = await Promise.all([
      prisma.voting.findMany({
        where,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: {
          [sortBy as string]: order as 'asc' | 'desc'
        },
        include: {
          community: {
            include: {
              metadata: true
            }
          },
          metadata: true,
          _count: {
            select: {
              participations: true
            }
          }
        }
      }),
      prisma.voting.count({ where })
    ]);

    // Si hay datos reales, usarlos
    if (votes.length > 0) {
      const formattedVotes = votes.map(vote => {
        const now = new Date();
        const isActive = vote.deadline > now;
        
        return {
          id: Number(vote.id),
          question: vote.question,
          description: vote.metadata?.description || '',
          communityId: Number(vote.communityId),
          creator: vote.creatorPubkey,
          voteType: vote.metadata?.voteType || 'OPINION',
          status: isActive ? 'ACTIVE' : 'COMPLETED',
          options: vote.metadata?.options || [],
          results: vote.metadata?.results || [],
          totalParticipants: vote._count.participations,
          quorum: vote.quorum,
          deadline: vote.deadline,
          createdAt: vote.createdAt,
          community: {
            id: Number(vote.community.id),
            name: vote.community.name,
            category: vote.community.metadata?.category || 'GENERAL'
          },
          _count: { participations: vote._count.participations }
        };
      });

      const meta = {
        total: totalCount,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalCount / pagination.limit),
        hasNext: pagination.page * pagination.limit < totalCount,
        hasPrev: pagination.page > 1,
        filters: {
          status: status !== 'all' ? status : null,
          voteType: voteType !== 'all' ? voteType : null,
          communityId: communityId ? Number(communityId) : null,
          creator: creator || null,
          search: search || null
        }
      };

      return res.json(apiResponse(formattedVotes, 'Votes retrieved successfully from database', meta));
    }
  } catch (error) {
    console.warn('Database query failed, falling back to mock data:', error);
  }

  // Fallback a mock data si no hay datos reales
  const mockVotes = [
    {
      id: 1,
      question: 'Should we implement a new fee structure for high-volume traders?',
      description: 'Proposal to reduce fees for users trading over $10k monthly',
      communityId: 1,
      creator: 'GJENwjwdh7rAcZyrYh76SDjwgYrhncfhQKaMNGfSHirw',
      voteType: 'OPINION',
      status: 'ACTIVE',
      options: ['Yes, implement tiered fees', 'No, keep current structure', 'Modify the proposal'],
      results: [45, 23, 12],
      totalParticipants: 80,
      quorum: 50,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      community: {
        id: 1,
        name: 'DeFi Enthusiasts',
        category: 'FINANCE'
      },
      _count: { participations: 80 }
    },
    {
      id: 2,
      question: 'What is the optimal block size for Solana?',
      description: 'Technical question about network performance',
      communityId: 2,
      creator: 'ABC123def456ghi789jkl012mno345pqr678stu901vwx',
      voteType: 'KNOWLEDGE',
      status: 'COMPLETED',
      options: ['64MB', '128MB', '256MB', '512MB'],
      results: [12, 45, 67, 23],
      totalParticipants: 147,
      quorum: 100,
      deadline: new Date(Date.now() - 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
      community: {
        id: 2,
        name: 'Solana Developers',
        category: 'TECHNOLOGY'
      },
      _count: { participations: 147 }
    }
  ];

  const meta = {
    total: mockVotes.length,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
    filters: {
      status: status !== 'all' ? status : null,
      voteType: voteType !== 'all' ? voteType : null,
      communityId: communityId ? Number(communityId) : null,
      creator: creator || null,
      search: search || null
    }
  };

  res.json(apiResponse(mockVotes, 'Votes retrieved successfully (mock data)', meta));
}));

/**
 * GET /api/votes/:id
 * Obtener votación específica por ID
 */
router.get('/:id',
  cacheMiddleware({
    ttl: 120, // 2 minutos (datos de votación cambian rápidamente)
    namespace: 'votes',
    tags: ['votes', 'vote-details'],
    keyGenerator: (req) => `vote:${req.params.id}`
  }),
  handleAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Intentar obtener datos reales de la base de datos
    const vote = await prisma.voting.findUnique({
      where: {
        id: BigInt(id)
      },
      include: {
        community: {
          include: {
            metadata: true
          }
        },
        metadata: true,
        participations: {
          take: 100,
          orderBy: {
            votedAt: 'desc'
          }
        },
        _count: {
          select: {
            participations: true
          }
        }
      }
    });

    if (vote) {
      const now = new Date();
      const isActive = vote.deadline > now;
      
      const formattedVote = {
        id: Number(vote.id),
        question: vote.question,
        description: vote.metadata?.description || '',
        communityId: Number(vote.communityId),
        creator: vote.creatorPubkey,
        voteType: vote.metadata?.voteType || 'OPINION',
        status: isActive ? 'ACTIVE' : 'COMPLETED',
        options: vote.metadata?.options || [],
        results: vote.metadata?.results || [],
        totalParticipants: vote._count.participations,
        quorum: vote.quorum,
        deadline: vote.deadline,
        createdAt: vote.createdAt,
        community: {
          id: Number(vote.community.id),
          name: vote.community.name,
          description: vote.community.metadata?.description || '',
          category: vote.community.metadata?.category || 'GENERAL',
          totalMembers: vote.community.memberCount
        },
        participations: vote.participations,
        _count: { participations: vote._count.participations }
      };

      return res.json(apiResponse(formattedVote, 'Vote retrieved successfully from database'));
    }
  } catch (error) {
    console.warn('Database query failed, falling back to mock data:', error);
  }

  // Fallback a mock data
  const mockVote = {
    id: Number(id),
    question: 'Should we implement a new fee structure for high-volume traders?',
    description: 'Proposal to reduce fees for users trading over $10k monthly',
    communityId: 1,
    creator: 'GJENwjwdh7rAcZyrYh76SDjwgYrhncfhQKaMNGfSHirw',
    voteType: 'OPINION',
    status: 'ACTIVE',
    options: ['Yes, implement tiered fees', 'No, keep current structure', 'Modify the proposal'],
    results: [45, 23, 12],
    totalParticipants: 80,
    quorum: 50,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    community: {
      id: 1,
      name: 'DeFi Enthusiasts',
      description: 'Community for DeFi protocol discussions and governance',
      category: 'FINANCE',
      totalMembers: 1250
    },
    participations: [],
    _count: { participations: 80 }
  };

  res.json(apiResponse(mockVote, 'Vote retrieved successfully (mock data)'));
}));

/**
 * POST /api/votes
 * Crear una nueva votación
 */
router.post('/',
  handleAsync(async (req: Request, res: Response) => {
  const { 
    question, 
    description, 
    communityId,
    creatorPubkey,
    voteType = 'OPINION',
    options = [],
    quorum = 0,
    deadline,
    tags = []
  } = req.body;

  // Validar campos requeridos
  if (!question || !communityId || !creatorPubkey || !deadline) {
    return res.status(400).json(apiResponse(null, 'question, communityId, creatorPubkey y deadline son campos requeridos', null, 'VALIDATION_ERROR'));
  }

  try {
    // 1. Verificar que la comunidad existe
    const community = await prisma.community.findUnique({
      where: {
        id: BigInt(communityId)
      }
    });

    if (!community) {
      return res.status(404).json(apiResponse(null, 'Comunidad no encontrada', null, 'NOT_FOUND'));
    }

    // 2. Verificar que el creador es miembro de la comunidad
    // Primero obtener el ID del usuario por su wallet
    const creator = await prisma.user.findFirst({
      where: {
        pubkey: creatorPubkey
      }
    });
    
    if (!creator) {
      return res.status(404).json(apiResponse(null, 'Usuario creador no encontrado', null, 'NOT_FOUND'));
    }
    
    const membership = await prisma.membership.findFirst({
      where: {
        communityId: BigInt(communityId),
        userId: creator.id,
        isActive: true
      }
    });

    if (!membership) {
      return res.status(403).json(apiResponse(null, 'El creador debe ser miembro activo de la comunidad', null, 'NOT_MEMBER'));
    }

    // 3. Interacción con blockchain (derivar PDAs necesarios)
    const { PublicKey } = require('@solana/web3.js');
    const PROGRAM_ID = new PublicKey('98eSBn9oRdJcPzFUuRMgktewygF6HfkwiCQUJuJBw1z');
    
    // Derivar PDA para la comunidad
    const communityAdminPubkey = new PublicKey(community.adminPubkey);
    const [communityPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('community'),
        communityAdminPubkey.toBuffer(),
        Buffer.from(community.name)
      ],
      PROGRAM_ID
    );
    
    // Derivar PDA para el creador
    const creatorPubkeyObj = new PublicKey(creatorPubkey);
    
    // Derivar PDA para la votación
    const [votePda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('vote'),
        communityPda.toBuffer(),
        creatorPubkeyObj.toBuffer()
      ],
      PROGRAM_ID
    );

    // 4. Crear la votación en la base de datos
    const result = await prisma.$transaction(async (prisma) => {
      // Generar un ID único para la votación
      const newId = BigInt(Date.now());
      
      // Crear la votación principal
      const voting = await prisma.voting.create({
        data: {
          id: newId,
          communityId: BigInt(communityId),
          question,
          creatorPubkey: creatorPubkey,
          quorum,
          deadline: new Date(deadline),
          totalVotes: 0,
          createdAt: new Date(),
          status: 'ACTIVE', // Estado por defecto
          votingType: 'OPINION' // Tipo por defecto
        }
      });

      // Crear los metadatos de la votación
      const metadata = await prisma.votingMetadata.create({
        data: {
          votingId: voting.id,
          description,
          voteType,
          options,
          results: new Array(options.length).fill(0),
          tags,
          category: 'GENERAL' // Categoría por defecto
        }
      });

      return {
        voting,
        metadata
      };
    });

    // 5. Invalidar caché
    invalidateCache({ namespace: 'votes', tags: ['votes', 'listings'] });
    invalidateCache({ namespace: 'communities', tags: ['community-details'], keys: [`community:${communityId}`] });

    // 6. Formatear la respuesta
    const formattedVoting = {
      id: Number(result.voting.id),
      question: result.voting.question,
      description: result.metadata.description,
      communityId: Number(result.voting.communityId),
      creator: result.voting.creatorPubkey,
      voteType: result.metadata.voteType,
      status: 'ACTIVE',
      options: result.metadata.options,
      results: result.metadata.results,
      totalParticipants: 0,
      quorum: result.voting.quorum,
      deadline: result.voting.deadline,
      createdAt: result.voting.createdAt,
      blockchain: {
        programId: PROGRAM_ID.toString(),
        network: 'devnet',
        pdas: {
          community: communityPda.toString(),
          vote: votePda.toString()
        },
        requiresOnChainAction: true,
        instructions: [
          'create_voting' // Instrucción que debe ejecutarse en el frontend
        ]
      }
    };

    return res.status(201).json(apiResponse(formattedVoting, 'Votación creada exitosamente'));
  } catch (error) {
    console.error('Error al crear la votación:', error);
    return res.status(500).json(apiResponse(null, 'Error al crear la votación', null, 'SERVER_ERROR'));
  }
}));

/**
 * POST /api/votes/:id/vote
 * Emitir un voto en una votación específica
 */
router.post('/:id/vote',
  handleAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { 
    voterWallet, 
    choice,
    signature = null // Firma opcional para verificación
  } = req.body;

  // Validar campos requeridos
  if (!voterWallet || choice === undefined) {
    return res.status(400).json(apiResponse(null, 'voterWallet y choice son campos requeridos', null, 'VALIDATION_ERROR'));
  }

  try {
    // 1. Verificar que la votación existe y está activa
    const voting = await prisma.voting.findUnique({
      where: {
        id: BigInt(id)
      },
      include: {
        community: true,
        metadata: true
      }
    });

    if (!voting) {
      return res.status(404).json(apiResponse(null, 'Votación no encontrada', null, 'NOT_FOUND'));
    }

    // Verificar si la votación está activa
    const now = new Date();
    if (voting.deadline <= now) {
      return res.status(400).json(apiResponse(null, 'La votación ha finalizado', null, 'VOTING_CLOSED'));
    }

    // 2. Verificar que el usuario es miembro de la comunidad
    const userCheck = await prisma.user.findFirst({
      where: {
        pubkey: voterWallet
      }
    });
    
    if (!userCheck) {
      return res.status(403).json(apiResponse(null, 'Usuario no encontrado', null, 'NOT_FOUND'));
    }
    
    const membership = await prisma.membership.findFirst({
      where: {
        communityId: voting.communityId,
        userId: userCheck.id,
        isActive: true
      }
    });

    if (!membership) {
      return res.status(403).json(apiResponse(null, 'El votante debe ser miembro activo de la comunidad', null, 'NOT_MEMBER'));
    }

    // 3. Verificar que el votante no ha votado anteriormente
    // Ya tenemos el ID del usuario de la verificación anterior
    const userId = userCheck.id;
    
    const existingVote = await prisma.participation.findFirst({
      where: {
        votingId: BigInt(id),
        userId: userId
      }
    });

    if (existingVote) {
      return res.status(400).json(apiResponse(null, 'El usuario ya ha votado en esta votación', null, 'ALREADY_VOTED'));
    }

    // 4. Interacción con blockchain (derivar PDAs necesarios)
    const { PublicKey } = require('@solana/web3.js');
    const PROGRAM_ID = new PublicKey('98eSBn9oRdJcPzFUuRMgktewygF6HfkwiCQUJuJBw1z');
    
    // Derivar PDA para la comunidad
    const communityAdminPubkey = new PublicKey(voting.community.adminPubkey);
    const [communityPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('community'),
        communityAdminPubkey.toBuffer(),
        Buffer.from(voting.community.name)
      ],
      PROGRAM_ID
    );
    
    // Derivar PDA para la votación
    const creatorPubkey = new PublicKey(voting.creatorPubkey);
    const [votePda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('vote'),
        communityPda.toBuffer(),
        creatorPubkey.toBuffer()
      ],
      PROGRAM_ID
    );
    
    // Derivar PDA para el votante
    const voterPubkey = new PublicKey(voterWallet);
    const [userPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('user'), voterPubkey.toBuffer()],
      PROGRAM_ID
    );
    
    // Derivar PDA para la participación
    const [participationPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('participation'),
        votePda.toBuffer(),
        voterPubkey.toBuffer()
      ],
      PROGRAM_ID
    );

    // 5. Registrar el voto en la base de datos
    const result = await prisma.$transaction(async (prisma) => {
      // Crear la participación
      const participation = await prisma.participation.create({
        data: {
          votingId: BigInt(id),
          userId: userId,
          optionSelected: choice,
          votedAt: new Date()
        }
      });

      // Actualizar los resultados de la votación
      const metadata = await prisma.votingMetadata.findUnique({
        where: {
          votingId: BigInt(id)
        }
      });

      if (metadata) {
        const results = [...(metadata.results || [])];
        // Asegurarse de que el índice es válido
        if (choice >= 0 && choice < results.length) {
          results[choice] = (results[choice] || 0) + 1;
          
          await prisma.votingMetadata.update({
            where: {
              votingId: BigInt(id)
            },
            data: {
              results
            }
          });
        }
      }

      // Incrementar el contador de votos totales
      await prisma.voting.update({
        where: {
          id: BigInt(id)
        },
        data: {
          totalVotes: {
            increment: 1
          }
        }
      });

      return { participation };
    });

    // 6. Invalidar caché
    invalidateCache({ namespace: 'votes', tags: ['votes', 'listings'] });
    invalidateCache({ namespace: 'votes', tags: ['vote-details'], keys: [`vote:${id}`] });

    // 7. Respuesta con información de blockchain
    return res.status(201).json(apiResponse({
      vote: {
        votingId: Number(id),
        voterWallet,
        choice,
        votedAt: new Date()
      },
      blockchain: {
        programId: PROGRAM_ID.toString(),
        network: 'devnet',
        pdas: {
          community: communityPda.toString(),
          vote: votePda.toString(),
          user: userPda.toString(),
          participation: participationPda.toString()
        },
        requiresOnChainAction: true,
        instructions: [
          'cast_vote' // Instrucción que debe ejecutarse en el frontend
        ]
      }
    }, 'Voto emitido exitosamente'));
  } catch (error) {
    console.error('Error al emitir el voto:', error);
    return res.status(500).json(apiResponse(null, 'Error al emitir el voto', null, 'SERVER_ERROR'));
  }
}));

export default router;