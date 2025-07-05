// backend/src/jobs/sendNotifications.ts
import { Job } from '../services/jobQueue';
import { updateJobProgress } from './index';

/**
 * Job para envío de notificaciones
 */
export async function sendNotificationsJob(job: Job): Promise<any> {
  console.log(`📬 Starting notifications job ${job.id}`);
  
  try {
    const { 
      notificationType = 'general',
      recipients = [],
      message,
      data = {},
      timestamp 
    } = job.data;
    
    updateJobProgress(job.id, 10);
    
    const results = {
      notificationType,
      timestamp,
      startTime: new Date(),
      recipients: recipients.length,
      sent: 0,
      failed: 0,
      details: [] as any[]
    };
    
    switch (notificationType) {
      case 'vote_completed':
        results.details = await sendVoteCompletedNotifications(job.id, data);
        break;
      case 'new_vote':
        results.details = await sendNewVoteNotifications(job.id, data);
        break;
      case 'community_update':
        results.details = await sendCommunityUpdateNotifications(job.id, data);
        break;
      case 'reputation_milestone':
        results.details = await sendReputationMilestoneNotifications(job.id, data);
        break;
      case 'daily_digest':
        results.details = await sendDailyDigestNotifications(job.id, data);
        break;
      case 'custom':
        results.details = await sendCustomNotifications(job.id, recipients, message, data);
        break;
      default:
        results.details = await sendGeneralNotifications(job.id, recipients, message, data);
    }
    
    // Calcular estadísticas finales
    results.sent = results.details.filter(d => d.status === 'sent').length;
    results.failed = results.details.filter(d => d.status === 'failed').length;
    
    updateJobProgress(job.id, 100);
    
    console.log(`✅ Notifications job ${job.id} completed: ${results.sent} sent, ${results.failed} failed`);
    return results;
    
  } catch (error) {
    console.error(`❌ Notifications job ${job.id} failed:`, error);
    throw error;
  }
}

/**
 * Enviar notificaciones de votación completada
 */
async function sendVoteCompletedNotifications(jobId: string, data: any): Promise<any[]> {
  updateJobProgress(jobId, 30);
  
  const { voteId, communityName, question, results } = data;
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const notifications = [
    {
      recipient: 'participant1@example.com',
      type: 'email',
      status: 'sent',
      message: `Vote completed in ${communityName}: "${question}"`,
      sentAt: new Date()
    },
    {
      recipient: 'participant2@example.com',
      type: 'email',
      status: 'sent',
      message: `Vote completed in ${communityName}: "${question}"`,
      sentAt: new Date()
    },
    {
      recipient: 'participant3@example.com',
      type: 'email',
      status: 'failed',
      message: `Vote completed in ${communityName}: "${question}"`,
      error: 'Invalid email address'
    }
  ];
  
  console.log(`🗳️ Sent ${notifications.length} vote completion notifications for vote ${voteId}`);
  return notifications;
}

/**
 * Enviar notificaciones de nueva votación
 */
async function sendNewVoteNotifications(jobId: string, data: any): Promise<any[]> {
  updateJobProgress(jobId, 50);
  
  const { voteId, communityName, question, creator, deadline } = data;
  
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const notifications = [
    {
      recipient: 'member1@example.com',
      type: 'email',
      status: 'sent',
      message: `New vote in ${communityName}: "${question}"`,
      sentAt: new Date()
    },
    {
      recipient: 'member2@example.com',
      type: 'email',
      status: 'sent',
      message: `New vote in ${communityName}: "${question}"`,
      sentAt: new Date()
    }
  ];
  
  console.log(`📝 Sent ${notifications.length} new vote notifications for vote ${voteId}`);
  return notifications;
}

/**
 * Enviar notificaciones de actualización de comunidad
 */
async function sendCommunityUpdateNotifications(jobId: string, data: any): Promise<any[]> {
  updateJobProgress(jobId, 70);
  
  const { communityId, communityName, updateType, message } = data;
  
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const notifications = [
    {
      recipient: 'admin@example.com',
      type: 'email',
      status: 'sent',
      message: `Community update in ${communityName}: ${message}`,
      sentAt: new Date()
    },
    {
      recipient: 'moderator@example.com',
      type: 'email',
      status: 'sent',
      message: `Community update in ${communityName}: ${message}`,
      sentAt: new Date()
    }
  ];
  
  console.log(`🏠 Sent ${notifications.length} community update notifications`);
  return notifications;
}

/**
 * Enviar notificaciones de milestone de reputación
 */
async function sendReputationMilestoneNotifications(jobId: string, data: any): Promise<any[]> {
  updateJobProgress(jobId, 80);
  
  const { userId, wallet, newLevel, reputation, milestone } = data;
  
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const notifications = [
    {
      recipient: wallet,
      type: 'push',
      status: 'sent',
      message: `Congratulations! You reached ${milestone}: Level ${newLevel} with ${reputation} reputation points!`,
      sentAt: new Date()
    }
  ];
  
  console.log(`🏆 Sent reputation milestone notification to ${wallet}`);
  return notifications;
}

/**
 * Enviar digest diario
 */
async function sendDailyDigestNotifications(jobId: string, data: any): Promise<any[]> {
  updateJobProgress(jobId, 85);
  
  const { date, stats, highlights } = data;
  
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  const subscribers = [
    'user1@example.com',
    'user2@example.com',
    'user3@example.com',
    'user4@example.com'
  ];
  
  const notifications = subscribers.map(email => ({
    recipient: email,
    type: 'email',
    status: Math.random() > 0.1 ? 'sent' : 'failed',
    message: `Daily Digest for ${date}: ${stats.newVotes} new votes, ${stats.completedVotes} completed`,
    sentAt: new Date(),
    error: Math.random() > 0.1 ? undefined : 'Delivery failed'
  }));
  
  console.log(`📰 Sent ${notifications.length} daily digest notifications`);
  return notifications;
}

/**
 * Enviar notificaciones personalizadas
 */
async function sendCustomNotifications(jobId: string, recipients: string[], message: string, data: any): Promise<any[]> {
  updateJobProgress(jobId, 90);
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const notifications = recipients.map(recipient => ({
    recipient,
    type: 'custom',
    status: Math.random() > 0.05 ? 'sent' : 'failed',
    message,
    sentAt: new Date(),
    error: Math.random() > 0.05 ? undefined : 'Recipient not found'
  }));
  
  console.log(`📧 Sent ${notifications.length} custom notifications`);
  return notifications;
}

/**
 * Enviar notificaciones generales
 */
async function sendGeneralNotifications(jobId: string, recipients: string[], message: string, data: any): Promise<any[]> {
  updateJobProgress(jobId, 95);
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const notifications = recipients.map(recipient => ({
    recipient,
    type: 'general',
    status: 'sent',
    message,
    sentAt: new Date()
  }));
  
  console.log(`📨 Sent ${notifications.length} general notifications`);
  return notifications;
}
