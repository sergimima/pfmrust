// backend/src/listeners/accountListeners.ts
import { Connection, PublicKey, AccountInfo } from '@solana/web3.js';
import { EventListenerConfig } from './index';

export type AccountChangeCallback<T> = (account: T, signature: string) => Promise<void>;

export class AccountListeners {
  private config: EventListenerConfig;
  private subscriptions: Map<string, number> = new Map();

  constructor(config: EventListenerConfig) {
    this.config = config;
  }

  /**
   * Escuchar cambios en User accounts
   */
  async listenToUserAccounts(callback: AccountChangeCallback<any>): Promise<void> {
    try {
      const subscriptionId = this.config.connection.onProgramAccountChange(
        this.config.programId,
        async (accountInfo: { accountId: PublicKey; accountInfo: AccountInfo<Buffer> }, context) => {
          try {
            // Por ahora, procesamos todas las accounts del programa
            // TODO: Filtrar por tipo cuando tengamos IDL
            console.log(`👤 User account change detected: ${accountInfo.accountId.toBase58()}`);
            await callback({ 
              pubkey: accountInfo.accountId.toBase58(),
              data: accountInfo.accountInfo.data,
              lamports: accountInfo.accountInfo.lamports
            }, context.slot.toString());
          } catch (error) {
            console.error('❌ User account change error:', error);
          }
        },
        'confirmed'
      );

      this.subscriptions.set('user', subscriptionId);
      console.log('👤 User account listener started');
    } catch (error) {
      console.error('❌ Failed to start User account listener:', error);
    }
  }

  /**
   * Escuchar cambios en Community accounts
   */
  async listenToCommunityAccounts(callback: AccountChangeCallback<any>): Promise<void> {
    try {
      const subscriptionId = this.config.connection.onProgramAccountChange(
        this.config.programId,
        async (accountInfo: { accountId: PublicKey; accountInfo: AccountInfo<Buffer> }, context) => {
          try {
            console.log(`🏘️ Community account change detected: ${accountInfo.accountId.toBase58()}`);
            await callback({ 
              pubkey: accountInfo.accountId.toBase58(),
              data: accountInfo.accountInfo.data,
              lamports: accountInfo.accountInfo.lamports
            }, context.slot.toString());
          } catch (error) {
            console.error('❌ Community account change error:', error);
          }
        },
        'confirmed'
      );

      this.subscriptions.set('community', subscriptionId);
      console.log('🏘️ Community account listener started');
    } catch (error) {
      console.error('❌ Failed to start Community account listener:', error);
    }
  }

  /**
   * Escuchar cambios en Vote accounts
   */
  async listenToVoteAccounts(callback: AccountChangeCallback<any>): Promise<void> {
    try {
      const subscriptionId = this.config.connection.onProgramAccountChange(
        this.config.programId,
        async (accountInfo: { accountId: PublicKey; accountInfo: AccountInfo<Buffer> }, context) => {
          try {
            console.log(`🗳️ Vote account change detected: ${accountInfo.accountId.toBase58()}`);
            await callback({ 
              pubkey: accountInfo.accountId.toBase58(),
              data: accountInfo.accountInfo.data,
              lamports: accountInfo.accountInfo.lamports
            }, context.slot.toString());
          } catch (error) {
            console.error('❌ Vote account change error:', error);
          }
        },
        'confirmed'
      );

      this.subscriptions.set('vote', subscriptionId);
      console.log('🗳️ Vote account listener started');
    } catch (error) {
      console.error('❌ Failed to start Vote account listener:', error);
    }
  }

  /**
   * Escuchar cambios en Membership accounts
   */
  async listenToMembershipAccounts(callback: AccountChangeCallback<any>): Promise<void> {
    try {
      const subscriptionId = this.config.connection.onProgramAccountChange(
        this.config.programId,
        async (accountInfo: { accountId: PublicKey; accountInfo: AccountInfo<Buffer> }, context) => {
          try {
            console.log(`👥 Membership account change detected: ${accountInfo.accountId.toBase58()}`);
            await callback({ 
              pubkey: accountInfo.accountId.toBase58(),
              data: accountInfo.accountInfo.data,
              lamports: accountInfo.accountInfo.lamports
            }, context.slot.toString());
          } catch (error) {
            console.error('❌ Membership account change error:', error);
          }
        },
        'confirmed'
      );

      this.subscriptions.set('membership', subscriptionId);
      console.log('👥 Membership account listener started');
    } catch (error) {
      console.error('❌ Failed to start Membership account listener:', error);
    }
  }

  /**
   * Parar todos los listeners
   */
  async stop(): Promise<void> {
    for (const [name, subscriptionId] of this.subscriptions) {
      try {
        await this.config.connection.removeAccountChangeListener(subscriptionId);
        console.log(`🛑 ${name} listener stopped`);
      } catch (error) {
        console.error(`❌ Error stopping ${name} listener:`, error);
      }
    }
    this.subscriptions.clear();
  }

  /**
   * Estado de los listeners
   */
  getStatus() {
    return {
      activeListeners: Array.from(this.subscriptions.keys()),
      subscriptionCount: this.subscriptions.size
    };
  }
}