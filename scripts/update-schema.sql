-- Add voting columns to designs table
ALTER TABLE designs 
ADD COLUMN IF NOT EXISTS votes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS votes_for INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS votes_against INTEGER DEFAULT 0;

-- Update existing designs to have 0 votes
UPDATE designs 
SET votes = 0, votes_for = 0, votes_against = 0 
WHERE votes IS NULL OR votes_for IS NULL OR votes_against IS NULL;

-- Create a test candidate design for voting
INSERT INTO designs (
  id,
  creator_address,
  name,
  description,
  prompt,
  style,
  kit_type,
  status,
  votes,
  votes_for,
  votes_against
) VALUES (
  'test-design-voting-123',
  '0x6b0dFdD17Dc0ECA9f4802e2589F653e90F405B6C',
  'Test Football Kit',
  'A beautiful test design for voting',
  'Create a modern football kit with blue and white colors',
  'modern',
  'home',
  'candidate',
  0,
  0,
  0
) ON CONFLICT (id) DO NOTHING;

SELECT 'Schema updated successfully!' as message; 