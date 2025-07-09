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

/**
 * POST /api/communities
 * Crear una nueva comunidad
 */
router.post('/',
  handleAsync(async (req: Request, res: Response) => {
  const { 
    name, 
    description, 
    adminPubkey,
    category = 'GENERAL',
    requiresApproval = false,
    votingFee = 0,
    rules,
    tags = [],
    avatarUrl,
    bannerUrl,
    website,
    socialLinks
  } = req.body;

  // Validar campos requeridos
  if (!name || !adminPubkey) {
    return res.status(400).json(apiResponse(null, 'Nombre y adminPubkey son campos requeridos', null, 'VALIDATION_ERROR'));
  }

  try {
    // Crear la comunidad y sus metadatos en una transacción
    const result = await prisma.$transaction(async (prisma) => {
      // Generar un ID único para la comunidad (simulando un ID de blockchain)
      const newId = BigInt(Date.now());
      
      // Crear la comunidad principal
      const community = await prisma.community.create({
        data: {
          id: newId,
          name,
          adminPubkey,
          votingFee: BigInt(votingFee),
          isActive: true,
          memberCount: 1, // El creador es el primer miembro
        }
      });

      // Crear los metadatos de la comunidad
      const metadata = await prisma.communityMetadata.create({
        data: {
          communityId: community.id,
          description,
          category: category as string,
          requiresApproval: requiresApproval as unknown as boolean,
          rules,
          tags,
          avatarUrl,
          bannerUrl,
          website,
          socialLinks: socialLinks || {}
        }
      });

      // Invalidar la caché de comunidades
      invalidateCache({ namespace: 'communities', tags: ['communities', 'listings'] });

      // Devolver la comunidad creada con sus metadatos
      return {
        community,
        metadata
      };
    });

    // Formatear la respuesta
    const formattedCommunity = {
      id: Number(result.community.id),
      name: result.community.name,
      description: result.metadata.description || '',
      authority: result.community.adminPubkey,
      category: result.metadata.category || 'GENERAL',
      isActive: result.community.isActive,
      totalMembers: result.community.memberCount,
      totalVotes: 0,
      feesCollected: Number(result.community.totalFeesCollected),
      requiresApproval: result.metadata.requiresApproval as unknown as boolean,
      createdAt: result.community.createdAt,
      updatedAt: result.community.lastSynced,
      _count: { 
        memberships: result.community.memberCount, 
        votes: 0 
      }
    };

    return res.status(201).json(apiResponse(formattedCommunity, 'Comunidad creada exitosamente'));
  } catch (error) {
    console.error('Error al crear la comunidad:', error);
    return res.status(500).json(apiResponse(null, 'Error al crear la comunidad', null, 'SERVER_ERROR'));
  }
}));

/**
 * POST /api/communities/join
 * Unirse a una comunidad
 */
router.post('/join',
  handleAsync(async (req: Request, res: Response) => {
  const { 
    communityId, 
    userWallet,
    signature = null // Firma opcional para verificación
  } = req.body;

  // Validar campos requeridos
  if (!communityId || !userWallet) {
    return res.status(400).json(apiResponse(null, 'communityId y userWallet son campos requeridos', null, 'VALIDATION_ERROR'));
  }

  try {
    // 1. Verificar que la comunidad existe
    const community = await prisma.community.findUnique({
      where: {
        id: BigInt(communityId)
      },
      include: {
        metadata: true
      }
    });

    if (!community) {
      return res.status(404).json(apiResponse(null, 'Comunidad no encontrada', null, 'NOT_FOUND'));
    }

    // 2. Verificar si el usuario ya es miembro
    // Primero obtener el ID del usuario por su wallet
    const user = await prisma.user.findFirst({
      where: {
        pubkey: userWallet
      }
    });
    
    if (!user) {
      // Si el usuario no existe, crearlo
      const newUser = await prisma.user.create({
        data: {
          id: BigInt(Date.now()),
          pubkey: userWallet,
          lastSynced: new Date()
        }
      });
      
      console.log(`Usuario creado con ID: ${newUser.id}`);
    }
    
    const userId = user ? user.id : BigInt(Date.now());
    
    const existingMembership = await prisma.membership.findFirst({
      where: {
        communityId: BigInt(communityId),
        userId: userId
      }
    });

    if (existingMembership) {
      return res.status(400).json(apiResponse(null, 'El usuario ya es miembro de esta comunidad', null, 'ALREADY_MEMBER'));
    }

    // 3. Verificar si la comunidad requiere aprobación
    const requiresApproval = community.metadata?.requiresApproval || false;
    const isActive = !requiresApproval; // Si requiere aprobación, no está activo inicialmente

    // 4. Interacción con blockchain (derivar PDAs necesarios)
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
    
    // Derivar PDA para el usuario
    const userPubkey = new PublicKey(userWallet);
    const [userPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('user'), userPubkey.toBuffer()],
      PROGRAM_ID
    );
    
    // Derivar PDA para la membresía
    const [membershipPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('membership'),
        communityPda.toBuffer(),
        userPubkey.toBuffer()
      ],
      PROGRAM_ID
    );

    // 5. Crear la membresía en la base de datos
    const membership = await prisma.membership.create({
      data: {
        communityId: BigInt(communityId),
        userId: userId,
        isActive: isActive,
        joinedAt: new Date(),
        role: requiresApproval ? 'PENDING' : 'MEMBER'
      }
    });

    // 6. Actualizar el contador de miembros si la membresía es activa
    if (isActive) {
      await prisma.community.update({
        where: {
          id: BigInt(communityId)
        },
        data: {
          memberCount: {
            increment: 1
          }
        }
      });
    }

    // 7. Invalidar caché
    invalidateCache({ namespace: 'communities', tags: ['communities', 'listings'] });
    invalidateCache({ namespace: 'communities', tags: ['community-details'], keys: [`community:${communityId}`] });

    // 8. Respuesta con información de blockchain
    return res.status(201).json(apiResponse({
      membership: {
        id: Number(membership.id),
        communityId: Number(membership.communityId),
        userId: Number(membership.userId),
        isActive: membership.isActive,
        role: membership.role,
        joinedAt: membership.joinedAt
      },
      blockchain: {
        programId: PROGRAM_ID.toString(),
        network: 'devnet',
        pdas: {
          community: communityPda.toString(),
          user: userPda.toString(),
          membership: membershipPda.toString()
        },
        requiresOnChainAction: true,
        instructions: [
          'join_community' // Instrucción que debe ejecutarse en el frontend
        ]
      }
    }, requiresApproval ? 
       'Solicitud de membresía enviada. Pendiente de aprobación.' : 
       'Te has unido a la comunidad exitosamente.'));
  } catch (error) {
    console.error('Error al unirse a la comunidad:', error);
    return res.status(500).json(apiResponse(null, 'Error al unirse a la comunidad', null, 'SERVER_ERROR'));
  }
}));

/**
 * POST /api/communities/:id/members
 * Gestionar miembros de una comunidad (aprobar/rechazar solicitudes)
 */
router.post('/:id/members',
  handleAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { 
    adminWallet, // Wallet del administrador que realiza la acción
    userWallet, // Wallet del usuario a gestionar
    action, // 'APPROVE' o 'REJECT'
    role = 'MEMBER' // Rol a asignar si se aprueba
  } = req.body;

  // Validar campos requeridos
  if (!adminWallet || !userWallet || !action) {
    return res.status(400).json(apiResponse(null, 'adminWallet, userWallet y action son campos requeridos', null, 'VALIDATION_ERROR'));
  }

  // Validar acción
  if (!['APPROVE', 'REJECT'].includes(action)) {
    return res.status(400).json(apiResponse(null, 'La acción debe ser APPROVE o REJECT', null, 'VALIDATION_ERROR'));
  }

  try {
    // 1. Verificar que la comunidad existe
    const community = await prisma.community.findUnique({
      where: {
        id: BigInt(id)
      }
    });

    if (!community) {
      return res.status(404).json(apiResponse(null, 'Comunidad no encontrada', null, 'NOT_FOUND'));
    }

    // 2. Verificar que el admin es el administrador de la comunidad
    if (community.adminPubkey !== adminWallet) {
      return res.status(403).json(apiResponse(null, 'Solo el administrador de la comunidad puede gestionar miembros', null, 'NOT_AUTHORIZED'));
    }

    // 3. Verificar que existe una solicitud pendiente
    // Primero obtener el ID del usuario por su wallet
    const user = await prisma.user.findFirst({
      where: {
        pubkey: userWallet
      }
    });
    
    if (!user) {
      return res.status(404).json(apiResponse(null, 'Usuario no encontrado', null, 'NOT_FOUND'));
    }
    
    const membership = await prisma.membership.findFirst({
      where: {
        communityId: BigInt(id),
        userId: user.id,
        isActive: false,
        role: 'PENDING'
      }
    });

    if (!membership) {
      return res.status(404).json(apiResponse(null, 'No existe una solicitud pendiente para este usuario', null, 'NOT_FOUND'));
    }

    // 4. Interacción con blockchain (derivar PDAs necesarios)
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
    
    // Derivar PDA para el usuario
    const userPubkeyObj = new PublicKey(userWallet);
    const [userPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('user'), userPubkeyObj.toBuffer()],
      PROGRAM_ID
    );
    
    // Derivar PDA para la membresía
    const [membershipPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('membership'),
        communityPda.toBuffer(),
        userPubkeyObj.toBuffer()
      ],
      PROGRAM_ID
    );

    // 5. Actualizar la membresía según la acción
    if (action === 'APPROVE') {
      // Aprobar la membresía
      await prisma.$transaction(async (prisma) => {
        // Actualizar estado de la membresía
        await prisma.membership.update({
          where: {
            id: membership.id
          },
          data: {
            isActive: true,
            role: role
          }
        });

        // Incrementar contador de miembros
        await prisma.community.update({
          where: {
            id: BigInt(id)
          },
          data: {
            memberCount: {
              increment: 1
            }
          }
        });
      });

      // 6. Invalidar caché
      invalidateCache({ namespace: 'communities', tags: ['communities', 'listings'] });
      invalidateCache({ namespace: 'communities', tags: ['community-details'], keys: [`community:${id}`] });

      // 7. Respuesta con información de blockchain
      return res.status(200).json(apiResponse({
        membership: {
          id: Number(membership.id),
          communityId: Number(membership.communityId),
          userId: Number(membership.userId),
          isActive: true,
          role: role,
          joinedAt: membership.joinedAt
        },
        blockchain: {
          programId: PROGRAM_ID.toString(),
          network: 'devnet',
          pdas: {
            community: communityPda.toString(),
            user: userPda.toString(),
            membership: membershipPda.toString()
          },
          requiresOnChainAction: true,
          instructions: [
            'approve_membership' // Instrucción que debe ejecutarse en el frontend
          ]
        }
      }, 'Solicitud de membresía aprobada exitosamente'));
    } else {
      // Rechazar la membresía
      await prisma.membership.update({
        where: {
          id: membership.id
        },
        data: {
          role: 'REJECTED'
        }
      });

      // Invalidar caché
      invalidateCache({ namespace: 'communities', tags: ['communities', 'listings'] });
      invalidateCache({ namespace: 'communities', tags: ['community-details'], keys: [`community:${id}`] });

      return res.status(200).json(apiResponse({
        membership: {
          id: Number(membership.id),
          communityId: Number(membership.communityId),
          userId: Number(membership.userId),
          isActive: false,
          role: 'REJECTED',
          joinedAt: membership.joinedAt
        }
      }, 'Solicitud de membresía rechazada'));
    }
  } catch (error) {
    console.error('Error al gestionar la membresía:', error);
    return res.status(500).json(apiResponse(null, 'Error al gestionar la membresía', null, 'SERVER_ERROR'));
  }
}));

/**
 * DELETE /api/communities/:id/members/:userWallet
 * Eliminar un miembro de una comunidad
 */
router.delete('/:id/members/:userWallet',
  handleAsync(async (req: Request, res: Response) => {
  const { id, userWallet } = req.params;
  const { adminWallet } = req.body;

  // Validar campos requeridos
  if (!adminWallet) {
    return res.status(400).json(apiResponse(null, 'adminWallet es un campo requerido', null, 'VALIDATION_ERROR'));
  }

  try {
    // 1. Verificar que la comunidad existe
    const community = await prisma.community.findUnique({
      where: {
        id: BigInt(id)
      }
    });

    if (!community) {
      return res.status(404).json(apiResponse(null, 'Comunidad no encontrada', null, 'NOT_FOUND'));
    }

    // 2. Verificar que el admin es el administrador de la comunidad
    if (community.adminPubkey !== adminWallet) {
      return res.status(403).json(apiResponse(null, 'Solo el administrador de la comunidad puede eliminar miembros', null, 'NOT_AUTHORIZED'));
    }

    // 3. Verificar que el usuario es miembro activo
    // Primero obtener el ID del usuario por su wallet
    const user = await prisma.user.findFirst({
      where: {
        pubkey: userWallet
      }
    });
    
    if (!user) {
      return res.status(404).json(apiResponse(null, 'Usuario no encontrado', null, 'NOT_FOUND'));
    }
    
    const membership = await prisma.membership.findFirst({
      where: {
        communityId: BigInt(id),
        userId: user.id,
        isActive: true
      }
    });

    if (!membership) {
      return res.status(404).json(apiResponse(null, 'El usuario no es un miembro activo de esta comunidad', null, 'NOT_FOUND'));
    }

    // 4. Interacción con blockchain (derivar PDAs necesarios)
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
    
    // Derivar PDA para el usuario
    const userPubkeyObj = new PublicKey(userWallet);
    const [userPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('user'), userPubkeyObj.toBuffer()],
      PROGRAM_ID
    );
    
    // Derivar PDA para la membresía
    const [membershipPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('membership'),
        communityPda.toBuffer(),
        userPubkeyObj.toBuffer()
      ],
      PROGRAM_ID
    );

    // 5. Actualizar la membresía y el contador de miembros
    await prisma.$transaction(async (prisma) => {
      // Actualizar estado de la membresía a REMOVED
      await prisma.membership.update({
        where: {
          id: membership.id
        },
        data: {
          isActive: false,
          role: 'REMOVED'
        }
      });

      // Decrementar contador de miembros
      await prisma.community.update({
        where: {
          id: BigInt(id)
        },
        data: {
          memberCount: {
            decrement: 1
          }
        }
      });
    });

    // 6. Invalidar caché
    invalidateCache({ namespace: 'communities', tags: ['communities', 'listings'] });
    invalidateCache({ namespace: 'communities', tags: ['community-details'], keys: [`community:${id}`] });

    // 7. Respuesta con información de blockchain
    return res.status(200).json(apiResponse({
      membership: {
        id: Number(membership.id),
        communityId: Number(membership.communityId),
        userId: Number(membership.userId),
        isActive: false,
        role: 'REMOVED'
      },
      blockchain: {
        programId: PROGRAM_ID.toString(),
        network: 'devnet',
        pdas: {
          community: communityPda.toString(),
          user: userPda.toString(),
          membership: membershipPda.toString()
        },
        requiresOnChainAction: true,
        instructions: [
          'remove_member' // Instrucción que debe ejecutarse en el frontend
        ]
      }
    }, 'Miembro eliminado exitosamente'));
  } catch (error) {
    console.error('Error al eliminar el miembro:', error);
    return res.status(500).json(apiResponse(null, 'Error al eliminar el miembro', null, 'SERVER_ERROR'));
  }
}));

export default router;