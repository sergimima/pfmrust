use anchor_lang::prelude::*;

#[account]
pub struct User {
    pub wallet: Pubkey,              // Wallet del usuario
    pub reputation_points: u64,      // Puntos de reputación
    pub level: u32,                  // Nivel del usuario
    pub total_votes_cast: u64,       // Total de votos emitidos
    pub voting_weight: f32,          // TAREA 2.5.6: Peso de voto (1x-3x)
    pub created_at: i64,             // Timestamp creación
    pub bump: u8,                    // PDA bump
}

impl User {
    pub const LEN: usize = 8 + // discriminator
        32 + // wallet
        8 + // reputation_points
        4 + // level
        8 + // total_votes_cast
        4 + // voting_weight (f32)
        8 + // created_at
        1; // bump
    
    // TAREA 2.5.6: Cálculo automático de voting_weight (1x-3x)
    pub fn calculate_voting_weight(&self) -> f32 {
        match self.reputation_points {
            0..=49 => 1.0,      // Nivel 1-5: peso 1x
            50..=149 => 1.5,    // Nivel 6-15: peso 1.5x
            150..=299 => 2.0,   // Nivel 16-30: peso 2x
            300..=499 => 2.5,   // Nivel 31-50: peso 2.5x
            _ => 3.0,           // Nivel 51+: peso 3x máximo
        }
    }
    
    // Actualizar peso de voto automáticamente
    pub fn update_voting_weight(&mut self) {
        self.voting_weight = self.calculate_voting_weight();
    }
}
