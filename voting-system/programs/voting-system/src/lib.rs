use anchor_lang::prelude::*;

pub mod state;
pub mod errors;

use state::{User, Community, Vote, VoteType, VoteStatus, Membership, Participation, FeePool, FeeTier, RewardRecord};
use state::membership::{UserRole, BanRecord, BanType, ModerationLog, ModerationAction, MembershipRequest, MembershipRequestStatus};
use state::moderation::{ReportType, ReportStatus};
use state::reports::{Report, ReportCounter, Appeal, AppealStatus};
use state::categories::{VotingCategory, CustomCategory, CategorySubscription};
use errors::VotingSystemError;

declare_id!("98eSBn9oRdJcPzFUuRMgktewygF6HfkwiCQUJuJBw1z");

#[program]
pub mod voting_system {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
    
    // === FUNCIONES DEL SISTEMA DE CATEGORÍAS ===
    
    pub fn create_custom_category(
        ctx: Context<CreateCustomCategory>,
        name: String,
        description: String,
        color: String,
        icon: String,
    ) -> Result<()> {
        require!(name.len() <= 50, VotingSystemError::NameTooLong);
        require!(description.len() <= 200, VotingSystemError::DescriptionTooLong);
        require!(color.len() <= 7, VotingSystemError::ColorTooLong);
        require!(icon.len() <= 10, VotingSystemError::IconTooLong);
        
        let custom_category = &mut ctx.accounts.custom_category;
        let admin_membership = &ctx.accounts.admin_membership;
        let community = &ctx.accounts.community;
        let clock = Clock::get()?;
        
        // Solo admins pueden crear categorías personalizadas
        require!(admin_membership.is_admin(), VotingSystemError::InsufficientPermissions);
        
        // Inicializar categoría personalizada
        custom_category.community = community.key();
        custom_category.name = name.clone();
        custom_category.description = description.clone();
        custom_category.color = color.clone();
        custom_category.icon = icon.clone();
        custom_category.created_by = admin_membership.user;
        custom_category.created_at = clock.unix_timestamp;
        custom_category.is_active = true;
        custom_category.usage_count = 0;
        custom_category.bump = ctx.bumps.custom_category;
        
        msg!("🎨 Custom category created successfully!");
        msg!("Name: {}", name);
        msg!("Description: {}", description);
        msg!("Color: {}", color);
        msg!("Icon: {}", icon);
        msg!("Community: {}", community.name);
        msg!("Created by: {}", admin_membership.user);
        
        Ok(())
    }
    
    pub fn subscribe_to_category(
        ctx: Context<SubscribeToCategory>,
        category: VotingCategory,
        community: Option<Pubkey>,
        enable_notifications: bool,
    ) -> Result<()> {
        let subscription = &mut ctx.accounts.subscription;
        let user = &ctx.accounts.user;
        let clock = Clock::get()?;
        
        // Inicializar suscripción
        subscription.user = user.wallet;
        subscription.category = category;
        subscription.community = community;
        subscription.subscribed_at = clock.unix_timestamp;
        subscription.is_active = true;
        subscription.notification_enabled = enable_notifications;
        subscription.bump = ctx.bumps.subscription;
        
        msg!("📢 Subscribed to category successfully!");
        msg!("User: {}", user.wallet);
        msg!("Category: {:?}", category);
        if let Some(community_key) = community {
            msg!("Community: {}", community_key);
        } else {
            msg!("Global subscription");
        }
        msg!("Notifications: {}", enable_notifications);
        
        Ok(())
    }
    
    pub fn unsubscribe_from_category(
        ctx: Context<UnsubscribeFromCategory>,
    ) -> Result<()> {
        let subscription = &mut ctx.accounts.subscription;
        
        // Desactivar suscripción
        subscription.is_active = false;
        subscription.notification_enabled = false;
        
        msg!("🔕 Unsubscribed from category successfully!");
        msg!("User: {}", subscription.user);
        msg!("Category: {:?}", subscription.category);
        
        Ok(())
    }
    
    pub fn get_communities_by_category(
        ctx: Context<GetCommunitiesByCategory>,
        category: u8,
    ) -> Result<()> {
        let community = &ctx.accounts.community;
        
        // Validar categoría
        require!(VotingCategory::is_valid_category(category), VotingSystemError::InvalidCategory);
        
        // Verificar si la comunidad coincide con la categoría
        require!(community.category == category, VotingSystemError::CategoryMismatch);
        require!(community.is_active, VotingSystemError::CommunityInactive);
        
        msg!("🏷️ Community matches category filter!");
        msg!("Community: {}", community.name);
        msg!("Category: {} ({})", category, VotingCategory::from_u8(category).unwrap().name());
        msg!("Members: {}", community.total_members);
        msg!("Votes: {}", community.total_votes);
        
        Ok(())
    }
    
    pub fn report_content(
        ctx: Context<ReportContent>,
        report_type: ReportType,
        reason: String,
    ) -> Result<()> {
        require!(reason.len() <= 200, VotingSystemError::ReasonTooLong);
        
        let report = &mut ctx.accounts.report;
        let report_counter = &mut ctx.accounts.report_counter;
        let vote = &ctx.accounts.vote;
        let reporter_membership = &ctx.accounts.reporter_membership;
        let clock = Clock::get()?;
        
        // Validaciones
        require!(vote.creator != ctx.accounts.reporter.key(), VotingSystemError::CannotReportOwnContent);
        require!(reporter_membership.is_active, VotingSystemError::OnlyMembersCanReport);
        
        // Inicializar reporte
        report.target_vote = vote.key();
        report.community = vote.community;
        report.reporter = ctx.accounts.reporter.key();
        report.report_type = report_type;
        report.reason = reason.clone();
        report.status = ReportStatus::Pending;
        report.reported_at = clock.unix_timestamp;
        report.reviewed_at = None;
        report.reviewed_by = None;
        report.bump = ctx.bumps.report;
        
        // Actualizar contador
        if report_counter.target_vote != vote.key() {
            // Primera vez inicializando
            report_counter.target_vote = vote.key();
            report_counter.community = vote.community;
            report_counter.total_reports = 0;
            report_counter.spam_count = 0;
            report_counter.offensive_count = 0;
            report_counter.off_topic_count = 0;
            report_counter.misinformation_count = 0;
            report_counter.inappropriate_count = 0;
            report_counter.other_count = 0;
            report_counter.auto_action_triggered = false;
            report_counter.last_reported_at = clock.unix_timestamp;
            report_counter.bump = ctx.bumps.report_counter;
        }
        
        report_counter.total_reports += 1;
        
        // Incrementar contador específico
        match report_type {
            ReportType::Spam => report_counter.spam_count += 1,
            ReportType::Offensive => report_counter.offensive_count += 1,
            ReportType::OffTopic => report_counter.off_topic_count += 1,
            ReportType::Misinformation => report_counter.misinformation_count += 1,
            ReportType::Harassment => report_counter.inappropriate_count += 1, // Mapear a inappropriate
            ReportType::Inappropriate => report_counter.inappropriate_count += 1,
            ReportType::Copyright => report_counter.other_count += 1, // Mapear a other
            ReportType::Other => report_counter.other_count += 1,
        }
        
        msg!("📋 Content reported successfully!");
        msg!("Vote: {}", vote.key());
        msg!("Report type: {:?}", report_type);
        msg!("Reason: {}", reason);
        msg!("Reporter: {}", ctx.accounts.reporter.key());
        msg!("Total reports for this vote: {}", report_counter.total_reports);
        
        // TODO: Escalación automática si se alcanzan 5+ reportes
        if report_counter.total_reports >= 5 {
            msg!("⚠️ ALERT: Vote has 5+ reports - requires moderator review!");
        }
        
        Ok(())
    }
    
    pub fn review_report(
        ctx: Context<ReviewReport>,
        action: ModerationAction,
        notes: String,
    ) -> Result<()> {
        require!(notes.len() <= 200, VotingSystemError::NotesTooLong);
        
        let report = &mut ctx.accounts.report;
        let moderator_membership = &ctx.accounts.moderator_membership;
        let clock = Clock::get()?;
        
        // Validaciones
        require!(report.status == ReportStatus::Pending, VotingSystemError::ReportNotPending);
        require!(moderator_membership.can_moderate(), VotingSystemError::OnlyModeratorsCanReview);
        
        // Actualizar reporte
        report.status = ReportStatus::Reviewed;
        report.reviewed_at = Some(clock.unix_timestamp);
        report.reviewed_by = Some(moderator_membership.user);
        
        // Crear log de moderación
        let moderation_log = &mut ctx.accounts.moderation_log;
        moderation_log.community = report.community;
        moderation_log.moderator = moderator_membership.user;
        moderation_log.target_user = Some(report.reporter);
        moderation_log.target_vote = Some(report.target_vote);
        moderation_log.action = action;
        moderation_log.reason = notes.clone();
        moderation_log.executed_at = clock.unix_timestamp;
        moderation_log.bump = ctx.bumps.moderation_log;
        
        msg!("👨‍⚖️ Report reviewed successfully!");
        msg!("Report ID: {}", report.key());
        msg!("Action taken: {:?}", action);
        msg!("Moderator: {}", moderator_membership.user);
        msg!("Notes: {}", notes);
        
        Ok(())
    }
    
    pub fn appeal_ban(
        ctx: Context<AppealBan>,
        reason: String,
    ) -> Result<()> {
        require!(reason.len() <= 300, VotingSystemError::AppealReasonTooLong);
        
        let appeal = &mut ctx.accounts.appeal;
        let ban_record = &ctx.accounts.ban_record;
        let appellant_membership = &ctx.accounts.appellant_membership;
        let clock = Clock::get()?;
        
        // Validaciones
        require!(ban_record.is_active, VotingSystemError::BanNotActive);
        require!(ban_record.user == appellant_membership.user, VotingSystemError::InvalidUser);
        
        // Inicializar appeal
        appeal.appellant = ctx.accounts.appellant.key();
        appeal.ban_record = ban_record.key();
        appeal.community = ban_record.community;
        appeal.reason = reason.clone();
        appeal.status = AppealStatus::Pending;
        appeal.reviewed_by = None;
        appeal.appealed_at = clock.unix_timestamp;
        appeal.reviewed_at = None;
        appeal.bump = ctx.bumps.appeal;
        
        msg!("⚖️ Ban appeal submitted successfully!");
        msg!("Ban record: {}", ban_record.key());
        msg!("Appellant: {}", ctx.accounts.appellant.key());
        msg!("Reason: {}", reason);
        msg!("Community: {}", ban_record.community);
        
        Ok(())
    }
    
    pub fn review_appeal(
        ctx: Context<ReviewAppeal>,
        decision: AppealStatus,
        admin_notes: String,
    ) -> Result<()> {
        require!(admin_notes.len() <= 200, VotingSystemError::NotesTooLong);
        
        let appeal = &mut ctx.accounts.appeal;
        let ban_record = &mut ctx.accounts.ban_record;
        let membership = &mut ctx.accounts.membership;
        let admin_membership = &ctx.accounts.admin_membership;
        let clock = Clock::get()?;
        
        // Validaciones
        require!(admin_membership.is_admin(), VotingSystemError::InsufficientPermissions);
        require!(appeal.status == AppealStatus::Pending, VotingSystemError::AppealNotPending);
        
        // Actualizar appeal
        appeal.status = decision;
        appeal.reviewed_by = Some(admin_membership.user);
        appeal.reviewed_at = Some(clock.unix_timestamp);
        
        // Si se aprueba el appeal, remover el ban
        if decision == AppealStatus::Approved {
            ban_record.is_active = false;
            membership.role = UserRole::Member;
            membership.is_active = true;
            
            // Bonus de reputación por appeal exitoso
            // TODO: Actualizar user reputation +25 points
        }
        
        // Crear log de moderación
        let moderation_log = &mut ctx.accounts.moderation_log;
        moderation_log.community = appeal.community;
        moderation_log.moderator = admin_membership.user;
        moderation_log.target_user = Some(appeal.appellant);
        moderation_log.target_vote = None;
        moderation_log.action = ModerationAction::ReviewAppeal;
        moderation_log.reason = admin_notes.clone();
        moderation_log.executed_at = clock.unix_timestamp;
        moderation_log.bump = ctx.bumps.moderation_log;
        
        msg!("⚖️ Appeal reviewed successfully!");
        msg!("Appeal ID: {}", appeal.key());
        msg!("Decision: {:?}", decision);
        msg!("Admin: {}", admin_membership.user);
        msg!("Notes: {}", admin_notes);
        
        if decision == AppealStatus::Approved {
            msg!("🔓 Ban removed - user restored to Member status");
        } else if decision == AppealStatus::Denied {
            msg!("🚫 Appeal denied - ban remains active");
        }
        
        Ok(())
    }
    
    /*
    // FUNCIONES COMENTADAS TEMPORALMENTE - FALTAN ESTRUCTURAS CONTEXT
    
    pub fn close_voting(
        ctx: Context<CloseVoting>,
        reason: String,
    ) -> Result<()> {
        // ... código comentado
        Ok(())
    }

    pub fn report_content(
        ctx: Context<ReportContent>,
        report_type: ReportType,
        reason: String,
    ) -> Result<()> {
        // ... código comentado
        Ok(())
    }
    
    // ... otras funciones comentadas
    */

    pub fn assign_moderator(
        ctx: Context<AssignModerator>,
    ) -> Result<()> {
        let membership = &mut ctx.accounts.membership;
        let admin_membership = &ctx.accounts.admin_membership;
        let clock = Clock::get()?;
        
        // Solo admins pueden asignar moderadores
        require!(admin_membership.is_admin(), VotingSystemError::InsufficientPermissions);
        
        // No se puede asignar a usuarios baneados
        require!(membership.role != UserRole::Banned, VotingSystemError::UserBanned);
        
        membership.role = UserRole::Moderator;
        
        // Crear log de moderación
        let moderation_log = &mut ctx.accounts.moderation_log;
        moderation_log.community = membership.community;
        moderation_log.moderator = admin_membership.user;
        moderation_log.target_user = Some(membership.user);
        moderation_log.target_vote = None;
        moderation_log.action = ModerationAction::AssignModerator;
        moderation_log.reason = "Assigned moderator role".to_string();
        moderation_log.executed_at = clock.unix_timestamp;
        moderation_log.bump = ctx.bumps.moderation_log;
        
        msg!("✅ Moderator assigned successfully!");
        msg!("User: {}", membership.user);
        msg!("Community: {}", membership.community);
        msg!("Assigned by: {}", admin_membership.user);
        
        Ok(())
    }

    pub fn ban_user(
        ctx: Context<BanUser>,
        ban_type: BanType,
        reason: String,
        duration_hours: Option<u32>,
    ) -> Result<()> {
        require!(reason.len() <= 200, VotingSystemError::ReasonTooLong);
        
        let membership = &mut ctx.accounts.membership;
        let moderator_membership = &ctx.accounts.moderator_membership;
        let ban_record = &mut ctx.accounts.ban_record;
        let clock = Clock::get()?;
        
        // Solo moderadores y admins pueden banear
        require!(moderator_membership.can_moderate(), VotingSystemError::InsufficientPermissions);
        
        // No se puede banear a otros moderadores o admins
        require!(!membership.is_moderator(), VotingSystemError::CannotBanModerator);
        
        // Calcular fecha de expiración
        let expires_at = match ban_type {
            BanType::Temporary => {
                require!(duration_hours.is_some(), VotingSystemError::InvalidBanDuration);
                let hours = duration_hours.unwrap();
                require!(hours > 0 && hours <= 8760, VotingSystemError::InvalidBanDuration); // Max 1 año
                Some(clock.unix_timestamp + (hours as i64 * 3600))
            },
            BanType::Permanent => None,
        };
        
        // Actualizar membership
        membership.role = UserRole::Banned;
        membership.is_active = false;
        
        // Crear registro de ban
        ban_record.user = membership.user;
        ban_record.community = membership.community;
        ban_record.moderator = moderator_membership.user;
        ban_record.ban_type = ban_type;
        ban_record.reason = reason.clone();
        ban_record.banned_at = clock.unix_timestamp;
        ban_record.expires_at = expires_at;
        ban_record.is_active = true;
        ban_record.bump = ctx.bumps.ban_record;
        
        // Crear log de moderación
        let moderation_log = &mut ctx.accounts.moderation_log;
        moderation_log.community = membership.community;
        moderation_log.moderator = moderator_membership.user;
        moderation_log.target_user = Some(membership.user);
        moderation_log.target_vote = None;
        moderation_log.action = ModerationAction::Ban;
        moderation_log.reason = reason;
        moderation_log.executed_at = clock.unix_timestamp;
        moderation_log.bump = ctx.bumps.moderation_log;
        
        msg!("🚫 User banned successfully!");
        msg!("User: {}", membership.user);
        msg!("Ban type: {:?}", ban_type);
        msg!("Moderator: {}", moderator_membership.user);
        if let Some(expires) = expires_at {
            msg!("Expires at: {}", expires);
        }
        
        Ok(())
    }

    pub fn withdraw_fees(
        ctx: Context<WithdrawFees>,
        amount: u64,
    ) -> Result<()> {
        let community = &mut ctx.accounts.community;
        let admin_membership = &ctx.accounts.admin_membership;
        
        // Solo el admin de la comunidad puede retirar fees
        require!(admin_membership.is_admin(), VotingSystemError::InsufficientPermissions);
        require!(community.authority == admin_membership.user, VotingSystemError::InsufficientPermissions);
        
        // Verificar que hay suficientes fees para retirar
        require!(community.fee_collected >= amount, VotingSystemError::InsufficientFunds);
        
        // Transferir SOL de community account al admin
        **community.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.admin.to_account_info().try_borrow_mut_lamports()? += amount;
        
        // Actualizar contador de fees
        community.fee_collected -= amount;
        
        msg!("💰 Fees withdrawn successfully!");
        msg!("Admin: {}", admin_membership.user);
        msg!("Amount: {} lamports ({} SOL)", amount, amount as f64 / 1_000_000_000.0);
        msg!("Remaining fees: {} lamports", community.fee_collected);
        
        Ok(())
    }
    
    pub fn distribute_daily_rewards(
        ctx: Context<DistributeDailyRewards>,
    ) -> Result<()> {
        let fee_pool = &mut ctx.accounts.fee_pool;
        let clock = Clock::get()?;
        
        // Verificar que han pasado 24 horas desde la última distribución
        require!(fee_pool.should_distribute(), VotingSystemError::DistributionNotReady);
        
        // Calcular 5% del total para distribución
        let distribution_amount = fee_pool.calculate_daily_distribution();
        require!(distribution_amount > 0, VotingSystemError::NoFundsToDistribute);
        
        // Verificar que el fee pool tiene suficientes fondos
        let fee_pool_lamports = fee_pool.to_account_info().lamports();
        require!(fee_pool_lamports >= distribution_amount, VotingSystemError::InsufficientFunds);
        
        // Actualizar fee pool
        fee_pool.daily_distribution = distribution_amount;
        fee_pool.last_distribution = clock.unix_timestamp;
        
        // Reducir total_collected (ya que se está distribuyendo)
        fee_pool.total_collected = fee_pool.total_collected.saturating_sub(distribution_amount);
        
        msg!("🎁 Daily rewards distribution initiated!");
        msg!("Distribution amount: {} lamports ({} SOL)", 
             distribution_amount, distribution_amount as f64 / 1_000_000_000.0);
        msg!("Timestamp: {}", clock.unix_timestamp);
        
        // TODO: Implementar lógica para identificar top usuarios y distribuir
        // Por ahora solo preparamos el pool para distribución
        
        Ok(())
    }
    
    pub fn claim_reward(
        ctx: Context<ClaimReward>,
    ) -> Result<()> {
        let user = &ctx.accounts.user;
        let fee_pool = &mut ctx.accounts.fee_pool;
        let reward_record = &mut ctx.accounts.reward_record;
        let clock = Clock::get()?;
        
        // Verificar que hay rewards disponibles para reclamar
        require!(fee_pool.daily_distribution > 0, VotingSystemError::NoRewardsAvailable);
        
        // Verificar que el usuario no ha reclamado hoy
        require!(
            reward_record.last_claimed < fee_pool.last_distribution,
            VotingSystemError::AlreadyClaimedToday
        );
        
        // Calcular reward basado en reputación del usuario
        // Top 10 usuarios obtienen recompensas proporcionales
        let user_reward = calculate_user_reward(user.reputation_points, fee_pool.daily_distribution);
        require!(user_reward > 0, VotingSystemError::NotEligibleForReward);
        
        // Verificar que el fee pool tiene suficientes fondos
        let fee_pool_lamports = fee_pool.to_account_info().lamports();
        require!(fee_pool_lamports >= user_reward, VotingSystemError::InsufficientFunds);
        
        // Transferir reward del fee pool al usuario
        **fee_pool.to_account_info().try_borrow_mut_lamports()? -= user_reward;
        **ctx.accounts.claimer.to_account_info().try_borrow_mut_lamports()? += user_reward;
        
        // Actualizar registro de reward
        reward_record.last_claimed = clock.unix_timestamp;
        reward_record.total_claimed += user_reward;
        reward_record.claims_count += 1;
        
        // Reducir daily_distribution disponible
        fee_pool.daily_distribution = fee_pool.daily_distribution.saturating_sub(user_reward);
        
        msg!("🏆 Reward claimed successfully!");
        msg!("User: {}", user.wallet);
        msg!("Reward: {} lamports ({} SOL)", user_reward, user_reward as f64 / 1_000_000_000.0);
        msg!("User reputation: {} points", user.reputation_points);
        msg!("Total claimed by user: {} lamports", reward_record.total_claimed);
        
        Ok(())
    }
    
    pub fn remove_member(
        ctx: Context<RemoveMember>,
        reason: String,
    ) -> Result<()> {
        require!(reason.len() <= 200, VotingSystemError::ReasonTooLong);
        
        let membership = &mut ctx.accounts.membership;
        let admin_membership = &ctx.accounts.admin_membership;
        let clock = Clock::get()?;
        
        // Solo admins pueden remover miembros
        require!(admin_membership.is_admin(), VotingSystemError::InsufficientPermissions);
        
        // No se pueden remover a otros admins o moderadores
        require!(!membership.is_admin(), VotingSystemError::CannotRemoveAdmin);
        require!(!membership.is_moderator(), VotingSystemError::CannotRemoveModerator);
        
        // Desactivar membership
        membership.is_active = false;
        membership.role = UserRole::Member; // Reset role
        
        // Actualizar stats de la comunidad
        let community = &mut ctx.accounts.community;
        community.total_members = community.total_members.saturating_sub(1);
        
        // Crear log de moderación
        let moderation_log = &mut ctx.accounts.moderation_log;
        moderation_log.community = membership.community;
        moderation_log.moderator = admin_membership.user;
        moderation_log.target_user = Some(membership.user);
        moderation_log.target_vote = None;
        moderation_log.action = ModerationAction::RemoveMember;
        moderation_log.reason = reason.clone();
        moderation_log.executed_at = clock.unix_timestamp;
        moderation_log.bump = ctx.bumps.moderation_log;
        
        msg!("❌ Member removed successfully!");
        msg!("User: {}", membership.user);
        msg!("Community: {}", membership.community);
        msg!("Reason: {}", reason);
        msg!("Removed by: {}", admin_membership.user);
        msg!("New total members: {}", community.total_members);
        
        Ok(())
    }
    
    pub fn update_fee_pool(
        ctx: Context<UpdateFeePool>,
        amount: u64,
    ) -> Result<()> {
        let fee_pool = &mut ctx.accounts.fee_pool;
        
        // Esta función se llama automáticamente cuando se recolectan fees
        fee_pool.total_collected += amount;
        
        msg!("📊 Fee pool updated: +{} lamports", amount);
        msg!("Total collected: {} lamports", fee_pool.total_collected);
        
        Ok(())
    }

    pub fn initialize_fee_pool(ctx: Context<InitializeFeePool>) -> Result<()> {
        let fee_pool = &mut ctx.accounts.fee_pool;
        let clock = Clock::get()?;
        
        fee_pool.total_collected = 0;
        fee_pool.daily_distribution = 0;
        fee_pool.last_distribution = clock.unix_timestamp;
        fee_pool.bump = ctx.bumps.fee_pool;
        
        msg!("Fee pool initialized successfully");
        Ok(())
    }

    pub fn create_user(ctx: Context<CreateUser>) -> Result<()> {
        let user = &mut ctx.accounts.user;
        let clock = Clock::get()?;
        
        user.wallet = ctx.accounts.wallet.key();
        user.reputation_points = 0;
        user.level = 1;
        user.total_votes_cast = 0;
        user.created_at = clock.unix_timestamp;
        user.bump = ctx.bumps.user;
        
        msg!("User profile created for wallet: {}", user.wallet);
        Ok(())
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
        community.name = name.clone();
        community.category = category;
        community.quorum_percentage = quorum_percentage;
        community.total_members = 1; // Creator is first member
        community.total_votes = 0;
        community.fee_collected = 0;
        community.created_at = clock.unix_timestamp;
        community.is_active = true;
        community.requires_approval = requires_approval;
        community.bump = ctx.bumps.community;
        
        msg!("Community '{}' created by {}", community.name, community.authority);
        msg!("Requires approval: {}", requires_approval);
        Ok(())
    }

    pub fn create_voting(
        ctx: Context<CreateVoting>,
        question: String,
        options: Vec<String>,
        vote_type: VoteType,
        correct_answer: Option<u8>,
        deadline_hours: u32,
        quorum_required: u64,
        quorum_percentage: Option<u8>,
        use_percentage_quorum: bool,
    ) -> Result<()> {
        // === VALIDACIONES BÁSICAS ===
        require!(question.len() > 0 && question.len() <= 200, VotingSystemError::QuestionTooLong);
        require!(options.len() >= 2 && options.len() <= 4, VotingSystemError::InvalidOptionsCount);
        require!(deadline_hours >= 1 && deadline_hours <= 168, VotingSystemError::InvalidDeadline); // 1 hora a 1 semana
        
        // Validaciones de quorum
        if use_percentage_quorum {
            require!(quorum_percentage.is_some(), VotingSystemError::MissingQuorumPercentage);
            let percentage = quorum_percentage.unwrap();
            require!(percentage > 0 && percentage <= 100, VotingSystemError::InvalidQuorumPercentage);
        } else {
            require!(quorum_required > 0, VotingSystemError::InvalidQuorum);
        }
        
        // Validar longitud de cada opción
        for option in &options {
            require!(option.len() > 0 && option.len() <= 50, VotingSystemError::OptionTooLong);
        }
        
        // Validaciones específicas para Knowledge type
        if vote_type == VoteType::Knowledge {
            require!(correct_answer.is_some(), VotingSystemError::MissingCorrectAnswer);
            let answer = correct_answer.unwrap();
            require!((answer as usize) < options.len(), VotingSystemError::InvalidCorrectAnswer);
        }
        
        // === SISTEMA DE FEES DINÁMICO ===
        // Calcular fee basado en la reputación del usuario
        let user = &ctx.accounts.user;
        let fee_tier = FeeTier::from_reputation(user.reputation_points);
        let voting_fee = fee_tier.get_voting_fee();
        
        // Solo transferir si el fee es mayor a 0
        if voting_fee > 0 {
            // Transferir fee del creator al community account
            let fee_transfer = anchor_lang::system_program::Transfer {
                from: ctx.accounts.creator.to_account_info(),
                to: ctx.accounts.community.to_account_info(),
            };
            
            let cpi_context = CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                fee_transfer,
            );
            
            anchor_lang::system_program::transfer(cpi_context, voting_fee)?;
            
            // Actualizar fee pool si existe
            if let Some(fee_pool) = &mut ctx.accounts.fee_pool {
                fee_pool.total_collected += voting_fee;
            }
        }
        
        // === INICIALIZACIÓN DE VOTE ACCOUNT ===
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
        vote.quorum_percentage = quorum_percentage;
        vote.use_percentage_quorum = use_percentage_quorum;
        vote.deadline = clock.unix_timestamp + (deadline_hours as i64 * 3600);
        vote.status = VoteStatus::Active;
        vote.fee_per_vote = voting_fee;
        vote.created_at = clock.unix_timestamp;
        vote.bump = ctx.bumps.vote;
        
        // === ACTUALIZAR ESTADÍSTICAS DE COMUNIDAD ===
        community.total_votes += 1;
        community.fee_collected += voting_fee;
        
        // === LOGS PARA DEBUGGING ===
        msg!("✅ Voting created successfully!");
        msg!("Question: {}", question);
        msg!("Options: {:?}", options);
        msg!("Type: {:?}", vote_type);
        msg!("Creator: {}", ctx.accounts.creator.key());
        msg!("Community: {}", community.name);
        msg!("Fee collected: {} lamports (Tier: {:?})", voting_fee, fee_tier);
        msg!("Deadline: {} hours from now", deadline_hours);
        
        if use_percentage_quorum {
            msg!("Quorum: {}% of members", quorum_percentage.unwrap());
        } else {
            msg!("Quorum: {} absolute votes", quorum_required);
        }
        
        Ok(())
    }

    pub fn cast_vote(
        ctx: Context<CastVote>,
        option_selected: u8,
    ) -> Result<()> {
        // === VALIDACIONES CRÍTICAS ===
        let vote = &mut ctx.accounts.vote;
        let membership = &ctx.accounts.membership;
        let clock = Clock::get()?;
        
        // 1. Verificar que la votación esté activa
        require!(vote.status == VoteStatus::Active, VotingSystemError::VoteNotActive);
        
        // 2. Verificar deadline
        require!(clock.unix_timestamp < vote.deadline, VotingSystemError::VoteExpired);
        
        // 3. Verificar opción válida
        require!((option_selected as usize) < vote.options.len(), VotingSystemError::InvalidOption);
        
        // 4. Verificar membresía activa en la comunidad (ya validado por constraints)
        // Los constraints ya verifican:
        // - membership.community == vote.community
        // - membership.user == voter.key()
        // - membership.is_active
        // - user.wallet == voter.key()
        
        // 5. El usuario ya votó se previene automáticamente por PDA único en Participation
        
        // === INICIALIZAR PARTICIPATION ACCOUNT ===
        let participation = &mut ctx.accounts.participation;
        
        participation.user = ctx.accounts.user.wallet;
        participation.vote = vote.key();
        participation.option_selected = option_selected;
        participation.voted_at = clock.unix_timestamp;
        participation.bump = ctx.bumps.participation;
        
        // === ACTUALIZAR RESULTADOS DE VOTACIÓN ===
        // Añadir el usuario a la lista de participantes
        vote.participants.push(ctx.accounts.user.wallet);
        
        // Incrementar el conteo de la opción seleccionada
        vote.results[option_selected as usize] += 1;
        
        // Incrementar total de votos
        vote.total_votes += 1;
        
        // === ACTUALIZAR ESTADÍSTICAS DE USUARIO ===
        let user_account = &mut ctx.accounts.user;
        user_account.total_votes_cast += 1;
        
        // Sistema básico de reputación: +1 punto por votar
        user_account.reputation_points += 1;
        
        // Subir de nivel cada 10 puntos
        let new_level = (user_account.reputation_points / 10) + 1;
        if new_level as u32 > user_account.level {
            user_account.level = new_level as u32;
            msg!("🎉 User leveled up to level {}!", new_level);
        }
        
        // === VERIFICAR QUORUM Y CERRAR VOTACIÓN SI SE ALCANZA ===
        if vote.total_votes >= vote.quorum_required {
            vote.status = VoteStatus::Completed;
            msg!("🎯 Quorum reached! Vote completed automatically.");
            
            // Para Knowledge type: verificar respuesta correcta y otorgar puntos extra
            if vote.vote_type == VoteType::Knowledge {
                if let Some(correct_answer) = vote.correct_answer {
                    if option_selected == correct_answer {
                        user_account.reputation_points += 3; // +3 puntos por respuesta correcta
                        msg!("✅ Correct answer! +3 bonus reputation points.");
                    }
                }
            }
        }
        
        // === LOGS DETALLADOS PARA DEBUGGING ===
        msg!("🗳️ Vote cast successfully!");
        msg!("User: {}", user_account.wallet);
        msg!("Vote: {}", vote.question);
        msg!("Option selected: {} ({})", option_selected, vote.options[option_selected as usize]);
        msg!("Total votes now: {}/{}", vote.total_votes, vote.quorum_required);
        msg!("User reputation: {} points, level: {}", user_account.reputation_points, user_account.level);
        msg!("Vote status: {:?}", vote.status);
        
        Ok(())
    }

    pub fn request_membership(
        ctx: Context<RequestMembership>,
        message: String,
    ) -> Result<()> {
        require!(message.len() <= 300, VotingSystemError::RequestMessageTooLong);
        
        let request = &mut ctx.accounts.membership_request;
        let community = &ctx.accounts.community;
        let user = &ctx.accounts.user;
        let clock = Clock::get()?;
        
        // Validaciones
        require!(community.is_active, VotingSystemError::CommunityInactive);
        
        // Inicializar solicitud
        request.user = ctx.accounts.requester.key();
        request.community = community.key();
        request.message = message.clone();
        request.status = MembershipRequestStatus::Pending;
        request.requested_at = clock.unix_timestamp;
        request.reviewed_by = None;
        request.reviewed_at = None;
        request.admin_notes = String::new();
        request.bump = ctx.bumps.membership_request;
        
        msg!("🔔 Membership request submitted successfully!");
        msg!("User: {}", ctx.accounts.requester.key());
        msg!("Community: {}", community.name);
        msg!("Message: {}", message);
        msg!("Requested at: {}", clock.unix_timestamp);
        
        Ok(())
    }
    
    pub fn approve_membership(
        ctx: Context<ApproveMembership>,
        admin_notes: String,
    ) -> Result<()> {
        require!(admin_notes.len() <= 200, VotingSystemError::AdminNotesTooLong);
        
        let request = &mut ctx.accounts.membership_request;
        let membership = &mut ctx.accounts.membership;
        let community = &mut ctx.accounts.community;
        let admin_membership = &ctx.accounts.admin_membership;
        let clock = Clock::get()?;
        
        // Validaciones
        require!(admin_membership.is_admin(), VotingSystemError::InsufficientPermissions);
        require!(request.status == MembershipRequestStatus::Pending, VotingSystemError::RequestNotPending);
        
        // Actualizar solicitud
        request.status = MembershipRequestStatus::Approved;
        request.reviewed_by = Some(admin_membership.user);
        request.reviewed_at = Some(clock.unix_timestamp);
        request.admin_notes = admin_notes.clone();
        
        // Crear membership (lo que hacía join_community)
        membership.user = request.user;
        membership.community = community.key();
        membership.role = UserRole::Member;
        membership.joined_at = clock.unix_timestamp;
        membership.is_active = true;
        membership.bump = ctx.bumps.membership;
        
        // Actualizar stats de comunidad
        community.total_members += 1;
        
        // Crear log de moderación
        let moderation_log = &mut ctx.accounts.moderation_log;
        moderation_log.community = community.key();
        moderation_log.moderator = admin_membership.user;
        moderation_log.target_user = Some(request.user);
        moderation_log.target_vote = None;
        moderation_log.action = ModerationAction::ApproveMembership;
        moderation_log.reason = admin_notes;
        moderation_log.executed_at = clock.unix_timestamp;
        moderation_log.bump = ctx.bumps.moderation_log;
        
        msg!("✅ Membership request approved successfully!");
        msg!("User: {}", request.user);
        msg!("Community: {}", community.name);
        msg!("Approved by: {}", admin_membership.user);
        msg!("Total members now: {}", community.total_members);
        
        Ok(())
    }
    
    pub fn reject_membership(
        ctx: Context<RejectMembership>,
        admin_notes: String,
    ) -> Result<()> {
        require!(admin_notes.len() <= 200, VotingSystemError::AdminNotesTooLong);
        
        let request = &mut ctx.accounts.membership_request;
        let admin_membership = &ctx.accounts.admin_membership;
        let clock = Clock::get()?;
        
        // Validaciones
        require!(admin_membership.is_admin(), VotingSystemError::InsufficientPermissions);
        require!(request.status == MembershipRequestStatus::Pending, VotingSystemError::RequestNotPending);
        
        // Actualizar solicitud
        request.status = MembershipRequestStatus::Rejected;
        request.reviewed_by = Some(admin_membership.user);
        request.reviewed_at = Some(clock.unix_timestamp);
        request.admin_notes = admin_notes.clone();
        
        // Crear log de moderación
        let moderation_log = &mut ctx.accounts.moderation_log;
        moderation_log.community = request.community;
        moderation_log.moderator = admin_membership.user;
        moderation_log.target_user = Some(request.user);
        moderation_log.target_vote = None;
        moderation_log.action = ModerationAction::RejectMembership;
        moderation_log.reason = admin_notes;
        moderation_log.executed_at = clock.unix_timestamp;
        moderation_log.bump = ctx.bumps.moderation_log;
        
        msg!("❌ Membership request rejected!");
        msg!("User: {}", request.user);
        msg!("Community: {}", request.community);
        msg!("Rejected by: {}", admin_membership.user);
        msg!("Reason: {}", request.admin_notes);
        
        Ok(())
    }

    pub fn join_community(ctx: Context<JoinCommunity>) -> Result<()> {
        // === VALIDACIONES ===
        require!(ctx.accounts.community.is_active, VotingSystemError::CommunityInactive);
        
        // Verificar si la comunidad requiere aprobación
        require!(!ctx.accounts.community.requires_approval, VotingSystemError::CommunityRequiresApproval);
        
        // Verificar que el usuario no sea ya miembro (PDA existe = ya es miembro)
        // Esta validación se hace automáticamente por Anchor al intentar crear PDA existente
        
        // === INICIALIZAR MEMBERSHIP ACCOUNT ===
        let membership = &mut ctx.accounts.membership;
        let community = &mut ctx.accounts.community;
        let user = &ctx.accounts.user;
        let clock = Clock::get()?;
        
        membership.user = ctx.accounts.member.key(); // Usar member.key() (wallet) no user.key() (PDA)
        membership.community = community.key();
        membership.role = UserRole::Member; // Rol por defecto
        membership.joined_at = clock.unix_timestamp;
        membership.is_active = true;
        membership.bump = ctx.bumps.membership;
        
        // === ACTUALIZAR ESTADÍSTICAS DE COMUNIDAD ===
        community.total_members += 1;
        
        // === LOGS PARA DEBUGGING ===
        msg!("✅ User joined community successfully!");
        msg!("User: {}", user.key());
        msg!("Community: {}", community.name);
        msg!("Total members now: {}", community.total_members);
        msg!("Joined at: {}", clock.unix_timestamp);
        
        Ok(())
    }

    pub fn create_knowledge_voting(
        ctx: Context<CreateKnowledgeVoting>,
        question: String,
        options: Vec<String>,
        vote_type: VoteType,
        correct_answer: Option<u8>,
        deadline_hours: u32,
        quorum_required: u64,
    ) -> Result<()> {
        // Reutilizar la misma lógica que create_voting
        // === VALIDACIONES BÁSICAS ===
        require!(question.len() > 0 && question.len() <= 200, VotingSystemError::QuestionTooLong);
        require!(options.len() >= 2 && options.len() <= 4, VotingSystemError::InvalidOptionsCount);
        require!(deadline_hours >= 1 && deadline_hours <= 168, VotingSystemError::InvalidDeadline);
        require!(quorum_required > 0, VotingSystemError::InvalidQuorum);
        
        for option in &options {
            require!(option.len() > 0 && option.len() <= 50, VotingSystemError::OptionTooLong);
        }
        
        // Validaciones específicas para Knowledge type
        if vote_type == VoteType::Knowledge {
            require!(correct_answer.is_some(), VotingSystemError::MissingCorrectAnswer);
            let answer = correct_answer.unwrap();
            require!((answer as usize) < options.len(), VotingSystemError::InvalidCorrectAnswer);
        }
        
        // === SISTEMA DE FEES (0.01 SOL) ===
        const VOTING_FEE: u64 = 10_000_000;
        
        let fee_transfer = anchor_lang::system_program::Transfer {
            from: ctx.accounts.creator.to_account_info(),
            to: ctx.accounts.community.to_account_info(),
        };
        
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            fee_transfer,
        );
        
        anchor_lang::system_program::transfer(cpi_context, VOTING_FEE)?;
        
        // === INICIALIZACIÓN DE VOTE ACCOUNT ===
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
        vote.deadline = clock.unix_timestamp + (deadline_hours as i64 * 3600);
        vote.status = VoteStatus::Active;
        vote.fee_per_vote = VOTING_FEE;
        vote.created_at = clock.unix_timestamp;
        vote.bump = ctx.bumps.vote;
        
        // === ACTUALIZAR ESTADÍSTICAS DE COMUNIDAD ===
        community.total_votes += 1;
        community.fee_collected += VOTING_FEE;
        
        msg!("✅ Knowledge Voting created successfully!");
        msg!("Question: {}", question);
        msg!("Options: {:?}", options);
        msg!("Type: {:?}", vote_type);
        
        Ok(())
    }
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

// Calcular reward basado en reputación del usuario
fn calculate_user_reward(reputation_points: u64, total_distribution: u64) -> u64 {
    // Solo usuarios con 100+ puntos de reputación pueden reclamar rewards
    if reputation_points < 100 {
        return 0;
    }
    
    // Sistema de tiers basado en reputación
    let reward_multiplier = if reputation_points >= 5000 {
        10 // VIP: 10% del pool
    } else if reputation_points >= 1000 {
        5  // Premium: 5% del pool
    } else if reputation_points >= 500 {
        3  // Advanced: 3% del pool
    } else {
        1  // Basic: 1% del pool
    };
    
    // Calcular reward como porcentaje del pool diario
    (total_distribution * reward_multiplier) / 100
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct InitializeFeePool<'info> {
    #[account(
        init,
        seeds = [b"fee_pool"],
        bump,
        space = 8 + FeePool::LEN,
        payer = authority
    )]
    pub fee_pool: Account<'info, FeePool>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

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

#[derive(Accounts)]
#[instruction(option_selected: u8)]
pub struct CastVote<'info> {
    #[account(
        init,
        seeds = [b"participation", vote.key().as_ref(), voter.key().as_ref()],
        bump,
        space = 8 + Participation::LEN,
        payer = voter
    )]
    pub participation: Account<'info, Participation>,
    
    #[account(
        mut,
        constraint = vote.status == VoteStatus::Active @ VotingSystemError::VoteNotActive
    )]
    pub vote: Account<'info, Vote>,
    
    #[account(
        constraint = membership.community == vote.community @ VotingSystemError::NotCommunityMember,
        constraint = membership.user == voter.key() @ VotingSystemError::NotCommunityMember,
        constraint = membership.is_active @ VotingSystemError::NotCommunityMember
    )]
    pub membership: Account<'info, Membership>,
    
    #[account(
        mut,
        constraint = user.wallet == voter.key() @ VotingSystemError::InvalidUser
    )]
    pub user: Account<'info, User>,
    
    #[account(mut)]
    pub voter: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct JoinCommunity<'info> {
    #[account(
        init,
        seeds = [b"membership", community.key().as_ref(), member.key().as_ref()],
        bump,
        space = 8 + Membership::LEN,
        payer = member
    )]
    pub membership: Account<'info, Membership>,
    
    #[account(
        mut,
        constraint = community.is_active @ VotingSystemError::CommunityInactive
    )]
    pub community: Account<'info, Community>,
    
    #[account(
        constraint = user.wallet == member.key() @ VotingSystemError::InvalidUser
    )]
    pub user: Account<'info, User>,
    
    #[account(mut)]
    pub member: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String, category: u8, quorum_percentage: u8)]
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

#[derive(Accounts)]
pub struct CreateVoting<'info> {
    #[account(
        init,
        seeds = [b"vote", community.key().as_ref(), creator.key().as_ref()],
        bump,
        space = 8 + Vote::LEN,
        payer = creator
    )]
    pub vote: Account<'info, Vote>,
    
    #[account(
        mut,
        constraint = community.is_active @ VotingSystemError::CommunityInactive
    )]
    pub community: Account<'info, Community>,
    
    #[account(
        constraint = user.wallet == creator.key() @ VotingSystemError::InvalidUser
    )]
    pub user: Account<'info, User>,
    
    #[account(
        mut,
        constraint = creator.lamports() >= 10_000_000 @ VotingSystemError::InsufficientFunds
    )]
    pub creator: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"fee_pool"],
        bump,
        constraint = fee_pool.key() != Pubkey::default()
    )]
    pub fee_pool: Option<Account<'info, FeePool>>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateKnowledgeVoting<'info> {
    #[account(
        init,
        seeds = [b"knowledge-vote", community.key().as_ref(), creator.key().as_ref()],
        bump,
        space = 8 + Vote::LEN,
        payer = creator
    )]
    pub vote: Account<'info, Vote>,
    
    #[account(
        mut,
        constraint = community.is_active @ VotingSystemError::CommunityInactive
    )]
    pub community: Account<'info, Community>,
    
    #[account(
        mut,
        constraint = creator.lamports() >= 10_000_000 @ VotingSystemError::InsufficientFunds
    )]
    pub creator: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AssignModerator<'info> {
    #[account(
        mut,
        constraint = membership.community == admin_membership.community @ VotingSystemError::InvalidCommunity
    )]
    pub membership: Account<'info, Membership>,
    
    #[account(
        constraint = admin_membership.is_admin() @ VotingSystemError::InsufficientPermissions
    )]
    pub admin_membership: Account<'info, Membership>,
    
    #[account(
        init,
        seeds = [b"moderation_log", membership.community.as_ref(), admin_membership.user.as_ref()],
        bump,
        space = 8 + ModerationLog::LEN,
        payer = admin
    )]
    pub moderation_log: Account<'info, ModerationLog>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

// === ESTRUCTURAS CONTEXT PARA SISTEMA DE CATEGORÍAS ===

#[derive(Accounts)]
#[instruction(name: String)] // Necesario para usar name en seeds
pub struct CreateCustomCategory<'info> {
    #[account(
        init,
        seeds = [b"custom_category", community.key().as_ref(), name.as_bytes()],
        bump,
        space = 8 + CustomCategory::LEN,
        payer = admin
    )]
    pub custom_category: Account<'info, CustomCategory>,
    
    pub community: Account<'info, Community>,
    
    #[account(
        constraint = admin_membership.is_admin() @ VotingSystemError::InsufficientPermissions,
        constraint = admin_membership.community == community.key() @ VotingSystemError::InvalidCommunity
    )]
    pub admin_membership: Account<'info, Membership>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(category: VotingCategory)] // Necesario para usar category en seeds
pub struct SubscribeToCategory<'info> {
    #[account(
        init,
        seeds = [b"subscription", user.key().as_ref(), &[category.to_u8()]],
        bump,
        space = 8 + CategorySubscription::LEN,
        payer = subscriber
    )]
    pub subscription: Account<'info, CategorySubscription>,
    
    pub user: Account<'info, User>,
    
    #[account(mut)]
    pub subscriber: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UnsubscribeFromCategory<'info> {
    #[account(
        mut,
        constraint = subscription.user == subscriber.key() @ VotingSystemError::InvalidUser
    )]
    pub subscription: Account<'info, CategorySubscription>,
    
    #[account(mut)]
    pub subscriber: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetCommunitiesByCategory<'info> {
    #[account(
        constraint = community.is_active @ VotingSystemError::CommunityInactive
    )]
    pub community: Account<'info, Community>,
}

#[derive(Accounts)]
pub struct BanUser<'info> {
    #[account(
        mut,
        constraint = membership.community == moderator_membership.community @ VotingSystemError::InvalidCommunity
    )]
    pub membership: Account<'info, Membership>,
    
    #[account(
        constraint = moderator_membership.can_moderate() @ VotingSystemError::InsufficientPermissions
    )]
    pub moderator_membership: Account<'info, Membership>,
    
    #[account(
        init,
        seeds = [b"ban_record", membership.community.as_ref(), membership.user.as_ref()],
        bump,
        space = 8 + BanRecord::LEN,
        payer = moderator
    )]
    pub ban_record: Account<'info, BanRecord>,
    
    #[account(
        init,
        seeds = [b"moderation_log", membership.community.as_ref(), moderator_membership.user.as_ref()],
        bump,
        space = 8 + ModerationLog::LEN,
        payer = moderator
    )]
    pub moderation_log: Account<'info, ModerationLog>,
    
    #[account(mut)]
    pub moderator: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseVoting<'info> {
    #[account(
        mut,
        constraint = vote.community == moderator_membership.community @ VotingSystemError::InvalidCommunity
    )]
    pub vote: Account<'info, Vote>,
    
    #[account(
        constraint = moderator_membership.can_moderate() @ VotingSystemError::InsufficientPermissions
    )]
    pub moderator_membership: Account<'info, Membership>,
    
    #[account(
        init,
        seeds = [b"moderation_log", vote.community.as_ref(), moderator_membership.user.as_ref()],
        bump,
        space = 8 + ModerationLog::LEN,
        payer = moderator
    )]
    pub moderation_log: Account<'info, ModerationLog>,
    
    #[account(mut)]
    pub moderator: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawFees<'info> {
    #[account(
        mut,
        constraint = community.authority == admin_membership.user @ VotingSystemError::InsufficientPermissions
    )]
    pub community: Account<'info, Community>,
    
    #[account(
        constraint = admin_membership.is_admin() @ VotingSystemError::InsufficientPermissions,
        constraint = admin_membership.community == community.key() @ VotingSystemError::InvalidCommunity
    )]
    pub admin_membership: Account<'info, Membership>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DistributeDailyRewards<'info> {
    #[account(
        mut,
        seeds = [b"fee_pool"],
        bump
    )]
    pub fee_pool: Account<'info, FeePool>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimReward<'info> {
    #[account(
        constraint = user.wallet == claimer.key() @ VotingSystemError::InvalidUser
    )]
    pub user: Account<'info, User>,
    
    #[account(
        mut,
        seeds = [b"fee_pool"],
        bump
    )]
    pub fee_pool: Account<'info, FeePool>,
    
    #[account(
        init_if_needed,
        seeds = [b"reward_record", claimer.key().as_ref()],
        bump,
        space = 8 + RewardRecord::LEN,
        payer = claimer
    )]
    pub reward_record: Account<'info, RewardRecord>,
    
    #[account(mut)]
    pub claimer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateFeePool<'info> {
    #[account(
        mut,
        seeds = [b"fee_pool"],
        bump
    )]
    pub fee_pool: Account<'info, FeePool>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RemoveMember<'info> {
    #[account(mut)]
    pub membership: Account<'info, Membership>,
    
    #[account(mut)]
    pub community: Account<'info, Community>,
    
    #[account(
        constraint = admin_membership.is_admin() @ VotingSystemError::InsufficientPermissions,
        constraint = admin_membership.community == membership.community @ VotingSystemError::InvalidCommunity
    )]
    pub admin_membership: Account<'info, Membership>,
    
    #[account(
        init,
        seeds = [b"moderation_log", membership.community.as_ref(), admin_membership.user.as_ref()],
        bump,
        space = 8 + ModerationLog::LEN,
        payer = admin
    )]
    pub moderation_log: Account<'info, ModerationLog>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

// ESTRUCTURAS FALTANTES PARA LAS FUNCIONES DE MODERACIÓN

#[derive(Accounts)]
pub struct ReportContent<'info> {
    #[account(
        init,
        seeds = [b"report", vote.key().as_ref(), reporter.key().as_ref()],
        bump,
        space = 8 + Report::LEN,
        payer = reporter
    )]
    pub report: Account<'info, Report>,
    
    #[account(
        init_if_needed,
        seeds = [b"report_counter", vote.key().as_ref()],
        bump,
        space = 8 + ReportCounter::LEN,
        payer = reporter
    )]
    pub report_counter: Account<'info, ReportCounter>,
    
    #[account(mut)]
    pub vote: Account<'info, Vote>,
    
    #[account(
        constraint = reporter_membership.user == reporter.key(),
        constraint = reporter_membership.is_active
    )]
    pub reporter_membership: Account<'info, Membership>,
    
    #[account(mut)]
    pub reporter: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReviewReport<'info> {
    #[account(mut)]
    pub report: Account<'info, Report>,
    
    #[account(
        constraint = moderator_membership.can_moderate() @ VotingSystemError::InsufficientPermissions
    )]
    pub moderator_membership: Account<'info, Membership>,
    
    #[account(
        init,
        seeds = [b"moderation_log", report.community.as_ref(), moderator_membership.user.as_ref()],
        bump,
        space = 8 + ModerationLog::LEN,
        payer = moderator
    )]
    pub moderation_log: Account<'info, ModerationLog>,
    
    #[account(mut)]
    pub moderator: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AppealBan<'info> {
    #[account(
        init,
        seeds = [b"appeal", ban_record.key().as_ref()],
        bump,
        space = 8 + Appeal::LEN,
        payer = appellant
    )]
    pub appeal: Account<'info, Appeal>,
    
    pub ban_record: Account<'info, BanRecord>,
    
    #[account(
        constraint = appellant_membership.user == appellant.key()
    )]
    pub appellant_membership: Account<'info, Membership>,
    
    #[account(mut)]
    pub appellant: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReviewAppeal<'info> {
    #[account(mut)]
    pub appeal: Account<'info, Appeal>,
    
    #[account(mut)]
    pub ban_record: Account<'info, BanRecord>,
    
    #[account(mut)]
    pub membership: Account<'info, Membership>,
    
    #[account(
        constraint = admin_membership.is_admin() @ VotingSystemError::InsufficientPermissions
    )]
    pub admin_membership: Account<'info, Membership>,
    
    #[account(
        init,
        seeds = [b"moderation_log", appeal.community.as_ref(), admin_membership.user.as_ref()],
        bump,
        space = 8 + ModerationLog::LEN,
        payer = admin
    )]
    pub moderation_log: Account<'info, ModerationLog>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

// ESTRUCTURAS PARA SISTEMA DE APROBACIÓN DE MIEMBROS

#[derive(Accounts)]
pub struct RequestMembership<'info> {
    #[account(
        init,
        seeds = [b"membership_request", community.key().as_ref(), requester.key().as_ref()],
        bump,
        space = 8 + MembershipRequest::LEN,
        payer = requester
    )]
    pub membership_request: Account<'info, MembershipRequest>,
    
    #[account(
        constraint = community.is_active @ VotingSystemError::CommunityInactive
    )]
    pub community: Account<'info, Community>,
    
    #[account(
        constraint = user.wallet == requester.key() @ VotingSystemError::InvalidUser
    )]
    pub user: Account<'info, User>,
    
    #[account(mut)]
    pub requester: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ApproveMembership<'info> {
    #[account(
        mut,
        constraint = membership_request.status == MembershipRequestStatus::Pending @ VotingSystemError::RequestNotPending
    )]
    pub membership_request: Account<'info, MembershipRequest>,
    
    #[account(
        init,
        seeds = [b"membership", community.key().as_ref(), membership_request.user.as_ref()],
        bump,
        space = 8 + Membership::LEN,
        payer = admin
    )]
    pub membership: Account<'info, Membership>,
    
    #[account(mut)]
    pub community: Account<'info, Community>,
    
    #[account(
        constraint = admin_membership.is_admin() @ VotingSystemError::InsufficientPermissions,
        constraint = admin_membership.community == community.key() @ VotingSystemError::InvalidCommunity
    )]
    pub admin_membership: Account<'info, Membership>,
    
    #[account(
        init,
        seeds = [b"moderation_log", community.key().as_ref(), admin_membership.user.as_ref()],
        bump,
        space = 8 + ModerationLog::LEN,
        payer = admin
    )]
    pub moderation_log: Account<'info, ModerationLog>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RejectMembership<'info> {
    #[account(
        mut,
        constraint = membership_request.status == MembershipRequestStatus::Pending @ VotingSystemError::RequestNotPending
    )]
    pub membership_request: Account<'info, MembershipRequest>,
    
    #[account(
        constraint = admin_membership.is_admin() @ VotingSystemError::InsufficientPermissions,
        constraint = admin_membership.community == membership_request.community @ VotingSystemError::InvalidCommunity
    )]
    pub admin_membership: Account<'info, Membership>,
    
    #[account(
        init,
        seeds = [b"moderation_log", membership_request.community.as_ref(), admin_membership.user.as_ref()],
        bump,
        space = 8 + ModerationLog::LEN,
        payer = admin
    )]
    pub moderation_log: Account<'info, ModerationLog>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}
