use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
#[instruction(name: String, category: u8, quorum_percentage: u8, requires_approval: bool)]
pub struct CreateCommunity<'info> {
    #[account(
        init,
        seeds = [b"community", authority.key().as_ref(), name.as_bytes()],
        bump,
        space = 8 + Community::LEN,
        payer = authority
    )]
    pub community: Account<'info, Community>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn create_community(
    ctx: Context<CreateCommunity>,
    name: String,
    category: u8,
    quorum_percentage: u8,
    requires_approval: bool,
) -> Result<()> {
    require!(name.len() <= 50, VotingSystemError::NameTooLong);
    require!(quorum_percentage > 0 && quorum_percentage <= 100, VotingSystemError::InvalidQuorum);
    
    let community = &mut ctx.accounts.community;
    let clock = Clock::get()?;
    
    community.authority = ctx.accounts.authority.key();
    community.moderators = Vec::new();
    community.name = name;
    community.category = category;
    community.quorum_percentage = quorum_percentage;
    community.total_members = 0;
    community.total_votes = 0;
    community.fee_collected = 0;
    community.created_at = clock.unix_timestamp;
    community.is_active = true;
    community.requires_approval = requires_approval;
    community.bump = ctx.bumps.community;
    
    msg!("Community '{}' created by {}", community.name, community.authority);
    
    Ok(())
}
