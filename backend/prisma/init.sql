-- Initial database setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert default voting categories
INSERT INTO voting_categories (name, description, color, icon) VALUES
('General', 'General purpose votings', '#6B7280', 'chat'),
('Events', 'Community events and activities', '#EF4444', 'calendar'),
('Proposals', 'Governance and improvement proposals', '#3B82F6', 'document'),
('Technical', 'Technical discussions and decisions', '#10B981', 'code'),
('Community', 'Community management topics', '#8B5CF6', 'users'),
('Gaming', 'Gaming related votings', '#F59E0B', 'gamepad'),
('Finance', 'Financial and treasury matters', '#059669', 'currency'),
('Education', 'Educational content and resources', '#DC2626', 'book')
ON CONFLICT (name) DO NOTHING;

-- Insert initial daily stats
INSERT INTO daily_stats (date) VALUES (CURRENT_DATE)
ON CONFLICT (date) DO NOTHING;
