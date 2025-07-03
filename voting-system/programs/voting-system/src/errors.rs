use anchor_lang::prelude::*;

#[error_code]
pub enum VotingSystemError {
    #[msg("Name is too long. Maximum 50 characters.")]
    NameTooLong,
    
    #[msg("Invalid quorum percentage. Must be between 1 and 100.")]
    InvalidQuorum,
    
    #[msg("Question is too long. Maximum 200 characters.")]
    QuestionTooLong,
    
    #[msg("Invalid number of options. Must be between 2 and 4.")]
    InvalidOptionsCount,
    
    #[msg("Option is too long. Maximum 50 characters.")]
    OptionTooLong,
    
    #[msg("Knowledge type voting requires a correct answer.")]
    MissingCorrectAnswer,
    
    #[msg("Correct answer index is invalid.")]
    InvalidCorrectAnswer,
    
    #[msg("Deadline must be between 1 hour and 1 week (168 hours).")]
    InvalidDeadline,
    
    #[msg("Community is not active.")]
    CommunityInactive,
    
    #[msg("Insufficient funds for fee payment.")]
    InsufficientFunds,
    
    #[msg("User account does not match signer.")]
    InvalidUser,
    
    #[msg("User is already a member of this community.")]
    AlreadyMember,
    
    #[msg("Vote is not active.")]
    VoteNotActive,
    
    #[msg("Vote has expired.")]
    VoteExpired,
    
    #[msg("Invalid option selected.")]
    InvalidOption,
    
    #[msg("User is not a member of this community.")]
    NotCommunityMember,
    
    #[msg("User has already voted in this voting.")]
    AlreadyVoted,
    
    #[msg("Insufficient permissions for this action.")]
    InsufficientPermissions,
    
    #[msg("User is banned from this community.")]
    UserBanned,
    
    #[msg("Cannot ban moderators or admins.")]
    CannotBanModerator,
    
    #[msg("Invalid ban duration. Must be between 1 hour and 1 year.")]
    InvalidBanDuration,
    
    #[msg("Reason is too long. Maximum 200 characters.")]
    ReasonTooLong,
    
    #[msg("Invalid community for this operation.")]
    InvalidCommunity,
    
    #[msg("Invalid report status.")]
    InvalidReportStatus,
    
    #[msg("Invalid appeal status.")]
    InvalidAppealStatus,
    
    #[msg("Ban is not active.")]
    BanNotActive,
    
    // NUEVOS ERRORES PARA SISTEMA DE MODERACIÓN
    #[msg("Description too long. Maximum 200 characters.")]
    DescriptionTooLong,
    
    #[msg("Reason too long. Maximum 300 characters.")]
    AppealReasonTooLong,
    
    #[msg("No action to appeal.")]
    NoActionToAppeal,
    
    #[msg("Notes too long. Maximum 200 characters.")]
    NotesTooLong,
    
    #[msg("Only community members can report content.")]
    OnlyMembersCanReport,
    
    #[msg("Cannot report your own content.")]
    CannotReportOwnContent,
    
    #[msg("Report already exists for this content.")]
    ReportAlreadyExists,
    
    #[msg("Appeal already exists for this action.")]
    AppealAlreadyExists,
    
    #[msg("Only moderators can review reports.")]
    OnlyModeratorsCanReview,
    
    #[msg("Report is not in pending status.")]
    ReportNotPending,
    
    #[msg("Appeal is not in pending status.")]
    AppealNotPending,
    
    // NUEVOS ERRORES PARA SISTEMA DE WITHDRAW Y DISTRIBUCIÓN
    #[msg("Distribution not ready. Must wait 24 hours.")]
    DistributionNotReady,
    
    #[msg("No funds available to distribute.")]
    NoFundsToDistribute,
    
    #[msg("No rewards available to claim.")]
    NoRewardsAvailable,
    
    #[msg("Already claimed rewards today.")]
    AlreadyClaimedToday,
    
    #[msg("Not eligible for reward. Insufficient reputation.")]
    NotEligibleForReward,
    
    #[msg("Invalid withdrawal amount.")]
    InvalidWithdrawalAmount,
    
    // NUEVOS ERRORES PARA REMOVE_MEMBER
    #[msg("Cannot remove admin users.")]
    CannotRemoveAdmin,
    
    #[msg("Cannot remove moderator users.")]
    CannotRemoveModerator,
    
    // NUEVOS ERRORES PARA SISTEMA DE APROBACIÓN DE MIEMBROS
    #[msg("Membership request message too long. Maximum 300 characters.")]
    RequestMessageTooLong,
    
    #[msg("Admin notes too long. Maximum 200 characters.")]
    AdminNotesTooLong,
    
    #[msg("Membership request not found.")]
    MembershipRequestNotFound,
    
    #[msg("Membership request not in pending status.")]
    RequestNotPending,
    
    #[msg("Membership request already exists.")]
    RequestAlreadyExists,
}
