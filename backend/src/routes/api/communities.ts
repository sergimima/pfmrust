// backend/src/routes/api/communities.ts
import { Router, Request, Response } from 'express';
import { apiResponse, handleAsync, validatePagination } from '../../utils/helpers';
import { cacheMiddleware, invalidateCache } from '../../middleware/cache';

const router = Router();

/**
 * GET /api/communities
 * Listar todas las comunidades con filtros
 */
router.get('/', 
  cacheMiddleware({ 
    ttl: 300, // 5 minutos
    namespace: 'communities',
    tags: ['communities', 'listings'],
    varyBy: ['query:page', 'query:limit', 'query:category', 'query:sortBy', 'query:order', 'query:search', 'query:isActive']
  }),
  handleAsync(async (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 20, 
    category, 
    sortBy = 'totalMembers', 
    order = 'desc',
    search,
    isActive = 'true'
  } = req.query;
  
  // Validar parámetros
  const pagination = validatePagination(Number(page), Number(limit));

  try {
    // Mock data por ahora
    const mockCommunities = [
      {
        id: 1,
        name: 'DeFi Enthusiasts',
        description: 'Community for DeFi protocol discussions and governance',
        authority: 'GJENwjwdh7rAcZyrYh76SDjwgYrhncfhQKaMNGfSHirw',
        category: 'FINANCE',
        isActive: true,
        totalMembers: 1250,
        totalVotes: 89,
        feesCollected: 125000,
        requiresApproval: false,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date(),
        _count: { memberships: 1250, votes: 89 }
      },
      {
        id: 2,
        name: 'Solana Developers',
        description: 'Technical discussions and proposals for Solana ecosystem',
        authority: 'ABC123def456ghi789jkl012mno345pqr678stu901vwx',
        category: 'TECHNOLOGY',
        isActive: true,
        totalMembers: 890,
        totalVotes: 156,
        feesCollected: 89000,
        requiresApproval: true,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date(),
        _count: { memberships: 890, votes: 156 }
      }
    ];

    const meta = {
      total: mockCommunities.length,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
      filters: {
        category: category || null,
        search: search || null,
        isActive: isActive !== 'all' ? isActive === 'true' : null
      }
    };

    res.json(apiResponse(mockCommunities, 'Communities retrieved successfully', meta));

  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json(apiResponse(null, 'Error fetching communities', null, 'FETCH_ERROR'));
  }
}));

/**
 * GET /api/communities/:id
 * Obtener comunidad específica por ID
 */
router.get('/:id',
  cacheMiddleware({
    ttl: 600, // 10 minutos
    namespace: 'communities',
    tags: ['communities', 'community-details'],
    keyGenerator: (req) => `community:${req.params.id}`
  }),
  handleAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Mock data por ahora
    const mockCommunity = {
      id: Number(id),
      name: 'DeFi Enthusiasts',
      description: 'Community for DeFi protocol discussions and governance',
      authority: 'GJENwjwdh7rAcZyrYh76SDjwgYrhncfhQKaMNGfSHirw',
      category: 'FINANCE',
      isActive: true,
      totalMembers: 1250,
      totalVotes: 89,
      feesCollected: 125000,
      requiresApproval: false,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date(),
      memberships: [],
      votes: [],
      _count: { memberships: 1250, votes: 89 }
    };

    res.json(apiResponse(mockCommunity, 'Community retrieved successfully'));

  } catch (error) {
    console.error('Error fetching community:', error);
    res.status(500).json(apiResponse(null, 'Error fetching community', null, 'FETCH_ERROR'));
  }
}));

export default router;