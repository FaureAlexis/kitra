/* eslint-disable testing-library/no-node-access */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface DatabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey?: string;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          wallet_address: string;
          ens_name?: string;
          username?: string;
          bio?: string;
          avatar_url?: string;
          twitter_handle?: string;
          instagram_handle?: string;
          website_url?: string;
          reputation_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      designs: {
        Row: {
          id: string;
          creator_address: string;
          name: string;
          description?: string;
          prompt: string;
          style: string;
          kit_type: string;
          tags: string[];
          ipfs_hash?: string;
          ipfs_url?: string;
          metadata_hash?: string;
          metadata_url?: string;
          token_id?: number;
          contract_address?: string;
          mint_transaction_hash?: string;
          status: 'draft' | 'candidate' | 'published' | 'rejected';
          is_featured: boolean;
          view_count: number;
          download_count: number;
          share_count: number;
          created_at: string;
          updated_at: string;
          published_at?: string;
          minted_at?: string;
        };
        Insert: Omit<Database['public']['Tables']['designs']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['designs']['Insert']>;
      };
      votes: {
        Row: {
          id: string;
          voter_address: string;
          design_id: string;
          proposal_id?: string;
          support: boolean;
          weight: number;
          reason?: string;
          transaction_hash?: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['votes']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['votes']['Insert']>;
      };
      proposals: {
        Row: {
          id: string;
          blockchain_proposal_id: string;
          proposer_address: string;
          design_id: string;
          proposal_type: 'approval' | 'rejection';
          title: string;
          description?: string;
          votes_for: number;
          votes_against: number;
          votes_abstain: number;
          total_votes: number;
          start_block?: number;
          end_block?: number;
          transaction_hash?: string;
          status: 'active' | 'succeeded' | 'defeated' | 'executed';
          created_at: string;
          updated_at: string;
          executed_at?: string;
        };
        Insert: Omit<Database['public']['Tables']['proposals']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['proposals']['Insert']>;
      };
    };
  };
}

export class DatabaseClient {
  private static instance: DatabaseClient;
  private supabase: SupabaseClient<Database>;
  private adminSupabase?: SupabaseClient<Database>;

  private constructor(config: DatabaseConfig) {
    // Regular client for frontend operations
    this.supabase = createClient<Database>(
      config.supabaseUrl,
      config.supabaseAnonKey
    );

    // Admin client for backend operations (if service key provided)
    if (config.supabaseServiceKey) {
      this.adminSupabase = createClient<Database>(
        config.supabaseUrl,
        config.supabaseServiceKey
      );
    }
  }

  public static getInstance(config?: DatabaseConfig): DatabaseClient {
    if (!DatabaseClient.instance) {
      if (!config) {
        // Try to create from environment variables
        const envConfig: DatabaseConfig = {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
        };
        
        if (!envConfig.supabaseUrl || !envConfig.supabaseAnonKey) {
          throw new Error('Supabase configuration missing');
        }
        
        DatabaseClient.instance = new DatabaseClient(envConfig);
      } else {
        DatabaseClient.instance = new DatabaseClient(config);
      }
    }
    return DatabaseClient.instance;
  }

  /**
   * Get the regular Supabase client (for frontend)
   */
  getClient(): SupabaseClient<Database> {
    return this.supabase;
  }

  /**
   * Get the admin Supabase client (for backend operations)
   */
  getAdminClient(): SupabaseClient<Database> {
    if (!this.adminSupabase) {
      throw new Error('Admin client not configured - service role key required');
    }
    return this.adminSupabase;
  }

  /**
   * Check database connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('users')
        .select('id')
        .limit(1);
      
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Execute RPC (Remote Procedure Call) function
   */
  async rpc<T = any>(
    functionName: string,
    params?: Record<string, any>,
    useAdmin = false
  ): Promise<{ data: T | null; error: any }> {
    const client = useAdmin ? this.getAdminClient() : this.supabase;
    return await client.rpc(functionName, params);
  }
}

// Initialize database client
export function createDatabaseClient(): DatabaseClient {
  return DatabaseClient.getInstance();
}

// Export singleton instance - handle build-time gracefully
export const db = (() => {
  try {
    return createDatabaseClient();
  } catch (error) {
    // During build time, return a mock client to prevent build failures
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn('Database client not available during build - using mock');
      return null as any;
    }
    throw error;
  }
})(); 