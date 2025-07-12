import { NextRequest, NextResponse } from 'next/server';
import { generateNonce } from 'siwe';

export async function POST(request: NextRequest) {
  try {
    const nonce = generateNonce();
    
    // TODO: Store nonce in session/cache for verification
    // For now, just return the nonce
    
    return NextResponse.json({ nonce }, { status: 200 });
  } catch (error) {
    console.error('Error generating nonce:', error);
    return NextResponse.json(
      { error: 'Failed to generate nonce' },
      { status: 500 }
    );
  }
} 