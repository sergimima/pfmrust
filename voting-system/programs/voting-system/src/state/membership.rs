use anchor_lang::prelude::*;

// Enum para roles de usuario
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug, Copy)]
pub enum UserRole {
    Member,     // Miembro normal
    Moderator,  // Moderador
    Admin,      // Administrador
    Banned,     // Usuario baneado
}

// Enum para tipos de ban
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug, Copy)]
pub enum BanType {
    Temporary,  // Ban temporal
    Permanent,  // Ban permanente
}

// Enum para acciones de moderación
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug, Copy)]
pub enum ModerationAction {
    Ban,
    Unban,
    AssignModerator,
    RemoveModerator,
    CloseVote,
    ReviewReport,
    ReviewAppeal,
    // Añadidos de moderation.rs
    None,
    Warning,
    TempBan,
    PermaBan,
    RemoveContent,
    RestrictVoting,
    RemoveMember,    // Nueva acción para remover miembros
    ApproveMembership,  // Nueva acción para aprobar membresías
    RejectMembership,   // Nueva acción para rechazar membresías
}

// Enum para estados de solicitud de membresía
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug, Copy)]
pub enum MembershipRequestStatus {
    Pending,    // Solicitud pendiente
    Approved,   // Solicitud aprobada
    Rejected,   // Solicitud rechazada
    Cancelled,  // Solicitud cancelada por el usuario
}

#[account]
pub struct Membership {
    pub user: Pubkey,               // Usuario miembro
    pub community: Pubkey,          // Comunidad a la que pertenece
    pub role: UserRole,             // Rol del usuario en la comunidad
    pub joined_at: i64,             // Timestamp cuando se unió
    pub is_active: bool,            // Membresía activa/inactiva
    pub bump: u8,                   // PDA bump
}

impl Membership {
    pub const LEN: usize = 8 + // discriminator
        32 + // user
        32 + // community
        1 +  // role
        8 +  // joined_at
        1 +  // is_active
        1;   // bump
        
    pub fn is_moderator(&self) -> bool {
        matches!(self.role, UserRole::Moderator | UserRole::Admin)
    }
    
    pub fn is_admin(&self) -> bool {
        matches!(self.role, UserRole::Admin)
    }
    
    pub fn can_moderate(&self) -> bool {
        self.is_active && self.is_moderator() && self.role != UserRole::Banned
    }
}

// Account para registros de ban
#[account]
pub struct BanRecord {
    pub user: Pubkey,               // Usuario baneado
    pub community: Pubkey,          // Comunidad donde fue baneado
    pub moderator: Pubkey,          // Moderador que aplicó el ban
    pub ban_type: BanType,          // Tipo de ban
    pub reason: String,             // Razón del ban (max 200 chars)
    pub banned_at: i64,             // Timestamp del ban
    pub expires_at: Option<i64>,    // Timestamp de expiración (None si permanente)
    pub is_active: bool,            // Ban activo/inactivo
    pub bump: u8,                   // PDA bump
}

impl BanRecord {
    pub const LEN: usize = 8 + // discriminator
        32 + // user
        32 + // community
        32 + // moderator
        1 +  // ban_type
        4 + 200 + // reason (String)
        8 +  // banned_at
        1 + 8 + // expires_at (Option<i64>)
        1 +  // is_active
        1;   // bump
}

// Account para logs de moderación
#[account]
pub struct ModerationLog {
    pub community: Pubkey,          // Comunidad
    pub moderator: Pubkey,          // Moderador que realizó la acción
    pub target_user: Option<Pubkey>, // Usuario objetivo (si aplica)
    pub target_vote: Option<Pubkey>, // Votación objetivo (si aplica)
    pub action: ModerationAction,   // Acción realizada
    pub reason: String,             // Razón/notas (max 200 chars)
    pub executed_at: i64,           // Timestamp de ejecución
    pub bump: u8,                   // PDA bump
}

impl ModerationLog {
    pub const LEN: usize = 8 + // discriminator
        32 + // community
        32 + // moderator
        1 + 32 + // target_user (Option<Pubkey>)
        1 + 32 + // target_vote (Option<Pubkey>)
        1 +  // action
        4 + 200 + // reason (String)
        8 +  // executed_at
        1;   // bump
}

// Account para solicitudes de membresía
#[account]
pub struct MembershipRequest {
    pub user: Pubkey,               // Usuario que solicita unirse
    pub community: Pubkey,          // Comunidad a la que quiere unirse
    pub message: String,            // Mensaje opcional del usuario (max 300 chars)
    pub status: MembershipRequestStatus, // Estado de la solicitud
    pub requested_at: i64,          // Timestamp de la solicitud
    pub reviewed_by: Option<Pubkey>, // Admin que revisó la solicitud
    pub reviewed_at: Option<i64>,   // Timestamp de revisión
    pub admin_notes: String,        // Notas del admin (max 200 chars)
    pub bump: u8,                   // PDA bump
}

impl MembershipRequest {
    pub const LEN: usize = 8 + // discriminator
        32 + // user
        32 + // community
        4 + 300 + // message (String max 300 chars)
        1 +  // status
        8 +  // requested_at
        1 + 32 + // reviewed_by (Option<Pubkey>)
        1 + 8 +  // reviewed_at (Option<i64>)
        4 + 200 + // admin_notes (String max 200 chars)
        1;   // bump
}
