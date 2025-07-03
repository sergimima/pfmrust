pub mod user;
pub mod community;
pub mod vote;
pub mod membership;
pub mod participation;
pub mod fees;
pub mod moderation;
pub mod reports; // Habilitado de nuevo
pub mod categories;

pub use user::*;
pub use community::*;
pub use vote::*;
pub use membership::*;
pub use participation::*;
pub use fees::*;
pub use moderation::*;
pub use categories::*;
// pub use reports::*; // Solo importar específicamente para evitar conflictos
