-- Check the status of the specific design
SELECT 
  id,
  name,
  status,
  creator_address,
  votes,
  votes_for,
  votes_against,
  created_at
FROM designs 
WHERE id = 'f57f1681-b8a2-4053-b6c9-550e81fa189f';

-- If the design exists but isn't a candidate, update it
UPDATE designs 
SET status = 'candidate' 
WHERE id = 'f57f1681-b8a2-4053-b6c9-550e81fa189f' 
  AND status != 'candidate';

-- Verify the update
SELECT 
  id,
  name,
  status,
  'Design is now ready for voting' as message
FROM designs 
WHERE id = 'f57f1681-b8a2-4053-b6c9-550e81fa189f'; 