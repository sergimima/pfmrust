use anchor_lang::prelude::*;

/// Program Derived Addresses (PDAs) documentation and utilities
/// 
/// This module contains the PDA definitions and helper functions
/// for deriving addresses in the voting system program.

/// Community PDA seeds and derivation
pub mod community {
    use super::*;
    
    pub const SEED_PREFIX: &[u8] = b"community";
    
    /// Derives a Community PDA address
    /// Seeds: [b"community", authority_pubkey, community_name_bytes]
    pub fn derive_address(authority: &Pubkey, name: &str, program_id: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(
            &[SEED_PREFIX, authority.as_ref(), name.as_bytes()],
            program_id,
        )
    }
}

/// Vote PDA seeds and derivation
pub mod vote {
    use super::*;
    
    pub const SEED_PREFIX: &[u8] = b"vote";
    
    /// Derives a Vote PDA address
    /// Seeds: [b"vote", community_pubkey, creator_pubkey, timestamp_bytes]
    pub fn derive_address(
        community: &Pubkey,
        creator: &Pubkey,
        timestamp: i64,
        program_id: &Pubkey,
    ) -> (Pubkey, u8) {
        Pubkey::find_program_address(
            &[
                SEED_PREFIX,
                community.as_ref(),
                creator.as_ref(),
                &timestamp.to_le_bytes(),
            ],
            program_id,
        )
    }
}

/// User PDA seeds and derivation
pub mod user {
    use super::*;
    
    pub const SEED_PREFIX: &[u8] = b"user";
    
    /// Derives a User PDA address
    /// Seeds: [b"user", wallet_pubkey]
    pub fn derive_address(wallet: &Pubkey, program_id: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(&[SEED_PREFIX, wallet.as_ref()], program_id)
    }
}

/// Fee Pool PDA for collecting and distributing fees
pub mod fee_pool {
    use super::*;
    
    pub const SEED_PREFIX: &[u8] = b"fee_pool";
    
    /// Derives the global Fee Pool PDA address
    /// Seeds: [b"fee_pool"]
    pub fn derive_address(program_id: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(&[SEED_PREFIX], program_id)
    }
}

/// Community Membership PDA for tracking user memberships
pub mod membership {
    use super::*;
    
    pub const SEED_PREFIX: &[u8] = b"membership";
    
    /// Derives a Membership PDA address
    /// Seeds: [b"membership", community_pubkey, user_pubkey]
    pub fn derive_address(
        community: &Pubkey,
        user: &Pubkey,
        program_id: &Pubkey,
    ) -> (Pubkey, u8) {
        Pubkey::find_program_address(
            &[SEED_PREFIX, community.as_ref(), user.as_ref()],
            program_id,
        )
    }
}

/// Vote Participation PDA for tracking individual votes
pub mod participation {
    use super::*;
    
    pub const SEED_PREFIX: &[u8] = b"participation";
    
    /// Derives a Vote Participation PDA address
    /// Seeds: [b"participation", vote_pubkey, user_pubkey]
    pub fn derive_address(vote: &Pubkey, user: &Pubkey, program_id: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(
            &[SEED_PREFIX, vote.as_ref(), user.as_ref()],
            program_id,
        )
    }
}
