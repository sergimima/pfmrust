// backend/src/routes/api/votes.ts
import { Router, Request, Response } from 'express';
import { apiResponse, handleAsync, validatePagination } from '../../utils/helpers';
import { cacheMiddleware, invalidateCache } from '../../middleware/cache';

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
    // Mock data por ahora
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

    res.json(apiResponse(mockVotes, 'Votes retrieved successfully', meta));

  } catch (error) {
    console.error('Error fetching votes:', error);
    res.status(500).json(apiResponse(null, 'Error fetching votes', null, 'FETCH_ERROR'));
  }
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
    // Mock data por ahora
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

    res.json(apiResponse(mockVote, 'Vote retrieved successfully'));

  } catch (error) {
    console.error('Error fetching vote:', error);
    res.status(500).json(apiResponse(null, 'Error fetching vote', null, 'FETCH_ERROR'));
  }
}));

export default router;