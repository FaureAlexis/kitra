import { NextRequest, NextResponse } from 'next/server';
import { GenerateKitService } from '@/app-services/generate-kit';

export async function POST(request: NextRequest) {
  try {
    const { name, description, prompt, style, colors } = await request.json();
    
    if (!name || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // TODO: Get user from authentication
    const userAddress = "0x742d35Cc6C6C72C4"; // Mock address
    
    const generateKitService = new GenerateKitService();
    
    const result = await generateKitService.generateKit({
      prompt,
      style,
      colors,
      userAddress,
    });
    
    return NextResponse.json({
      success: true,
      textureUrl: result.textureUrl,
      ipfsHash: result.ipfsHash,
      metadata: result.metadata,
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error generating kit:', error);
    return NextResponse.json(
      { error: 'Failed to generate kit' },
      { status: 500 }
    );
  }
} 