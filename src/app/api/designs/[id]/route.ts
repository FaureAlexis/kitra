import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/client';
import { DesignListItem } from '../route';

export interface DesignDetails extends DesignListItem {
  // Additional fields for design details
  textureData?: string; // base64 texture data for builder loading
  metadataJson?: any; // Full metadata from IPFS
  creatorEnsName?: string; // ENS name if available
  publishedAt?: string; // When it was published (if published)
  lastModified?: string; // Last modification date
  downloads?: number; // Number of downloads
  shares?: number; // Number of shares
  contractAddress?: string; // Smart contract address if minted
  mintTransactionHash?: string; // Transaction hash of minting
  mintedAt?: string; // When it was minted as NFT
}

export interface DesignDetailsResponse {
  success: boolean;
  design?: DesignDetails;
  error?: string;
}

// GET /api/designs/[id] - Fetch specific design details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  console.log('🔍 [DESIGN DETAILS API] Fetching design details for ID:', id);
  
  try {
    const designId = id;
    
    if (!designId) {
      return NextResponse.json(
        { success: false, error: 'Design ID is required' },
        { status: 400 }
      );
    }

    console.log('🗄️ [DESIGN DETAILS API] Querying database for design:', designId);
    
    // Query design from database
    const { data: design, error } = await db.getAdminClient()
      .from('designs')
      .select(`
        id,
        name,
        description,
        creator_address,
        created_at,
        ipfs_hash,
        ipfs_url,
        metadata_hash,
        metadata_url,
        prompt,
        style,
        kit_type,
        tags,
        status,
        view_count,
        download_count,
        share_count,
        token_id,
        contract_address,
        mint_transaction_hash,
        published_at,
        minted_at
      `)
      .eq('id', designId)
      .single();

    if (error || !design) {
      console.error('❌ [DESIGN DETAILS API] Design not found:', designId, error);
      return NextResponse.json(
        { success: false, error: 'Design not found' },
        { status: 404 }
      );
    }

    console.log('✅ [DESIGN DETAILS API] Design found:', {
      id: design.id,
      name: design.name,
      creator: design.creator_address,
      status: design.status
    });

    // Get texture data from IPFS if available
    let textureData = '';
    if (design.ipfs_url) {
      try {
        console.log('🌐 [DESIGN DETAILS API] Fetching texture from IPFS...');
        const textureResponse = await fetch(design.ipfs_url);
        if (textureResponse.ok) {
          const textureBlob = await textureResponse.blob();
          const arrayBuffer = await textureBlob.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          textureData = `data:image/png;base64,${buffer.toString('base64')}`;
          console.log('✅ [DESIGN DETAILS API] Texture data loaded from IPFS');
        } else {
          console.warn('⚠️ [DESIGN DETAILS API] Failed to fetch texture from IPFS');
        }
      } catch (textureError) {
        console.warn('⚠️ [DESIGN DETAILS API] Error fetching texture:', textureError);
      }
    }

    // Transform to API format
    const designDetails: DesignDetails = {
      id: design.id,
      name: design.name,
      description: design.description || '',
      creator: design.creator_address,
      createdAt: design.created_at,
      ipfsHash: design.ipfs_hash || '',
      ipfsUrl: design.ipfs_url || '',
      metadataHash: design.metadata_hash || '',
      metadataUrl: design.metadata_url || '',
      prompt: design.prompt,
      style: design.style,
      kitType: design.kit_type,
      tags: design.tags || [],
      votes: design.view_count, // Using view_count as proxy for votes
      status: design.status,
      // Extended fields for details
      textureData: textureData,
      downloads: design.download_count,
      shares: design.share_count,
      tokenId: design.token_id || undefined,
      contractAddress: design.contract_address || undefined,
      mintTransactionHash: design.mint_transaction_hash || undefined,
      publishedAt: design.published_at || undefined,
      mintedAt: design.minted_at || undefined
    };

    // Increment view count
    try {
      await db.getAdminClient()
        .from('designs')
        .update({ view_count: design.view_count + 1 })
        .eq('id', designId);
      console.log('📊 [DESIGN DETAILS API] View count incremented');
    } catch (viewError) {
      console.warn('⚠️ [DESIGN DETAILS API] Failed to increment view count:', viewError);
    }

    console.log('✅ [DESIGN DETAILS API] Design details fetched successfully');

    return NextResponse.json({
      success: true,
      design: designDetails
    });

  } catch (error) {
    console.error('💥 [DESIGN DETAILS API] Critical error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch design details' },
      { status: 500 }
    );
  }
} 