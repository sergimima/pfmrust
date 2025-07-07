import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { VotingSystem } from "../target/types/voting_system";

// Datos de prueba realistas
const COMMUNITIES_DATA = [
  {
    name: "Blockchain Developers",
    description: "Community for blockchain developers to share knowledge and collaborate on projects",
    category: 0, // Technology
    quorum: 5,
    tags: ["blockchain", "solana", "rust", "development"]
  },
  {
    name: "DeFi Enthusiasts", 
    description: "Discuss decentralized finance protocols, yield farming, and DeFi strategies",
    category: 1, // Finance
    quorum: 3,
    tags: ["defi", "yield", "protocols", "trading"]
  },
  {
    name: "Solana Gaming",
    description: "Gaming community focused on Solana-based games and NFTs",
    category: 2, // Gaming  
    quorum: 4,
    tags: ["gaming", "nft", "solana", "metaverse"]
  },
  {
    name: "Crypto Art Gallery",
    description: "Digital art creators and collectors sharing their work",
    category: 3, // Art
    quorum: 2,
    tags: ["art", "nft", "digital", "creativity"]
  },
  {
    name: "Solana Education Hub",
    description: "Learn about Solana development, tokenomics, and ecosystem",
    category: 4, // Education
    quorum: 6,
    tags: ["education", "learning", "solana", "development"]
  }
];

const VOTINGS_DATA = [
  {
    question: "Should we implement a new staking mechanism for community tokens?",
    options: ["Yes, implement immediately", "Yes, but after more research", "No, current system is fine", "Need more discussion"],
    type: "Opinion",
    communityIndex: 0,
    deadline: 7 // 7 days
  },
  {
    question: "What is the current annual percentage yield (APY) for SOL staking?",
    options: ["4-5%", "6-7%", "8-9%", "10%+"],
    type: "Knowledge",
    correctAnswer: "6-7%",
    communityIndex: 1,
    deadline: 3
  },
  {
    question: "Which gaming feature should we prioritize for development?",
    options: ["PvP battles", "Guild system", "In-game marketplace", "Tournament mode"],
    type: "Opinion", 
    communityIndex: 2,
    deadline: 5
  },
  {
    question: "What is the maximum supply of SOL tokens?",
    options: ["No maximum (inflationary)", "500 million", "1 billion", "21 million"],
    type: "Knowledge",
    correctAnswer: "No maximum (inflationary)",
    communityIndex: 4,
    deadline: 4
  },
  {
    question: "Should we organize a virtual art exhibition this month?",
    options: ["Yes, this month", "Yes, but next month", "No, not interested"],
    type: "Opinion",
    communityIndex: 3,
    deadline: 2
  }
];

// Generar wallets de prueba (simulados)
function generateMockWallets(count: number): anchor.web3.Keypair[] {
  const wallets = [];
  for (let i = 0; i < count; i++) {
    wallets.push(anchor.web3.Keypair.generate());
  }
  return wallets;
}

async function populateData() {
  try {
    // Configure connection
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
    
    console.log("🌱 Iniciando población de datos en devnet...");
    console.log("Program ID:", program.programId.toString());
    console.log("Super Admin:", superAdminKeypair.publicKey.toString());
    
    // Generate mock users
    console.log("👥 Generando usuarios de prueba...");
    const mockUsers = generateMockWallets(8);
    const createdUsers = [];
    const createdCommunities = [];
    
    // Create mock users
    for (let i = 0; i < mockUsers.length; i++) {
      const user = mockUsers[i];
      console.log(`\n📝 Creando usuario ${i + 1}/8: ${user.publicKey.toString()}`);
      
      try {
        // Airdrop SOL to user for transactions
        const airdropSig = await connection.requestAirdrop(user.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL);
        await connection.confirmTransaction(airdropSig);
        
        // Calculate user PDA
        const [userPda] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("user"), user.publicKey.toBuffer()],
          program.programId
        );
        
        // Create user with their own keypair
        const userProvider = new anchor.AnchorProvider(connection, new anchor.Wallet(user), {
          commitment: "confirmed",
        });
        const userProgram = new anchor.Program(program.idl, program.programId, userProvider) as Program<VotingSystem>;
        
        const tx = await userProgram.methods
          .createUser()
          .accounts({
            user: userPda,
            wallet: user.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          } as any)
          .rpc();
          
        console.log(`  ✅ Usuario creado: ${userPda.toString()}`);
        createdUsers.push({ keypair: user, pda: userPda });
        
      } catch (error) {
        console.log(`  ⚠️ Usuario ${i + 1} ya existe o error:`, error.message);
        // Calculate PDA anyway for later use
        const [userPda] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("user"), user.publicKey.toBuffer()],
          program.programId
        );
        createdUsers.push({ keypair: user, pda: userPda });
      }
    }
    
    // Create communities
    console.log("\n🏘️ Creando comunidades...");
    for (let i = 0; i < COMMUNITIES_DATA.length; i++) {
      const communityData = COMMUNITIES_DATA[i];
      console.log(`\n🏗️ Creando comunidad: ${communityData.name}`);
      
      try {
        // Calculate community PDA
        const [communityPda] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("community"), superAdminKeypair.publicKey.toBuffer(), Buffer.from(communityData.name)],
          program.programId
        );
        
        const tx = await program.methods
          .createCommunity(
            communityData.name,
            communityData.category,
            communityData.quorum,
            false  // requires_approval
          )
          .accounts({
            community: communityPda,
            authority: superAdminKeypair.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          } as any)
          .rpc();
          
        console.log(`  ✅ Comunidad creada: ${communityPda.toString()}`);
        createdCommunities.push({ data: communityData, pda: communityPda });
        
      } catch (error) {
        console.log(`  ⚠️ Error creando comunidad ${communityData.name}:`, error.message);
      }
    }
    
    // Add users to communities
    console.log("\n🤝 Añadiendo usuarios a comunidades...");
    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      // Join first 3 communities
      for (let j = 0; j < Math.min(3, createdCommunities.length); j++) {
        const community = createdCommunities[j];
        
        try {
          console.log(`\n👤 Usuario ${user.keypair.publicKey.toString().slice(0, 8)}... uniéndose a ${community.data.name}`);
          
          // Calculate membership PDA
          const [membershipPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("membership"), community.pda.toBuffer(), user.keypair.publicKey.toBuffer()],
            program.programId
          );
          
          // Create user provider
          const userProvider = new anchor.AnchorProvider(connection, new anchor.Wallet(user.keypair), {
            commitment: "confirmed",
          });
          const userProgram = new anchor.Program(program.idl, program.programId, userProvider) as Program<VotingSystem>;
          
          const tx = await userProgram.methods
            .joinCommunity()
            .accounts({
              membership: membershipPda,
              community: community.pda,
              member: user.keypair.publicKey,
              user: user.pda,
              systemProgram: anchor.web3.SystemProgram.programId,
            } as any)
            .rpc();
            
          console.log(`  ✅ Membership creada: ${membershipPda.toString()}`);
          
        } catch (error) {
          console.log(`  ⚠️ Error uniendo usuario a comunidad:`, error.message);
        }
      }
    }
    
    console.log("\n🎉 Población de datos completada!");
    console.log(`✅ Usuarios creados: ${createdUsers.length}`);
    console.log(`✅ Comunidades creadas: ${createdCommunities.length}`);
    console.log(`✅ Sistema listo para testing con datos reales`);
    
  } catch (error) {
    console.error("❌ Error poblando datos:", error);
    if (error.logs) {
      console.log("📋 Transaction logs:");
      error.logs.forEach(log => console.log("  ", log));
    }
  }
}

console.log("🌐 Configurando población de datos en devnet...");
populateData()
  .then(() => {
    console.log("🎉 Población completada exitosamente!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Error fatal:", error);
    process.exit(1);
  });
