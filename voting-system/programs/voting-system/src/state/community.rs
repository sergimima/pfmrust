use anchor_lang::prelude::*;

#[account]
pub struct Community {
    pub authority: Pubkey,          // Creador/admin de la comunidad
    pub moderators: Vec<Pubkey>,    // Lista de moderadores (max 5)
    pub name: String,               // Nombre (max 50 chars)
    pub category: u8,               // Categoría (0-9)
    pub quorum_percentage: u8,      // % para quorum (1-100)
    pub total_members: u64,         // Contador de miembros
    pub total_votes: u64,           // Contador de votaciones
    pub fee_collected: u64,         // Total fees en lamports
    pub created_at: i64,            // Timestamp creación
    pub is_active: bool,            // Estado activo/inactivo
    pub bump: u8,                   // PDA bump
}

impl Community {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        4 + (32 * 5) + // moderators (max 5)
        4 + 50 + // name
        1 + // category
        1 + // quorum_percentage
        8 + // total_members
        8 + // total_votes
        8 + // fee_collected
        8 + // created_at
        1 + // is_active
        1; // bump
}
