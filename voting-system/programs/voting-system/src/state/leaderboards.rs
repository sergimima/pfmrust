use anchor_lang::prelude::*;

// TAREA 2.6.1: GlobalLeaderboard Account
#[account]
pub struct GlobalLeaderboard {
    pub top_users: Vec<LeaderboardEntry>,    // Top 5 usuarios globales
    pub last_updated: i64,                   // Timestamp última actualización
    pub total_users: u64,                    // Total usuarios en el sistema
    pub total_reputation: u64,               // Suma total de reputación
    pub update_authority: Pubkey,            // Quien puede actualizar (admin)
    pub bump: u8,
}

// TAREA 2.6.2: CommunityLeaderboard Account
#[account]
pub struct CommunityLeaderboard {
    pub community: Pubkey,                   // Comunidad asociada
    pub top_users: Vec<LeaderboardEntry>,    // Top 3 usuarios de la comunidad
    pub last_updated: i64,                   // Timestamp última actualización
    pub total_votes_cast: u64,               // Total votos en la comunidad
    pub total_votations_created: u64,        // Total votaciones creadas
    pub most_active_user: Pubkey,            // Usuario más activo
    pub bump: u8,
}

// Entrada individual del leaderboard
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct LeaderboardEntry {
    pub user: Pubkey,                        // Usuario
    pub reputation_points: u64,              // Puntos de reputación
    pub level: u32,                          // Nivel del usuario
    pub voting_weight: f32,                  // Peso de voto actual
    pub total_votes_cast: u64,               // Total votos emitidos
    pub total_votations_created: u64,        // Total votaciones creadas
    pub rank: u8,                            // Posición en ranking (1-5 global, 1-3 community)
}

impl GlobalLeaderboard {
    pub const MAX_ENTRIES: usize = 5;        // Top 5 global
    
    pub const LEN: usize = 8 + // discriminator
        4 + (Self::MAX_ENTRIES * LeaderboardEntry::LEN) + // top_users
        8 + // last_updated
        8 + // total_users
        8 + // total_reputation
        32 + // update_authority
        1; // bump
    
    // Verificar si necesita actualización (cada 1 hora)
    pub fn needs_update(&self, current_timestamp: i64) -> bool {
        current_timestamp - self.last_updated >= 3600 // 1 hora
    }
    
    // Añadir o actualizar usuario en el ranking
    pub fn update_user_ranking(&mut self, user: Pubkey, entry: LeaderboardEntry) {
        // Buscar si el usuario ya está en el ranking
        if let Some(pos) = self.top_users.iter().position(|e| e.user == user) {
            self.top_users[pos] = entry;
        } else {
            self.top_users.push(entry);
        }
        
        // Ordenar por reputación (descendente) y mantener solo top 5
        self.top_users.sort_by(|a, b| b.reputation_points.cmp(&a.reputation_points));
        self.top_users.truncate(Self::MAX_ENTRIES);
        
        // Actualizar ranks
        for (i, entry) in self.top_users.iter_mut().enumerate() {
            entry.rank = (i + 1) as u8;
        }
    }
}

impl CommunityLeaderboard {
    pub const MAX_ENTRIES: usize = 3;        // Top 3 por comunidad
    
    pub const LEN: usize = 8 + // discriminator
        32 + // community
        4 + (Self::MAX_ENTRIES * LeaderboardEntry::LEN) + // top_users
        8 + // last_updated
        8 + // total_votes_cast
        8 + // total_votations_created
        32 + // most_active_user
        1; // bump
    
    // Verificar si necesita actualización (cada 30 minutos)
    pub fn needs_update(&self, current_timestamp: i64) -> bool {
        current_timestamp - self.last_updated >= 1800 // 30 minutos
    }
    
    // Añadir o actualizar usuario en el ranking comunitario
    pub fn update_user_ranking(&mut self, user: Pubkey, entry: LeaderboardEntry) {
        // Buscar si el usuario ya está en el ranking
        if let Some(pos) = self.top_users.iter().position(|e| e.user == user) {
            self.top_users[pos] = entry;
        } else {
            self.top_users.push(entry);
        }
        
        // Ordenar por total de votos emitidos (más activo) y mantener solo top 3
        self.top_users.sort_by(|a, b| b.total_votes_cast.cmp(&a.total_votes_cast));
        self.top_users.truncate(Self::MAX_ENTRIES);
        
        // Actualizar ranks
        for (i, entry) in self.top_users.iter_mut().enumerate() {
            entry.rank = (i + 1) as u8;
        }
        
        // Actualizar usuario más activo
        if let Some(top_user) = self.top_users.first() {
            self.most_active_user = top_user.user;
        }
    }
}

impl LeaderboardEntry {
    pub const LEN: usize = 
        32 + // user
        8 +  // reputation_points
        4 +  // level
        4 +  // voting_weight (f32)
        8 +  // total_votes_cast
        8 +  // total_votations_created
        1;   // rank
    
    // Crear entrada desde datos de usuario
    pub fn from_user_data(
        user: Pubkey,
        reputation_points: u64,
        level: u32,
        voting_weight: f32,
        total_votes_cast: u64,
        total_votations_created: u64,
    ) -> Self {
        Self {
            user,
            reputation_points,
            level,
            voting_weight,
            total_votes_cast,
            total_votations_created,
            rank: 0, // Se asigna después al ordenar
        }
    }
    
    // Calcular score combinado para ranking
    pub fn calculate_score(&self) -> u64 {
        // Score = reputación + votos * 0.1 + votaciones * 0.5
        self.reputation_points + 
        (self.total_votes_cast as f64 * 0.1) as u64 + 
        (self.total_votations_created as f64 * 0.5) as u64
    }
}
