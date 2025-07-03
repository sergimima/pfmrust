use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug, Copy)]
pub enum VoteType {
    Opinion,    // Sin respuesta correcta
    Knowledge,  // Con respuesta correcta
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug, Copy)]
pub enum VoteStatus {
    Active,
    Completed,
    Cancelled,
    Failed,         // Votación fallida por quorum
    AwaitingReveal, // Esperando revelación de respuesta
    ConfidenceVoting, // Votación de confianza activa
}

#[account]
pub struct Vote {
    pub community: Pubkey,          // Referencia a comunidad
    pub creator: Pubkey,            // Quien creó la votación
    pub question: String,           // Pregunta (max 200 chars)
    pub vote_type: VoteType,        // Opinión | Conocimiento
    pub options: Vec<String>,       // Opciones de respuesta (max 4)
    pub correct_answer: Option<u8>, // Para tipo Conocimiento
    pub participants: Vec<Pubkey>,  // Lista de votantes (max 100)
    pub results: Vec<u64>,          // Conteo por opción
    pub total_votes: u64,           // Total de votos
    pub quorum_required: u64,       // Quorum necesario (absoluto)
    pub quorum_percentage: Option<u8>, // Quorum por porcentaje (0-100)
    pub use_percentage_quorum: bool, // Si usar quorum por porcentaje
    pub deadline: i64,              // Timestamp límite
    pub status: VoteStatus,         // Active | Completed | Cancelled | Failed
    pub fee_per_vote: u64,          // Fee en lamports (0.01 SOL)
    pub created_at: i64,
    // Campos para sistema commit-reveal (2.4.3-2.4.6)
    pub answer_hash: Option<[u8; 32]>,     // Hash respuesta oculta
    pub revealed_answer: Option<String>,   // Respuesta revelada
    pub reveal_deadline: Option<i64>,      // Deadline para revelar
    pub confidence_votes_for: u32,         // Votos confianza a favor
    pub confidence_votes_against: u32,     // Votos confianza contra
    pub confidence_deadline: Option<i64>,  // Deadline votación confianza
    pub weighted_voting_enabled: bool,     // TAREA 2.5.7: Votación ponderada opcional
    pub weighted_results: Vec<f32>,         // Resultados ponderados por reputación
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
        1 + 1 + // quorum_percentage (Option<u8>)
        1 + // use_percentage_quorum
        8 + // deadline
        1 + // status
        8 + // fee_per_vote
        8 + // created_at
        // Campos commit-reveal
        1 + 32 + // answer_hash (Option<[u8; 32]>)
        1 + 4 + 200 + // revealed_answer (Option<String>)
        1 + 8 + // reveal_deadline (Option<i64>)
        4 + // confidence_votes_for
        4 + // confidence_votes_against
        1 + 8 + // confidence_deadline (Option<i64>)
        1 + // weighted_voting_enabled
        4 + (4 * 4) + // weighted_results (Vec<f32>, max 4)
        1; // bump
    
    // Método para calcular quorum dinámico
    pub fn calculate_required_quorum(&self, total_members: u64) -> u64 {
        if self.use_percentage_quorum {
            if let Some(percentage) = self.quorum_percentage {
                // Calcular quorum por porcentaje de miembros totales
                let quorum_by_percentage = (total_members * percentage as u64) / 100;
                // Mínimo 1 voto requerido
                std::cmp::max(1, quorum_by_percentage)
            } else {
                self.quorum_required
            }
        } else {
            self.quorum_required
        }
    }
    
    // Verificar si se ha alcanzado el quorum
    pub fn has_reached_quorum(&self, total_members: u64) -> bool {
        self.total_votes >= self.calculate_required_quorum(total_members)
    }
    
    // Verificar si la votación ha expirado
    pub fn is_expired(&self, current_timestamp: i64) -> bool {
        current_timestamp >= self.deadline
    }
    
    // Verificar si la votación falló por quorum
    pub fn should_fail_for_quorum(&self, total_members: u64, current_timestamp: i64) -> bool {
        self.is_expired(current_timestamp) && !self.has_reached_quorum(total_members)
    }
}
