import { NextRequest, NextResponse } from 'next/server';
import { blockchainService } from '@/lib/services/blockchain.service';
import { db } from '@/lib/database/client';

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

    // Check if proposal exists in database
    console.log('🔍 [VOTE API] Checking if proposal exists in database...');
    const { data: proposal, error: proposalError } = await db.getAdminClient()
      .from('proposals')
      .select('*')
      .eq('blockchain_proposal_id', body.proposalId)
      .single();

    if (proposalError || !proposal) {
      console.error('❌ [VOTE API] Proposal not found in database:', proposalError);
      return NextResponse.json(
        { success: false, error: 'Proposal not found' },
        { status: 404 }
      );
    }

    // Check if user has already voted in database
    console.log('🔍 [VOTE API] Checking if user has already voted in database...');
    const { data: existingVote } = await db.getAdminClient()
      .from('votes')
      .select('id')
      .eq('proposal_id', proposal.id)
      .eq('voter_address', body.voterAddress.toLowerCase())
      .single();

    if (existingVote) {
      console.log('⚠️ [VOTE API] User has already voted in database');
      return NextResponse.json(
        { success: false, error: 'You have already voted on this proposal' },
        { status: 409 }
      );
    }

    // Check blockchain for double voting (fallback)
    console.log('🔍 [VOTE API] Double-checking blockchain vote status...');
    try {
      const hasVoted = await blockchainService.hasUserVoted(body.proposalId, body.voterAddress);
      if (hasVoted) {
        console.log('⚠️ [VOTE API] User has already voted on blockchain');
        return NextResponse.json(
          { success: false, error: 'You have already voted on this proposal' },
          { status: 409 }
        );
      }
    } catch (voteCheckError) {
      console.warn('⚠️ [VOTE API] Could not check blockchain vote status:', voteCheckError);
    }

    // Get user's voting power
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

    // Cast the vote on blockchain
    console.log('🔗 [VOTE API] Casting vote on blockchain...');
    const voteResult = await blockchainService.castVote(
      body.proposalId,
      body.support,
      body.reason
    );

    console.log('✅ [VOTE API] Vote cast on blockchain:', {
      transactionHash: voteResult.transactionHash,
      weight: voteResult.weight,
      support: voteResult.support
    });

    // Store vote in database
    console.log('💾 [VOTE API] Storing vote in database...');
    const { error: voteInsertError } = await db.getAdminClient()
      .from('votes')
      .insert({
        voter_address: body.voterAddress.toLowerCase(),
        design_id: proposal.design_id,
        proposal_id: proposal.id,
        support: body.support,
        weight: voteResult.weight,
        reason: body.reason || null,
        transaction_hash: voteResult.transactionHash
      });

    if (voteInsertError) {
      console.error('❌ [VOTE API] Failed to store vote in database:', voteInsertError);
      // Vote was cast on blockchain but not stored in database - log for manual resolution
    } else {
      console.log('✅ [VOTE API] Vote stored in database successfully');
    }

    // Update proposal vote counts in database
    console.log('📊 [VOTE API] Updating proposal vote counts...');
    const voteIncrement = body.support ? 'votes_for' : 'votes_against';
    const { error: updateError } = await db.getAdminClient()
      .from('proposals')
      .update({
        [voteIncrement]: proposal[voteIncrement] + voteResult.weight,
        total_votes: proposal.total_votes + voteResult.weight,
        updated_at: new Date().toISOString()
      })
      .eq('id', proposal.id);

    if (updateError) {
      console.error('❌ [VOTE API] Failed to update proposal counts:', updateError);
    } else {
      console.log('✅ [VOTE API] Proposal vote counts updated');
    }

    const response: VoteResponse = {
      success: true,
      transactionHash: voteResult.transactionHash,
      weight: voteResult.weight,
      proposalId: body.proposalId
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

      if (error.message.includes('proposal not active')) {
        return NextResponse.json(
          { success: false, error: 'This proposal is no longer active for voting.' },
          { status: 410 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Failed to cast vote. Please try again.' },
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

      // Store proposal in database
      console.log('💾 [VOTE API] Storing proposal in database...');
      
      // First, get the design to link the proposal
      const { data: design, error: designError } = await db.getAdminClient()
        .from('designs')
        .select('id')
        .eq('token_id', body.designTokenId)
        .single();

      if (designError || !design) {
        console.warn('⚠️ [VOTE API] Could not find design for token ID:', body.designTokenId, designError);
        // Continue anyway, proposal was created on blockchain
      }

      const { error: proposalInsertError } = await db.getAdminClient()
        .from('proposals')
        .insert({
          blockchain_proposal_id: proposalResult.proposalId,
          proposer_address: body.proposerAddress.toLowerCase(),
          design_id: design?.id || null,
          proposal_type: body.proposalType,
          title: body.title,
          description: body.description || '',
          votes_for: 0,
          votes_against: 0,
          votes_abstain: 0,
          total_votes: 0,
          transaction_hash: proposalResult.transactionHash,
          status: 'active'
        });

      if (proposalInsertError) {
        console.error('❌ [VOTE API] Failed to store proposal in database:', proposalInsertError);
        // Proposal was created on blockchain but not stored in database - log for manual resolution
      } else {
        console.log('✅ [VOTE API] Proposal stored in database successfully');
      }

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
    const designId = searchParams.get('designId'); // Handle designId parameter
    const voterAddress = searchParams.get('voterAddress');

    // Handle both proposalId and designId
    if (!proposalId && !designId) {
      return NextResponse.json(
        { success: false, error: 'Missing proposalId or designId parameter' },
        { status: 400 }
      );
    }

    // Handle designId → find or create proposal
    let finalProposalId = proposalId;
    
    if (designId && !proposalId) {
      console.log('🔍 [VOTE API] Looking for existing proposal for design:', designId);
      
      // Check if proposal already exists for this design
      const { data: existingProposal } = await db.getAdminClient()
        .from('proposals')
        .select('blockchain_proposal_id')
        .eq('design_id', designId)
        .single();
      
      if (existingProposal) {
        finalProposalId = existingProposal.blockchain_proposal_id;
        console.log('✅ [VOTE API] Found existing proposal:', finalProposalId);
             } else {
         console.log('⚠️ [VOTE API] No proposal exists for design, attempting to create one...');
         
         // Get design details from database
         const { data: design } = await db.getAdminClient()
           .from('designs')
           .select('*')
           .eq('id', designId)
           .single();
         
         if (!design || design.status !== 'candidate' || !design.token_id) {
           return NextResponse.json({
             success: false,
             error: 'This design is not minted as an NFT yet or not eligible for voting',
             needsProposal: true,
             designId
           }, { status: 400 });
         }

         // Create proposal for this design
         try {
           console.log('🚀 [VOTE API] Creating proposal for design:', designId);
           const proposalResult = await blockchainService.proposeDesignApproval(
             design.token_id,
             `Proposal for design: ${design.name}`,
             `Vote on whether to approve the design "${design.name}" by ${design.creator_address}`
           );
           
           // Store proposal in database
           const { data: newProposal } = await db.getAdminClient()
             .from('proposals')
             .insert({
               design_id: designId,
               blockchain_proposal_id: proposalResult.proposalId,
               transaction_hash: proposalResult.transactionHash,
               title: `Approval for ${design.name}`,
               description: `Vote on whether to approve the design "${design.name}"`,
               proposal_type: 'approval',
               status: 'active',
               created_at: new Date().toISOString()
             })
             .select('blockchain_proposal_id')
             .single();
           
           if (newProposal) {
             finalProposalId = newProposal.blockchain_proposal_id;
             console.log('✅ [VOTE API] Created new proposal:', finalProposalId);
           } else {
             throw new Error('Failed to store proposal in database');
           }
           
         } catch (createError) {
           console.error('❌ [VOTE API] Failed to create proposal:', createError);
           return NextResponse.json({
             success: false,
             error: 'Failed to create voting proposal for this design',
             designId
           }, { status: 500 });
         }
       }
    }
    
    if (!finalProposalId) {
      return NextResponse.json(
        { success: false, error: 'No valid proposal ID found' },
        { status: 400 }
      );
    }

    console.log('📋 [VOTE API] Fetching proposal state:', {
      proposalId: finalProposalId.slice(0, 10) + '...',
      hasVoterAddress: !!voterAddress
    });

    // Get proposal state from blockchain (with ENS error handling)
    let proposalData;
    try {
      proposalData = await blockchainService.getProposalState(finalProposalId);
    } catch (error) {
      console.error('❌ [VOTE API] Blockchain error (possibly ENS on Chiliz):', error);
      return NextResponse.json({
        success: false,
        error: 'Blockchain network error - Chiliz does not support ENS',
        chainId: '88882'
      }, { status: 500 });
    }

    // Check if specific voter has voted (if voter address provided)
    let hasVoted = false;
    if (voterAddress && finalProposalId) {
      try {
        hasVoted = await blockchainService.hasUserVoted(finalProposalId, voterAddress);
      } catch (error) {
        console.warn('⚠️ [VOTE API] Could not check voter status (ENS error):', error);
        // Don't fail the request for ENS errors, just assume not voted
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