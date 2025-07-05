// backend/src/utils/websocketHelpers.ts
import { websocketService } from '../services/websocketService';
import type { RealTimeUpdate, NotificationData, VoteProgress } from '../services/websocketService';

/**
 * Helper functions to send WebSocket updates from different parts of the application
 */

/**
 * Send vote creation notification
 */
export async function notifyVoteCreated(voteData: {
  voteId: string;
  title: string;
  communityId: string;
  creator: string;
  deadline: Date;
  type: 'Opinion' | 'Knowledge';
}): Promise<void> {
  if (!websocketService) return;

  try {
    // Send real-time update
    const update: RealTimeUpdate = {
      type: 'vote_created',
      data: voteData,
      timestamp: new Date(),
      targetCommunities: [voteData.communityId]
    };

    await websocketService.broadcastUpdate(update);

    // Send notification to community members
    const notification: NotificationData = {
      id: `vote_created_${voteData.voteId}`,
      type: 'info',
      title: 'New Vote Created',
      message: `"${voteData.title}" - Vote now!`,
      communityId: voteData.communityId,
      voteId: voteData.voteId,
      timestamp: new Date(),
      read: false,
      actions: [
        {
          label: 'Vote Now',
          action: 'navigate_to_vote',
          data: { voteId: voteData.voteId }
        }
      ]
    };

    await websocketService.sendNotification(notification);

  } catch (error) {
    console.error('Error notifying vote created:', error);
  }
}

/**
 * Send vote progress update
 */
export async function notifyVoteProgress(progressData: {
  voteId: string;
  totalParticipants: number;
  results: number[];
  participationRate: number;
  timeRemaining: number;
  quorumReached: boolean;
  status: 'active' | 'completed' | 'failed';
}): Promise<void> {
  if (!websocketService) return;

  try {
    const voteProgress: VoteProgress = {
      voteId: progressData.voteId,
      totalParticipants: progressData.totalParticipants,
      results: progressData.results,
      participationRate: progressData.participationRate,
      timeRemaining: progressData.timeRemaining,
      quorumReached: progressData.quorumReached,
      status: progressData.status
    };

    await websocketService.sendVoteProgress(voteProgress);

  } catch (error) {
    console.error('Error notifying vote progress:', error);
  }
}

/**
 * Send vote completion notification
 */
export async function notifyVoteCompleted(voteData: {
  voteId: string;
  title: string;
  communityId: string;
  results: number[];
  totalParticipants: number;
  quorumReached: boolean;
}): Promise<void> {
  if (!websocketService) return;

  try {
    // Send real-time update
    const update: RealTimeUpdate = {
      type: 'vote_completed',
      data: voteData,
      timestamp: new Date(),
      targetCommunities: [voteData.communityId]
    };

    await websocketService.broadcastUpdate(update);

    // Send notification
    const notification: NotificationData = {
      id: `vote_completed_${voteData.voteId}`,
      type: 'success',
      title: 'Vote Completed',
      message: `"${voteData.title}" has finished. View results!`,
      communityId: voteData.communityId,
      voteId: voteData.voteId,
      timestamp: new Date(),
      read: false,
      actions: [
        {
          label: 'View Results',
          action: 'navigate_to_results',
          data: { voteId: voteData.voteId }
        }
      ]
    };

    await websocketService.sendNotification(notification);

  } catch (error) {
    console.error('Error notifying vote completed:', error);
  }
}

/**
 * Send user joined community notification
 */
export async function notifyUserJoinedCommunity(userData: {
  userId: string;
  username: string;
  communityId: string;
  communityName: string;
}): Promise<void> {
  if (!websocketService) return;

  try {
    const update: RealTimeUpdate = {
      type: 'user_joined',
      data: userData,
      timestamp: new Date(),
      targetCommunities: [userData.communityId]
    };

    await websocketService.broadcastUpdate(update);

  } catch (error) {
    console.error('Error notifying user joined:', error);
  }
}

/**
 * Send community created notification
 */
export async function notifyCommunityCreated(communityData: {
  communityId: string;
  name: string;
  creator: string;
  category: string;
  description: string;
}): Promise<void> {
  if (!websocketService) return;

  try {
    const update: RealTimeUpdate = {
      type: 'community_created',
      data: communityData,
      timestamp: new Date()
    };

    await websocketService.broadcastUpdate(update);

    // Send notification to all users
    const notification: NotificationData = {
      id: `community_created_${communityData.communityId}`,
      type: 'info',
      title: 'New Community Created',
      message: `"${communityData.name}" community is now available!`,
      communityId: communityData.communityId,
      timestamp: new Date(),
      read: false,
      actions: [
        {
          label: 'Join Community',
          action: 'navigate_to_community',
          data: { communityId: communityData.communityId }
        }
      ]
    };

    await websocketService.sendNotification(notification);

  } catch (error) {
    console.error('Error notifying community created:', error);
  }
}

/**
 * Send reputation update notification
 */
export async function notifyReputationUpdate(userData: {
  userId: string;
  oldReputation: number;
  newReputation: number;
  reason: string;
  points: number;
}): Promise<void> {
  if (!websocketService) return;

  try {
    const update: RealTimeUpdate = {
      type: 'reputation_updated',
      data: userData,
      timestamp: new Date(),
      targetUsers: [userData.userId]
    };

    await websocketService.broadcastUpdate(update);

    // Send notification if significant change
    if (Math.abs(userData.points) >= 5) {
      const notification: NotificationData = {
        id: `reputation_update_${userData.userId}_${Date.now()}`,
        type: userData.points > 0 ? 'success' : 'warning',
        title: userData.points > 0 ? 'Reputation Increased!' : 'Reputation Changed',
        message: `${userData.reason}: ${userData.points > 0 ? '+' : ''}${userData.points} points`,
        userId: userData.userId,
        timestamp: new Date(),
        read: false
      };

      await websocketService.sendNotification(notification);
    }

  } catch (error) {
    console.error('Error notifying reputation update:', error);
  }
}

/**
 * Send leaderboard update notification
 */
export async function notifyLeaderboardUpdate(leaderboardData: {
  type: 'global' | 'community';
  communityId?: string;
  topUsers: Array<{
    userId: string;
    username: string;
    reputation: number;
    rank: number;
  }>;
}): Promise<void> {
  if (!websocketService) return;

  try {
    const update: RealTimeUpdate = {
      type: 'leaderboard_updated',
      data: leaderboardData,
      timestamp: new Date(),
      targetCommunities: leaderboardData.communityId ? [leaderboardData.communityId] : undefined
    };

    await websocketService.broadcastUpdate(update);

  } catch (error) {
    console.error('Error notifying leaderboard update:', error);
  }
}

/**
 * Send system announcement
 */
export async function sendSystemAnnouncement(announcement: {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  targetUsers?: string[];
  targetCommunities?: string[];
}): Promise<void> {
  if (!websocketService) return;

  try {
    const notification: NotificationData = {
      id: `system_announcement_${Date.now()}`,
      type: announcement.type || 'info',
      title: announcement.title,
      message: announcement.message,
      timestamp: new Date(),
      read: false
    };

    // Send to specific users or broadcast
    if (announcement.targetUsers) {
      for (const userId of announcement.targetUsers) {
        await websocketService.sendNotification({ ...notification, userId });
      }
    } else {
      await websocketService.sendNotification(notification);
    }

  } catch (error) {
    console.error('Error sending system announcement:', error);
  }
}

/**
 * Get WebSocket service status
 */
export function getWebSocketStatus(): {
  available: boolean;
  stats?: any;
} {
  if (!websocketService) {
    return { available: false };
  }

  return {
    available: true,
    stats: websocketService.getStats()
  };
}
