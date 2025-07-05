// backend/src/routes/api/users.ts
import { Router, Request, Response } from 'express';
import { apiResponse, handleAsync, validatePagination } from '../../utils/helpers';
import { cacheMiddleware, invalidateCache } from '../../middleware/cache';

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

  // Mock data por ahora - será reemplazado cuando Prisma esté configurado
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

  res.json(apiResponse(mockUsers, 'Users retrieved successfully', meta));
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

  // Mock data por ahora
  const mockUser = {
    id: 1,
    wallet,
    reputation: 1500,
    level: 8,
    totalVotesCast: 45,
    totalCommunitiesJoined: 12,
    votingWeight: 2.5,
    createdAt: new Date('2024-01-15'),
    lastActiveAt: new Date(),
    memberships: [],
    votes: [],
    _count: { memberships: 12, votes: 45 }
  };

  res.json(apiResponse(mockUser, 'User retrieved successfully'));
}));

export default router;