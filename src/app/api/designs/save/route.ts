import { NextRequest, NextResponse } from 'next/server';
import { PinataSDK } from 'pinata';
import { blockchainService } from '@/lib/services/blockchain.service';

interface SaveDesignRequest {
  textureData: string; // base64 encoded
  designName: string;
  designDescription: string;
  prompt: string;
  style: string;
  kitType: string;
  userAddress?: string;
  mintAsNFT?: boolean; // Optional flag to mint as NFT candidate
}

interface SaveDesignResponse {
  success: boolean;
  ipfsHash?: string;
  ipfsUrl?: string;
  metadataHash?: string;
  metadataUrl?: string;
  tokenId?: number; // If minted as NFT
  transactionHash?: string; // Blockchain transaction hash
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log('🚀 [SAVE API] Starting design save process...');
  
  try {
    // Validate environment variables
    console.log('🔍 [SAVE API] Checking environment variables...');
    if (!process.env.PINATA_JWT) {
      console.error('❌ [SAVE API] PINATA_JWT environment variable is missing');
      return NextResponse.json(
        { success: false, error: 'IPFS service not configured' },
        { status: 500 }
      );
    }
    console.log('✅ [SAVE API] Environment variables validated');

    // Parse request body
    console.log('📥 [SAVE API] Parsing request body...');
    const body: SaveDesignRequest = await request.json();
    console.log('📋 [SAVE API] Request body parsed:', {
      designName: body.designName,
      designDescription: body.designDescription?.substring(0, 100) + '...',
      prompt: body.prompt?.substring(0, 100) + '...',
      style: body.style,
      kitType: body.kitType,
      userAddress: body.userAddress,
      mintAsNFT: body.mintAsNFT,
      textureDataLength: body.textureData?.length || 0,
      textureDataPrefix: body.textureData?.substring(0, 50) + '...'
    });
    
    // Validate required fields
    console.log('🔍 [SAVE API] Validating required fields...');
    if (!body.textureData || !body.designName || !body.prompt) {
      console.error('❌ [SAVE API] Missing required fields:', {
        hasTextureData: !!body.textureData,
        hasDesignName: !!body.designName,
        hasPrompt: !!body.prompt
      });
      return NextResponse.json(
        { success: false, error: 'Missing required fields: textureData, designName, prompt' },
        { status: 400 }
      );
    }
    
    // Validate user address if minting NFT
    if (body.mintAsNFT && !body.userAddress) {
      console.error('❌ [SAVE API] User address required for NFT minting');
      return NextResponse.json(
        { success: false, error: 'User address required for NFT minting' },
        { status: 400 }
      );
    }
    console.log('✅ [SAVE API] Required fields validated');

    // Initialize Pinata SDK
    console.log('🔧 [SAVE API] Initializing Pinata SDK...');
    const pinata = new PinataSDK({
      pinataJwt: process.env.PINATA_JWT,
      pinataGateway: process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud'
    });
    console.log('✅ [SAVE API] Pinata SDK initialized');

    // Convert base64 to buffer
    console.log('🔄 [SAVE API] Converting base64 texture data to buffer...');
    let textureBuffer: Buffer;
    try {
      // Remove data URL prefix if present
      const base64Data = body.textureData.replace(/^data:image\/[a-z]+;base64,/, '');
      textureBuffer = Buffer.from(base64Data, 'base64');
      console.log('✅ [SAVE API] Base64 conversion successful, buffer size:', textureBuffer.length);
    } catch (bufferError) {
      console.error('❌ [SAVE API] Base64 conversion failed:', bufferError);
      return NextResponse.json(
        { success: false, error: 'Invalid texture data format' },
        { status: 400 }
      );
    }
    
    // Upload texture to IPFS
    console.log('📤 [SAVE API] Creating texture file for upload...');
    const textureBlob = new Blob([textureBuffer], { type: 'image/png' });
    const textureFile = new File([textureBlob], `${body.designName}-texture.png`, {
      type: 'image/png'
    });
    console.log('✅ [SAVE API] Texture file created:', {
      fileName: textureFile.name,
      fileSize: textureFile.size,
      fileType: textureFile.type
    });

    console.log('🌐 [SAVE API] Uploading texture to IPFS...');
    let textureUpload;
    try {
              textureUpload = await pinata.upload.public.file(textureFile);
      console.log('✅ [SAVE API] Texture upload successful:', {
        cid: textureUpload.cid,
        size: textureUpload.size
      });
    } catch (uploadError) {
      console.error('❌ [SAVE API] Texture upload failed:', uploadError);
      throw uploadError;
    }
    
    const textureIpfsUrl = `https://gateway.pinata.cloud/ipfs/${textureUpload.cid}`;
    console.log('🔗 [SAVE API] Texture IPFS URL:', textureIpfsUrl);

    // Create design metadata
    console.log('📋 [SAVE API] Creating design metadata...');
    const metadata = {
      name: body.designName,
      description: body.designDescription,
      image: textureIpfsUrl,
      attributes: [
        { trait_type: "Style", value: body.style },
        { trait_type: "Kit Type", value: body.kitType },
        { trait_type: "AI Generated", value: "true" },
        { trait_type: "Generator", value: "GPT-image-1" },
        { trait_type: "Prompt", value: body.prompt },
        { trait_type: "Created", value: new Date().toISOString() }
      ],
      external_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://kitra.vercel.app'}/designs/${textureUpload.cid}`,
      animation_url: textureIpfsUrl,
      // Kitra-specific metadata
      kitra: {
        prompt: body.prompt,
        style: body.style,
        kitType: body.kitType,
        textureHash: textureUpload.cid,
        createdAt: new Date().toISOString(),
        version: "1.0.0",
        creator: body.userAddress
      }
    };
    console.log('✅ [SAVE API] Metadata created:', {
      name: metadata.name,
      attributesCount: metadata.attributes.length,
      hasKitraData: !!metadata.kitra
    });

    // Upload metadata to IPFS using JSON method
    console.log('🌐 [SAVE API] Uploading metadata to IPFS...');
    let metadataUpload;
    try {
              metadataUpload = await pinata.upload.public.json(metadata);
      console.log('✅ [SAVE API] Metadata upload successful:', {
        cid: metadataUpload.cid,
        size: metadataUpload.size
      });
    } catch (metadataError) {
      console.error('❌ [SAVE API] Metadata upload failed:', metadataError);
      throw metadataError;
    }
    
    const metadataIpfsUrl = `https://gateway.pinata.cloud/ipfs/${metadataUpload.cid}`;
    console.log('🔗 [SAVE API] Metadata IPFS URL:', metadataIpfsUrl);

    // Prepare response object
    const response: SaveDesignResponse = {
      success: true,
      ipfsHash: textureUpload.cid,
      ipfsUrl: textureIpfsUrl,
      metadataHash: metadataUpload.cid,
      metadataUrl: metadataIpfsUrl
    };

    // Mint NFT if requested and user address provided
    if (body.mintAsNFT && body.userAddress) {
      console.log('🪙 [SAVE API] Minting NFT candidate...');
      try {
        const mintResult = await blockchainService.mintDesignCandidate(
          body.userAddress,
          body.designName,
          metadataIpfsUrl
        );

        console.log('✅ [SAVE API] NFT minted successfully:', {
          tokenId: mintResult.tokenId,
          transactionHash: mintResult.transactionHash
        });

        response.tokenId = mintResult.tokenId;
        response.transactionHash = mintResult.transactionHash;

        // TODO: Store design data in database with blockchain information
        console.log('📝 [SAVE API] Design metadata should be stored in database here');
        
      } catch (mintError) {
        console.error('❌ [SAVE API] NFT minting failed:', mintError);
        // Don't fail the entire request if minting fails
        // Return success with IPFS data but add minting error
        console.log('⚠️ [SAVE API] Continuing with IPFS-only save due to minting error');
      }
    }

    // TODO: Store design metadata in database
    // This would include:
    // - Design basic info (name, description, prompt, style, etc.)
    // - IPFS hashes and URLs
    // - Blockchain data (token ID, transaction hash, contract address)
    // - User data (creator address)
    // - Status (draft, candidate, published)
    console.log('📝 [SAVE API] TODO: Store design in database with all metadata');

    console.log('🎉 [SAVE API] Design saved successfully!', {
      textureHash: textureUpload.cid,
      metadataHash: metadataUpload.cid,
      textureUrl: textureIpfsUrl,
      metadataUrl: metadataIpfsUrl,
      tokenId: response.tokenId,
      hasBlockchainData: !!response.tokenId
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('💥 [SAVE API] Critical error occurred:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    // Handle specific errors
    if (error instanceof Error) {
      console.log('🔍 [SAVE API] Analyzing error type:', error.message);
      
      if (error.message.includes('rate limit')) {
        console.log('⚠️ [SAVE API] Rate limit detected');
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      
      if (error.message.includes('quota')) {
        console.log('⚠️ [SAVE API] Quota exceeded detected');
        return NextResponse.json(
          { success: false, error: 'Storage quota exceeded. Please contact support.' },
          { status: 402 }
        );
      }

      if (error.message.includes('jwt') || error.message.includes('auth')) {
        console.log('⚠️ [SAVE API] Authentication error detected');
        return NextResponse.json(
          { success: false, error: 'Authentication failed. Please check API configuration.' },
          { status: 401 }
        );
      }

      if (error.message.includes('network') || error.message.includes('timeout')) {
        console.log('⚠️ [SAVE API] Network error detected');
        return NextResponse.json(
          { success: false, error: 'Network error. Please check your connection and try again.' },
          { status: 503 }
        );
      }

      if (error.message.includes('blockchain') || error.message.includes('contract')) {
        console.log('⚠️ [SAVE API] Blockchain error detected');
        return NextResponse.json(
          { success: false, error: 'Blockchain error. Design saved to IPFS but NFT minting failed.' },
          { status: 207 } // Partial success
        );
      }
    }

    console.log('❌ [SAVE API] Returning generic error response');
    return NextResponse.json(
      { success: false, error: 'Failed to save design. Please try again.' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve design by IPFS hash
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const ipfsHash = searchParams.get('hash');

    if (!ipfsHash) {
      return NextResponse.json(
        { success: false, error: 'Missing IPFS hash parameter' },
        { status: 400 }
      );
    }

    // Return IPFS gateway URL
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    
    return NextResponse.json({
      success: true,
      ipfsUrl,
      ipfsHash
    });

  } catch (error) {
    console.error('Error retrieving design from IPFS:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve design' },
      { status: 500 }
    );
  }
} 