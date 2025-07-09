// IDL original restaurado - SIN tocar más
export const IDL = {
  "address": "98eSBn9oRdJcPzFUuRMgktewygF6HfkwiCQUJuJBw1z",
  "version": "0.1.0",
  "name": "voting_system",
  "instructions": [
    {
      "name": "createUser",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "email",
          "type": "string"
        }
      ]
    },
    {
      "name": "createCommunity",
      "accounts": [
        {
          "name": "community",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "category",
          "type": "u8"
        },
        {
          "name": "quorum_percentage",
          "type": "u8"
        },
        {
          "name": "requires_approval",
          "type": "bool"
        }
      ]
    },
    {
      "name": "joinCommunity",
      "accounts": [
        {
          "name": "membership",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "community",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createVoting",
      "accounts": [
        {
          "name": "vote",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "community",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "question",
          "type": "string"
        },
        {
          "name": "options",
          "type": {
            "vec": "string"
          }
        },
        {
          "name": "deadline",
          "type": "i64"
        }
      ]
    },
    {
      "name": "castVote",
      "accounts": [
        {
          "name": "participation",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vote",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "membership",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voter",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "optionIndex",
          "type": "u8"
        }
      ]
    }
  ],
  "types": [],
  "accounts": [
    {
      "name": "user",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "email",
            "type": "string"
          },
          {
            "name": "reputation",
            "type": "u32"
          },
          {
            "name": "joinedAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "community",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "memberCount",
            "type": "u32"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "membership",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "community",
            "type": "publicKey"
          },
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "joinedAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "vote",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "community",
            "type": "publicKey"
          },
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "question",
            "type": "string"
          },
          {
            "name": "options",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "results",
            "type": {
              "vec": "u32"
            }
          },
          {
            "name": "totalVotes",
            "type": "u32"
          },
          {
            "name": "deadline",
            "type": "i64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "participation",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vote",
            "type": "publicKey"
          },
          {
            "name": "voter",
            "type": "publicKey"
          },
          {
            "name": "optionIndex",
            "type": "u8"
          },
          {
            "name": "votedAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};

// Tipos básicos para compatibilidad
export interface UserAccount {
  authority: string;
  name: string;
  email: string;
  reputation: number;
  joinedAt: string;
  bump: number;
}

export interface VoteAccount {
  community: string;
  creator: string;
  question: string;
  options: string[];
  results: number[];
  totalVotes: number;
  deadline: string;
  createdAt: string;
  bump: number;
}

export const PROGRAM_ID = "98eSBn9oRdJcPzFUuRMgktewygF6HfkwiCQUJuJBw1z";
