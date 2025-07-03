use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug, Copy)]
pub enum FeeTier {
    Basic,      // 0.01 SOL - usuarios normales
    Premium,    // 0.005 SOL - usuarios con alta reputación (1000+ puntos)
    VIP,        // 0.002 SOL - usuarios VIP (5000+ puntos)
    Free,       // 0 SOL - moderadores y admins
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug, Copy)]
pub enum CommunityTier {
    Public,     // 0.1 SOL - comunidades públicas
    Private,    // 0.2 SOL - comunidades privadas
    Premium,    // 0.5 SOL - comunidades premium con features extra
}

impl FeeTier {
    pub fn get_voting_fee(&self) -> u64 {
        match self {
            FeeTier::Basic => 10_000_000,   // 0.01 SOL
            FeeTier::Premium => 5_000_000,  // 0.005 SOL
            FeeTier::VIP => 2_000_000,      // 0.002 SOL
            FeeTier::Free => 0,             // 0 SOL
        }
    }
    
    pub fn from_reputation(reputation_points: u64) -> Self {
        if reputation_points >= 5000 {
            FeeTier::VIP
        } else if reputation_points >= 1000 {
            FeeTier::Premium
        } else {
            FeeTier::Basic
        }
    }
}

impl CommunityTier {
    pub fn get_creation_fee(&self) -> u64 {
        match self {
            CommunityTier::Public => 100_000_000,   // 0.1 SOL
            CommunityTier::Private => 200_000_000,  // 0.2 SOL  
            CommunityTier::Premium => 500_000_000,  // 0.5 SOL
        }
    }
}

#[account]
pub struct FeePool {
    pub total_collected: u64,      // Total fees recolectadas
    pub daily_distribution: u64,   // Para distribución diaria (5%)
    pub last_distribution: i64,    // Timestamp última distribución
    pub bump: u8,
}

impl FeePool {
    pub const LEN: usize = 8 + // discriminator
        8 + // total_collected
        8 + // daily_distribution  
        8 + // last_distribution
        1;  // bump
    
    pub fn calculate_daily_distribution(&self) -> u64 {
        (self.total_collected * 5) / 100  // 5% del total
    }
    
    pub fn should_distribute(&self) -> bool {
        let current_time = Clock::get().unwrap().unix_timestamp;
        current_time >= self.last_distribution + 86400 // 24 horas
    }
}

// Account para registro de recompensas por usuario
#[account]
pub struct RewardRecord {
    pub user: Pubkey,              // Usuario
    pub total_claimed: u64,        // Total reclamado histórico
    pub last_claimed: i64,         // Timestamp última reclamación
    pub claims_count: u32,         // Número de reclamaciones
    pub bump: u8,                  // PDA bump
}

impl RewardRecord {
    pub const LEN: usize = 8 + // discriminator
        32 + // user
        8 +  // total_claimed
        8 +  // last_claimed
        4 +  // claims_count
        1;   // bump
}
