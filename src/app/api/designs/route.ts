import { NextRequest, NextResponse } from 'next/server';
import { DesignService } from '@/app-services/design-service';
import { GenerateKitService } from '@/app-services/generate-kit';
import { UserEntity } from '@/domain/models/User';

// Mock repository implementation
class MockDesignRepository {
  private designs: any[] = [];
  
  async save(design: any) {
    this.designs.push(design);
    return design;
  }
  
  async findById(id: string) {
    return this.designs.find(d => d.id === id) || null;
  }
  
  async findByUser(userId: string) {
    return this.designs.filter(d => d.createdBy === userId);
  }
  
  async findPublished() {
    return this.designs.filter(d => d.isPublished);
  }
  
  async delete(id: string) {
    const index = this.designs.findIndex(d => d.id === id);
    if (index > -1) {
      this.designs.splice(index, 1);
    }
  }
}

const mockRepository = new MockDesignRepository();

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
    const mockUser = UserEntity.create({
      address: "0x742d35Cc6C6C72C4",
      ensName: "designer.eth",
    });
    
    const designService = new DesignService(
      mockRepository,
      new GenerateKitService()
    );
    
    const design = await designService.createDesign({
      name,
      description,
      prompt,
      style,
      colors,
      user: mockUser,
    });
    
    return NextResponse.json({
      success: true,
      design: {
        id: design.id,
        name: design.name,
        description: design.description,
        textureUrl: design.textureUrl,
        ipfsHash: design.ipfsHash,
        createdAt: design.createdAt,
      },
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating design:', error);
    return NextResponse.json(
      { error: 'Failed to create design' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (userId) {
      const designs = await mockRepository.findByUser(userId);
      return NextResponse.json({ designs }, { status: 200 });
    }
    
    const designs = await mockRepository.findPublished();
    return NextResponse.json({ designs }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching designs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch designs' },
      { status: 500 }
    );
  }
} 