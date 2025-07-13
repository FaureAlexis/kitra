import { NextRequest, NextResponse } from 'next/server';
import { blockchainService } from '@/lib/services/blockchain.service';
import { db } from '@/lib/database/client';

interface MintDesignRequest {
  designId: string;
  userAddress: string;
  highPriority?: boolean; // Optional flag for faster confirmation
}

interface MintDesignResponse {
  success: boolean;
  tokenId?: number;
  transactionHash?: string;
  error?: string;
}

// POST /api/designs/mint - Convert a draft design to NFT candidate
export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log('🪙 [MINT API] Processing manual mint request...');
  
  try {
    const body: MintDesignRequest = await request.json();
    console.log('📋 [MINT API] Mint request details:', {
      designId: body.designId,
      userAddress: body.userAddress?.slice(0, 8) + '...'
    });

    // Validate required fields
    if (!body.designId || !body.userAddress) {
      console.error('❌ [MINT API] Missing required fields');
      return NextResponse.json(
        { success: false, error: 'Missing required fields: designId, userAddress' },
        { status: 400 }
      );
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(body.userAddress)) {
      console.error('❌ [MINT API] Invalid address format');
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Get design from database
    console.log('🔍 [MINT API] Fetching design from database...');
    const { data: design, error: designError } = await db.getAdminClient()
      .from('designs')
      .select('*')
      .eq('id', body.designId)
      .single();

    if (designError || !design) {
      console.error('❌ [MINT API] Design not found:', designError);
      return NextResponse.json(
        { success: false, error: 'Design not found' },
        { status: 404 }
      );
    }

    // Check if already minted
    if (design.token_id) {
      console.log('⚠️ [MINT API] Design already minted');
      return NextResponse.json(
        { success: false, error: 'Design is already minted as NFT' },
        { status: 409 }
      );
    }

    // Check if user owns the design
    if (design.creator_address.toLowerCase() !== body.userAddress.toLowerCase()) {
      console.error('❌ [MINT API] Unauthorized minting attempt');
      return NextResponse.json(
        { success: false, error: 'You can only mint your own designs' },
        { status: 403 }
      );
    }

    // Ensure design has IPFS metadata
    if (!design.metadata_url) {
      console.error('❌ [MINT API] Design missing metadata URL');
      return NextResponse.json(
        { success: false, error: 'Design missing IPFS metadata. Please save the design again.' },
        { status: 400 }
      );
    }

    console.log('✅ [MINT API] Validation passed, proceeding with minting...');

    // Mint NFT on blockchain
    console.log('🪙 [MINT API] Minting NFT candidate...');
    let mintResult;
    try {
      mintResult = await blockchainService.mintDesignCandidate(
        body.userAddress,
        design.name,
        design.metadata_url,
        body.highPriority !== false // Default to high priority unless explicitly set to false
      );
    } catch (mintError: any) {
      console.error('❌ [MINT API] Blockchain minting failed:', mintError);
      
      // Handle specific ENS errors
      if (mintError?.message?.includes('ENS') || mintError?.code === 'UNSUPPORTED_OPERATION') {
        return NextResponse.json({
          success: false,
          error: 'Chiliz network does not support ENS. Please try again or contact support.',
          details: 'Network incompatibility with ENS resolution'
        }, { status: 500 });
      }
      
      // Handle timeout errors more gracefully
      if (mintError?.message?.includes('timeout')) {
        return NextResponse.json({
          success: false,
          error: 'Transaction confirmation timed out',
          details: 'The transaction was sent but confirmation took too long. It may still succeed on the blockchain.',
          transactionHash: mintError?.transactionHash || null, // Include transaction hash if available
          retry: true
        }, { status: 408 }); // 408 Request Timeout
      }
      
      // Handle other blockchain errors
      return NextResponse.json({
        success: false,
        error: 'Failed to mint NFT on blockchain',
        details: mintError?.message || 'Unknown blockchain error'
      }, { status: 500 });
    }

    console.log('✅ [MINT API] NFT minted successfully:', {
      tokenId: mintResult.tokenId,
      transactionHash: mintResult.transactionHash
    });

    // Update design in database
    console.log('💾 [MINT API] Updating design in database...');
    const { error: updateError } = await db.getAdminClient()
      .from('designs')
      .update({
        token_id: mintResult.tokenId,
        contract_address: process.env.NEXT_PUBLIC_DESIGN_CANDIDATE_ADDRESS,
        mint_transaction_hash: mintResult.transactionHash,
        status: 'candidate',
        minted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', body.designId);

    if (updateError) {
      console.error('❌ [MINT API] Database update failed:', updateError);
      // NFT was minted but DB update failed - this is a partial success
      return NextResponse.json({
        success: false,
        error: 'NFT minted but database update failed. Please contact support.',
        tokenId: mintResult.tokenId,
        transactionHash: mintResult.transactionHash
      }, { status: 500 });
    }

    console.log('🎉 [MINT API] Design successfully converted to NFT candidate');

    const response: MintDesignResponse = {
      success: true,
      tokenId: mintResult.tokenId,
      transactionHash: mintResult.transactionHash
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ [MINT API] Unexpected error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to mint NFT candidate' 
      },
      { status: 500 }
    );
  }
}

// GET /api/designs/mint - Get mintable designs for a user
export async function GET(request: NextRequest): Promise<NextResponse> {
  console.log('🔍 [MINT API] Fetching mintable designs...');
  
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');

    if (!userAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing userAddress parameter' },
        { status: 400 }
      );
    }

    // Get all draft designs for this user
    const { data: draftDesigns, error } = await db.getAdminClient()
      .from('designs')
      .select('id, name, description, created_at, ipfs_url, metadata_url')
      .eq('creator_address', userAddress.toLowerCase())
      .eq('status', 'draft')
      .is('token_id', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [MINT API] Database query failed:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch designs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      designs: draftDesigns || [],
      count: draftDesigns?.length || 0
    });

  } catch (error) {
    console.error('❌ [MINT API] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mintable designs' },
      { status: 500 }
    );
  }
} 