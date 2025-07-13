import { NextRequest, NextResponse } from 'next/server';
import { blockchainService } from '@/lib/services/blockchain.service';
import { db } from '@/lib/database/client';

interface CastVoteRequest {
  designId: string;
  support: boolean; // true = for, false = against
  reason?: string;
  voterAddress: string;
}

interface VoteResponse {
  success: boolean;
  transactionHash?: string;
  weight?: number;
  error?: string;
}

// POST /api/vote - Cast a vote on a design (simplified version)
export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log('🗳️ [VOTE API] Processing simplified vote request...');
  
  try {
    const body: CastVoteRequest = await request.json();
    console.log('📋 [VOTE API] Vote request details:', {
      designId: body.designId,
      support: body.support,
      hasReason: !!body.reason,
      voter: body.voterAddress?.slice(0, 8) + '...'
    });

    // Validate required fields
    if (!body.designId || !body.voterAddress || typeof body.support !== 'boolean') {
      console.error('❌ [VOTE API] Missing required fields');
      return NextResponse.json(
        { success: false, error: 'Missing required fields: designId, voterAddress, support' },
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

    // Check if design exists and is eligible for voting
    console.log('🔍 [VOTE API] Checking if design exists and is eligible...');
    const { data: design, error: designError } = await db.getAdminClient()
      .from('designs')
      .select('*')
      .eq('id', body.designId)
      .single();

    if (designError || !design) {
      console.error('❌ [VOTE API] Design not found:', designError);
      return NextResponse.json(
        { success: false, error: 'Design not found' },
        { status: 404 }
      );
    }

    if (design.status !== 'candidate') {
      console.error('❌ [VOTE API] Design not eligible for voting:', design.status);
      return NextResponse.json(
        { success: false, error: 'This design is not eligible for voting' },
        { status: 400 }
      );
    }

    // Check if user has already voted on this design
    console.log('🔍 [VOTE API] Checking if user has already voted...');
    const { data: existingVote } = await db.getAdminClient()
      .from('votes')
      .select('id')
      .eq('design_id', body.designId)
      .eq('voter_address', body.voterAddress.toLowerCase())
      .single();

    if (existingVote) {
      console.log('⚠️ [VOTE API] User has already voted');
      return NextResponse.json(
        { success: false, error: 'You have already voted on this design' },
        { status: 409 }
      );
    }

    // Get user's voting power from BasicVoting token
    console.log('🔍 [VOTE API] Checking voter\'s voting power...');
    let votingPower = 1; // Default voting power
    try {
      votingPower = await blockchainService.getVotingPower(body.voterAddress);
      if (votingPower === 0) {
        console.log('⚠️ [VOTE API] User has no voting power');
        return NextResponse.json(
          { success: false, error: 'You have no voting power. You need tokens to vote.' },
          { status: 403 }
        );
      }
      console.log('✅ [VOTE API] User has voting power:', votingPower);
    } catch (powerError) {
      console.warn('⚠️ [VOTE API] Could not check voting power, using default:', powerError);
    }

    // Store vote in database
    console.log('💾 [VOTE API] Storing vote in database...');
    const { data: vote, error: voteInsertError } = await db.getAdminClient()
      .from('votes')
      .insert({
        voter_address: body.voterAddress.toLowerCase(),
        design_id: body.designId,
        support: body.support,
        weight: votingPower,
        reason: body.reason || null,
        transaction_hash: `db_vote_${Date.now()}`, // Fake transaction hash for database votes
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (voteInsertError) {
      console.error('❌ [VOTE API] Failed to store vote in database:', voteInsertError);
      return NextResponse.json(
        { success: false, error: 'Failed to record vote' },
        { status: 500 }
      );
    }

    console.log('✅ [VOTE API] Vote stored in database successfully');

    // Update design vote counts
    console.log('📊 [VOTE API] Updating design vote counts...');
    const voteIncrement = body.support ? 'votes_for' : 'votes_against';
    const currentVotes = design[voteIncrement] || 0;
    const totalVotes = (design.votes_for || 0) + (design.votes_against || 0);

    const { error: updateError } = await db.getAdminClient()
      .from('designs')
      .update({
        [voteIncrement]: currentVotes + votingPower,
        votes: totalVotes + votingPower, // Update legacy votes field too
        updated_at: new Date().toISOString()
      })
      .eq('id', body.designId);

    if (updateError) {
      console.error('❌ [VOTE API] Failed to update design counts:', updateError);
    } else {
      console.log('✅ [VOTE API] Design vote counts updated');
    }

    const response: VoteResponse = {
      success: true,
      transactionHash: vote.transaction_hash,
      weight: votingPower
    };

    console.log('🎉 [VOTE API] Vote completed successfully');
    return NextResponse.json(response);

  } catch (error) {
    console.error('💥 [VOTE API] Critical error:', error);
      
    if (error instanceof Error) {
      if (error.message.includes('insufficient funds')) {
        return NextResponse.json(
          { success: false, error: 'Insufficient funds for transaction. Please ensure you have enough tokens for gas fees.' },
          { status: 402 }
        );
      }
      
      if (error.message.includes('user denied')) {
        return NextResponse.json(
          { success: false, error: 'Transaction was cancelled by user.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Failed to cast vote. Please try again.' },
      { status: 500 }
    );
  }
}

// GET /api/vote?designId=... - Get voting information for a design
export async function GET(request: NextRequest): Promise<NextResponse> {
  console.log('🔍 [VOTE API] Processing vote status request...');
  
  try {
    const { searchParams } = new URL(request.url);
    const designId = searchParams.get('designId');
    const voterAddress = searchParams.get('voterAddress');

    if (!designId) {
      return NextResponse.json(
        { success: false, error: 'Missing designId parameter' },
        { status: 400 }
      );
    }

    console.log('📋 [VOTE API] Fetching vote status:', {
      designId,
      hasVoterAddress: !!voterAddress
    });

    // Get design info
    const { data: design, error: designError } = await db.getAdminClient()
      .from('designs')
      .select('*')
      .eq('id', designId)
      .single();

    if (designError || !design) {
      console.error('❌ [VOTE API] Design not found:', designError);
      return NextResponse.json(
        { success: false, error: 'Design not found' },
        { status: 404 }
      );
    }

    // Get vote counts
    const { data: votes } = await db.getAdminClient()
      .from('votes')
      .select('support, weight')
      .eq('design_id', designId);

    // Calculate vote totals
    let votesFor = 0;
    let votesAgainst = 0;
    let totalVotes = 0;

    if (votes) {
      votes.forEach((vote: { support: boolean; weight: number }) => {
        if (vote.support) {
          votesFor += vote.weight;
        } else {
          votesAgainst += vote.weight;
        }
        totalVotes += vote.weight;
      });
    }

    // Check if specific voter has voted
    let hasVoted = false;
    if (voterAddress) {
      const { data: userVote } = await db.getAdminClient()
        .from('votes')
        .select('id')
        .eq('design_id', designId)
        .eq('voter_address', voterAddress.toLowerCase())
        .single();
      
      hasVoted = !!userVote;
    }

    const response = {
      success: true,
      design: {
        id: design.id,
        name: design.name,
        status: design.status,
        totalVotes,
        votesFor,
        votesAgainst,
        approvalPercentage: totalVotes > 0 ? Math.round((votesFor / totalVotes) * 100) : 0
      },
      hasVoted: voterAddress ? hasVoted : undefined
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ [VOTE API] Error fetching vote status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vote status' },
      { status: 500 }
    );
  }
} 