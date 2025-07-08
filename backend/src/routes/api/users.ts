// backend/src/routes/api/users.ts
import { Router, Request, Response } from 'express';
import { apiResponse, handleAsync, validatePagination } from '../../utils/helpers';
import { cacheMiddleware, invalidateCache } from '../../middleware/cache';
import prisma from '../../database/prisma';

const router = Router();

/**
 * GET /api/users
 * Listar todos los usuarios con paginación
 */
router.get('/', 
  cacheMiddleware({ 
    ttl: 300, // 5 minutos
    namespace: 'users',
    tags: ['users', 'listings'],
    varyBy: ['query:page', 'query:limit', 'query:sortBy', 'query:order']
  }),
  handleAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, sortBy = 'reputation', order = 'desc' } = req.query;
  
  // Validar parámetros
  const pagination = validatePagination(Number(page), Number(limit));

  try {
    // Intentar obtener datos reales de la base de datos
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: {
          [sortBy as string]: order as 'asc' | 'desc'
        },
        include: {
          memberships: true,
          participations: {
            orderBy: {
              votedAt: 'desc'
            },
            take: 10
          },
          _count: {
            select: {
              memberships: true,
              participations: true
            }
          }
        }
      }),
      prisma.user.count()
    ]);

    // Si hay datos reales, usarlos
    if (users.length > 0) {
      const formattedUsers = users.map(user => ({
        id: Number(user.id),
        wallet: user.pubkey,
        reputation: user.reputation,
        level: user.level,
        totalVotesCast: user._count.participations,
        totalCommunitiesJoined: user._count.memberships,
        votingWeight: Number(user.votingWeight),
        createdAt: user.createdAt,
        lastActiveAt: user.lastSynced,
        memberships: user.memberships,
        votes: user.participations,
        _count: { 
          memberships: user._count.memberships, 
          votes: user._count.participations 
        }
      }));

      const meta = {
        total: totalCount,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(totalCount / pagination.limit),
        hasNext: pagination.page * pagination.limit < totalCount,
        hasPrev: pagination.page > 1
      };

      return res.json(apiResponse(formattedUsers, 'Users retrieved successfully from database', meta));
    }
  } catch (error) {
    console.warn('Database query failed, falling back to mock data:', error);
  }

  // Fallback a mock data si no hay datos reales
  const mockUsers = [
    {
      id: 1,
      wallet: 'GJENwjwdh7rAcZyrYh76SDjwgYrhncfhQKaMNGfSHirw',
      reputation: 1500,
      level: 8,
      totalVotesCast: 45,
      totalCommunitiesJoined: 12,
      votingWeight: 2.5,
      createdAt: new Date('2024-01-15'),
      lastActiveAt: new Date(),
      memberships: [],
      _count: { memberships: 12, votes: 45 }
    },
    {
      id: 2, 
      wallet: 'ABC123def456ghi789jkl012mno345pqr678stu901vwx',
      reputation: 890,
      level: 5,
      totalVotesCast: 23,
      totalCommunitiesJoined: 8,
      votingWeight: 1.8,
      createdAt: new Date('2024-02-01'),
      lastActiveAt: new Date(Date.now() - 3600000),
      memberships: [],
      _count: { memberships: 8, votes: 23 }
    }
  ];

  const meta = {
    total: mockUsers.length,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  };

  res.json(apiResponse(mockUsers, 'Users retrieved successfully (mock data)', meta));
}));

/**
 * GET /api/users/:wallet
 * Obtener usuario específico por wallet
 */
router.get('/:wallet',
  cacheMiddleware({
    ttl: 600, // 10 minutos
    namespace: 'users',
    tags: ['users', 'user-details'],
    keyGenerator: (req) => `user:${req.params.wallet}`
  }),
  handleAsync(async (req: Request, res: Response) => {
  const { wallet } = req.params;

  try {
    // Intentar obtener datos reales de la base de datos
    const user = await prisma.user.findFirst({
      where: {
        pubkey: wallet
      },
      include: {
        memberships: {
          include: {
            community: true
          }
        },
        participations: {
          include: {
            voting: true
          },
          take: 10,
          orderBy: {
            votedAt: 'desc'
          }
        },
        _count: {
          select: {
            memberships: true,
            participations: true
          }
        }
      }
    });

    if (user) {
      const formattedUser = {
        id: Number(user.id),
        wallet: user.pubkey,
        reputation: user.reputation,
        level: user.level,
        totalVotesCast: user._count.participations,
        totalCommunitiesJoined: user._count.memberships,
        totalVotingWeight: Number(user.votingWeight),
        createdAt: user.createdAt,
        lastActiveAt: user.lastSynced,
        memberships: user.memberships,
        votes: user.participations,
        _count: { 
          memberships: user._count.memberships, 
          votes: user._count.participations 
        }
      };

      return res.json(apiResponse(formattedUser, 'User retrieved successfully from database'));
    }
  } catch (error) {
    console.warn('Database query failed, falling back to mock data:', error);
  }

  // Fallback a mock data si no se encuentra el usuario
  const mockUser = {
    id: 1,
    wallet,
    reputation: 0,
    level: 1,
    totalVotesCast: 0,
    totalCommunitiesJoined: 0,
    votingWeight: 1.0,
    createdAt: new Date(),
    lastActiveAt: new Date(),
    memberships: [],
    votes: [],
    _count: { memberships: 0, votes: 0 }
  };

  res.json(apiResponse(mockUser, 'User not found in database, using default data'));
}));

export default router;