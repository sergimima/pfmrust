use anchor_lang::prelude::*;

/// User roles within a community
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum UserRole {
    /// Regular community member
    Member,
    /// Community moderator with extended permissions
    Moderator,
    /// Community administrator with full control
    Admin,
}

/// Community categories for organization
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum CommunityCategory {
    Technology = 0,
    Finance = 1,
    Gaming = 2,
    Art = 3,
    Education = 4,
    Sports = 5,
    Music = 6,
    Politics = 7,
    Science = 8,
    General = 9,
}

impl From<u8> for CommunityCategory {
    fn from(value: u8) -> Self {
        match value {
            0 => CommunityCategory::Technology,
            1 => CommunityCategory::Finance,
            2 => CommunityCategory::Gaming,
            3 => CommunityCategory::Art,
            4 => CommunityCategory::Education,
            5 => CommunityCategory::Sports,
            6 => CommunityCategory::Music,
            7 => CommunityCategory::Politics,
            8 => CommunityCategory::Science,
            _ => CommunityCategory::General,
        }
    }
}

/// Community status
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum CommunityStatus {
    /// Community is active and accepting new members/votes
    Active,
    /// Community is paused (no new votes, but existing ones can complete)
    Paused,
    /// Community is archived (read-only)
    Archived,
    /// Community is banned/suspended
    Suspended,
}

/// User status within the platform
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum UserStatus {
    /// User is active and can participate
    Active,
    /// User is temporarily suspended
    Suspended,
    /// User is permanently banned
    Banned,
    /// User account is under review
    UnderReview,
}

/// Membership status within a community
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum MembershipStatus {
    /// Membership request is pending approval
    Pending,
    /// User is an active member
    Active,
    /// User has left the community
    Left,
    /// User was removed/kicked from community
    Removed,
}

/// Quorum configuration types
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum QuorumType {
    /// No quorum requirement (simple majority of voters)
    None,
    /// Percentage of total community members
    Percentage(u8),
    /// Absolute number of participants required
    Absolute(u64),
}

/// Fee tier for different operations
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum FeeTier {
    /// Free operations (for special cases)
    Free,
    /// Standard fee tier
    Standard,
    /// Premium operations with higher fees
    Premium,
}

impl FeeTier {
    /// Get the fee amount in lamports for voting
    pub fn voting_fee(&self) -> u64 {
        match self {
            FeeTier::Free => 0,
            FeeTier::Standard => 10_000_000,  // 0.01 SOL
            FeeTier::Premium => 50_000_000,   // 0.05 SOL
        }
    }
    
    /// Get the fee amount in lamports for community creation
    pub fn community_fee(&self) -> u64 {
        match self {
            FeeTier::Free => 0,
            FeeTier::Standard => 100_000_000, // 0.1 SOL
            FeeTier::Premium => 500_000_000,  // 0.5 SOL
        }
    }
}
