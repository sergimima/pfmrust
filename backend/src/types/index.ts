// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// Community types
export interface Community {
  id: string;
  name: string;
  adminPubkey: string;
  memberCount: number;
  votingFee: string;
  totalFeesCollected: string;
  isActive: boolean;
  createdAt: string;
  lastSynced: string;
}

export interface CommunityMetadata {
  description?: string;
  rules?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  tags: string[];
}

// Voting types
export interface Voting {
  id: string;
  communityId: string;
  title: string;
  creatorPubkey: string;
  deadline: string;
  totalVotes: number;
  status: 'ACTIVE' | 'CLOSED' | 'FAILED';
  votingType: 'OPINION' | 'KNOWLEDGE';
  quorumEnabled: boolean;
  quorumThreshold?: number;
  createdAt: string;
  lastSynced: string;
}

export interface VotingMetadata {
  description?: string;
  category: string;
  tags: string[];
  creatorNotes?: string;
  featured: boolean;
  viewCount: number;
  shareCount: number;
}

// User types
export interface UserReputation {
  userPubkey: string;
  participationPoints: number;
  creationPoints: number;
  accuracyPoints: number;
  trustPoints: number;
  totalScore: number;
  votingWeight: number;
  lastUpdated: string;
}

// Blockchain event types
export interface BlockchainEvent {
  type: 'community_created' | 'voting_created' | 'vote_cast' | 'user_created';
  signature: string;
  blockTime: number;
  data: any;
}

// Cache keys
export const CACHE_KEYS = {
  COMMUNITY: (id: string) => `community:${id}`,
  VOTING: (id: string) => `voting:${id}`,
  USER_REPUTATION: (pubkey: string) => `user:reputation:${pubkey}`,
  LEADERBOARD_GLOBAL: 'leaderboard:global',
  LEADERBOARD_COMMUNITY: (id: string) => `leaderboard:community:${id}`,
  DAILY_STATS: (date: string) => `stats:daily:${date}`,
} as const;

// Event listener types
export interface EventListener {
  type: string;
  handler: (event: BlockchainEvent) => Promise<void>;
  isActive: boolean;
}
