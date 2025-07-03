use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum VoteType {
    Opinion,    // Sin respuesta correcta
    Knowledge,  // Con respuesta correcta
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum VoteStatus {
    Active,
    Completed,
    Cancelled,
}

#[account]
pub struct Vote {
    pub community: Pubkey,          // Referencia a comunidad
    pub creator: Pubkey,            // Quien creó la votación
    pub question: String,           // Pregunta (max 200 chars)
    pub vote_type: VoteType,        // Opinión | Conocimiento
    pub options: Vec<String>,       // Opciones de respuesta (max 4)
    pub correct_answer: Option<u8>, // Para tipo Conocimiento
    pub participants: Vec<Pubkey>,  // Lista de votantes
    pub results: Vec<u64>,          // Conteo por opción
    pub total_votes: u64,           // Total de votos
    pub quorum_required: u64,       // Quorum necesario
    pub deadline: i64,              // Timestamp límite
    pub status: VoteStatus,         // Active | Completed | Cancelled
    pub fee_per_vote: u64,          // Fee en lamports (0.01 SOL)
    pub created_at: i64,
    pub bump: u8,
}

impl Vote {
    pub const LEN: usize = 8 + // discriminator
        32 + // community
        32 + // creator
        4 + 200 + // question
        1 + // vote_type
        4 + (4 + 50) * 4 + // options (max 4, 50 chars each)
        1 + 1 + // correct_answer (Option<u8>)
        4 + (32 * 100) + // participants (max 100)
        4 + (8 * 4) + // results (max 4)
        8 + // total_votes
        8 + // quorum_required
        8 + // deadline
        1 + // status
        8 + // fee_per_vote
        8 + // created_at
        1; // bump
}
