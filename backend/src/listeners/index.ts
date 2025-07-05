// backend/src/listeners/index.ts
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, Idl } from '@coral-xyz/anchor';
import { getRedisClient } from '../config/redis';
import { AccountListeners } from './accountListeners';
import { TransactionListeners } from './transactionListeners';
import { SyncService } from './syncService';

export interface EventListenerConfig {
  connection: Connection;
  programId: PublicKey;
  program: Program<Idl> | null; // Allow null for when IDL is not available
  pollInterval: number;
  maxRetries: number;
  batchSize: number;
}

export class EventListenerManager {
  private config: EventListenerConfig;
  private accountListeners: AccountListeners;
  private transactionListeners: TransactionListeners;
  private syncService: SyncService;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(config: EventListenerConfig) {
    this.config = config;
    this.accountListeners = new AccountListeners(config);
    this.transactionListeners = new TransactionListeners(config);
    this.syncService = new SyncService();
  }

  /**
   * Iniciar todos los event listeners
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ Event listeners already running');
      return;
    }

    try {
      console.log('🎧 Starting Event Listeners...');
      
      // Inicializar servicios
      await this.syncService.initialize();
      
      // Configurar listeners de accounts
      await this.setupAccountListeners();
      
      // Configurar listeners de transacciones
      await this.setupTransactionListeners();
      
      // Iniciar polling loop
      this.startPolling();
      
      this.isRunning = true;
      console.log('✅ Event Listeners started successfully');
      console.log(`📊 Polling interval: ${this.config.pollInterval}ms`);
      console.log(`🔄 Batch size: ${this.config.batchSize}`);
      
    } catch (error) {
      console.error('❌ Failed to start Event Listeners:', error);
      throw error;
    }
  }

  /**
   * Parar todos los event listeners
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('⚠️ Event listeners not running');
      return;
    }

    try {
      console.log('🛑 Stopping Event Listeners...');
      
      // Parar polling
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      
      // Parar listeners
      await this.accountListeners.stop();
      await this.transactionListeners.stop();
      
      this.isRunning = false;
      console.log('✅ Event Listeners stopped successfully');
      
    } catch (error) {
      console.error('❌ Error stopping Event Listeners:', error);
      throw error;
    }
  }

  /**
   * Configurar listeners de accounts (User, Community, Vote, etc.)
   */
  private async setupAccountListeners(): Promise<void> {
    console.log('🏗️ Setting up Account Listeners...');
    
    // User accounts
    await this.accountListeners.listenToUserAccounts(async (user, signature) => {
      this.handleUserAccountChange(user, signature);
    });
    
    // Community accounts
    await this.accountListeners.listenToCommunityAccounts(async (community, signature) => {
      this.handleCommunityAccountChange(community, signature);
    });
    
    // Vote accounts
    await this.accountListeners.listenToVoteAccounts(async (vote, signature) => {
      this.handleVoteAccountChange(vote, signature);
    });
    
    // Membership accounts
    await this.accountListeners.listenToMembershipAccounts(async (membership, signature) => {
      this.handleMembershipAccountChange(membership, signature);
    });
    
    console.log('✅ Account Listeners configured');
  }

  /**
   * Configurar listeners de transacciones
   */
  private async setupTransactionListeners(): Promise<void> {
    console.log('🏗️ Setting up Transaction Listeners...');
    
    // Escuchar todas las transacciones del programa
    await this.transactionListeners.listenToProgram(async (transaction) => {
      this.handleProgramTransaction(transaction);
    });
    
    console.log('✅ Transaction Listeners configured');
  }

  /**
   * Iniciar el loop de polling
   */
  private startPolling(): void {
    this.intervalId = setInterval(async () => {
      try {
        await this.pollForUpdates();
      } catch (error) {
        console.error('❌ Polling error:', error);
      }
    }, this.config.pollInterval);
  }

  /**
   * Polling para actualizaciones pendientes
   */
  private async pollForUpdates(): Promise<void> {
    try {
      // Verificar conexión
      const slot = await this.config.connection.getSlot();
      
      // Procesar transacciones pendientes
      await this.transactionListeners.processQueue();
      
      // Verificar sincronización
      await this.syncService.verifySyncStatus();
      
      // Log estadísticas cada minuto
      const now = Date.now();
      const redis = getRedisClient();
      if (redis) {
        const lastLog = await redis.get('last_stats_log');
        if (!lastLog || now - parseInt(lastLog) > 60000) {
          await this.logStatistics();
          await redis.set('last_stats_log', now.toString());
        }
      }
      
    } catch (error) {
      console.error('❌ Polling update error:', error);
    }
  }

  /**
   * Manejar cambios en User accounts
   */
  private async handleUserAccountChange(user: any, signature: string): Promise<void> {
    try {
      await this.syncService.syncUser(user, signature);
      console.log(`👤 User synced: ${user.pubkey}`);
    } catch (error) {
      console.error('❌ User sync error:', error);
    }
  }

  /**
   * Manejar cambios en Community accounts
   */
  private async handleCommunityAccountChange(community: any, signature: string): Promise<void> {
    try {
      await this.syncService.syncCommunity(community, signature);
      console.log(`🏘️ Community synced: ${community.pubkey}`);
    } catch (error) {
      console.error('❌ Community sync error:', error);
    }
  }

  /**
   * Manejar cambios en Vote accounts
   */
  private async handleVoteAccountChange(vote: any, signature: string): Promise<void> {
    try {
      await this.syncService.syncVote(vote, signature);
      console.log(`🗳️ Vote synced: ${vote.pubkey}`);
    } catch (error) {
      console.error('❌ Vote sync error:', error);
    }
  }

  /**
   * Manejar cambios en Membership accounts
   */
  private async handleMembershipAccountChange(membership: any, signature: string): Promise<void> {
    try {
      await this.syncService.syncMembership(membership, signature);
      console.log(`👥 Membership synced: ${membership.pubkey}`);
    } catch (error) {
      console.error('❌ Membership sync error:', error);
    }
  }

  /**
   * Manejar transacciones del programa
   */
  private async handleProgramTransaction(transaction: any): Promise<void> {
    try {
      await this.syncService.processProgramTransaction(transaction);
      console.log(`📝 Transaction processed: ${transaction.signature}`);
    } catch (error) {
      console.error('❌ Transaction processing error:', error);
    }
  }

  /**
   * Log de estadísticas
   */
  private async logStatistics(): Promise<void> {
    try {
      const stats = await this.syncService.getStatistics();
      console.log('📊 Event Listener Statistics:');
      console.log(`   📝 Transactions processed: ${stats.transactionsProcessed}`);
      console.log(`   👤 Users synced: ${stats.usersSynced}`);
      console.log(`   🏘️ Communities synced: ${stats.communitiesSynced}`);
      console.log(`   🗳️ Votes synced: ${stats.votesSynced}`);
      console.log(`   ⚡ Last sync: ${stats.lastSync}`);
    } catch (error) {
      console.error('❌ Statistics error:', error);
    }
  }

  /**
   * Estado del manager
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      config: {
        programId: this.config.programId.toBase58(),
        pollInterval: this.config.pollInterval,
        maxRetries: this.config.maxRetries,
        batchSize: this.config.batchSize,
        hasProgramIdl: this.config.program !== null
      },
      accountListeners: this.accountListeners.getStatus(),
      transactionListeners: this.transactionListeners.getStatus()
    };
  }
}

export default EventListenerManager;