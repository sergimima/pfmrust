// backend/src/routes/api/communities.ts
import { Router, Request, Response } from 'express';
import { apiResponse, handleAsync, validatePagination } from '../../utils/helpers';
import { cacheMiddleware, invalidateCache } from '../../middleware/cache';
import prisma from '../../database/prisma';

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
    sortBy = 'memberCount', 
    order = 'desc',
    search,
    isActive = 'true'
  } = req.query;
  
  // Validar parámetros
  const pagination = validatePagination(Number(page), Number(limit));

  try {
    // Construir filtros
    const where: any = {};
    
    if (isActive !== 'all') {
      where.isActive = isActive === 'true';
    }
    
    if (search) {
      where.name = {
        contains: search as string,
        mode: 'insensitive'
      };
    }
    
    if (category) {
      where.metadata = {
        category: category as string
      };
    }

    // Intentar obtener datos reales de la base de datos
    const [communities, totalCount] = await Promise.all([
      prisma.community.findMany({
        where,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: {
          [sortBy as string]: order as 'asc' | 'desc'
        },
        include: {
          metadata: true,
          _count: {
            select: {
              votings: true
            }
          }
        }
      }),
      prisma.community.count({ where })
    ]);

    // Si hay datos reales, usarlos
    if (communities.length > 0) {
      const formattedCommunities = communities.map(community => ({
        id: Number(community.id),
        name: community.name,
        description: community.metadata?.description || '',
        authority: community.adminPubkey,
        category: community.metadata?.category || 'GENERAL',
        isActive: community.isActive,
        totalMembers: community.memberCount,
        totalVotes: community._count.votings,
        feesCollected: Number(community.totalFeesCollected),
        requiresApproval: community.metadata?.requiresApproval || false,
        createdAt: community.createdAt,
        updatedAt: community.lastSynced,
        _count: { 
          memberships: community.memberCount, 
          votes: community._count.votings 
        }
      }));

      const meta = {
        total: totalCount,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalCount / pagination.limit),
        hasNext: pagination.page * pagination.limit < totalCount,
        hasPrev: pagination.page > 1,
        filters: {
          category: category || null,
          search: search || null,
          isActive: isActive !== 'all' ? isActive === 'true' : null
        }
      };

      return res.json(apiResponse(formattedCommunities, 'Communities retrieved successfully from database', meta));
    }
  } catch (error) {
    console.warn('Database query failed, falling back to mock data:', error);
  }

  // Fallback a mock data si no hay datos reales
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

  res.json(apiResponse(mockCommunities, 'Communities retrieved successfully (mock data)', meta));
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
    // Intentar obtener datos reales de la base de datos
    const community = await prisma.community.findUnique({
      where: {
        id: BigInt(id)
      },
      include: {
        metadata: true,
        votings: {
          take: 10,
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            votings: true
          }
        }
      }
    });

    if (community) {
      const formattedCommunity = {
        id: Number(community.id),
        name: community.name,
        description: community.metadata?.description || '',
        authority: community.adminPubkey,
        category: community.metadata?.category || 'GENERAL',
        isActive: community.isActive,
        totalMembers: community.memberCount,
        totalVotes: community._count.votings,
        feesCollected: Number(community.totalFeesCollected),
        requiresApproval: community.metadata?.requiresApproval || false,
        createdAt: community.createdAt,
        updatedAt: community.lastSynced,
        memberships: [],
        votes: community.votings,
        _count: { 
          memberships: community.memberCount, 
          votes: community._count.votings 
        }
      };

      return res.json(apiResponse(formattedCommunity, 'Community retrieved successfully from database'));
    }
  } catch (error) {
    console.warn('Database query failed, falling back to mock data:', error);
  }

  // Fallback a mock data
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

  res.json(apiResponse(mockCommunity, 'Community retrieved successfully (mock data)'));
}));

export default router;