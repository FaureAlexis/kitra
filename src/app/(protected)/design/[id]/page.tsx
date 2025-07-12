'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Share2, 
  Download, 
  Edit, 
  Heart,
  ExternalLink,
  Copy,
  Eye,
  Calendar,
  User,
  Tag,
  Vote,
  Palette,
  Shirt
} from 'lucide-react';
import Link from "next/link";
import { useDesignLoader } from '@/hooks/useDesignLoader';
import { useWalletData } from '@/hooks/useWalletData';
import { SafeCanvas } from '../../builder/components/3d/SafeCanvas';
import { Scene } from '../../builder/components/3d/Scene';
import { toast } from 'sonner';

export default function DesignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const designId = params.id as string;
  const walletData = useWalletData();
  
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [currentVotes, setCurrentVotes] = useState(0);
  
  const { design, loading, error, loadDesign } = useDesignLoader();

  // Load design on mount
  useEffect(() => {
    if (designId) {
      console.log('🔍 [DesignDetails] Loading design:', designId);
      loadDesign(designId);
    }
  }, [designId, loadDesign]);

  // Set initial votes when design loads
  useEffect(() => {
    if (design) {
      setCurrentVotes(design.votes);
      // TODO: Check if user has already voted for this design
      setHasVoted(false);
    }
  }, [design]);

  const handleVote = async () => {
    if (!walletData.isConnected) {
      toast.error('Please connect your wallet to vote');
      return;
    }

    if (hasVoted) {
      toast.info('You have already voted for this design');
      return;
    }

    setIsVoting(true);
    
    try {
      // TODO: Implement actual voting API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setCurrentVotes(prev => prev + 1);
      setHasVoted(true);
      
      toast.success('Vote cast successfully!', {
        description: 'Your vote has been recorded on the blockchain'
      });
      
    } catch (error) {
      console.error('Voting error:', error);
      toast.error('Failed to cast vote', {
        description: 'Please try again later'
      });
    } finally {
      setIsVoting(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/design/${designId}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: design?.name || 'Football Kit Design',
          text: design?.description || 'Check out this amazing football kit design!',
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share design');
    }
  };

  const handleDownload = () => {
    if (design?.ipfsUrl) {
      // Create a temporary link to download the image
      const link = document.createElement('a');
      link.href = design.ipfsUrl;
      link.download = `${design.name.replace(/\s+/g, '_')}_texture.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download started!');
    } else {
      toast.error('No image available for download');
    }
  };

  const handleLoadInBuilder = () => {
    router.push(`/builder?load=${designId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCreator = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isOwner = walletData.address && design && 
    walletData.address.toLowerCase() === design.creator.toLowerCase();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-8 w-64" />
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <div className="space-y-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !design) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-semibold mb-2">Design Not Found</h2>
          <p className="text-muted-foreground mb-6">
            {error || 'The design you\'re looking for doesn\'t exist or has been removed.'}
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
            <Button asChild>
              <Link href="/gallery">Browse Gallery</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{design.name}</h1>
            <p className="text-muted-foreground">
              Created by {design.creatorEnsName || formatCreator(design.creator)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            {isOwner && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/builder?load=${designId}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* 3D Preview */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-muted/30 to-muted/60 relative">
                <Suspense fallback={
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                }>
                  <SafeCanvas>
                    <Scene 
                      modelPath="/models/jersey.glb"
                      primaryColor="#ec4899"
                      secondaryColor="#ffffff"
                      pattern="solid"
                      textureUrl={design.ipfsUrl}
                      textureId={design.id}
                    />
                  </SafeCanvas>
                </Suspense>
                
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <Badge variant={design.status === 'published' ? 'default' : 'secondary'}>
                    {design.status}
                  </Badge>
                </div>
                
                {/* View Count */}
                <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1">
                  <div className="flex items-center gap-1 text-white text-sm">
                    <Eye className="h-4 w-4" />
                    <span>2.3k views</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                size="lg" 
                onClick={handleLoadInBuilder}
                className="w-full"
              >
                <Palette className="h-4 w-4 mr-2" />
                Load in Builder
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleDownload}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          {/* Design Details */}
          <div className="space-y-6">
            {/* Description */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shirt className="h-5 w-5" />
                  Design Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {design.description}
                </p>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(design.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{design.creatorEnsName || formatCreator(design.creator)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shirt className="h-4 w-4 text-muted-foreground" />
                    <span className="capitalize">{design.kitType} Kit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <span className="capitalize">{design.style}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Voting Section */}
            {design.status === 'candidate' && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Vote className="h-5 w-5" />
                    Community Voting
                  </CardTitle>
                  <CardDescription>
                    This design is in the voting phase. Vote to help it get published!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold">{currentVotes} votes</div>
                    <Button 
                      onClick={handleVote}
                      disabled={isVoting || hasVoted || !walletData.isConnected}
                      size="lg"
                    >
                      <Heart className={`h-4 w-4 mr-2 ${hasVoted ? 'fill-current' : ''}`} />
                      {isVoting ? 'Voting...' : hasVoted ? 'Voted' : 'Vote'}
                    </Button>
                  </div>
                  
                  {!walletData.isConnected && (
                    <p className="text-sm text-muted-foreground">
                      Connect your wallet to vote for this design
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {design.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* IPFS Metadata */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Blockchain Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">IPFS Hash:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-muted px-2 py-1 rounded text-xs">
                      {design.ipfsHash?.slice(0, 12)}...
                    </code>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        navigator.clipboard.writeText(design.ipfsHash || '');
                        toast.success('IPFS hash copied!');
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">View on IPFS:</span>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={design.ipfsUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
                
                {design.metadataUrl && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Metadata:</span>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={design.metadataUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Prompt Section */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle>AI Generation Prompt</CardTitle>
            <CardDescription>
              The prompt used to generate this design with AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="font-mono text-sm leading-relaxed">
                "{design.prompt}"
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Related Designs */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Related Designs</h2>
          <div className="text-center py-12 text-muted-foreground">
            <p>Related designs feature coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
} 