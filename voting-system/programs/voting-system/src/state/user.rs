use anchor_lang::prelude::*;

#[account]
pub struct User {
    pub wallet: Pubkey,              // Wallet del usuario
    pub reputation_points: u64,      // Puntos de reputación
    pub level: u32,                  // Nivel del usuario
    pub total_votes_cast: u64,       // Total de votos emitidos
    pub created_at: i64,             // Timestamp creación
    pub bump: u8,                    // PDA bump
}

impl User {
    pub const LEN: usize = 8 + // discriminator
        32 + // wallet
        8 + // reputation_points
        4 + // level
        8 + // total_votes_cast
        8 + // created_at
        1; // bump
}
