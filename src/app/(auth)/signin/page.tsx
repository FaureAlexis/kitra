"use client";

import { useAccount, useSignMessage } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SiweMessage } from "siwe";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAppKit } from "@reown/appkit/react";

export default function SignInPage() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync, isPending } = useSignMessage();
  const { open } = useAppKit();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already connected and authenticated
  useEffect(() => {
    if (isConnected && address) {
      // TODO: Check authentication status
      // For now, just redirect to dashboard
      router.push("/dashboard");
    }
  }, [isConnected, address, router]);

  const handleSIWESignIn = async () => {
    if (!address) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Step 1: Get nonce from backend
      const nonceResponse = await fetch("/api/siwe/nonce", {
        method: "POST",
      });
      
      if (!nonceResponse.ok) {
        throw new Error("Failed to get nonce");
      }
      
      const { nonce } = await nonceResponse.json();
      
      // Step 2: Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address: address,
        statement: "Sign in with Ethereum to access Kitra",
        uri: window.location.origin,
        version: "1",
        chainId: 88882, // Chiliz Spicy testnet
        nonce: nonce,
      });
      
      const messageString = message.prepareMessage();
      
      // Step 3: Sign message
      const signature = await signMessageAsync({ message: messageString });
      
      // Step 4: Verify signature with backend
      const verifyResponse = await fetch("/api/siwe/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageString,
          signature: signature,
        }),
      });
      
      if (!verifyResponse.ok) {
        throw new Error("Failed to verify signature");
      }
      
      const { success, user } = await verifyResponse.json();
      
      if (!success) {
        throw new Error("Authentication failed");
      }
      
      // Success! Redirect to dashboard
      router.push("/dashboard");
      
    } catch (err) {
      console.error("SIWE sign-in error:", err);
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      
      <div className="relative w-full max-w-md">
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <span className="text-2xl text-primary-foreground font-bold">K</span>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                Connect to Kitra
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Sign in with your Ethereum wallet to start creating
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {!isConnected ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Choose your wallet to get started
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={() => open()}
                    className="w-full h-12 text-base font-medium"
                    size="lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                        <span className="text-xs font-bold">W</span>
                      </div>
                      Connect Wallet
                    </div>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-2">Connected as</p>
                  <p className="font-mono text-sm bg-background px-3 py-2 rounded-lg border">
                    {address}
                  </p>
                </div>
                
                <Button 
                  onClick={handleSIWESignIn}
                  disabled={isLoading || isPending}
                  className="w-full h-12 text-base font-medium"
                  size="lg"
                >
                  {isLoading || isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Signing...
                    </div>
                  ) : (
                    "Sign In with Ethereum"
                  )}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  By signing in, you agree to our{" "}
                  <a href="#" className="text-primary hover:underline">Terms of Service</a>{" "}
                  and{" "}
                  <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                </p>
              </div>
            )}
            
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Don't have a wallet?{" "}
                <a 
                  href="https://metamask.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  Get MetaMask
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to landing */}
        <div className="text-center mt-6">
          <Button variant="ghost" asChild>
            <a href="/landing" className="text-muted-foreground hover:text-foreground">
              ← Back to home
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
} 