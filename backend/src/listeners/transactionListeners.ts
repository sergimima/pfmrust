// backend/src/listeners/transactionListeners.ts
import { Connection, PublicKey } from '@solana/web3.js';
import { EventListenerConfig } from './index';
import { getRedisClient } from '../config/redis';

export interface ParsedTransaction {
  signature: string;
  slot: number;
  blockTime: number | null;
  accounts: string[];
  logs: string[];
}

export type TransactionCallback = (transaction: ParsedTransaction) => Promise<void>;

export class TransactionListeners {
  private config: EventListenerConfig;
  private subscriptions: Map<string, number> = new Map();
  private transactionQueue: ParsedTransaction[] = [];
  private isProcessing: boolean = false;

  constructor(config: EventListenerConfig) {
    this.config = config;
  }

  /**
   * Escuchar todas las transacciones del programa
   */
  async listenToProgram(callback: TransactionCallback): Promise<void> {
    try {
      // Escuchar logs del programa
      const subscriptionId = this.config.connection.onLogs(
        this.config.programId,
        async (logs, context) => {
          try {
            console.log(`📝 Program transaction detected: ${logs.signature}`);
            
            const transaction: ParsedTransaction = {
              signature: logs.signature,
              slot: context.slot,
              blockTime: null, // Will be filled later if needed
              accounts: [], // Will be filled when we parse the transaction
              logs: logs.logs || []
            };

            // Añadir a la cola de procesamiento
            this.transactionQueue.push(transaction);
            
            // Procesar inmediatamente
            await callback(transaction);
            
          } catch (error) {
            console.error('❌ Program logs error:', error);
          }
        },
        'confirmed'
      );

      this.subscriptions.set('program', subscriptionId);
      console.log('📝 Program transaction listener started');
    } catch (error) {
      console.error('❌ Failed to start Program transaction listener:', error);
    }
  }

  /**
   * Procesar cola de transacciones
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing || this.transactionQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const batch = this.transactionQueue.splice(0, this.config.batchSize);
      
      console.log(`🔄 Processing ${batch.length} transactions...`);
      
      for (const transaction of batch) {
        await this.processTransactionWithRetry(transaction);
      }

      // Actualizar estadísticas en Redis
      await this.updateProcessingStats(batch.length);

    } catch (error) {
      console.error('❌ Queue processing error:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Procesar transacción con reintentos
   */
  private async processTransactionWithRetry(transaction: ParsedTransaction): Promise<void> {
    let retries = 0;
    
    while (retries < this.config.maxRetries) {
      try {
        await this.processTransaction(transaction);
        return;
      } catch (error) {
        retries++;
        console.error(`❌ Transaction processing error (retry ${retries}):`, error);
        
        if (retries >= this.config.maxRetries) {
          // Guardar en dead letter queue
          await this.saveToDeadLetterQueue(transaction, error);
        } else {
          // Esperar antes del retry
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
    }
  }

  /**
   * Procesar una transacción individual
   */
  private async processTransaction(transaction: ParsedTransaction): Promise<void> {
    console.log(`📝 Processing transaction: ${transaction.signature}`);
    
    // TODO: Aquí iría la lógica específica cuando tengamos el IDL
    // Por ahora solo registramos la transacción
  }

  /**
   * Guardar en dead letter queue
   */
  private async saveToDeadLetterQueue(transaction: ParsedTransaction, error: any): Promise<void> {
    try {
      const redis = getRedisClient();
      if (redis) {
        const deadLetter = {
          transaction,
          error: error.message,
          timestamp: new Date().toISOString(),
          retries: this.config.maxRetries
        };
        
        await redis.lPush('transaction_dlq', JSON.stringify(deadLetter));
        console.log(`💀 Transaction saved to DLQ: ${transaction.signature}`);
      }
    } catch (error) {
      console.error('❌ DLQ save error:', error);
    }
  }

  /**
   * Actualizar estadísticas de procesamiento
   */
  private async updateProcessingStats(processed: number): Promise<void> {
    try {
      const redis = getRedisClient();
      if (redis) {
        await redis.incrBy('transactions_processed', processed);
        await redis.set('last_processing_time', new Date().toISOString());
      }
    } catch (error) {
      console.error('❌ Stats update error:', error);
    }
  }

  /**
   * Obtener estadísticas de la cola
   */
  getQueueStats() {
    return {
      queueSize: this.transactionQueue.length,
      isProcessing: this.isProcessing,
      batchSize: this.config.batchSize
    };
  }

  /**
   * Parar todos los listeners
   */
  async stop(): Promise<void> {
    for (const [name, subscriptionId] of this.subscriptions) {
      try {
        await this.config.connection.removeOnLogsListener(subscriptionId);
        console.log(`🛑 ${name} transaction listener stopped`);
      } catch (error) {
        console.error(`❌ Error stopping ${name} listener:`, error);
      }
    }
    this.subscriptions.clear();
    
    // Procesar transacciones restantes
    if (this.transactionQueue.length > 0) {
      console.log(`🔄 Processing remaining ${this.transactionQueue.length} transactions...`);
      await this.processQueue();
    }
  }

  /**
   * Estado de los listeners
   */
  getStatus() {
    return {
      activeListeners: Array.from(this.subscriptions.keys()),
      subscriptionCount: this.subscriptions.size,
      queueStats: this.getQueueStats()
    };
  }
}