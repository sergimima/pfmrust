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
    
    #[msg("Community requires approval to join. Use request_membership instead.")]
    CommunityRequiresApproval,
    
    // NUEVOS ERRORES PARA SISTEMA DE CATEGORÍAS
    
    #[msg("Color too long. Maximum 7 characters.")]
    ColorTooLong,
    
    #[msg("Icon too long. Maximum 10 characters.")]
    IconTooLong,
    
    #[msg("Invalid category. Must be 0-10.")]
    InvalidCategory,
    
    #[msg("Category mismatch. Community doesn't belong to this category.")]
    CategoryMismatch,
    
    // NUEVOS ERRORES PARA SISTEMA DE QUORUM AVANZADO
    #[msg("Missing quorum percentage. Required when using percentage quorum.")]
    MissingQuorumPercentage,
    
    #[msg("Invalid quorum percentage. Must be between 1-100.")]
    InvalidQuorumPercentage,
    
    #[msg("Vote failed due to insufficient quorum.")]
    VoteFailedQuorum,
    
    #[msg("Vote has not expired yet.")]
    VoteNotExpired,
    
    // NUEVOS ERRORES PARA SISTEMA COMMIT-REVEAL (2.4.3-2.4.6)
    #[msg("Invalid vote type for this operation.")]
    InvalidVoteType,
    
    #[msg("Vote not completed yet.")]
    VoteNotCompleted,
    
    #[msg("No answer hash stored for verification.")]
    NoAnswerHashStored,
    
    #[msg("Invalid answer hash. Answer doesn't match stored hash.")]
    InvalidAnswerHash,
    
    #[msg("Reveal deadline has expired.")]
    RevealDeadlineExpired,
    
    #[msg("Not in confidence voting phase.")]
    NotInConfidencePhase,
    
    #[msg("Confidence voting deadline has expired.")]
    ConfidenceDeadlineExpired,
    
    #[msg("Confidence voting is still active.")]
    ConfidenceVotingStillActive,
}
