use anchor_lang::prelude::*;
use crate::state::membership::ModerationAction;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug, Copy)]
pub enum ReportType {
    Spam,
    Offensive,
    OffTopic,
    Misinformation,
    Harassment,
    Inappropriate,
    Copyright,
    Other,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug, Copy)]
pub enum ReportStatus {
    Pending,
    UnderReview,
    Reviewed,
    Resolved,
    Dismissed,
    Escalated,
}

// Comentado para evitar duplicados - usar el de membership.rs
/*
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug, Copy)]
pub enum ModerationAction {
    None,
    Warning,
    TempBan,
    PermaBan,
    RemoveContent,
    RestrictVoting,
}
*/

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug, Copy)]
pub enum AppealStatus {
    Pending,
    UnderReview,
    Approved,
    Rejected,
}

// Account para reportes individuales
#[account]
pub struct Report {
    pub reporter: Pubkey,           // Quien reporta
    pub target_vote: Pubkey,        // Votación reportada
    pub target_user: Pubkey,        // Usuario reportado
    pub community: Pubkey,          // Comunidad donde ocurrió
    pub report_type: ReportType,    // Tipo de reporte
    pub status: ReportStatus,       // Estado del reporte
    pub description: String,        // Descripción del problema (max 200 chars)
    pub reported_at: i64,          // Timestamp del reporte
    pub reviewed_by: Option<Pubkey>, // Moderador que revisó (None si automático)
    pub reviewed_at: Option<i64>,   // Timestamp de revisión
    pub action_taken: ModerationAction, // Acción tomada
    pub bump: u8,                   // PDA bump
}

impl Report {
    pub const LEN: usize = 8 + // discriminator
        32 + // reporter
        32 + // target_vote
        32 + // target_user
        32 + // community
        1 +  // report_type
        1 +  // status
        4 + 200 + // description (Vec<u8> len + max 200 chars)
        8 +  // reported_at
        1 + 32 + // reviewed_by (Option<Pubkey>)
        1 + 8 +  // reviewed_at (Option<i64>)
        1 +  // action_taken
        1;   // bump
}

// Account para recopilación de reportes por votación
#[account]
pub struct ReportSummary {
    pub target_vote: Pubkey,        // Votación reportada
    pub community: Pubkey,          // Comunidad
    pub total_reports: u32,         // Total de reportes
    pub spam_reports: u16,          // Reportes de spam
    pub offensive_reports: u16,     // Reportes ofensivos
    pub offtopic_reports: u16,      // Reportes fuera de tema
    pub misinformation_reports: u16, // Reportes desinformación
    pub harassment_reports: u16,    // Reportes acoso
    pub inappropriate_reports: u16,  // Reportes inapropiados
    pub copyright_reports: u16,     // Reportes copyright
    pub other_reports: u16,         // Otros reportes
    pub is_escalated: bool,         // Si se escaló automáticamente
    pub escalated_at: Option<i64>,  // Timestamp de escalación
    pub action_taken: ModerationAction, // Acción final tomada
    pub bump: u8,                   // PDA bump
}

impl ReportSummary {
    pub const LEN: usize = 8 + // discriminator
        32 + // target_vote
        32 + // community
        4 +  // total_reports
        2 * 8 + // reportes por tipo
        1 +  // is_escalated
        1 + 8 + // escalated_at
        1 +  // action_taken
        1;   // bump
}

// Account para apelaciones de usuarios baneados
#[account]
pub struct Appeal {
    pub appellant: Pubkey,          // Usuario que apela
    pub community: Pubkey,          // Comunidad donde fue baneado
    pub original_action: ModerationAction, // Acción original
    pub reason: String,             // Razón de la apelación (max 300 chars)
    pub status: AppealStatus,       // Estado de la apelación
    pub submitted_at: i64,          // Timestamp de envío
    pub reviewed_by: Option<Pubkey>, // Moderador que revisó
    pub reviewed_at: Option<i64>,   // Timestamp de revisión
    pub moderator_notes: Option<String>, // Notas del moderador (max 200 chars)
    pub decision: Option<ModerationAction>, // Decisión final
    pub bump: u8,                   // PDA bump
}

impl Appeal {
    pub const LEN: usize = 8 + // discriminator
        32 + // appellant
        32 + // community
        1 +  // original_action
        4 + 300 + // reason
        1 +  // status
        8 +  // submitted_at
        1 + 32 + // reviewed_by
        1 + 8 +  // reviewed_at
        1 + 4 + 200 + // moderator_notes (Option<String>)
        1 + 1 + // decision (Option<ModerationAction>)
        1;   // bump
}
