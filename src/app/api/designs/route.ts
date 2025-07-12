import { NextRequest, NextResponse } from 'next/server';
import { blockchainService } from '@/lib/services/blockchain.service';

export interface DesignListItem {
  id: string;
  name: string;
  description: string;
  creator: string;
  createdAt: string;
  ipfsHash: string;
  ipfsUrl: string;
  metadataHash: string;
  metadataUrl: string;
  prompt: string;
  style: string;
  kitType: string;
  tags: string[];
  votes: number;
  status: 'draft' | 'candidate' | 'published' | 'rejected';
  // Blockchain specific fields
  tokenId?: number;
  transactionHash?: string;
  isCandidate?: boolean;
  mintedAt?: string;
}

export interface DesignListResponse {
  success: boolean;
  designs: DesignListItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  error?: string;
}

// GET /api/designs - List designs with filters
export async function GET(request: NextRequest): Promise<NextResponse> {
  console.log('🔍 [DESIGNS API] Fetching designs list...');
  
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '12'), 50);
    const status = searchParams.get('status') as 'draft' | 'candidate' | 'published' | 'rejected' | null;
    const creator = searchParams.get('creator');
    const tagsParam = searchParams.get('tags');
    const tags = tagsParam ? tagsParam.split(',').map(tag => tag.trim()) : undefined;

    console.log('📋 [DESIGNS API] Query params:', {
      page,
      pageSize,
      status,
      creator,
      tags
    });

    let allDesigns: DesignListItem[] = [];

    // Fetch candidate designs from blockchain
    console.log('🔗 [DESIGNS API] Fetching candidate designs from blockchain...');
    try {
      const candidateDesigns = await blockchainService.getCandidateDesigns();
      console.log('✅ [DESIGNS API] Fetched candidate designs:', candidateDesigns.length);

      // Convert blockchain designs to our format
      for (const design of candidateDesigns) {
        try {
          // Fetch metadata from IPFS
          console.log('🌐 [DESIGNS API] Fetching metadata for token:', design.tokenId);
          const metadataResponse = await fetch(design.tokenURI);
          let metadata: any = {};
          
          if (metadataResponse.ok) {
            metadata = await metadataResponse.json();
          } else {
            console.warn('⚠️ [DESIGNS API] Failed to fetch metadata for token:', design.tokenId);
          }

          // Extract Kitra-specific metadata
          const kitraData = metadata.kitra || {};
          
          const designItem: DesignListItem = {
            id: `blockchain_${design.tokenId}`,
            name: metadata.name || design.name || `Design #${design.tokenId}`,
            description: metadata.description || kitraData.description || 'Blockchain-verified football kit design',
            creator: design.designer,
            createdAt: new Date(design.mintTime * 1000).toISOString(),
            ipfsHash: metadata.image ? metadata.image.split('/').pop() || '' : '',
            ipfsUrl: metadata.image || '',
            metadataHash: design.tokenURI.split('/').pop() || '',
            metadataUrl: design.tokenURI,
            prompt: kitraData.prompt || metadata.attributes?.find((attr: any) => attr.trait_type === 'Prompt')?.value || 'AI-generated football kit design',
            style: kitraData.style || metadata.attributes?.find((attr: any) => attr.trait_type === 'Style')?.value || 'modern',
            kitType: kitraData.kitType || metadata.attributes?.find((attr: any) => attr.trait_type === 'Kit Type')?.value || 'home',
            tags: [
              kitraData.style || 'modern',
              kitraData.kitType || 'home',
              'blockchain',
              'nft'
            ],
            votes: 0, // TODO: Fetch actual vote count from proposals
            status: design.isCandidate ? 'candidate' : 'published',
            // Blockchain specific
            tokenId: design.tokenId,
            isCandidate: design.isCandidate,
            mintedAt: new Date(design.mintTime * 1000).toISOString()
          };

          allDesigns.push(designItem);
        } catch (designError) {
          console.error('❌ [DESIGNS API] Error processing design:', design.tokenId, designError);
          // Continue with other designs
        }
      }
    } catch (blockchainError) {
      console.error('❌ [DESIGNS API] Error fetching from blockchain:', blockchainError);
      // Continue with mock data as fallback
    }

    // Add mock data for demonstration (in production, this would come from database)
    const mockDesigns: DesignListItem[] = [
      {
        id: 'mock_1',
        name: 'Lightning Bolt Home Kit',
        description: 'Electric blue and gold dynamic energy pattern with modern geometric elements that create a striking visual impact',
        creator: '0x742d35Cc6464C4532d18174C9c4F021F551B2dC4',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        ipfsHash: 'QmMockHash1234567890',
        ipfsUrl: 'https://gateway.pinata.cloud/ipfs/QmMockHash1234567890',
        metadataHash: 'QmMockMeta1234567890',
        metadataUrl: 'https://gateway.pinata.cloud/ipfs/QmMockMeta1234567890',
        prompt: 'Modern football kit with lightning bolt patterns, electric blue and gold colors, dynamic energy design with geometric elements and high contrast details',
        style: 'modern',
        kitType: 'home',
        tags: ['modern', 'blue', 'gold', 'lightning', 'dynamic', 'geometric'],
        votes: 156,
        status: 'published',
      },
      {
        id: 'mock_2',
        name: 'Classic Stripes Heritage',
        description: 'Timeless black and white vertical stripes with subtle texture details and traditional football heritage aesthetics',
        creator: '0x123a45B6789C012d3E4F56789A0B1C2D3E4F5678',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        ipfsHash: 'QmMockHash2345678901',
        ipfsUrl: 'https://gateway.pinata.cloud/ipfs/QmMockHash2345678901',
        metadataHash: 'QmMockMeta2345678901',
        metadataUrl: 'https://gateway.pinata.cloud/ipfs/QmMockMeta2345678901',
        prompt: 'Classic football kit with black and white vertical stripes, traditional design with modern touches and premium fabric texture',
        style: 'classic',
        kitType: 'home',
        tags: ['classic', 'black', 'white', 'stripes', 'traditional', 'heritage'],
        votes: 89,
        status: 'candidate',
      },
      {
        id: 'mock_3',
        name: 'Retro Wave Synthwave',
        description: '80s inspired wavy pattern in neon colors with vintage aesthetics and cyberpunk elements',
        creator: '0x456e78F9012A345B6789C012D3E4F56789A0B1C2',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        ipfsHash: 'QmMockHash3456789012',
        ipfsUrl: 'https://gateway.pinata.cloud/ipfs/QmMockHash3456789012',
        metadataHash: 'QmMockMeta3456789012',
        metadataUrl: 'https://gateway.pinata.cloud/ipfs/QmMockMeta3456789012',
        prompt: 'Retro 80s football kit with neon wave patterns, synthwave aesthetics, pink and cyan colors with glowing effects',
        style: 'retro',
        kitType: 'away',
        tags: ['retro', 'neon', 'pink', 'cyan', 'synthwave', '80s', 'glowing'],
        votes: 234,
        status: 'published',
      }
    ];

    // Add mock designs to the collection for now
    allDesigns.push(...mockDesigns);

    console.log('📊 [DESIGNS API] Total designs before filtering:', allDesigns.length);

    // Apply filters
    let filteredDesigns = allDesigns;

    // Filter by status
    if (status) {
      filteredDesigns = filteredDesigns.filter(design => design.status === status);
      console.log('🔍 [DESIGNS API] After status filter:', filteredDesigns.length);
    }

    // Filter by creator
    if (creator) {
      filteredDesigns = filteredDesigns.filter(design => 
        design.creator.toLowerCase() === creator.toLowerCase()
      );
      console.log('🔍 [DESIGNS API] After creator filter:', filteredDesigns.length);
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      filteredDesigns = filteredDesigns.filter(design =>
        tags.some(tag => design.tags.includes(tag.toLowerCase()))
      );
      console.log('🔍 [DESIGNS API] After tags filter:', filteredDesigns.length);
    }

    // Sort by creation date (newest first)
    filteredDesigns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination
    const total = filteredDesigns.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedDesigns = filteredDesigns.slice(startIndex, endIndex);
    const hasMore = endIndex < total;

    console.log('📄 [DESIGNS API] Pagination applied:', {
      total,
      page,
      pageSize,
      startIndex,
      endIndex,
      returned: paginatedDesigns.length,
      hasMore
    });

    console.log('✅ [DESIGNS API] Designs fetched successfully:', {
      total,
      returned: paginatedDesigns.length,
      page,
      pageSize
    });

    const response: DesignListResponse = {
      success: true,
      designs: paginatedDesigns,
      total,
      page,
      pageSize,
      hasMore
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ [DESIGNS API] Error fetching designs:', error);
    
    // Return fallback mock data on error
    const fallbackDesigns: DesignListItem[] = [
      {
        id: 'fallback_1',
        name: 'Error Fallback Design',
        description: 'This is a fallback design shown when blockchain data is unavailable',
        creator: '0x000000000000000000000000000000000000dead',
        createdAt: new Date().toISOString(),
        ipfsHash: 'QmFallbackHash',
        ipfsUrl: 'https://gateway.pinata.cloud/ipfs/QmFallbackHash',
        metadataHash: 'QmFallbackMeta',
        metadataUrl: 'https://gateway.pinata.cloud/ipfs/QmFallbackMeta',
        prompt: 'Fallback design for error handling',
        style: 'modern',
        kitType: 'home',
        tags: ['fallback', 'error'],
        votes: 0,
        status: 'draft',
      }
    ];

    const response: DesignListResponse = {
      success: false,
      designs: fallbackDesigns,
      total: fallbackDesigns.length,
      page: 1,
      pageSize: 12,
      hasMore: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };

    return NextResponse.json(response, { status: 500 });
  }
} 