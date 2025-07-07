import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { VotingSystem } from "../target/types/voting_system";

async function initializeSystem() {
  try {
    // Configure the client manually with keypair
    const connection = new anchor.web3.Connection("https://api.devnet.solana.com", "confirmed");
    
    // Load keypair from file
    const keypairPath = "/home/sergi/.config/solana/id.json";
    const keypairFile = require('fs').readFileSync(keypairPath);
    const keypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(JSON.parse(keypairFile.toString())));
    
    const wallet = new anchor.Wallet(keypair);
    const provider = new anchor.AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    anchor.setProvider(provider);
    
    const program = anchor.workspace.VotingSystem as Program<VotingSystem>;
    
    console.log("🚀 Inicializando Super Admin en devnet...");
    console.log("Program ID:", program.programId.toString());
    console.log("Super Admin wallet:", provider.wallet.publicKey.toString());
    console.log("Network:", provider.connection.rpcEndpoint);
    
    // Calculate Super Admin user PDA
    const [userPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user"), provider.wallet.publicKey.toBuffer()],
      program.programId
    );
    
    console.log("👤 Super Admin PDA:", userPda.toString());
    
    // Check if user already exists
    try {
      const existingUser = await program.account.user.fetch(userPda);
      console.log("ℹ️  Super Admin ya existe:");
      console.log("  - Wallet:", existingUser.wallet.toString());
      console.log("  - Reputation:", existingUser.reputationPoints.toString());
      console.log("  - Level:", existingUser.level.toString());
      console.log("  - Total votes:", existingUser.totalVotesCast.toString());
      console.log("  - Created at:", new Date(existingUser.createdAt.toNumber() * 1000).toISOString());
      console.log("✅ Super Admin ya configurado correctamente!");
      return;
    } catch (error) {
      console.log("📝 Super Admin no existe, creando...");
    }
    
    // Create Super Admin user
    console.log("🔨 Creando Super Admin...");
    const instruction = await program.methods
      .createUser()
      .accounts({
        user: userPda,
        wallet: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .instruction();
      
    const tx = await provider.sendAndConfirm(new anchor.web3.Transaction().add(instruction));
      
    console.log("✅ Super Admin creado exitosamente!");
    console.log("📋 Transaction signature:", tx);
    console.log("🔗 Explorer: https://explorer.solana.com/tx/" + tx + "?cluster=devnet");
    
    // Verify creation
    const userAccount = await program.account.user.fetch(userPda);
    console.log("👤 Super Admin configurado:");
    console.log("  - Wallet:", userAccount.wallet.toString());
    console.log("  - Reputation:", userAccount.reputationPoints.toString());
    console.log("  - Level:", userAccount.level.toString());
    console.log("  - Total votes:", userAccount.totalVotesCast.toString());
    console.log("  - Created at:", new Date(userAccount.createdAt.toNumber() * 1000).toISOString());
    console.log("  - PDA:", userPda.toString());
    
  } catch (error) {
    console.error("❌ Error:", error);
    if (error.logs) {
      console.log("📋 Transaction logs:");
      error.logs.forEach(log => console.log("  ", log));
    }
  }
}

// Set devnet explicitly
process.env.ANCHOR_PROVIDER_URL = "https://api.devnet.solana.com";

console.log("🌐 Configurando devnet...");
initializeSystem()
  .then(() => {
    console.log("🎉 Inicialización completada!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Error fatal:", error);
    process.exit(1);
  });
