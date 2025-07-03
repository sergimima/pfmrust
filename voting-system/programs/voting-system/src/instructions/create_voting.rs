use anchor_lang::prelude::*;
use solana_program::hash::hash;
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
    
    #[account(
        mut,
        constraint = creator_user.wallet == creator.key() @ VotingSystemError::InvalidUser
    )]
    pub creator_user: AccountLoader<'info, User>,
    
    pub system_program: Program<'info, System>,
}

pub fn create_voting(
    ctx: Context<CreateVoting>,
    question: String,
    options: Vec<String>,
    vote_type: VoteType,
    correct_answer: Option<u8>,
    answer_text: Option<String>,  // NUEVO: Texto de respuesta para hash
    weighted_voting_enabled: bool,  // TAREA 2.5.7: Sistema voto ponderado
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
        require!(answer_text.is_some(), VotingSystemError::MissingCorrectAnswer);
        let answer = correct_answer.unwrap();
        require!((answer as usize) < options.len(), VotingSystemError::InvalidCorrectAnswer);
    }
    
    let vote = &mut ctx.accounts.vote;
    let community = &mut ctx.accounts.community;
    let clock = Clock::get()?;
    
    vote.community = community.key();
    vote.creator = ctx.accounts.creator.key();
    vote.question = question.clone();
    vote.vote_type = vote_type;
    vote.options = options.clone();
    vote.correct_answer = correct_answer;
    vote.participants = Vec::new();
    vote.results = vec![0; options.len()];
    vote.total_votes = 0;
    vote.quorum_required = quorum_required;
    vote.quorum_percentage = None;
    vote.use_percentage_quorum = false;
    vote.deadline = clock.unix_timestamp + (deadline_hours as i64 * 3600);
    vote.status = VoteStatus::Active;
    vote.fee_per_vote = 10_000_000; // 0.01 SOL in lamports
    vote.created_at = clock.unix_timestamp;
    
    // TAREA 2.4.3: Sistema commit-reveal para Knowledge questions
    if vote_type == VoteType::Knowledge {
        let answer_text_str = answer_text.unwrap();
        vote.answer_hash = Some(hash(answer_text_str.as_bytes()).to_bytes());
        vote.revealed_answer = None;
        vote.reveal_deadline = Some(clock.unix_timestamp + (deadline_hours as i64 * 3600) + 86400); // 24h después del deadline
        vote.confidence_votes_for = 0;
        vote.confidence_votes_against = 0;
        vote.confidence_deadline = None;
        
        msg!("📝 Knowledge question created with commit-reveal system");
        msg!("Answer hash stored: {:?}", vote.answer_hash.unwrap()[..8].to_vec());
        msg!("Reveal deadline: {}", vote.reveal_deadline.unwrap());
    } else {
        vote.answer_hash = None;
        vote.revealed_answer = None;
        vote.reveal_deadline = None;
        vote.confidence_votes_for = 0;
        vote.confidence_votes_against = 0;
        vote.confidence_deadline = None;
    }
    
    vote.bump = ctx.bumps.vote;
    
    // TAREA 2.5.7: Inicializar sistema voto ponderado
    vote.weighted_voting_enabled = weighted_voting_enabled;
    vote.weighted_results = vec![0.0; options.len()];
    
    // Update community stats
    community.total_votes += 1;
    
    // TAREA 2.5.3: Puntos de creación (+5) para el creator
    let mut creator_user = ctx.accounts.creator_user.load_mut()?;
    creator_user.reputation_points += 5;
    
    // TAREA 2.5.6: Actualizar voting_weight automáticamente
    creator_user.update_voting_weight();
    
    // Actualizar nivel si es necesario
    let new_level = (creator_user.reputation_points / 10) + 1;
    if new_level as u32 > creator_user.level {
        creator_user.level = new_level as u32;
        msg!("🎆 ¡Nuevo nivel alcanzado: {}!", creator_user.level);
    }
    
    msg!("📈 Creator +5 reputación por crear votación (Total: {}, Peso: {}x)", 
         creator_user.reputation_points, creator_user.voting_weight);
    
    msg!("✅ {} voting '{}' created in community {}", 
         if vote_type == VoteType::Knowledge { "Knowledge" } else { "Opinion" },
         question, 
         community.name);
    msg!("Deadline: {}", vote.deadline);
    msg!("Options: {:?}", options);
    
    if weighted_voting_enabled {
        msg!("⚖️ Weighted voting ENABLED - votes count by reputation");
    } else {
        msg!("🗓️ Standard voting - one vote per user");
    }
    
    Ok(())
}
