use anchor_lang::prelude::*;
use crate::state::User;

#[derive(Accounts)]
pub struct CreateUser<'info> {
    #[account(
        init,
        seeds = [b"user", wallet.key().as_ref()],
        bump,
        space = 8 + User::LEN,
        payer = wallet
    )]
    pub user: Account<'info, User>,
    
    #[account(mut)]
    pub wallet: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}
