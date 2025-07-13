import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-sm text-muted-foreground mb-6">
              <span className="mr-2">🚀</span>
              AI-Powered Design Platform
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Create the Future of{" "}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Football Kits
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Design, vote, and mint unique football jerseys using AI.
              Join the decentralized revolution in sports fashion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6">
                <Link href="/signin">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                <Link href="/gallery">View Gallery</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How Kitra Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to create and monetize your football kit designs
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🎨</span>
                </div>
                <CardTitle className="text-xl">Design with AI</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base leading-relaxed">
                  Use our AI-powered design tools to create unique football kit patterns.
                  DALL-E 3 generates stunning textures based on your creativity.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🗳️</span>
                </div>
                <CardTitle className="text-xl">Community Votes</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base leading-relaxed">
                  Submit your designs to the community. Token holders vote on the best designs
                  using our transparent governance system.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🏆</span>
                </div>
                <CardTitle className="text-xl">Mint NFTs</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base leading-relaxed">
                  Winning designs get minted as NFTs on Chiliz Spicy testnet.
                  Creators earn royalties from every trade.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built on Cutting-Edge Technology
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powered by the latest in AI, blockchain, and 3D visualization
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border border-emerald-200 dark:border-emerald-800">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-500 flex items-center justify-center">
                <span className="text-white font-bold">AI</span>
              </div>
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">OpenAI DALL-E 3</h3>
              <p className="text-emerald-700 dark:text-emerald-300 text-sm">AI-powered texture generation</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border border-red-200 dark:border-red-800">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-red-500 flex items-center justify-center">
                <span className="text-white font-bold">CHZ</span>
              </div>
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Chiliz Blockchain</h3>
              <p className="text-red-700 dark:text-red-300 text-sm">Sports-focused blockchain</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border border-purple-200 dark:border-purple-800">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-purple-500 flex items-center justify-center">
                <span className="text-white font-bold">IPFS</span>
              </div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">IPFS Storage</h3>
              <p className="text-purple-700 dark:text-purple-300 text-sm">Decentralized asset storage</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border border-orange-200 dark:border-orange-800">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-orange-500 flex items-center justify-center">
                <span className="text-white font-bold">3D</span>
              </div>
              <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">3D Visualization</h3>
              <p className="text-orange-700 dark:text-orange-300 text-sm">Three.js powered preview</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
                1,234
              </div>
              <div className="text-muted-foreground text-lg">Total Designs Created</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
                456
              </div>
              <div className="text-muted-foreground text-lg">NFTs Minted</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
                789
              </div>
              <div className="text-muted-foreground text-lg">Active Voters</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Design the Future?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of creators building the next generation of football fashion
            </p>
            <Button size="lg" className="text-lg px-8 py-6">
              <Link href="/signin">Start Creating Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Kitra
              </h3>
              <p className="text-muted-foreground">
                The future of football kit design is here.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Platform</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/gallery" className="hover:text-foreground transition-colors">Gallery</Link></li>
                <li><Link href="/builder" className="hover:text-foreground transition-colors">Builder</Link></li>
                <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Community</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" target="_blank" className="hover:text-foreground transition-colors">Discord</a></li>
                <li><a href="#" target="_blank" className="hover:text-foreground transition-colors">Twitter</a></li>
                <li><a href="#" target="_blank" className="hover:text-foreground transition-colors">GitHub</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Resources</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" target="_blank" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" target="_blank" className="hover:text-foreground transition-colors">API Reference</a></li>
                <li><a href="#" target="_blank" className="hover:text-foreground transition-colors">Smart Contracts</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Kitra. Built with ❤️ for the football community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
