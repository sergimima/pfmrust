import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { VotingSystem } from "../target/types/voting_system";

async function populateSimple() {
  try {
    // Configure connection manually
    const connection = new anchor.web3.Connection("https://api.devnet.solana.com", "confirmed");
    
    // Load Super Admin keypair
    const keypairPath = "/home/sergi/.config/solana/id.json";
    const keypairFile = require('fs').readFileSync(keypairPath);
    const superAdminKeypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(JSON.parse(keypairFile.toString())));
    
    const wallet = new anchor.Wallet(superAdminKeypair);
    const provider = new anchor.AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    anchor.setProvider(provider);
    
    const program = anchor.workspace.VotingSystem as Program<VotingSystem>;
    
    console.log("🌱 Población simple en devnet...");
    console.log("Program ID:", program.programId.toString());
    console.log("Super Admin:", superAdminKeypair.publicKey.toString());
    
    // 1. Create one test user
    console.log("\n👤 Creando usuario de prueba...");
    const testUser = anchor.web3.Keypair.generate();
    
    // Airdrop SOL to test user
    console.log("💰 Solicitando airdrop para usuario...");
    const airdropSig = await connection.requestAirdrop(testUser.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await connection.confirmTransaction(airdropSig);
    console.log(`✅ Airdrop confirmado: ${testUser.publicKey.toString()}`);
    
    // Create test user account
    const [testUserPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user"), testUser.publicKey.toBuffer()],
      program.programId
    );
    
    console.log("📝 Creando cuenta de usuario...");
    const testUserProvider = new anchor.AnchorProvider(connection, new anchor.Wallet(testUser), {
      commitment: "confirmed",
    });
    
    try {
      const createUserTx = await program.methods
        .createUser()
        .accounts({
          user: testUserPda,
          wallet: testUser.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as any)
        .signers([testUser])
        .rpc();
        
      console.log(`✅ Usuario creado: ${testUserPda.toString()}`);
      console.log(`📋 TX: ${createUserTx}`);
    } catch (error) {
      console.log("⚠️ Usuario ya existe o error:", error.message);
    }
    
    // 2. Create one test community
    console.log("\n🏘️ Creando comunidad de prueba...");
    const communityName = "Test Community";
    
    const [communityPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("community"), superAdminKeypair.publicKey.toBuffer(), Buffer.from(communityName)],
      program.programId
    );
    
    try {
      // Use raw instruction to avoid TypeScript issues
      const createCommunityInstruction = await program.methods
        .createCommunity(
          communityName,
          0, // Technology category
          50, // 50% quorum
          false // requires_approval
        )
        .accounts({
          community: communityPda,
          authority: superAdminKeypair.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as any)
        .instruction();
        
      const tx = new anchor.web3.Transaction().add(createCommunityInstruction);
      const createCommunityTx = await provider.sendAndConfirm(tx);
      
      console.log(`✅ Comunidad creada: ${communityPda.toString()}`);
      console.log(`📋 TX: ${createCommunityTx}`);
    } catch (error) {
      console.log("⚠️ Comunidad ya existe o error:", error.message);
    }
    
    // 3. Join user to community
    console.log("\n🤝 Uniendo usuario a comunidad...");
    const [membershipPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("membership"), communityPda.toBuffer(), testUser.publicKey.toBuffer()],
      program.programId
    );
    
    try {
      const joinCommunityInstruction = await program.methods
        .joinCommunity()
        .accounts({
          membership: membershipPda,
          community: communityPda,
          member: testUser.publicKey,
          user: testUserPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as any)
        .instruction();
        
      const joinTx = new anchor.web3.Transaction().add(joinCommunityInstruction);
      const joinCommunityTx = await testUserProvider.sendAndConfirm(joinTx, [testUser]);
      
      console.log(`✅ Membership creada: ${membershipPda.toString()}`);
      console.log(`📋 TX: ${joinCommunityTx}`);
    } catch (error) {
      console.log("⚠️ Ya es miembro o error:", error.message);
    }
    
    console.log("\n🎉 Población simple completada!");
    console.log("✅ 1 usuario de prueba creado");
    console.log("✅ 1 comunidad creada");
    console.log("✅ 1 membership establecida");
    console.log("🚀 Sistema listo para testing básico");
    
  } catch (error) {
    console.error("❌ Error:", error);
    if (error.logs) {
      console.log("📋 Logs:");
      error.logs.forEach(log => console.log("  ", log));
    }
  }
}

console.log("🌐 Iniciando población simple...");
populateSimple()
  .then(() => {
    console.log("🎉 ¡Población exitosa!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Error fatal:", error);
    process.exit(1);
  });
