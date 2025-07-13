"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWalletData, useUserStats, useUserDesigns, useVotingHistory } from "@/hooks/useWalletData";
import Link from "next/link";
import { Palette, Vote, Trophy, DollarSign, Rocket, Calendar, Eye, Edit, CheckCircle, X } from "lucide-react";

function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="animate-pulse w-10 h-10 rounded-xl bg-muted" />
          <div>
            <div className="animate-pulse h-8 w-48 mb-2 bg-muted rounded" />
            <div className="animate-pulse h-4 w-64 bg-muted rounded" />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="animate-pulse h-4 w-20 mb-2 bg-muted rounded" />
                  <div className="animate-pulse h-8 w-12 bg-muted rounded" />
                </div>
                <div className="animate-pulse w-12 h-12 rounded-xl bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ConnectWalletPrompt() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6">
          <span className="text-4xl">👛</span>
        </div>
        <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          To access your dashboard and manage your designs, please connect your wallet first.
        </p>
        <w3m-button />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const walletData = useWalletData();
  const { data: userStats, isLoading: statsLoading, error: statsError } = useUserStats(walletData.address);
  const { data: userDesigns, isLoading: designsLoading, error: designsError } = useUserDesigns(walletData.address);
  const { data: votingHistory, isLoading: votingLoading } = useVotingHistory(walletData.address);

  // Show connect wallet prompt if not connected
  if (!walletData.isConnected) {
    return <ConnectWalletPrompt />;
  }

  // Show loading state
  if (walletData.isLoading || statsLoading || designsLoading) {
    return <LoadingSkeleton />;
  }

  // Show error state
  if (statsError || designsError) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Alert className="mb-6">
          <AlertDescription>
            Failed to load dashboard data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />

      <div className="max-w-7xl mx-auto p-6 relative">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground/80 bg-clip-text text-transparent">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {walletData.ensName || `${walletData.address.slice(0, 6)}...${walletData.address.slice(-4)}`}
              </p>
            </div>
            <div className="flex items-center gap-4 justify-end text-right">
              <div>
                <p className="text-sm text-muted-foreground">Wallet Connected</p>
                <p className="text-sm font-medium">{walletData.formattedBalance}</p>
              </div>
            </div>
          </div>
        </div>

              {/* User Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Designs Created</p>
                  <p className="text-2xl font-bold">{userStats?.designsCount || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Palette className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Votes Cast</p>
                  <p className="text-2xl font-bold">{userStats?.votesCount || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-950 dark:to-blue-900 flex items-center justify-center">
                  <Vote className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">NFTs Owned</p>
                  <p className="text-2xl font-bold">{userStats?.tokensOwned || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-950 dark:to-amber-900 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                  <p className="text-2xl font-bold">{userStats?.totalEarnings || "0 CHZ"}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-950 dark:to-emerald-900 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg mb-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Jump into creating and exploring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" asChild>
              <Link href="/builder">
                <Rocket className="w-4 h-4 mr-2" />
                Create New Design
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/gallery">
                <Palette className="w-4 h-4 mr-2" />
                Browse Gallery
              </Link>
            </Button>
            <Button size="lg" variant="outline">
              <Vote className="w-4 h-4 mr-2" />
              View Voting Queue
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* My Designs */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>My Designs</CardTitle>
                <CardDescription>Your created designs and their status</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/builder">Create New</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userDesigns && userDesigns.length > 0 ? (
                userDesigns.map((design) => (
                  <div key={design.id} className="flex items-center justify-between p-4 rounded-xl border bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{design.name}</h3>
                        <Badge variant={
                          design.status === 'published' ? 'default' :
                          design.status === 'voting' ? 'secondary' : 'outline'
                        } className="text-xs">
                          {design.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Vote className="w-4 h-4" />
                          {design.votes} votes
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {design.earnings}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {design.createdAt}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        View
                      </Button>
                      {design.status === 'draft' && (
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Palette className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground mb-4">No designs yet</p>
                  <Button asChild>
                    <Link href="/builder">Create Your First Design</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Voting History */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Votes</CardTitle>
                <CardDescription>Your voting activity</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {votingHistory && votingHistory.length > 0 ? (
                votingHistory.map((vote, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl border bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-medium mb-2">{vote.designName}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className={`flex items-center gap-1 ${
                          vote.vote === 'support' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {vote.vote === 'support' ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          {vote.vote}
                        </span>
                        <span className="flex items-center gap-1">
                          <Vote className="w-4 h-4" />
                          {vote.weight} voting power
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {vote.date}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      View
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-950 dark:to-blue-900 flex items-center justify-center mx-auto mb-4">
                    <Vote className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-muted-foreground mb-4">No votes cast yet</p>
                  <Button variant="outline" asChild>
                    <Link href="/gallery">Browse Designs to Vote</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}
