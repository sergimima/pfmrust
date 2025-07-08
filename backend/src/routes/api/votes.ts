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

export default router;