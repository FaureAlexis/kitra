"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWalletData, useUserStats, useUserDesigns, useVotingHistory } from "@/hooks/useWalletData";
import Link from "next/link";

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
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <span className="text-primary-foreground font-bold">📊</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {walletData.ensName || `${walletData.address.slice(0, 6)}...${walletData.address.slice(-4)}`}
            </p>
          </div>
        </div>
      </div>

      {/* Wallet Status */}
      <Card className="border-0 shadow-lg mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-green-50 dark:from-green-950 dark:to-green-900 flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Wallet Connected</p>
                <p className="font-mono text-sm">{walletData.address}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="text-lg font-semibold">{walletData.formattedBalance}</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                <span className="text-2xl">🎨</span>
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
                <span className="text-2xl">🗳️</span>
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
                <span className="text-2xl">🏆</span>
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
                <span className="text-2xl">💰</span>
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
                <span className="mr-2">🚀</span>
                Create New Design
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/gallery">
                <span className="mr-2">🎨</span>
                Browse Gallery
              </Link>
            </Button>
            <Button size="lg" variant="outline">
              <span className="mr-2">🗳️</span>
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
                          <span>🗳️</span>
                          {design.votes} votes
                        </span>
                        <span className="flex items-center gap-1">
                          <span>💰</span>
                          {design.earnings}
                        </span>
                        <span className="flex items-center gap-1">
                          <span>📅</span>
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
                    <span className="text-2xl">🎨</span>
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
                          {vote.vote === 'support' ? '✅' : '❌'}
                          {vote.vote}
                        </span>
                        <span className="flex items-center gap-1">
                          <span>⚖️</span>
                          {vote.weight} voting power
                        </span>
                        <span className="flex items-center gap-1">
                          <span>📅</span>
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
                    <span className="text-2xl">🗳️</span>
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

      {/* User Profile */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-xl">
              {walletData.ensName?.[0].toUpperCase() || walletData.address[2].toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{walletData.ensName || 'Anonymous'}</h3>
              <p className="text-sm text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded mt-1 inline-block">
                {walletData.address}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Button variant="outline">
              <span className="mr-2">✏️</span>
              Edit Profile
            </Button>
            <Button variant="outline">
              <span className="mr-2">👁️</span>
              View Public Profile
            </Button>
            <Button variant="outline">
              <span className="mr-2">⚙️</span>
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 