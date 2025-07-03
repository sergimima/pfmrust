use anchor_lang::prelude::*;

// Enum para categorías de comunidades y votaciones
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug, Copy)]
pub enum VotingCategory {
    Technology,     // 0 - Tecnología
    Finance,        // 1 - Finanzas
    Gaming,         // 2 - Gaming
    Art,            // 3 - Arte
    Education,      // 4 - Educación
    Sports,         // 5 - Deportes
    Music,          // 6 - Música
    Politics,       // 7 - Política
    Science,        // 8 - Ciencia
    General,        // 9 - General
    Custom,         // 10 - Personalizada
}

impl VotingCategory {
    pub fn from_u8(value: u8) -> Option<Self> {
        match value {
            0 => Some(VotingCategory::Technology),
            1 => Some(VotingCategory::Finance),
            2 => Some(VotingCategory::Gaming),
            3 => Some(VotingCategory::Art),
            4 => Some(VotingCategory::Education),
            5 => Some(VotingCategory::Sports),
            6 => Some(VotingCategory::Music),
            7 => Some(VotingCategory::Politics),
            8 => Some(VotingCategory::Science),
            9 => Some(VotingCategory::General),
            10 => Some(VotingCategory::Custom),
            _ => None,
        }
    }
    
    pub fn to_u8(&self) -> u8 {
        match self {
            VotingCategory::Technology => 0,
            VotingCategory::Finance => 1,
            VotingCategory::Gaming => 2,
            VotingCategory::Art => 3,
            VotingCategory::Education => 4,
            VotingCategory::Sports => 5,
            VotingCategory::Music => 6,
            VotingCategory::Politics => 7,
            VotingCategory::Science => 8,
            VotingCategory::General => 9,
            VotingCategory::Custom => 10,
        }
    }
    
    pub fn name(&self) -> &str {
        match self {
            VotingCategory::Technology => "Technology",
            VotingCategory::Finance => "Finance",
            VotingCategory::Gaming => "Gaming",
            VotingCategory::Art => "Art",
            VotingCategory::Education => "Education",
            VotingCategory::Sports => "Sports",
            VotingCategory::Music => "Music",
            VotingCategory::Politics => "Politics",
            VotingCategory::Science => "Science",
            VotingCategory::General => "General",
            VotingCategory::Custom => "Custom",
        }
    }
    
    pub fn description(&self) -> &str {
        match self {
            VotingCategory::Technology => "Software, hardware, blockchain, AI, and tech innovations",
            VotingCategory::Finance => "DeFi, trading, investments, and financial topics",
            VotingCategory::Gaming => "Video games, esports, game development, and gaming culture",
            VotingCategory::Art => "Digital art, NFTs, creative projects, and artistic discussions",
            VotingCategory::Education => "Learning, courses, academic topics, and educational content",
            VotingCategory::Sports => "Traditional sports, fitness, competitions, and athletic events",
            VotingCategory::Music => "Music creation, artists, genres, and musical discussions",
            VotingCategory::Politics => "Governance, policy, political discussions, and civic topics",
            VotingCategory::Science => "Research, discoveries, scientific topics, and STEM fields",
            VotingCategory::General => "General discussions and miscellaneous topics",
            VotingCategory::Custom => "Custom categories defined by community admins",
        }
    }
    
    pub fn is_valid_category(value: u8) -> bool {
        value <= 10 // 0-10 son válidos
    }
}

// Account para categorías personalizadas
#[account]
pub struct CustomCategory {
    pub community: Pubkey,          // Comunidad que creó la categoría
    pub name: String,               // Nombre de la categoría (max 50 chars)
    pub description: String,        // Descripción (max 200 chars)
    pub color: String,              // Color hex para UI (max 7 chars "#RRGGBB")
    pub icon: String,               // Icono/emoji (max 10 chars)
    pub created_by: Pubkey,         // Admin que creó la categoría
    pub created_at: i64,            // Timestamp de creación
    pub is_active: bool,            // Categoría activa/inactiva
    pub usage_count: u64,           // Contador de uso
    pub bump: u8,                   // PDA bump
}

impl CustomCategory {
    pub const LEN: usize = 8 + // discriminator
        32 + // community
        4 + 50 + // name
        4 + 200 + // description
        4 + 7 + // color
        4 + 10 + // icon
        32 + // created_by
        8 + // created_at
        1 + // is_active
        8 + // usage_count
        1; // bump
}

// Account para suscripciones a categorías
#[account]
pub struct CategorySubscription {
    pub user: Pubkey,               // Usuario suscrito
    pub category: VotingCategory,   // Categoría suscrita
    pub community: Option<Pubkey>,  // Comunidad específica (None = global)
    pub subscribed_at: i64,         // Timestamp de suscripción
    pub is_active: bool,            // Suscripción activa
    pub notification_enabled: bool, // Notificaciones habilitadas
    pub bump: u8,                   // PDA bump
}

impl CategorySubscription {
    pub const LEN: usize = 8 + // discriminator
        32 + // user
        1 + // category
        1 + 32 + // community (Option<Pubkey>)
        8 + // subscribed_at
        1 + // is_active
        1 + // notification_enabled
        1; // bump
}
