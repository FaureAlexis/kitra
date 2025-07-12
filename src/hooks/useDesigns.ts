import { useState, useEffect, useCallback } from 'react';
import { DesignListItem, DesignListResponse } from '../app/api/designs/route';

export interface UseDesignsParams {
  page?: number;
  pageSize?: number;
  status?: 'published' | 'candidate' | 'draft';
  creator?: string;
  tags?: string[];
}

export interface UseDesignsResult {
  designs: DesignListItem[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  fetchDesigns: () => Promise<void>;
  refetchDesigns: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export const useDesigns = (params: UseDesignsParams = {}): UseDesignsResult => {
  const [designs, setDesigns] = useState<DesignListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(params.page || 1);
  const [pageSize] = useState(params.pageSize || 12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildQueryString = useCallback((currentPage: number) => {
    const searchParams = new URLSearchParams();
    searchParams.set('page', currentPage.toString());
    searchParams.set('pageSize', pageSize.toString());
    
    if (params.status) {
      searchParams.set('status', params.status);
    }
    
    if (params.creator) {
      searchParams.set('creator', params.creator);
    }
    
    if (params.tags && params.tags.length > 0) {
      searchParams.set('tags', params.tags.join(','));
    }
    
    return searchParams.toString();
  }, [params.status, params.creator, params.tags, pageSize]);

  const fetchDesigns = useCallback(async (currentPage: number = 1, append: boolean = false) => {
    console.log('🔍 [useDesigns] Fetching designs...', {
      page: currentPage,
      pageSize,
      append,
      params
    });
    
    setLoading(true);
    setError(null);
    
    try {
      const queryString = buildQueryString(currentPage);
      const response = await fetch(`/api/designs?${queryString}`);
      
      console.log('📡 [useDesigns] API response:', {
        status: response.status,
        ok: response.ok
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: DesignListResponse = await response.json();
      
      console.log('📥 [useDesigns] API data:', {
        success: data.success,
        designsCount: data.designs.length,
        total: data.total,
        page: data.page
      });
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch designs');
      }
      
      setDesigns(prev => append ? [...prev, ...data.designs] : data.designs);
      setTotal(data.total);
      setPage(data.page);
      
      console.log('✅ [useDesigns] Designs updated successfully');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ [useDesigns] Error fetching designs:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [buildQueryString, pageSize, params]);

  const refetchDesigns = useCallback(async () => {
    console.log('🔄 [useDesigns] Refetching designs from start...');
    setPage(1);
    await fetchDesigns(1, false);
  }, [fetchDesigns]);

  const loadMore = useCallback(async () => {
    const nextPage = page + 1;
    const maxPage = Math.ceil(total / pageSize);
    
    console.log('📄 [useDesigns] Loading more designs...', {
      currentPage: page,
      nextPage,
      maxPage,
      total,
      pageSize
    });
    
    if (nextPage <= maxPage) {
      await fetchDesigns(nextPage, true);
    }
  }, [page, total, pageSize, fetchDesigns]);

  // Initial fetch and refetch when params change
  useEffect(() => {
    console.log('🔄 [useDesigns] Params changed, refetching...', params);
    refetchDesigns();
  }, [params.status, params.creator, params.tags?.join(',')]);

  const hasMore = page * pageSize < total;

  return {
    designs,
    total,
    page,
    pageSize,
    loading,
    error,
    hasMore,
    fetchDesigns: () => fetchDesigns(page, false),
    refetchDesigns,
    loadMore
  };
}; 