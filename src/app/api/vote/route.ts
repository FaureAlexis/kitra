import { NextRequest, NextResponse } from 'next/server';
import { blockchainService } from '@/lib/services/blockchain.service';

interface CastVoteRequest {
  proposalId: string;
  support: boolean; // true = for, false = against
  reason?: string;
  voterAddress: string;
}

interface CreateProposalRequest {
  designTokenId: number;
  title: string;
  description: string;
  proposerAddress: string;
  proposalType: 'approval' | 'rejection';
}

interface VoteResponse {
  success: boolean;
  transactionHash?: string;
  weight?: number;
  proposalId?: string;
  error?: string;
}

// POST /api/vote - Cast a vote on a proposal
export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log('🗳️ [VOTE API] Processing vote request...');
  
  try {
    const body: CastVoteRequest = await request.json();
    console.log('📋 [VOTE API] Vote request details:', {
      proposalId: body.proposalId?.slice(0, 10) + '...',
      support: body.support,
      hasReason: !!body.reason,
      voter: body.voterAddress?.slice(0, 8) + '...'
    });

    // Validate required fields
    if (!body.proposalId || !body.voterAddress || typeof body.support !== 'boolean') {
      console.error('❌ [VOTE API] Missing required fields');
      return NextResponse.json(
        { success: false, error: 'Missing required fields: proposalId, voterAddress, support' },
        { status: 400 }
      );
    }

    // Validate proposal ID format (should be a hex string)
    if (!/^0x[a-fA-F0-9]+$/.test(body.proposalId)) {
      console.error('❌ [VOTE API] Invalid proposal ID format');
      return NextResponse.json(
        { success: false, error: 'Invalid proposal ID format' },
        { status: 400 }
      );
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(body.voterAddress)) {
      console.error('❌ [VOTE API] Invalid voter address format');
      return NextResponse.json(
        { success: false, error: 'Invalid voter address format' },
        { status: 400 }
      );
    }

    console.log('✅ [VOTE API] Request validation passed');

    // Check if user has already voted (prevent double voting)
    console.log('🔍 [VOTE API] Checking if user has already voted...');
    try {
      const hasVoted = await blockchainService.hasUserVoted(body.proposalId, body.voterAddress);
      if (hasVoted) {
        console.log('⚠️ [VOTE API] User has already voted on this proposal');
        return NextResponse.json(
          { success: false, error: 'You have already voted on this proposal' },
          { status: 409 }
        );
      }
    } catch (voteCheckError) {
      console.warn('⚠️ [VOTE API] Could not check vote status, proceeding anyway:', voteCheckError);
    }

    // Get user's voting power
    console.log('🔍 [VOTE API] Checking voter\'s voting power...');
    try {
      const votingPower = await blockchainService.getVotingPower(body.voterAddress);
      if (votingPower === 0) {
        console.log('⚠️ [VOTE API] User has no voting power');
        return NextResponse.json(
          { success: false, error: 'You have no voting power. You need tokens to vote.' },
          { status: 403 }
        );
      }
      console.log('✅ [VOTE API] User has voting power:', votingPower);
    } catch (powerError) {
      console.warn('⚠️ [VOTE API] Could not check voting power, proceeding anyway:', powerError);
    }

    // Cast the vote on blockchain
    console.log('🗳️ [VOTE API] Casting vote on blockchain...');
    try {
      const voteResult = await blockchainService.castVote(
        body.proposalId,
        body.support,
        body.reason
      );

      console.log('✅ [VOTE API] Vote cast successfully:', {
        transactionHash: voteResult.transactionHash,
        weight: voteResult.weight,
        support: voteResult.support
      });

      // TODO: Store vote in database for faster queries
      console.log('📝 [VOTE API] TODO: Store vote in database for analytics');

      const response: VoteResponse = {
        success: true,
        transactionHash: voteResult.transactionHash,
        weight: voteResult.weight,
        proposalId: body.proposalId
      };

      return NextResponse.json(response);

    } catch (voteError) {
      console.error('❌ [VOTE API] Failed to cast vote on blockchain:', voteError);
      
      // Handle specific blockchain errors
      if (voteError instanceof Error) {
        if (voteError.message.includes('already voted')) {
          return NextResponse.json(
            { success: false, error: 'You have already voted on this proposal' },
            { status: 409 }
          );
        }
        
        if (voteError.message.includes('not active')) {
          return NextResponse.json(
            { success: false, error: 'Voting period has ended for this proposal' },
            { status: 410 }
          );
        }
        
        if (voteError.message.includes('insufficient')) {
          return NextResponse.json(
            { success: false, error: 'Insufficient voting power or gas' },
            { status: 403 }
          );
        }
      }

      return NextResponse.json(
        { success: false, error: 'Failed to cast vote. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('💥 [VOTE API] Critical error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/vote - Create a new proposal
export async function PUT(request: NextRequest): Promise<NextResponse> {
  console.log('📝 [VOTE API] Processing proposal creation request...');
  
  try {
    const body: CreateProposalRequest = await request.json();
    console.log('📋 [VOTE API] Proposal request details:', {
      designTokenId: body.designTokenId,
      title: body.title,
      description: body.description?.substring(0, 100) + '...',
      proposer: body.proposerAddress?.slice(0, 8) + '...',
      type: body.proposalType
    });

    // Validate required fields
    if (!body.designTokenId || !body.title || !body.proposerAddress || !body.proposalType) {
      console.error('❌ [VOTE API] Missing required fields for proposal creation');
      return NextResponse.json(
        { success: false, error: 'Missing required fields: designTokenId, title, proposerAddress, proposalType' },
        { status: 400 }
      );
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(body.proposerAddress)) {
      console.error('❌ [VOTE API] Invalid proposer address format');
      return NextResponse.json(
        { success: false, error: 'Invalid proposer address format' },
        { status: 400 }
      );
    }

    // Validate proposal type
    if (!['approval', 'rejection'].includes(body.proposalType)) {
      console.error('❌ [VOTE API] Invalid proposal type');
      return NextResponse.json(
        { success: false, error: 'Invalid proposal type. Must be "approval" or "rejection"' },
        { status: 400 }
      );
    }

    console.log('✅ [VOTE API] Proposal validation passed');

    // Check proposer's voting power (must have tokens to propose)
    console.log('🔍 [VOTE API] Checking proposer\'s voting power...');
    try {
      const votingPower = await blockchainService.getVotingPower(body.proposerAddress);
      if (votingPower === 0) {
        console.log('⚠️ [VOTE API] Proposer has no voting power');
        return NextResponse.json(
          { success: false, error: 'You need tokens to create proposals' },
          { status: 403 }
        );
      }
      console.log('✅ [VOTE API] Proposer has voting power:', votingPower);
    } catch (powerError) {
      console.warn('⚠️ [VOTE API] Could not check proposer voting power:', powerError);
    }

    // Create proposal on blockchain
    console.log('📝 [VOTE API] Creating proposal on blockchain...');
    try {
      const proposalResult = await blockchainService.proposeDesignApproval(
        body.designTokenId,
        body.title,
        body.description || ''
      );

      console.log('✅ [VOTE API] Proposal created successfully:', {
        proposalId: proposalResult.proposalId,
        transactionHash: proposalResult.transactionHash
      });

      // TODO: Store proposal in database for faster queries
      console.log('📝 [VOTE API] TODO: Store proposal in database');

      const response: VoteResponse = {
        success: true,
        proposalId: proposalResult.proposalId,
        transactionHash: proposalResult.transactionHash
      };

      return NextResponse.json(response);

    } catch (proposalError) {
      console.error('❌ [VOTE API] Failed to create proposal on blockchain:', proposalError);
      
      // Handle specific blockchain errors
      if (proposalError instanceof Error) {
        if (proposalError.message.includes('already exists')) {
          return NextResponse.json(
            { success: false, error: 'A proposal for this design already exists' },
            { status: 409 }
          );
        }
        
        if (proposalError.message.includes('not candidate')) {
          return NextResponse.json(
            { success: false, error: 'Design is not a candidate for voting' },
            { status: 400 }
          );
        }
      }

      return NextResponse.json(
        { success: false, error: 'Failed to create proposal. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('💥 [VOTE API] Critical error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/vote?proposalId=... - Get proposal state and voting information
export async function GET(request: NextRequest): Promise<NextResponse> {
  console.log('🔍 [VOTE API] Processing proposal state request...');
  
  try {
    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get('proposalId');
    const voterAddress = searchParams.get('voterAddress');

    if (!proposalId) {
      return NextResponse.json(
        { success: false, error: 'Missing proposalId parameter' },
        { status: 400 }
      );
    }

    console.log('📋 [VOTE API] Fetching proposal state:', {
      proposalId: proposalId.slice(0, 10) + '...',
      hasVoterAddress: !!voterAddress
    });

    // Get proposal state from blockchain
    const proposalData = await blockchainService.getProposalState(proposalId);

    // Check if specific voter has voted (if voter address provided)
    let hasVoted = false;
    if (voterAddress) {
      try {
        hasVoted = await blockchainService.hasUserVoted(proposalId, voterAddress);
      } catch (error) {
        console.warn('⚠️ [VOTE API] Could not check voter status:', error);
      }
    }

    const response = {
      success: true,
      proposal: proposalData,
      hasVoted: voterAddress ? hasVoted : undefined
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ [VOTE API] Error fetching proposal state:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch proposal state' },
      { status: 500 }
    );
  }
} 