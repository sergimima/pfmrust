export const IDL = {
  "metadata": {
    "name": "voting_system",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "cast_vote",
      "discriminator": [20, 212, 15, 189, 69, 180, 69, 151],
      "accounts": [
        {
          "name": "participation",
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "const", "value": [112, 97, 114, 116, 105, 99, 105, 112, 97, 116, 105, 111, 110] },
              { "kind": "account", "path": "vote" },
              { "kind": "account", "path": "voter" }
            ]
          }
        },
        { "name": "vote", "writable": true },
        { "name": "membership" },
        { "name": "user", "writable": true },
        { "name": "voter", "writable": true, "signer": true },
        { "name": "system_program", "address": "11111111111111111111111111111111" }
      ],
      "args": [{ "name": "option_selected", "type": "u8" }]
    },
    {
      "name": "create_user",
      "discriminator": [108, 227, 130, 130, 252, 109, 75, 218],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "const", "value": [117, 115, 101, 114] },
              { "kind": "account", "path": "wallet" }
            ]
          }
        },
        { "name": "wallet", "writable": true, "signer": true },
        { "name": "system_program", "address": "11111111111111111111111111111111" }
      ],
      "args": []
    },
    {
      "name": "create_community",
      "discriminator": [203, 214, 176, 194, 13, 207, 22, 60],
      "accounts": [
        {
          "name": "community",
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "const", "value": [99, 111, 109, 109, 117, 110, 105, 116, 121] },
              { "kind": "account", "path": "authority" },
              { "kind": "arg", "path": "name" }
            ]
          }
        },
        { "name": "authority", "writable": true, "signer": true },
        { "name": "system_program", "address": "11111111111111111111111111111111" }
      ],
      "args": [
        { "name": "name", "type": "string" },
        { "name": "category", "type": "u8" },
        { "name": "quorum_percentage", "type": "u8" },
        { "name": "requires_approval", "type": "bool" }
      ]
    },
    {
      "name": "create_voting",
      "discriminator": [80, 167, 83, 59, 173, 210, 195, 40],
      "accounts": [
        {
          "name": "vote",
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "const", "value": [118, 111, 116, 101] },
              { "kind": "account", "path": "community" },
              { "kind": "account", "path": "creator" }
            ]
          }
        },
        { "name": "community", "writable": true },
        { "name": "user" },
        { "name": "creator", "writable": true, "signer": true },
        {
          "name": "fee_pool",
          "writable": true,
          "optional": true,
          "pda": {
            "seeds": [{ "kind": "const", "value": [102, 101, 101, 95, 112, 111, 111, 108] }]
          }
        },
        { "name": "system_program", "address": "11111111111111111111111111111111" }
      ],
      "args": [
        { "name": "question", "type": "string" },
        { "name": "options", "type": { "vec": "string" } },
        { "name": "vote_type", "type": { "defined": { "name": "VoteType" } } },
        { "name": "correct_answer", "type": { "option": "u8" } },
        { "name": "deadline_hours", "type": "u32" },
        { "name": "quorum_required", "type": "u64" },
        { "name": "quorum_percentage", "type": { "option": "u8" } },
        { "name": "use_percentage_quorum", "type": "bool" }
      ]
    },
    {
      "name": "join_community",
      "discriminator": [252, 106, 147, 30, 134, 74, 28, 232],
      "accounts": [
        {
          "name": "membership",
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "const", "value": [109, 101, 109, 98, 101, 114, 115, 104, 105, 112] },
              { "kind": "account", "path": "community" },
              { "kind": "account", "path": "member" }
            ]
          }
        },
        { "name": "community", "writable": true },
        { "name": "user" },
        { "name": "member", "writable": true, "signer": true },
        { "name": "system_program", "address": "11111111111111111111111111111111" }
      ],
      "args": []
    }
  ],
  "accounts": [
    { "name": "Appeal", "discriminator": [155, 196, 80, 143, 64, 220, 198, 177] },
    { "name": "BanRecord", "discriminator": [142, 178, 207, 85, 75, 207, 248, 149] },
    { "name": "CategorySubscription", "discriminator": [64, 141, 196, 184, 24, 78, 187, 131] },
    { "name": "Community", "discriminator": [192, 73, 211, 158, 178, 81, 19, 112] },
    { "name": "CustomCategory", "discriminator": [76, 10, 133, 106, 215, 69, 137, 170] },
    { "name": "FeePool", "discriminator": [172, 38, 77, 146, 148, 5, 51, 242] },
    { "name": "Membership", "discriminator": [231, 141, 180, 98, 109, 168, 175, 166] },
    { "name": "MembershipRequest", "discriminator": [186, 187, 91, 238, 189, 248, 20, 59] },
    { "name": "ModerationLog", "discriminator": [125, 203, 214, 12, 175, 29, 142, 97] },
    { "name": "Participation", "discriminator": [237, 154, 142, 46, 143, 63, 189, 18] },
    { "name": "Report", "discriminator": [232, 246, 229, 227, 242, 105, 190, 2] },
    { "name": "ReportCounter", "discriminator": [107, 50, 134, 174, 48, 221, 114, 246] },
    { "name": "RewardRecord", "discriminator": [44, 129, 188, 244, 91, 0, 49, 222] },
    { "name": "User", "discriminator": [159, 117, 95, 227, 239, 151, 58, 236] },
    { "name": "Vote", "discriminator": [96, 91, 104, 57, 145, 35, 172, 155] }
  ],
  "errors": [
    { "code": 6000, "name": "NameTooLong", "msg": "Name is too long. Maximum 50 characters." },
    { "code": 6001, "name": "InvalidQuorum", "msg": "Invalid quorum percentage. Must be between 1 and 100." },
    { "code": 6002, "name": "QuestionTooLong", "msg": "Question is too long. Maximum 200 characters." },
    { "code": 6003, "name": "InvalidOptionsCount", "msg": "Invalid number of options. Must be between 2 and 4." }
  ],
  "types": [
    {
      "name": "Appeal",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "appellant", "type": "pubkey" },
          { "name": "ban_record", "type": "pubkey" },
          { "name": "community", "type": "pubkey" },
          { "name": "reason", "type": "string" },
          { "name": "status", "type": { "defined": { "name": "AppealStatus" } } },
          { "name": "reviewed_by", "type": { "option": "pubkey" } },
          { "name": "appealed_at", "type": "i64" },
          { "name": "reviewed_at", "type": { "option": "i64" } },
          { "name": "bump", "type": "u8" }
        ]
      }
    },
    {
      "name": "AppealStatus",
      "type": {
        "kind": "enum",
        "variants": [
          { "name": "Pending" },
          { "name": "Approved" },
          { "name": "Denied" }
        ]
      }
    },
    {
      "name": "BanRecord",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "user", "type": "pubkey" },
          { "name": "community", "type": "pubkey" },
          { "name": "moderator", "type": "pubkey" },
          { "name": "ban_type", "type": { "defined": { "name": "BanType" } } },
          { "name": "reason", "type": "string" },
          { "name": "banned_at", "type": "i64" },
          { "name": "expires_at", "type": { "option": "i64" } },
          { "name": "is_active", "type": "bool" },
          { "name": "bump", "type": "u8" }
        ]
      }
    },
    {
      "name": "BanType",
      "type": {
        "kind": "enum",
        "variants": [
          { "name": "Temporary" },
          { "name": "Permanent" }
        ]
      }
    },
    {
      "name": "CategorySubscription",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "user", "type": "pubkey" },
          { "name": "category", "type": { "defined": { "name": "VotingCategory" } } },
          { "name": "community", "type": { "option": "pubkey" } },
          { "name": "subscribed_at", "type": "i64" },
          { "name": "is_active", "type": "bool" },
          { "name": "notification_enabled", "type": "bool" },
          { "name": "bump", "type": "u8" }
        ]
      }
    },
    {
      "name": "Community",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "authority", "type": "pubkey" },
          { "name": "moderators", "type": { "vec": "pubkey" } },
          { "name": "name", "type": "string" },
          { "name": "category", "type": "u8" },
          { "name": "quorum_percentage", "type": "u8" },
          { "name": "total_members", "type": "u64" },
          { "name": "total_votes", "type": "u64" },
          { "name": "fee_collected", "type": "u64" },
          { "name": "created_at", "type": "i64" },
          { "name": "is_active", "type": "bool" },
          { "name": "requires_approval", "type": "bool" },
          { "name": "bump", "type": "u8" }
        ]
      }
    },
    {
      "name": "CustomCategory",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "community", "type": "pubkey" },
          { "name": "name", "type": "string" },
          { "name": "description", "type": "string" },
          { "name": "color", "type": "string" },
          { "name": "icon", "type": "string" },
          { "name": "created_by", "type": "pubkey" },
          { "name": "created_at", "type": "i64" },
          { "name": "is_active", "type": "bool" },
          { "name": "usage_count", "type": "u64" },
          { "name": "bump", "type": "u8" }
        ]
      }
    },
    {
      "name": "FeePool",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "total_collected", "type": "u64" },
          { "name": "daily_distribution", "type": "u64" },
          { "name": "last_distribution", "type": "i64" },
          { "name": "bump", "type": "u8" }
        ]
      }
    },
    {
      "name": "Membership",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "user", "type": "pubkey" },
          { "name": "community", "type": "pubkey" },
          { "name": "role", "type": { "defined": { "name": "UserRole" } } },
          { "name": "joined_at", "type": "i64" },
          { "name": "is_active", "type": "bool" },
          { "name": "bump", "type": "u8" }
        ]
      }
    },
    {
      "name": "MembershipRequest",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "user", "type": "pubkey" },
          { "name": "community", "type": "pubkey" },
          { "name": "message", "type": "string" },
          { "name": "status", "type": { "defined": { "name": "MembershipRequestStatus" } } },
          { "name": "requested_at", "type": "i64" },
          { "name": "reviewed_by", "type": { "option": "pubkey" } },
          { "name": "reviewed_at", "type": { "option": "i64" } },
          { "name": "admin_notes", "type": "string" },
          { "name": "bump", "type": "u8" }
        ]
      }
    },
    {
      "name": "MembershipRequestStatus",
      "type": {
        "kind": "enum",
        "variants": [
          { "name": "Pending" },
          { "name": "Approved" },
          { "name": "Rejected" },
          { "name": "Cancelled" }
        ]
      }
    },
    {
      "name": "ModerationAction",
      "type": {
        "kind": "enum",
        "variants": [
          { "name": "Ban" },
          { "name": "Unban" },
          { "name": "AssignModerator" },
          { "name": "RemoveModerator" },
          { "name": "CloseVote" },
          { "name": "ReviewReport" },
          { "name": "ReviewAppeal" },
          { "name": "None" },
          { "name": "Warning" },
          { "name": "TempBan" },
          { "name": "PermaBan" },
          { "name": "RemoveContent" },
          { "name": "RestrictVoting" },
          { "name": "RemoveMember" },
          { "name": "ApproveMembership" },
          { "name": "RejectMembership" }
        ]
      }
    },
    {
      "name": "ModerationLog",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "community", "type": "pubkey" },
          { "name": "moderator", "type": "pubkey" },
          { "name": "target_user", "type": { "option": "pubkey" } },
          { "name": "target_vote", "type": { "option": "pubkey" } },
          { "name": "action", "type": { "defined": { "name": "ModerationAction" } } },
          { "name": "reason", "type": "string" },
          { "name": "executed_at", "type": "i64" },
          { "name": "bump", "type": "u8" }
        ]
      }
    },
    {
      "name": "Participation",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "user", "type": "pubkey" },
          { "name": "vote", "type": "pubkey" },
          { "name": "option_selected", "type": "u8" },
          { "name": "voted_at", "type": "i64" },
          { "name": "bump", "type": "u8" }
        ]
      }
    },
    {
      "name": "Report",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "reporter", "type": "pubkey" },
          { "name": "target_vote", "type": "pubkey" },
          { "name": "community", "type": "pubkey" },
          { "name": "report_type", "type": { "defined": { "name": "ReportType" } } },
          { "name": "reason", "type": "string" },
          { "name": "status", "type": { "defined": { "name": "ReportStatus" } } },
          { "name": "reviewed_by", "type": { "option": "pubkey" } },
          { "name": "reported_at", "type": "i64" },
          { "name": "reviewed_at", "type": { "option": "i64" } },
          { "name": "bump", "type": "u8" }
        ]
      }
    },
    {
      "name": "ReportCounter",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "target_vote", "type": "pubkey" },
          { "name": "community", "type": "pubkey" },
          { "name": "total_reports", "type": "u32" },
          { "name": "spam_count", "type": "u32" },
          { "name": "offensive_count", "type": "u32" },
          { "name": "off_topic_count", "type": "u32" },
          { "name": "misinformation_count", "type": "u32" },
          { "name": "harassment_count", "type": "u32" },
          { "name": "inappropriate_count", "type": "u32" },
          { "name": "copyright_count", "type": "u32" },
          { "name": "other_count", "type": "u32" },
          { "name": "auto_action_triggered", "type": "bool" },
          { "name": "last_reported_at", "type": "i64" },
          { "name": "bump", "type": "u8" }
        ]
      }
    },
    {
      "name": "ReportStatus",
      "type": {
        "kind": "enum",
        "variants": [
          { "name": "Pending" },
          { "name": "UnderReview" },
          { "name": "Reviewed" },
          { "name": "Resolved" },
          { "name": "Dismissed" },
          { "name": "Escalated" }
        ]
      }
    },
    {
      "name": "ReportType",
      "type": {
        "kind": "enum",
        "variants": [
          { "name": "Spam" },
          { "name": "Offensive" },
          { "name": "OffTopic" },
          { "name": "Misinformation" },
          { "name": "Harassment" },
          { "name": "Inappropriate" },
          { "name": "Copyright" },
          { "name": "Other" }
        ]
      }
    },
    {
      "name": "RewardRecord",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "user", "type": "pubkey" },
          { "name": "total_claimed", "type": "u64" },
          { "name": "last_claimed", "type": "i64" },
          { "name": "claims_count", "type": "u32" },
          { "name": "bump", "type": "u8" }
        ]
      }
    },
    {
      "name": "User",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "wallet", "type": "pubkey" },
          { "name": "reputation_points", "type": "u64" },
          { "name": "level", "type": "u32" },
          { "name": "total_votes_cast", "type": "u64" },
          { "name": "voting_weight", "type": "f32" },
          { "name": "created_at", "type": "i64" },
          { "name": "bump", "type": "u8" }
        ]
      }
    },
    {
      "name": "UserRole",
      "type": {
        "kind": "enum",
        "variants": [
          { "name": "Member" },
          { "name": "Moderator" },
          { "name": "Admin" },
          { "name": "Banned" }
        ]
      }
    },
    {
      "name": "Vote",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "community", "type": "pubkey" },
          { "name": "creator", "type": "pubkey" },
          { "name": "question", "type": "string" },
          { "name": "vote_type", "type": { "defined": { "name": "VoteType" } } },
          { "name": "options", "type": { "vec": "string" } },
          { "name": "correct_answer", "type": { "option": "u8" } },
          { "name": "participants", "type": { "vec": "pubkey" } },
          { "name": "results", "type": { "vec": "u64" } },
          { "name": "total_votes", "type": "u64" },
          { "name": "quorum_required", "type": "u64" },
          { "name": "quorum_percentage", "type": { "option": "u8" } },
          { "name": "use_percentage_quorum", "type": "bool" },
          { "name": "deadline", "type": "i64" },
          { "name": "status", "type": { "defined": { "name": "VoteStatus" } } },
          { "name": "fee_per_vote", "type": "u64" },
          { "name": "created_at", "type": "i64" },
          { "name": "answer_hash", "type": { "option": { "array": ["u8", 32] } } },
          { "name": "revealed_answer", "type": { "option": "string" } },
          { "name": "reveal_deadline", "type": { "option": "i64" } },
          { "name": "confidence_votes_for", "type": "u32" },
          { "name": "confidence_votes_against", "type": "u32" },
          { "name": "confidence_deadline", "type": { "option": "i64" } },
          { "name": "weighted_voting_enabled", "type": "bool" },
          { "name": "weighted_results", "type": { "vec": "f32" } },
          { "name": "bump", "type": "u8" }
        ]
      }
    },
    {
      "name": "VoteStatus",
      "type": {
        "kind": "enum",
        "variants": [
          { "name": "Active" },
          { "name": "Completed" },
          { "name": "Cancelled" },
          { "name": "Failed" },
          { "name": "AwaitingReveal" },
          { "name": "ConfidenceVoting" }
        ]
      }
    },
    {
      "name": "VoteType",
      "type": {
        "kind": "enum",
        "variants": [
          { "name": "Opinion" },
          { "name": "Knowledge" }
        ]
      }
    },
    {
      "name": "VotingCategory",
      "type": {
        "kind": "enum",
        "variants": [
          { "name": "Technology" },
          { "name": "Finance" },
          { "name": "Gaming" },
          { "name": "Art" },
          { "name": "Education" },
          { "name": "Sports" },
          { "name": "Music" },
          { "name": "Politics" },
          { "name": "Science" },
          { "name": "General" },
          { "name": "Custom" }
        ]
      }
    }
  ]
};

export const PROGRAM_ID = "98eSBn9oRdJcPzFUuRMgktewygF6HfkwiCQUJuJBw1z";