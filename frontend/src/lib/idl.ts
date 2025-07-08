// Copiando IDL del smart contract para usarlo en el frontend
// Origen: voting-system/target/idl/voting_system.json

export const IDL = {
  "address": "98eSBn9oRdJcPzFUuRMgktewygF6HfkwiCQUJuJBw1z",
  "metadata": {
    "name": "voting_system",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  // IDL será importado aquí después de verificar el contenido completo
} as const;

export type VotingSystemIDL = typeof IDL;
