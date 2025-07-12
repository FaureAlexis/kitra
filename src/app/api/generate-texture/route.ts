import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Type definitions
interface GenerateTextureRequest {
  prompt: string;
  style?: 'photorealistic' | 'artistic' | 'minimalist' | 'vintage' | 'modern';
  kitType?: 'home' | 'away' | 'third' | 'goalkeeper';
  colors?: string[];
  teamName?: string;
  elements?: string[];
}

interface GenerateTextureResponse {
  success: boolean;
  texture?: string; // base64 encoded image
  metadata?: {
    prompt: string;
    style: string;
    dimensions: string;
    format: string;
    timestamp: number;
  };
  error?: string;
}

// Style-specific prompt modifiers
const STYLE_MODIFIERS = {
  photorealistic: "Create a photorealistic, high-detail sports jersey texture with professional fabric textures and lighting.",
  artistic: "Create an artistic, stylized sports jersey texture with creative patterns and unique visual elements.",
  minimalist: "Create a clean, minimalist sports jersey texture with simple geometric patterns and modern aesthetic.",
  vintage: "Create a vintage-style sports jersey texture with retro patterns, classic colors, and nostalgic design elements.",
  modern: "Create a modern, contemporary sports jersey texture with sleek patterns and current design trends."
};

// Kit type specifications
const KIT_TYPE_SPECS = {
  home: "home jersey with primary team colors and traditional design elements",
  away: "away jersey with contrasting colors and distinctive away kit styling",
  third: "third kit with unique alternative colors and creative design approach", 
  goalkeeper: "goalkeeper jersey with distinctive colors and patterns for visibility"
};

function buildOptimizedPrompt(request: GenerateTextureRequest): string {
  const { prompt, style = 'modern', kitType = 'home', colors = [], teamName, elements = [] } = request;
  
  // Base prompt structure for football kit texture
  let optimizedPrompt = STYLE_MODIFIERS[style];
  
  // Add kit type specification
  optimizedPrompt += ` Design a ${KIT_TYPE_SPECS[kitType]}`;
  
  // Add team name if provided
  if (teamName) {
    optimizedPrompt += ` for ${teamName}`;
  }
  
  // Add user's custom prompt
  optimizedPrompt += `. ${prompt}`;
  
  // Add colors if specified
  if (colors.length > 0) {
    optimizedPrompt += ` Use these colors: ${colors.join(', ')}.`;
  }
  
  // Add specific elements
  if (elements.length > 0) {
    optimizedPrompt += ` Include these design elements: ${elements.join(', ')}.`;
  }
  
  // Technical specifications for optimal texture generation
  optimizedPrompt += ` Create a seamless, tileable texture suitable for 3D mapping onto a football jersey. The design should be flat and suitable for UV mapping, with consistent lighting and no shadows. Output as a high-resolution texture map with proper aspect ratio for jersey applications.`;
  
  return optimizedPrompt;
}

async function generateTextureWithRetry(prompt: string, maxRetries = 3): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.images.generate({
        model: "gpt-image-1",
        prompt: prompt,
        size: "1024x1024", // Square format ideal for textures
        quality: "high", // "low", "medium", or "high" for GPT-image-1
        n: 1 // GPT-image-1 supports 1-10 images
        // Note: response_format is not supported for GPT-image-1 - it always returns base64
      });
      
      if (response.data && response.data[0] && response.data[0].b64_json) {
        return response.data[0].b64_json;
      }
      
      throw new Error('No image data received from OpenAI');
    } catch (error) {
      lastError = error as Error;
      console.warn(`Texture generation attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Failed to generate texture after all retries');
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }
    
    // Parse and validate request
    const body: GenerateTextureRequest = await request.json();
    
    if (!body.prompt || body.prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }
    
    if (body.prompt.length > 1000) {
      return NextResponse.json(
        { success: false, error: 'Prompt too long (max 1000 characters)' },
        { status: 400 }
      );
    }
    
    // Build optimized prompt
    const optimizedPrompt = buildOptimizedPrompt(body);
    console.log('Generated optimized prompt:', optimizedPrompt);
    
    // Generate texture
    const textureBase64 = await generateTextureWithRetry(optimizedPrompt);
    
    // Prepare response
    const response: GenerateTextureResponse = {
      success: true,
      texture: textureBase64,
      metadata: {
        prompt: optimizedPrompt,
        style: body.style || 'modern',
        dimensions: '1024x1024',
        format: 'png',
        timestamp: Date.now()
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Texture generation error:', error);
    
    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      
      if (error.message.includes('content policy')) {
        return NextResponse.json(
          { success: false, error: 'Content violates usage policies. Please modify your prompt.' },
          { status: 400 }
        );
      }
      
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { success: false, error: 'API quota exceeded. Please check your OpenAI billing.' },
          { status: 402 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to generate texture. Please try again.' },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'healthy',
    model: 'gpt-image-1',
    timestamp: new Date().toISOString()
  });
} 