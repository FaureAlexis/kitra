-- Kitra Database Schema
-- This schema complements the blockchain data with off-chain metadata

-- Users table (indexed by wallet address)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  ens_name VARCHAR(255),
  username VARCHAR(50),
  bio TEXT,
  avatar_url TEXT,
  twitter_handle VARCHAR(50),
  instagram_handle VARCHAR(50),
  website_url TEXT,
  reputation_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Design metadata table (complements NFT data)
CREATE TABLE designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_address VARCHAR(42) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL, -- AI generation prompt
  style VARCHAR(50) NOT NULL, -- modern, classic, retro, etc.
  kit_type VARCHAR(50) NOT NULL, -- home, away, third, goalkeeper
  tags TEXT[], -- Array of tags
  
  -- IPFS data
  ipfs_hash VARCHAR(100) UNIQUE,
  ipfs_url TEXT,
  metadata_hash VARCHAR(100),
  metadata_url TEXT,
  
  -- Blockchain data
  token_id INTEGER, -- NFT token ID (null for non-minted designs)
  contract_address VARCHAR(42), -- Smart contract address
  mint_transaction_hash VARCHAR(66),
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- draft, candidate, published, rejected
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- Voting (cached counts)
  votes INTEGER DEFAULT 0, -- Legacy vote count for UI compatibility
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP,
  minted_at TIMESTAMP,
  
  -- Constraints
  CONSTRAINT fk_creator FOREIGN KEY (creator_address) REFERENCES users(wallet_address)
);

-- Votes table (tracks individual votes)
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_address VARCHAR(42) NOT NULL,
  design_id UUID NOT NULL,
  proposal_id VARCHAR(66), -- Blockchain proposal ID
  support BOOLEAN NOT NULL, -- true = for, false = against
  weight INTEGER DEFAULT 1, -- Voting weight
  reason TEXT, -- Optional voting reason
  transaction_hash VARCHAR(66), -- Blockchain transaction hash
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT fk_voter FOREIGN KEY (voter_address) REFERENCES users(wallet_address),
  CONSTRAINT fk_design FOREIGN KEY (design_id) REFERENCES designs(id),
  UNIQUE(voter_address, design_id) -- One vote per user per design
);

-- Proposals table (governance proposals)
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blockchain_proposal_id VARCHAR(66) UNIQUE NOT NULL,
  proposer_address VARCHAR(42) NOT NULL,
  design_id UUID NOT NULL,
  proposal_type VARCHAR(20) NOT NULL, -- approval, rejection
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Voting stats (cached from blockchain)
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  votes_abstain INTEGER DEFAULT 0,
  total_votes INTEGER DEFAULT 0,
  
  -- Blockchain data
  start_block INTEGER,
  end_block INTEGER,
  transaction_hash VARCHAR(66),
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, succeeded, defeated, executed
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  executed_at TIMESTAMP,
  
  -- Constraints
  CONSTRAINT fk_proposer FOREIGN KEY (proposer_address) REFERENCES users(wallet_address),
  CONSTRAINT fk_proposal_design FOREIGN KEY (design_id) REFERENCES designs(id)
);

-- Collections table (for organizing designs)
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_address VARCHAR(42) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT fk_collection_creator FOREIGN KEY (creator_address) REFERENCES users(wallet_address)
);

-- Many-to-many relationship between designs and collections
CREATE TABLE design_collections (
  design_id UUID NOT NULL,
  collection_id UUID NOT NULL,
  added_at TIMESTAMP DEFAULT NOW(),
  
  PRIMARY KEY (design_id, collection_id),
  CONSTRAINT fk_design_collection_design FOREIGN KEY (design_id) REFERENCES designs(id) ON DELETE CASCADE,
  CONSTRAINT fk_design_collection_collection FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
);

-- Comments table (for design feedback)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commenter_address VARCHAR(42) NOT NULL,
  design_id UUID NOT NULL,
  parent_comment_id UUID, -- For threaded comments
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT fk_commenter FOREIGN KEY (commenter_address) REFERENCES users(wallet_address),
  CONSTRAINT fk_comment_design FOREIGN KEY (design_id) REFERENCES designs(id) ON DELETE CASCADE,
  CONSTRAINT fk_parent_comment FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE SET NULL
);

-- Likes table (simple reactions)
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  liker_address VARCHAR(42) NOT NULL,
  design_id UUID NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT fk_liker FOREIGN KEY (liker_address) REFERENCES users(wallet_address),
  CONSTRAINT fk_liked_design FOREIGN KEY (design_id) REFERENCES designs(id) ON DELETE CASCADE,
  UNIQUE(liker_address, design_id) -- One like per user per design
);

-- Follows table (user following system)
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_address VARCHAR(42) NOT NULL,
  following_address VARCHAR(42) NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT fk_follower FOREIGN KEY (follower_address) REFERENCES users(wallet_address),
  CONSTRAINT fk_following FOREIGN KEY (following_address) REFERENCES users(wallet_address),
  UNIQUE(follower_address, following_address), -- Prevent duplicate follows
  CHECK(follower_address != following_address) -- Prevent self-following
);

-- Analytics events table (for tracking user behavior)
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address VARCHAR(42),
  event_type VARCHAR(50) NOT NULL, -- view, download, share, mint, vote, etc.
  entity_type VARCHAR(50), -- design, user, collection, etc.
  entity_id UUID,
  metadata JSONB, -- Additional event data
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_designs_creator ON designs(creator_address);
CREATE INDEX idx_designs_status ON designs(status);
CREATE INDEX idx_designs_created_at ON designs(created_at DESC);
CREATE INDEX idx_designs_token_id ON designs(token_id) WHERE token_id IS NOT NULL;
CREATE INDEX idx_designs_ipfs_hash ON designs(ipfs_hash) WHERE ipfs_hash IS NOT NULL;

CREATE INDEX idx_votes_voter ON votes(voter_address);
CREATE INDEX idx_votes_design ON votes(design_id);
CREATE INDEX idx_votes_created_at ON votes(created_at DESC);

CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_design ON proposals(design_id);
CREATE INDEX idx_proposals_blockchain_id ON proposals(blockchain_proposal_id);

CREATE INDEX idx_comments_design ON comments(design_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

CREATE INDEX idx_likes_design ON likes(design_id);
CREATE INDEX idx_likes_liker ON likes(liker_address);

CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at DESC);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_designs_updated_at BEFORE UPDATE ON designs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column(); 