import { NextRequest, NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';

export async function POST(request: NextRequest) {
  try {
    const { message, signature } = await request.json();
    
    if (!message || !signature) {
      return NextResponse.json(
        { error: 'Missing message or signature' },
        { status: 400 }
      );
    }
    
    // Parse and verify the SIWE message
    const siweMessage = new SiweMessage(message);
    const fields = await siweMessage.verify({ signature });
    
    if (!fields.success) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    // TODO: Create or update user in database
    const user = {
      address: fields.data.address,
      chainId: fields.data.chainId,
      domain: fields.data.domain,
      issuedAt: fields.data.issuedAt,
      nonce: fields.data.nonce,
    };
    
    // TODO: Create JWT token or session
    // For now, just return success
    
    return NextResponse.json({
      success: true,
      user: user,
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error verifying SIWE message:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
} 