use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
#[instruction(question: String, _timestamp: i64)]
pub struct CreateVoting<'info> {
    #[account(
        init,
        seeds = [b"vote", community.key().as_ref(), creator.key().as_ref(), &_timestamp.to_le_bytes()],
        bump,
        space = 8 + Vote::LEN,
        payer = creator
    )]
    pub vote: Account<'info, Vote>,
    
    #[account(mut)]
    pub community: Account<'info, Community>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn create_voting(
    ctx: Context<CreateVoting>,
    question: String,
    options: Vec<String>,
    vote_type: VoteType,
    correct_answer: Option<u8>,
    deadline_hours: u32,
    quorum_required: u64,
    _timestamp: i64,
) -> Result<()> {
    require!(question.len() <= 200, VotingSystemError::QuestionTooLong);
    require!(options.len() >= 2 && options.len() <= 4, VotingSystemError::InvalidOptionsCount);
    require!(deadline_hours > 0 && deadline_hours <= 168, VotingSystemError::InvalidDeadline); // Max 1 week
    
    for option in &options {
        require!(option.len() <= 50, VotingSystemError::OptionTooLong);
    }
    
    if vote_type == VoteType::Knowledge {
        require!(correct_answer.is_some(), VotingSystemError::MissingCorrectAnswer);
        let answer = correct_answer.unwrap();
        require!((answer as usize) < options.len(), VotingSystemError::InvalidCorrectAnswer);
    }
    
    let vote = &mut ctx.accounts.vote;
    let community = &mut ctx.accounts.community;
    let clock = Clock::get()?;
    
    vote.community = community.key();
    vote.creator = ctx.accounts.creator.key();
    vote.question = question;
    vote.vote_type = vote_type;
    vote.options = options.clone();
    vote.correct_answer = correct_answer;
    vote.participants = Vec::new();
    vote.results = vec![0; options.len()];
    vote.total_votes = 0;
    vote.quorum_required = quorum_required;
    vote.deadline = clock.unix_timestamp + (deadline_hours as i64 * 3600);
    vote.status = VoteStatus::Active;
    vote.fee_per_vote = 10_000_000; // 0.01 SOL in lamports
    vote.created_at = clock.unix_timestamp;
    vote.bump = ctx.bumps.vote;
    
    // Update community stats
    community.total_votes += 1;
    
    msg!("Voting '{}' created in community {}", vote.question, community.name);
    
    Ok(())
}
