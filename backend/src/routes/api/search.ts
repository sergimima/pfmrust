// backend/src/routes/api/search.ts
import { Router, Request, Response } from 'express';
import { getCache, setCache } from '../../config/redis';
import { apiResponse, handleAsync, validatePagination } from '../../utils/helpers';

const router = Router();

/**
 * POST /api/search
 * Búsqueda global en el sistema
 */
router.post('/', handleAsync(async (req: Request, res: Response) => {
  const { 
    query, 
    types = ['users', 'communities', 'votes'], 
    filters = {},
    page = 1,
    limit = 20 
  } = req.body;

  if (!query || query.trim().length < 2) {
    return res.status(400).json(apiResponse(null, 'Query must be at least 2 characters long', null, 'INVALID_QUERY'));
  }

  // Validar parámetros
  const pagination = validatePagination(Number(page), Number(limit));

  try {
    // Mock search results por ahora
    const results: any = {
      query,
      total: 0,
      results: {}
    };

    // Mock usuarios encontrados
    if (types.includes('users')) {
      const mockUsers = [
        {
          id: 1,
          wallet: 'GJENwjwdh7rAcZyrYh76SDjwgYrhncfhQKaMNGfSHirw',
          reputation: 1500,
          level: 8,
          totalVotesCast: 45,
          lastActiveAt: new Date(),
          _count: { memberships: 12 }
        }
      ].filter(u => u.wallet.toLowerCase().includes(query.toLowerCase()));

      results.results.users = {
        count: mockUsers.length,
        items: mockUsers
      };
      results.total += mockUsers.length;
    }

    // Mock comunidades encontradas
    if (types.includes('communities')) {
      const mockCommunities = [
        {
          id: 1,
          name: 'DeFi Enthusiasts',
          description: 'Community for DeFi protocol discussions and governance',
          category: 'FINANCE',
          totalMembers: 1250,
          totalVotes: 89,
          createdAt: new Date('2024-01-10')
        },
        {
          id: 2,
          name: 'Solana Developers',
          description: 'Technical discussions and proposals for Solana ecosystem',
          category: 'TECHNOLOGY',
          totalMembers: 890,
          totalVotes: 156,
          createdAt: new Date('2024-01-20')
        }
      ].filter(c => 
        c.name.toLowerCase().includes(query.toLowerCase()) || 
        c.description.toLowerCase().includes(query.toLowerCase())
      );

      results.results.communities = {
        count: mockCommunities.length,
        items: mockCommunities
      };
      results.total += mockCommunities.length;
    }

    // Mock votaciones encontradas
    if (types.includes('votes')) {
      const mockVotes = [
        {
          id: 1,
          question: 'Should we implement a new fee structure for high-volume traders?',
          description: 'Proposal to reduce fees for users trading over $10k monthly',
          voteType: 'OPINION',
          status: 'ACTIVE',
          totalParticipants: 80,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          community: {
            id: 1,
            name: 'DeFi Enthusiasts',
            category: 'FINANCE'
          }
        }
      ].filter(v => 
        v.question.toLowerCase().includes(query.toLowerCase()) || 
        v.description.toLowerCase().includes(query.toLowerCase())
      );

      results.results.votes = {
        count: mockVotes.length,
        items: mockVotes
      };
      results.total += mockVotes.length;
    }

    res.json(apiResponse(results, 'Search completed successfully'));

  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json(apiResponse(null, 'Error performing search', null, 'SEARCH_ERROR'));
  }
}));

/**
 * GET /api/search/suggestions
 * Obtener sugerencias de búsqueda
 */
router.get('/suggestions', handleAsync(async (req: Request, res: Response) => {
  const { q, type = 'all' } = req.query;

  if (!q || (q as string).length < 2) {
    return res.json(apiResponse([], 'Suggestions retrieved successfully'));
  }

  try {
    // Mock suggestions
    const suggestions = [
      {
        type: 'community',
        id: 1,
        title: 'DeFi Enthusiasts',
        subtitle: 'FINANCE • 1250 members',
        url: '/communities/1'
      },
      {
        type: 'user',
        id: 1,
        title: 'GJENwjwdh7rAcZyrYh76SDjwgYrhncfhQKaMNGfSHirw',
        subtitle: 'Level 8 • 1500 reputation',
        url: '/users/GJENwjwdh7rAcZyrYh76SDjwgYrhncfhQKaMNGfSHirw'
      },
      {
        type: 'vote',
        id: 1,
        title: 'Should we implement a new fee structure...',
        subtitle: 'DeFi Enthusiasts • ACTIVE',
        url: '/votes/1'
      }
    ].filter(s => s.title.toLowerCase().includes((q as string).toLowerCase()));

    res.json(apiResponse(suggestions, 'Suggestions retrieved successfully'));

  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json(apiResponse(null, 'Error fetching suggestions', null, 'SUGGESTIONS_ERROR'));
  }
}));

export default router;