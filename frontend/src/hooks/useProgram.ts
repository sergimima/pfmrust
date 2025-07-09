// frontend/src/hooks/useProgram.ts - IMPLEMENTACIÓN REAL CON ANCHOR
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import { Program, AnchorProvider, BN, setProvider } from '@coral-xyz/anchor';
import { useMemo } from 'react';
import { IDL, UserAccount, VoteAccount } from '../lib/idl';

// Program ID del smart contract deployado
const PROGRAM_ID = new PublicKey('98eSBn9oRdJcPzFUuRMgktewygF6HfkwiCQUJuJBw1z');

export const useProgram = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const program: any | null = useMemo(() => {
    try {
      if (!wallet) {
        console.log('❌ Wallet no conectada');
        return null;
      }

      console.log('🔄 Inicializando programa Anchor...');
      
      // Crear provider de Anchor
      const provider = new AnchorProvider(
        connection,
        wallet,
        { commitment: 'confirmed' }
      );
      
      // Establecer el provider globalmente
      setProvider(provider);
      
      console.log('🔑 Usando Program ID:', PROGRAM_ID.toString());
      
      // Enfoque directo para Anchor 0.31.1
      try {
        // Crear un objeto de programa directamente sin usar el constructor Program
        // Esto evita los problemas con el constructor Program y el error _bn
        
        // 1. Obtener el IDL limpio
        const cleanIdl = JSON.parse(JSON.stringify(IDL));
        if ('address' in cleanIdl) {
          delete cleanIdl.address;
        }
        
        // 2. Verificar la estructura del IDL
        const createCommunityInstruction = cleanIdl.instructions?.find(
          (i: any) => i.name === 'createCommunity'
        );
        console.log('🔍 Instrucción createCommunity:', createCommunityInstruction);
        
        // 3. Crear un programa manualmente
        // @ts-ignore - Usar una forma alternativa de inicializar el programa
        const programInstance = {
          programId: PROGRAM_ID,
          provider: provider,
          idl: cleanIdl,
          account: {},
          methods: {},
          rpc: {}
        };
        
        // 4. Configurar el programa con los métodos necesarios
        // @ts-ignore
        programInstance.account = {};
        // @ts-ignore
        programInstance.methods = {};
        
        // 5. Configurar los métodos específicos que necesitamos
        // @ts-ignore
        programInstance.methods.createCommunity = function(name, category, quorum_percentage, requires_approval) {
          return {
            accounts: function(accounts: any) {
              return {
                rpc: async function() {
                  console.log('📣 Llamando a createCommunity con:', { name, category, quorum_percentage, requires_approval, accounts });
                  
                  try {
                    // Crear una transacción manualmente
                    const transaction = new Transaction();
                    
                    // Vamos a usar un enfoque diferente: usar el sighash correcto para la instrucción
                    // El sighash es el hash SHA256 de "global:createCommunity" truncado a 8 bytes
                    // Este es el discriminador que Anchor usa para identificar instrucciones
                    
                    // Usaremos un valor conocido para el discriminador de createCommunity
                    // Este valor se puede obtener del IDL o calcularlo con sha256("global:createCommunity").slice(0, 8)
                    const METHOD_NAME = "createCommunity";
                    const METHOD_NS = "global";
                    const discriminator = Buffer.from(
                      // Este es el discriminador real para "global:createCommunity" según el IDL
                      [203, 214, 176, 194, 13, 207, 22, 60]
                    );
                    
                    // Serializar los argumentos según el formato de Anchor
                    // 1. String (name): [longitud (u32 LE)][bytes]
                    const nameBuffer = Buffer.from(name);
                    const nameLength = Buffer.alloc(4);
                    nameLength.writeUInt32LE(nameBuffer.length, 0);
                    
                    // 2. u8 (category): un solo byte
                    const categoryByte = Buffer.from([category]);
                    
                    // 3. u8 (quorum_percentage): un solo byte
                    const quorumByte = Buffer.from([quorum_percentage]);
                    
                    // 4. bool (requires_approval): un solo byte (0 o 1)
                    const approvalByte = Buffer.from([requires_approval ? 1 : 0]);
                    
                    // Concatenar todo en el orden correcto
                    const data = Buffer.concat([
                      discriminator,   // 8 bytes
                      nameLength,      // 4 bytes
                      nameBuffer,      // n bytes
                      categoryByte,    // 1 byte
                      quorumByte,      // 1 byte
                      approvalByte     // 1 byte
                    ]);
                    
                    console.log('🔍 Datos de instrucción:', {
                      discriminator: discriminator.toString('hex'),
                      nameLength: nameLength.toString('hex'),
                      nameBuffer: nameBuffer.toString('hex'),
                      categoryByte: categoryByte.toString('hex'),
                      quorumByte: quorumByte.toString('hex'),
                      approvalByte: approvalByte.toString('hex'),
                      data: data.toString('hex')
                    });
                    
                    // Crear la instrucción
                    const instruction = new TransactionInstruction({
                      keys: [
                        { pubkey: accounts.community, isSigner: false, isWritable: true },
                        { pubkey: accounts.authority, isSigner: true, isWritable: false },
                        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
                      ],
                      programId: PROGRAM_ID,
                      data: data,
                    });
                    
                    // Añadir la instrucción a la transacción
                    transaction.add(instruction);
                    
                    // Enviar la transacción
                    const signature = await provider.sendAndConfirm(transaction);
                    console.log('✅ Transacción enviada con éxito:', signature);
                    return signature;
                  } catch (error) {
                    console.error('❌ Error al enviar la transacción:', error);
                    throw error;
                  }
                }
              };
            }
          };
        };
        
        console.log('✅ Programa inicializado manualmente');
        return programInstance;
      } catch (error) {
        console.error('❌ Error en inicialización manual:', error);
        return null;
      }
    } catch (error) {
      console.error('❌ Error inicializando programa Anchor:', error);
      return null;
    }
  }, [connection, wallet]);

  return {
    program,
    isConnected: !!program,
    wallet,
    connection,
    programId: PROGRAM_ID
  };
};

// Hook para manejar usuarios
export const useUser = () => {
  const { program, isConnected, wallet } = useProgram();

  const createUser = async () => {
    if (!program || !wallet?.publicKey) {
      throw new Error('❌ Wallet no conectado o programa no disponible');
    }

    console.log('👤 Creando usuario REAL en blockchain...');
    
    try {
      // Derivar PDA para el usuario
      const [userPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user'), wallet.publicKey.toBuffer()],
        program.programId
      );

      console.log('📝 User PDA:', userPda.toString());
      console.log('🔐 Wallet requiere FIRMA para crear usuario');

      // Llamar a create_user del smart contract REAL
      
      const tx = await (program.methods as any).createUser("Usuario Test", "test@example.com")
        .accounts({
          user: userPda,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('✅ Usuario creado exitosamente en blockchain');
      console.log('🔗 Transaction signature:', tx);
      
      return { userPda, transaction: tx };
    } catch (error: any) {
      console.error('❌ Error creando usuario en blockchain:', error);
      throw new Error(`Error creando usuario: ${error.message}`);
    }
  };

  const getUserPDA = () => {
    if (!wallet?.publicKey) return null;
    
    const [userPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('user'), wallet.publicKey.toBuffer()],
      PROGRAM_ID
    );
    
    return userPda;
  };

  const fetchUser = async () => {
    if (!program || !wallet?.publicKey) return null;

    try {
      const userPda = getUserPDA();
      if (!userPda) return null;

      const userAccount: UserAccount = await (program.account as any)['user'].fetch(userPda);
      console.log('✅ Usuario obtenido desde blockchain:', userAccount);
      
      return {
        address: userPda,
        authority: userAccount.authority,
        name: userAccount.name,
        email: userAccount.email,
        reputation: userAccount.reputation,
        joinedAt: userAccount.joinedAt,
        bump: userAccount.bump
      };
    } catch (error) {
      console.log('ℹ️ Usuario no existe en blockchain:', error);
      return null;
    }
  };

  return {
    createUser,
    fetchUser,
    getUserPDA,
    isConnected,
    wallet
  };
};

// Hook para manejar comunidades
export const useCommunity = () => {
  const { program, isConnected, wallet } = useProgram();

  const createCommunity = async (params: {
    name: string;
    category: number;
    quorum_percentage?: number; // Nombre exacto como en el IDL
    quorumPercentage?: number; // Mantener compatibilidad con código existente
    requires_approval?: boolean; // Nombre exacto como en el IDL
    requiresApproval?: boolean; // Mantener compatibilidad con código existente
  }) => {
    if (!program || !wallet?.publicKey) {
      throw new Error('❌ Wallet no conectado o programa no disponible');
    }

    console.log('🏘️ Creando comunidad REAL en blockchain...', params);
    
    try {
      // Derivar PDA para la comunidad
      const [communityPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('community'),
          wallet.publicKey.toBuffer(),
          Buffer.from(params.name)
        ],
        program.programId
      );
      
      console.log('📝 Community PDA:', communityPda.toString());
      console.log('🔐 Wallet requiere FIRMA para crear comunidad');

      // CORRECCIÓN CRÍTICA: Conversión explícita a u8
      const quorumPercentage = params.quorum_percentage || params.quorumPercentage || 50;
      const requiresApproval = params.requires_approval !== undefined ? params.requires_approval : (params.requiresApproval !== undefined ? params.requiresApproval : false);
      
      // CONVERSIÓN FORZADA A u8 (0-255) con parseInt
      const categoryU8 = parseInt(String(Math.max(0, Math.min(255, params.category || 0))));
      const quorumU8 = parseInt(String(Math.max(1, Math.min(100, quorumPercentage))));
      
      console.log('🔧 CONVERSIÓN FORZADA A u8 con parseInt:');
      console.log('- category original:', params.category, '-> u8:', categoryU8);
      console.log('- quorum original:', quorumPercentage, '-> u8:', quorumU8);
      console.log('- requires_approval:', requiresApproval);
      
      // Verificar que los valores están en el rango correcto
      if (categoryU8 < 0 || categoryU8 > 255) {
        throw new Error(`Category fuera de rango u8: ${categoryU8}`);
      }
      if (quorumU8 < 1 || quorumU8 > 100) {
        throw new Error(`Quorum fuera de rango válido: ${quorumU8}`);
      }
      
      console.log('✅ VALIDACIÓN EXITOSA - Valores u8 correctos');
      console.log('📊 VALORES FINALES:');
      console.log('- name:', params.name, '(string)');
      console.log('- category:', categoryU8, '(u8)');
      console.log('- quorum_percentage:', quorumU8, '(u8)');
      console.log('- requires_approval:', requiresApproval, '(bool)');
      
      // Asignar valores convertidos
      params.quorum_percentage = quorumU8;
      params.requires_approval = requiresApproval;
      const category = categoryU8;
      
      console.log('SOLUCIÓN FINAL - Usando nombres exactos del IDL:');
      console.log('- quorum_percentage:', params.quorum_percentage, 'tipo:', typeof params.quorum_percentage);
      console.log('- category:', category, 'tipo:', typeof category);
      console.log('- requires_approval:', params.requires_approval, 'tipo:', typeof params.requires_approval);
      
      console.log('USANDO VALORES REALES DEL USUARIO:');
      console.log('- quorum original:', params.quorumPercentage, '-> normalizado:', params.quorum_percentage);
      console.log('- category original:', params.category, '-> normalizado:', category);
      console.log('- Validación: quorum > 0 && quorum <= 100 =', params.quorum_percentage > 0 && params.quorum_percentage <= 100);
      
      console.log('🔢 TESTING - Valores finales');
      console.log('🔍 DEBUGGING - quorum_percentage:', params.quorum_percentage);
      console.log('🔍 DEBUGGING - category:', category);
      console.log('🔍 DEBUGGING - Program ID:', PROGRAM_ID.toString());
      
      // Obtener el valor de requires_approval para logs
      //const requiresApproval = params.requires_approval;
      
      console.log('🔍 DEBUG - Params recibidos:', params);
      console.log('🔍 DEBUG - quorum_percentage:', params.quorum_percentage);
      console.log('🔍 DEBUG - category:', category);
      
      console.log('Valores finales a enviar:', {
        name: params.name,
        category: category,
        quorum_percentage: params.quorum_percentage,
        requires_approval: params.requires_approval
      });
      
      // Usar 4 parámetros como está definido en lib.rs (la implementación real)
      console.log('🔄 Enviando 4 parámetros como en lib.rs (con números nativos)...');
      console.log('🔍 Tipos finales:', {
        name: typeof params.name,
        category: typeof category + ' (valor: ' + category + ')',
        quorum_percentage: typeof params.quorum_percentage + ' (valor: ' + params.quorum_percentage + ')',
        requires_approval: typeof params.requires_approval
      });
      console.log('📝 TRANSACTION DETAILS:');
      console.log('- Community PDA:', communityPda.toString());
      console.log('- Authority:', wallet.publicKey.toString());
      console.log('- System Program:', SystemProgram.programId.toString());
      
      // DEBUGGING FINAL - Verificar valores nativos
      console.log('🔍 DEBUGGING FINAL - Valores nativos exactos:');
      console.log('- name bytes:', Buffer.from(params.name).toString('hex'));
      console.log('- category nativo:', category, 'tipo:', typeof category);
      console.log('- quorum_percentage:', params.quorum_percentage, 'tipo:', typeof params.quorum_percentage);
      console.log('- requires_approval:', params.requires_approval);
      
      console.log('💨 PROBANDO CON 4 PARÁMETROS (usando nombres exactos del IDL):');
      console.log('- name:', params.name);
      console.log('- category:', category);
      console.log('- quorum_percentage:', params.quorum_percentage);
      console.log('- requires_approval:', params.requires_approval);
      
      try {
        // Usar nuestra implementación manual del programa
        console.log('🔄 Usando implementación manual del programa...');
        
        // El smart contract acepta 4 parámetros
        // (name, category, quorum_percentage, requires_approval)
        const method = program.methods.createCommunity(
          params.name,
          category,
          params.quorum_percentage,
          params.requires_approval
        );
        console.log('✅ Método creado exitosamente');
        
        console.log('🔄 Paso 2: Configurando cuentas...');
        const methodWithAccounts = method.accounts({
          community: communityPda,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        });
        console.log('✅ Cuentas configuradas exitosamente');
        
        console.log('🔄 Paso 3: Enviando transacción a la red...');
        const tx = await methodWithAccounts.rpc();
        console.log('✅ Transacción enviada exitosamente');
        
        console.log('✅ Comunidad creada exitosamente en blockchain');
        console.log('🔗 Transaction signature:', tx);
        
        return { communityPda, transaction: tx };
      } catch (error: any) {
        console.log('❌ ERROR DETALLADO:');
        console.log('- Error type:', typeof error);
        console.log('- Error name:', error.name);
        console.log('- Error message:', error.message);
        console.log('- Error stack:', error.stack);
        console.log('- Error completo:', error);
        
        if (error.logs) {
          console.log('📜 LOGS DE LA TRANSACCIÓN:');
          error.logs.forEach((log: string, i: number) => {
            console.log(`  ${i}: ${log}`);
          });
        }
        
        throw error;
      }
    } catch (error: any) {
      console.error('❌ Error creando comunidad en blockchain:', error);
      throw new Error(`Error creando comunidad: ${error.message}`);
    }
  };

  const joinCommunity = async (communityPda: PublicKey) => {
    if (!program || !wallet?.publicKey) {
      throw new Error('❌ Wallet no conectado o programa no disponible');
    }

    console.log('🤝 Uniéndose REAL a comunidad...', communityPda.toString());
    
    try {
      // Derivar PDA para membership
      const [membershipPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('membership'),
          communityPda.toBuffer(),
          wallet.publicKey.toBuffer()
        ],
        program.programId
      );

      // Obtener PDA del usuario
      const [userPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user'), wallet.publicKey.toBuffer()],
        program.programId
      );

      console.log('📝 Membership PDA:', membershipPda.toString());
      console.log('🔐 Wallet requiere FIRMA para unirse');

      // Llamar a join_community del smart contract REAL
      // Añadir aserción de tipo para evitar error de recursividad infinita
      const tx = await (program.methods as any).joinCommunity()
        .accounts({
          membership: membershipPda,
          community: communityPda,
          user: userPda,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('✅ Unido a comunidad exitosamente en blockchain');
      console.log('🔗 Transaction signature:', tx);
      
      return { membershipPda, transaction: tx };
    } catch (error: any) {
      console.error('❌ Error uniéndose a comunidad en blockchain:', error);
      throw new Error(`Error uniéndose a comunidad: ${error.message}`);
    }
  };

  return {
    createCommunity,
    joinCommunity,
    isConnected,
    wallet
  };
};

// Hook para manejar votaciones
export const useVoting = () => {
  const { program, isConnected, wallet } = useProgram();

  const createVoting = async (params: {
    question: string;
    options: string[];
    voteType: 'Opinion' | 'Knowledge';
    correctAnswer?: number;
    deadlineHours: number;
    quorumRequired: number;
    communityPda: PublicKey;
  }) => {
    if (!program || !wallet?.publicKey) {
      throw new Error('❌ Wallet no conectado o programa no disponible');
    }

    console.log('✨ Creando votación REAL en blockchain...', params);
    
    try {
      // Derivar PDA para la votación
      const [votePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('vote'),
          params.communityPda.toBuffer(),
          wallet.publicKey.toBuffer()
        ],
        program.programId
      );

      // Obtener PDA del usuario
      const [userPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user'), wallet.publicKey.toBuffer()],
        program.programId
      );

      // Fee pool PDA
      const [feePoolPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('fee_pool')],
        program.programId
      );

      console.log('📝 Vote PDA:', votePda.toString());
      console.log('🔐 Wallet requiere FIRMA para crear votación');

      // Convertir tipo de voto
      const voteTypeEnum = params.voteType === 'Knowledge' ? { knowledge: {} } : { opinion: {} };

      // Llamar a create_voting del smart contract REAL
      // Añadir aserción de tipo para evitar error de recursividad infinita
      const tx = await (program.methods as any).createVoting(
          params.question,
          params.options,
          new BN(Date.now() + (params.deadlineHours * 60 * 60 * 1000))
        )
        .accounts({
          vote: votePda,
          community: params.communityPda,
          creator: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('✅ Votación creada exitosamente en blockchain');
      console.log('🔗 Transaction signature:', tx);
      
      return { votePda, transaction: tx };
    } catch (error: any) {
      console.error('❌ Error creando votación en blockchain:', error);
      throw new Error(`Error creando votación: ${error.message}`);
    }
  };

  const castVote = async (votePda: PublicKey, selectedOption: number) => {
    if (!program || !wallet?.publicKey) {
      throw new Error('❌ Wallet no conectado o programa no disponible');
    }

    console.log('🗳️ Votando REAL en blockchain...', { votePda: votePda.toString(), selectedOption });
    
    try {
      // Derivar PDA para participación
      const [participationPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('participation'),
          votePda.toBuffer(),
          wallet.publicKey.toBuffer()
        ],
        program.programId
      );

      // Obtener PDA del usuario
      const [userPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user'), wallet.publicKey.toBuffer()],
        program.programId
      );

      // Obtener la votación para saber la comunidad
      const voteAccount: VoteAccount = await (program.account as any)['vote'].fetch(votePda);
      const community = new PublicKey(voteAccount.community);
      
      // Derivar PDA para membership
      const [membershipPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('membership'),
          community.toBuffer(),
          wallet.publicKey.toBuffer()
        ],
        program.programId
      );

      console.log('📝 Participation PDA:', participationPda.toString());
      console.log('📝 Membership PDA:', membershipPda.toString());
      console.log('🔐 Wallet requiere FIRMA para votar');

      // Llamar a cast_vote del smart contract REAL
      // Añadir aserción de tipo para evitar error de recursividad infinita
      const tx = await (program.methods as any).castVote(selectedOption)
        .accounts({
          participation: participationPda,
          vote: votePda,
          membership: membershipPda,
          user: userPda,
          voter: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('✅ Voto registrado exitosamente en blockchain');
      console.log('🔗 Transaction signature:', tx);
      
      return { participationPda, transaction: tx };
    } catch (error: any) {
      console.error('❌ Error votando en blockchain:', error);
      throw new Error(`Error votando: ${error.message}`);
    }
  };

  return {
    createVoting,
    castVote,
    isConnected,
    wallet
  };
};

// Utilidades para derivar PDAs
export const getPDAForUser = (userWallet: PublicKey): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('user'), userWallet.toBuffer()],
    PROGRAM_ID
  );
};

export const getPDAForCommunity = (authority: PublicKey, name: string): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('community'), authority.toBuffer(), Buffer.from(name)],
    PROGRAM_ID
  );
};

export const getPDAForVoting = (community: PublicKey, creator: PublicKey): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vote'), community.toBuffer(), creator.toBuffer()],
    PROGRAM_ID
  );
};

export const getPDAForMembership = (community: PublicKey, user: PublicKey): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('membership'), community.toBuffer(), user.toBuffer()],
    PROGRAM_ID
  );
};
