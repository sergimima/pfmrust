'use client';

import { useState, useEffect } from 'react';
import ModerationPanel from '@/components/moderation/ModerationPanel';

// Interfaces
interface Report {
  id: string;
  type: string;
  content: string;
  reporter: string;
  reported: string;
  status: string;
  priority: string;
  createdAt: string;
  moderator?: string;
  notes?: string;
}

interface Appeal {
  id: string;
  user: string;
  originalAction: string;
  reason: string;
  status: string;
  createdAt: string;
}

export default function ModerationPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    const mockReports = [
      {
        id: '1',
        type: 'spam',
        content: 'Vote: "Buy my tokens now!"',
        reporter: 'alice.sol',
        reported: 'spammer.sol',
        status: 'pending',
        priority: 'high',
        createdAt: '2025-07-05T10:30:00Z'
      },
      {
        id: '2',
        type: 'harassment',
        content: 'Comment: "Offensive language targeting user"',
        reporter: 'bob.sol',
        reported: 'troll.sol',
        status: 'pending',
        priority: 'critical',
        createdAt: '2025-07-05T09:15:00Z'
      },
      {
        id: '3',
        type: 'misinformation',
        content: 'Vote: "False claims about protocol"',
        reporter: 'charlie.sol',
        reported: 'faker.sol',
        status: 'reviewed',
        priority: 'medium',
        createdAt: '2025-07-05T08:00:00Z',
        moderator: 'admin.sol',
        notes: 'Confirmed misinformation, user warned'
      }
    ];

    const mockAppeals = [
      {
        id: '1',
        user: 'appealer.sol',
        originalAction: 'Temporary ban for spam',
        reason: 'I was not spamming, it was a legitimate proposal',
        status: 'pending',
        createdAt: '2025-07-05T11:00:00Z'
      }
    ];

    setTimeout(() => {
      setReports(mockReports);
      setAppeals(mockAppeals);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <ModerationPanel reports={reports} appeals={appeals} />;
}