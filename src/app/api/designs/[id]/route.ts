import { NextRequest, NextResponse } from 'next/server';
import { DesignListItem } from '../route';

export interface DesignDetails extends DesignListItem {
  // Additional fields for design details
  textureData?: string; // base64 texture data for builder loading
  metadataJson?: any; // Full metadata from IPFS
  creatorEnsName?: string; // ENS name if available
  publishedAt?: string; // When it was published (if published)
  lastModified?: string; // Last modification date
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

    // TODO: In a real implementation, this would fetch from a database
    // For now, we'll return mock data that matches the structure
    const mockDesigns: DesignDetails[] = [
      {
        id: 'design_1',
        name: 'Lightning Bolt Home Kit',
        description: 'Electric blue and gold dynamic energy pattern with modern geometric elements that create a striking visual impact',
        creator: '0x742d35Cc6464C4532d18174C9c4F021F551B2dC4',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        ipfsHash: 'QmHash1234567890',
        ipfsUrl: 'https://gateway.pinata.cloud/ipfs/QmHash1234567890',
        metadataHash: 'QmMeta1234567890',
        metadataUrl: 'https://gateway.pinata.cloud/ipfs/QmMeta1234567890',
        prompt: 'Modern football kit with lightning bolt patterns, electric blue and gold colors, dynamic energy design with geometric elements and high contrast details',
        style: 'modern',
        kitType: 'home',
        tags: ['modern', 'blue', 'gold', 'lightning', 'dynamic', 'geometric'],
        votes: 156,
        status: 'published',
        // Extended fields for details
        textureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // Placeholder base64
        metadataJson: {
          name: 'Lightning Bolt Home Kit',
          description: 'Electric blue and gold dynamic energy pattern with modern geometric elements',
          attributes: [
            { trait_type: 'Style', value: 'modern' },
            { trait_type: 'Kit Type', value: 'home' },
            { trait_type: 'AI Generated', value: 'true' },
            { trait_type: 'Generator', value: 'GPT-image-1' }
          ]
        },
        creatorEnsName: 'designer1.eth',
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'design_2',
        name: 'Classic Stripes Heritage',
        description: 'Timeless black and white vertical stripes with subtle texture details and traditional football heritage aesthetics',
        creator: '0x123a45B6789C012d3E4F56789A0B1C2D3E4F5678',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        ipfsHash: 'QmHash2345678901',
        ipfsUrl: 'https://gateway.pinata.cloud/ipfs/QmHash2345678901',
        metadataHash: 'QmMeta2345678901',
        metadataUrl: 'https://gateway.pinata.cloud/ipfs/QmMeta2345678901',
        prompt: 'Classic football kit with black and white vertical stripes, traditional design with modern touches and premium fabric texture',
        style: 'classic',
        kitType: 'home',
        tags: ['classic', 'black', 'white', 'stripes', 'traditional', 'heritage'],
        votes: 89,
        status: 'candidate',
        // Extended fields
        textureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        metadataJson: {
          name: 'Classic Stripes Heritage',
          description: 'Timeless black and white vertical stripes',
          attributes: [
            { trait_type: 'Style', value: 'classic' },
            { trait_type: 'Kit Type', value: 'home' }
          ]
        },
        creatorEnsName: 'heritage.eth',
        lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'design_3',
        name: 'Retro Wave Synthwave',
        description: '80s inspired wavy pattern in neon colors with vintage aesthetics and cyberpunk elements',
        creator: '0x456e78F9012A345B6789C012D3E4F56789A0B1C2',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        ipfsHash: 'QmHash3456789012',
        ipfsUrl: 'https://gateway.pinata.cloud/ipfs/QmHash3456789012',
        metadataHash: 'QmMeta3456789012',
        metadataUrl: 'https://gateway.pinata.cloud/ipfs/QmMeta3456789012',
        prompt: 'Retro 80s football kit with neon wave patterns, synthwave aesthetics, pink and cyan colors with glowing effects',
        style: 'retro',
        kitType: 'away',
        tags: ['retro', 'neon', 'pink', 'cyan', 'synthwave', '80s', 'glowing'],
        votes: 234,
        status: 'published',
        // Extended fields
        textureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        metadataJson: {
          name: 'Retro Wave Synthwave',
          description: '80s inspired wavy pattern in neon colors',
          attributes: [
            { trait_type: 'Style', value: 'retro' },
            { trait_type: 'Kit Type', value: 'away' },
            { trait_type: 'Era', value: '80s' }
          ]
        },
        creatorEnsName: 'synthwave.eth',
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const design = mockDesigns.find(d => d.id === designId);
    
    if (!design) {
      console.log('❌ [DESIGN DETAILS API] Design not found:', designId);
      return NextResponse.json(
        { success: false, error: 'Design not found' },
        { status: 404 }
      );
    }

    console.log('✅ [DESIGN DETAILS API] Design found:', {
      id: design.id,
      name: design.name,
      status: design.status,
      hasTextureData: !!design.textureData
    });

    const response: DesignDetailsResponse = {
      success: true,
      design
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ [DESIGN DETAILS API] Error fetching design details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch design details' },
      { status: 500 }
    );
  }
} 