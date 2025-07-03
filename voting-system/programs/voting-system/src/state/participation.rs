use anchor_lang::prelude::*;

#[account]
pub struct Participation {
    pub user: Pubkey,               // Usuario que votó
    pub vote: Pubkey,               // Votación en la que participó
    pub option_selected: u8,        // Opción elegida (0-3)
    pub voted_at: i64,              // Timestamp del voto
    pub bump: u8,                   // PDA bump
}

impl Participation {
    pub const LEN: usize = 8 + // discriminator
        32 + // user
        32 + // vote
        1 + // option_selected
        8 + // voted_at
        1; // bump
}
