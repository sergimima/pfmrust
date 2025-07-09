// Solana wallet and connection types
export interface WalletContextState {
  wallet: any;
  publicKey: any;
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export interface SolanaContextState {
  connection: any;
  network: string;
  programId: any;
  isConnected: boolean;
}

// User types
export interface User {
  id: string;
  wallet: string;
  reputation: number;
  level: number;
  totalVotesCast: number;
  totalCommunitiesJoined: number;
  totalVotesCreated: number;
  createdAt: string;
  updatedAt: string;
}

// Community types
export interface Community {
  id: string;
  name: string;
  description: string;
  authority: string;
  category: string;
  isActive: boolean;
  totalMembers: number;
  totalVotes: number;
  feesCollected: number;
  requiresApproval: boolean;
  createdAt: string;
  updatedAt: string;
  rules?: string;
  tags?: string[];
  website?: string;
  socialLinks?: {
    discord?: string;
    twitter?: string;
    [key: string]: string | undefined;
  };
}

// Vote types
export interface Vote {
  id: string;
  community: string;
  creator: string;
  question: string;
  options: string[];
  voteType: 'Opinion' | 'Knowledge';
  deadline: string;
  quorum: number;
  status: 'Active' | 'Completed' | 'Failed';
  results: number[];
  totalParticipants: number;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
}

// Component props
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}
