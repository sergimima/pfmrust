// backend/src/services/websocketService.ts
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { analyticsService } from './analyticsService';
import { getRedisClient } from '../config/redis';

export interface WebSocketUser {
  userId?: string;
  wallet?: string;
  communities: string[];
  connectedAt: Date;
  lastActivity: Date;
}

export interface RealTimeUpdate {
  type: 'vote_created' | 'vote_completed' | 'user_joined' | 'community_created' | 'reputation_updated' | 'leaderboard_updated';
  data: any;
  timestamp: Date;
  targetUsers?: string[];
  targetCommunities?: string[];
}

export interface VoteProgress {
  voteId: string;
  totalParticipants: number;
  results: number[];
  participationRate: number;
  timeRemaining: number;
  quorumReached: boolean;
  status: 'active' | 'completed' | 'failed';
}

export interface NotificationData {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  userId?: string;
  communityId?: string;
  voteId?: string;
  timestamp: Date;
  read: boolean;
  actions?: Array<{
    label: string;
    action: string;
    data?: any;
  }>;
}

export class WebSocketService {
  private io: SocketIOServer;
  private redis;
  private connectedUsers: Map<string, WebSocketUser> = new Map();
  private userSockets: Map<string, string[]> = new Map(); // userId -> socketIds[]
  private roomSubscriptions: Map<string, Set<string>> = new Map(); // room -> socketIds

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.redis = getRedisClient();
    this.setupEventHandlers();
    this.startPeriodicUpdates();
    
    console.log('🔌 WebSocket Service initialized');
  }

  /**
   * Setup socket event handlers
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`🔗 Client connected: ${socket.id}`);

      // Authentication and user setup
      socket.on('authenticate', async (data: { userId?: string; wallet?: string }) => {
        try {
          const user: WebSocketUser = {
            userId: data.userId,
            wallet: data.wallet,
            communities: [],
            connectedAt: new Date(),
            lastActivity: new Date()
          };

          this.connectedUsers.set(socket.id, user);

          if (data.userId) {
            // Track user sockets
            const userSocketIds = this.userSockets.get(data.userId) || [];
            userSocketIds.push(socket.id);
            this.userSockets.set(data.userId, userSocketIds);

            // Join user-specific room
            socket.join(`user:${data.userId}`);

            // Load user's communities and join rooms
            const userCommunities = await this.getUserCommunities(data.userId);
            user.communities = userCommunities;
            
            userCommunities.forEach(communityId => {
              socket.join(`community:${communityId}`);
              this.addToRoomSubscription(`community:${communityId}`, socket.id);
            });

            // Send user's notifications
            const notifications = await this.getUserNotifications(data.userId);
            socket.emit('notifications:list', notifications);

            console.log(`✅ User authenticated: ${data.userId} (${userCommunities.length} communities)`);
          }

          socket.emit('authenticated', { success: true, user });

          // Record connection analytics
          await analyticsService.recordEvent({
            type: 'websocket_connection',
            data: { userId: data.userId, wallet: data.wallet },
            timestamp: new Date()
          });

        } catch (error) {
          console.error('Authentication error:', error);
          socket.emit('authenticated', { success: false, error: 'Authentication failed' });
        }
      });

      // Join specific rooms
      socket.on('join_room', (room: string) => {
        socket.join(room);
        this.addToRoomSubscription(room, socket.id);
        console.log(`📍 Socket ${socket.id} joined room: ${room}`);
      });

      // Leave specific rooms
      socket.on('leave_room', (room: string) => {
        socket.leave(room);
        this.removeFromRoomSubscription(room, socket.id);
        console.log(`📤 Socket ${socket.id} left room: ${room}`);
      });

      // Subscribe to vote updates
      socket.on('subscribe_vote', (voteId: string) => {
        socket.join(`vote:${voteId}`);
        this.addToRoomSubscription(`vote:${voteId}`, socket.id);
        console.log(`🗳️ Socket ${socket.id} subscribed to vote: ${voteId}`);
      });

      // Unsubscribe from vote updates
      socket.on('unsubscribe_vote', (voteId: string) => {
        socket.leave(`vote:${voteId}`);
        this.removeFromRoomSubscription(`vote:${voteId}`, socket.id);
      });

      // Mark notifications as read
      socket.on('notifications:mark_read', async (notificationIds: string[]) => {
        const user = this.connectedUsers.get(socket.id);
        if (user?.userId) {
          await this.markNotificationsAsRead(user.userId, notificationIds);
          socket.emit('notifications:marked_read', notificationIds);
        }
      });

      // Handle ping for activity tracking
      socket.on('ping', () => {
        const user = this.connectedUsers.get(socket.id);
        if (user) {
          user.lastActivity = new Date();
        }
        socket.emit('pong');
      });

      // Request real-time data
      socket.on('request_realtime_data', async (type: string) => {
        try {
          switch (type) {
            case 'system_stats':
              const stats = await analyticsService.getRealTimeMetrics();
              socket.emit('realtime_data', { type, data: stats });
              break;
            case 'active_votes':
              const activeVotes = await this.getActiveVotes();
              socket.emit('realtime_data', { type, data: activeVotes });
              break;
            case 'leaderboard':
              const leaderboard = await analyticsService.getLeaderboardAnalytics('global');
              socket.emit('realtime_data', { type, data: leaderboard });
              break;
          }
        } catch (error) {
          console.error(`Error getting real-time data for ${type}:`, error);
          socket.emit('error', { message: 'Failed to get real-time data' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
        this.handleDisconnection(socket.id);
      });

      // Handle connection errors
      socket.on('error', (error: Error) => {
        console.error(`❌ Socket error for ${socket.id}:`, error);
      });
    });
  }

  /**
   * Handle client disconnection
   */
  private handleDisconnection(socketId: string): void {
    const user = this.connectedUsers.get(socketId);
    
    if (user?.userId) {
      // Remove from user sockets tracking
      const userSocketIds = this.userSockets.get(user.userId) || [];
      const updatedSocketIds = userSocketIds.filter(id => id !== socketId);
      
      if (updatedSocketIds.length === 0) {
        this.userSockets.delete(user.userId);
      } else {
        this.userSockets.set(user.userId, updatedSocketIds);
      }
    }

    // Remove from room subscriptions
    this.roomSubscriptions.forEach((socketIds, room) => {
      socketIds.delete(socketId);
      if (socketIds.size === 0) {
        this.roomSubscriptions.delete(room);
      }
    });

    this.connectedUsers.delete(socketId);
  }

  /**
   * Broadcast real-time update
   */
  async broadcastUpdate(update: RealTimeUpdate): Promise<void> {
    try {
      // Store update in Redis for persistence
      await this.storeUpdate(update);

      // Broadcast to target users
      if (update.targetUsers) {
        update.targetUsers.forEach(userId => {
          this.io.to(`user:${userId}`).emit('realtime_update', update);
        });
      }

      // Broadcast to target communities
      if (update.targetCommunities) {
        update.targetCommunities.forEach(communityId => {
          this.io.to(`community:${communityId}`).emit('realtime_update', update);
        });
      }

      // Broadcast to all if no specific targets
      if (!update.targetUsers && !update.targetCommunities) {
        this.io.emit('realtime_update', update);
      }

      console.log(`📡 Broadcasted update: ${update.type}`);

    } catch (error) {
      console.error('Error broadcasting update:', error);
    }
  }

  /**
   * Send vote progress update
   */
  async sendVoteProgress(voteProgress: VoteProgress): Promise<void> {
    try {
      const update: RealTimeUpdate = {
        type: 'vote_created',
        data: voteProgress,
        timestamp: new Date()
      };

      // Send to vote-specific room
      this.io.to(`vote:${voteProgress.voteId}`).emit('vote_progress', voteProgress);
      
      // Also broadcast as general update
      await this.broadcastUpdate(update);

      console.log(`🗳️ Vote progress sent for: ${voteProgress.voteId}`);

    } catch (error) {
      console.error('Error sending vote progress:', error);
    }
  }

  /**
   * Send notification to specific user
   */
  async sendNotification(notification: NotificationData): Promise<void> {
    try {
      // Store notification
      await this.storeNotification(notification);

      // Send to user if online
      if (notification.userId) {
        this.io.to(`user:${notification.userId}`).emit('notification', notification);
        console.log(`🔔 Notification sent to user: ${notification.userId}`);
      } else {
        // Broadcast to all
        this.io.emit('notification', notification);
        console.log(`📢 Notification broadcasted to all users`);
      }

    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Get active rooms and their subscriber counts
   */
  getActiveRooms(): Record<string, number> {
    const rooms: Record<string, number> = {};
    this.roomSubscriptions.forEach((socketIds, room) => {
      rooms[room] = socketIds.size;
    });
    return rooms;
  }

  /**
   * Get user's communities
   */
  private async getUserCommunities(userId: string): Promise<string[]> {
    try {
      // TODO: Replace with actual database query
      // For now, return mock data
      return [`community_${Math.floor(Math.random() * 10)}`];
    } catch (error) {
      console.error('Error getting user communities:', error);
      return [];
    }
  }

  /**
   * Get user's notifications
   */
  private async getUserNotifications(userId: string): Promise<NotificationData[]> {
    try {
      if (!this.redis) return [];

      const notificationsKey = `notifications:${userId}`;
      const notifications = await this.redis.lRange(notificationsKey, 0, 49); // Last 50

      return notifications.map(n => JSON.parse(n));
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  /**
   * Mark notifications as read
   */
  private async markNotificationsAsRead(userId: string, notificationIds: string[]): Promise<void> {
    try {
      if (!this.redis) return;

      const readKey = `notifications_read:${userId}`;
      const pipeline = this.redis.multi();
      
      notificationIds.forEach(id => {
        pipeline.sAdd(readKey, id);
      });
      
      pipeline.expire(readKey, 86400 * 30); // Keep for 30 days
      await pipeline.exec();

    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  }

  /**
   * Store real-time update
   */
  private async storeUpdate(update: RealTimeUpdate): Promise<void> {
    try {
      if (!this.redis) return;

      const key = `realtime_updates:${update.type}`;
      await this.redis.lPush(key, JSON.stringify(update));
      await this.redis.lTrim(key, 0, 99); // Keep last 100
      await this.redis.expire(key, 3600); // Expire in 1 hour

    } catch (error) {
      console.error('Error storing update:', error);
    }
  }

  /**
   * Store notification
   */
  private async storeNotification(notification: NotificationData): Promise<void> {
    try {
      if (!this.redis) return;

      if (notification.userId) {
        const key = `notifications:${notification.userId}`;
        await this.redis.lPush(key, JSON.stringify(notification));
        await this.redis.lTrim(key, 0, 99); // Keep last 100
        await this.redis.expire(key, 86400 * 7); // Keep for 7 days
      }

    } catch (error) {
      console.error('Error storing notification:', error);
    }
  }

  /**
   * Get active votes
   */
  private async getActiveVotes(): Promise<any[]> {
    try {
      // TODO: Replace with actual database query
      return Array.from({ length: 5 }, (_, i) => ({
        id: `vote_${i + 1}`,
        title: `Active Vote ${i + 1}`,
        participants: Math.floor(Math.random() * 100) + 10,
        timeRemaining: Math.floor(Math.random() * 86400) + 3600,
        communityId: `community_${Math.floor(Math.random() * 5) + 1}`
      }));
    } catch (error) {
      console.error('Error getting active votes:', error);
      return [];
    }
  }

  /**
   * Add socket to room subscription tracking
   */
  private addToRoomSubscription(room: string, socketId: string): void {
    if (!this.roomSubscriptions.has(room)) {
      this.roomSubscriptions.set(room, new Set());
    }
    this.roomSubscriptions.get(room)!.add(socketId);
  }

  /**
   * Remove socket from room subscription tracking
   */
  private removeFromRoomSubscription(room: string, socketId: string): void {
    const roomSockets = this.roomSubscriptions.get(room);
    if (roomSockets) {
      roomSockets.delete(socketId);
      if (roomSockets.size === 0) {
        this.roomSubscriptions.delete(room);
      }
    }
  }

  /**
   * Start periodic updates
   */
  private startPeriodicUpdates(): void {
    // Send real-time stats every 30 seconds
    setInterval(async () => {
      try {
        const stats = await analyticsService.getRealTimeMetrics();
        if (stats) {
          const update: RealTimeUpdate = {
            type: 'reputation_updated',
            data: { 
              ...stats, 
              connectedUsers: this.getConnectedUsersCount(),
              activeRooms: Object.keys(this.getActiveRooms()).length
            },
            timestamp: new Date()
          };
          
          this.io.emit('system_stats', update.data);
        }
      } catch (error) {
        console.error('Error sending periodic stats:', error);
      }
    }, 30000);

    // Update leaderboards every 5 minutes
    setInterval(async () => {
      try {
        const leaderboard = await analyticsService.getLeaderboardAnalytics('global');
        if (leaderboard) {
          const update: RealTimeUpdate = {
            type: 'leaderboard_updated',
            data: leaderboard,
            timestamp: new Date()
          };
          
          this.io.emit('leaderboard_update', leaderboard);
        }
      } catch (error) {
        console.error('Error sending leaderboard update:', error);
      }
    }, 300000);

    console.log('🔄 Periodic updates started');
  }

  /**
   * Get WebSocket statistics
   */
  getStats(): any {
    return {
      connectedSockets: this.io.sockets.sockets.size,
      connectedUsers: this.connectedUsers.size,
      authenticatedUsers: this.userSockets.size,
      activeRooms: this.roomSubscriptions.size,
      roomDetails: this.getActiveRooms()
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    console.log('🔌 Shutting down WebSocket service...');
    
    // Notify all clients
    this.io.emit('server_shutdown', { 
      message: 'Server is shutting down',
      timestamp: new Date()
    });

    // Close all connections
    this.io.close();
    
    console.log('✅ WebSocket service shut down');
  }
}

// Export singleton instance (will be initialized in main server)
export let websocketService: WebSocketService;

export function initializeWebSocketService(server: HTTPServer): WebSocketService {
  websocketService = new WebSocketService(server);
  return websocketService;
}
