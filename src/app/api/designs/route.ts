import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/client';

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
  console.log('📋 [DESIGNS API] Fetching designs list...');
  
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || searchParams.get('limit') || '12')));
    const offset = (page - 1) * pageSize;
    
    const status = searchParams.get('status') as 'draft' | 'candidate' | 'published' | 'rejected' | null;
    const creator = searchParams.get('creator') || searchParams.get('userId');
    const style = searchParams.get('style');
    const kitType = searchParams.get('kitType');
    const search = searchParams.get('search');
    const tagsParam = searchParams.get('tags');
    const tags = tagsParam ? tagsParam.split(',').map(tag => tag.trim()) : null;
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    console.log('🔍 [DESIGNS API] Query parameters:', {
      page,
      pageSize,
      offset,
      status,
      creator,
      style,
      kitType,
      search,
      tags,
      sortBy,
      sortOrder
    });

    // Build query
    let query = db.getAdminClient()
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
        token_id
      `);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    
    if (creator) {
      query = query.eq('creator_address', creator.toLowerCase());
    }
    
    if (style) {
      query = query.eq('style', style);
    }
    
    if (kitType) {
      query = query.eq('kit_type', kitType);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%, description.ilike.%${search}%, prompt.ilike.%${search}%`);
    }
    
    if (tags && tags.length > 0) {
      // Filter designs that contain any of the specified tags
      const tagFilters = tags.map(tag => `tags.cs.{${tag}}`).join(',');
      query = query.or(tagFilters);
    }

    // Apply sorting
    const validSortColumns = ['created_at', 'name', 'view_count', 'status'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder === 'asc' ? true : false;
    
    query = query.order(sortColumn, { ascending: order });

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1);

    console.log('🗄️ [DESIGNS API] Executing database query...');
    const { data: designs, error, count } = await query;

    if (error) {
      console.error('❌ [DESIGNS API] Database query failed:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch designs from database' },
        { status: 500 }
      );
    }

    console.log('📊 [DESIGNS API] Database query result:', {
      designCount: designs?.length || 0,
      totalCount: count
    });

    // Transform database records to API format
    const allDesigns: DesignListItem[] = (designs || []).map((design: any) => ({
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
      votes: design.vote_count || 0, // Real vote count from blockchain voting
      status: design.status,
      tokenId: design.token_id || undefined
    }));



    // Get total count for pagination
    let totalCount = allDesigns.length;
    if (!creator && !status && !style && !kitType && !search && !tags) {
      // Get total count only for unfiltered queries
      const { count: fullCount } = await db.getAdminClient()
        .from('designs')
        .select('*', { count: 'exact', head: true });
      totalCount = fullCount || 0;
    }

    console.log('📊 [DESIGNS API] Final result:', {
      designs: allDesigns.length,
      totalCount,
      page,
      pageSize
    });

    return NextResponse.json({
      success: true,
      designs: allDesigns,
      total: totalCount,
      page,
      pageSize,
      hasMore: page * pageSize < totalCount
    });

  } catch (error) {
    console.error('💥 [DESIGNS API] Critical error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 