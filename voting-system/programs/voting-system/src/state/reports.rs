use anchor_lang::prelude::*;
use crate::state::moderation::{ReportType, ReportStatus};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug, Copy)]
pub enum AppealStatus {
    Pending,    // Pendiente de revisión
    Approved,   // Appeal aprobado - ban removido
    Denied,     // Appeal denegado - ban mantenido
}

#[account]
pub struct Report {
    pub reporter: Pubkey,           // Usuario que reporta
    pub target_vote: Pubkey,        // Votación reportada
    pub community: Pubkey,          // Comunidad donde ocurre
    pub report_type: ReportType,    // Tipo de reporte
    pub reason: String,             // Razón detallada (max 300 chars)
    pub status: ReportStatus,       // Estado del reporte
    pub reviewed_by: Option<Pubkey>, // Moderador que revisó
    pub reported_at: i64,           // Timestamp del reporte
    pub reviewed_at: Option<i64>,   // Timestamp de revisión
    pub bump: u8,
}

impl Report {
    pub const LEN: usize = 8 + // discriminator
        32 + // reporter
        32 + // target_vote
        32 + // community
        1 +  // report_type
        4 + 300 + // reason (String)
        1 +  // status
        1 + 32 + // reviewed_by (Option<Pubkey>)
        8 +  // reported_at
        1 + 8 + // reviewed_at (Option<i64>)
        1;   // bump
}

#[account]
pub struct ReportCounter {
    pub target_vote: Pubkey,        // Votación reportada
    pub community: Pubkey,          // Comunidad
    pub total_reports: u32,         // Total de reportes
    pub spam_count: u32,            // Reportes de spam
    pub offensive_count: u32,       // Reportes ofensivos
    pub off_topic_count: u32,       // Reportes fuera de tema
    pub misinformation_count: u32,  // Reportes desinformación
    pub harassment_count: u32,      // Reportes de acoso
    pub inappropriate_count: u32,   // Reportes inapropiados
    pub copyright_count: u32,       // Reportes de copyright
    pub other_count: u32,           // Otros reportes
    pub auto_action_triggered: bool, // Si se activó acción automática
    pub last_reported_at: i64,      // Último reporte
    pub bump: u8,
}

impl ReportCounter {
    pub const LEN: usize = 8 + // discriminator
        32 + // target_vote
        32 + // community
        4 +  // total_reports
        4 +  // spam_count
        4 +  // offensive_count
        4 +  // off_topic_count
        4 +  // misinformation_count
        4 +  // harassment_count
        4 +  // inappropriate_count
        4 +  // copyright_count
        4 +  // other_count
        1 +  // auto_action_triggered
        8 +  // last_reported_at
        1;   // bump

    pub fn should_trigger_auto_action(&self) -> bool {
        // Acción automática si:
        // - 5+ reportes en total, O
        // - 3+ reportes del mismo tipo, O
        // - 2+ reportes de ofensivo/inapropiado/acoso
        self.total_reports >= 5 ||
        self.spam_count >= 3 ||
        self.off_topic_count >= 3 ||
        self.misinformation_count >= 3 ||
        self.offensive_count >= 2 ||
        self.harassment_count >= 2 ||
        self.inappropriate_count >= 2 ||
        self.copyright_count >= 3
    }

    pub fn increment_report(&mut self, report_type: ReportType) {
        self.total_reports += 1;
        match report_type {
            ReportType::Spam => self.spam_count += 1,
            ReportType::Offensive => self.offensive_count += 1,
            ReportType::OffTopic => self.off_topic_count += 1,
            ReportType::Misinformation => self.misinformation_count += 1,
            ReportType::Harassment => self.harassment_count += 1,
            ReportType::Inappropriate => self.inappropriate_count += 1,
            ReportType::Copyright => self.copyright_count += 1,
            ReportType::Other => self.other_count += 1,
        }
    }
}

#[account]
pub struct Appeal {
    pub appellant: Pubkey,          // Usuario que apela
    pub ban_record: Pubkey,         // Registro de ban al que se apela
    pub community: Pubkey,          // Comunidad
    pub reason: String,             // Razón del appeal (max 500 chars)
    pub status: AppealStatus,       // Estado del appeal
    pub reviewed_by: Option<Pubkey>, // Admin que revisó
    pub appealed_at: i64,           // Timestamp del appeal
    pub reviewed_at: Option<i64>,   // Timestamp de revisión
    pub bump: u8,
}

impl Appeal {
    pub const LEN: usize = 8 + // discriminator
        32 + // appellant
        32 + // ban_record
        32 + // community
        4 + 500 + // reason (String)
        1 +  // status
        1 + 32 + // reviewed_by (Option<Pubkey>)
        8 +  // appealed_at
        1 + 8 + // reviewed_at (Option<i64>)
        1;   // bump
}
