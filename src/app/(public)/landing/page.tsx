'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Paintbrush, Flame, Trophy, Users, Zap, ChevronRight, Star, ArrowRight, Menu, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Logo } from "@/components/ui/logo";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleAnchorClick = (href: string) => {
    setIsMenuOpen(false);
    // Add smooth scrolling behavior
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative" style={{ scrollBehavior: 'smooth' }}>
      {/* Gradient Image Background for Entire Page */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/gradient-background.png)',
            backgroundSize: '100% auto',
            backgroundPosition: 'center top'
          }}
        />
      </div>

      {/* Navigation Banner */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/30 bg-white/15 backdrop-blur-lg supports-[backdrop-filter]:bg-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Logo width={32} color="white" />

              <span className="text-xl font-bold text-white">Kitra</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => handleAnchorClick('#hero')}
                className="text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => handleAnchorClick('#features')}
                className="text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => handleAnchorClick('#how-it-works')}
                className="text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => handleAnchorClick('#get-started')}
                className="text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                Get Started
              </button>
            </div>

            {/* CTA Button & Mobile Menu */}
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                asChild
              >
                <Link href="/builder">
                  Start Creating
                </Link>
              </Button>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-white/30 py-4">
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleAnchorClick('#hero')}
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors text-left"
                >
                  Home
                </button>
                <button
                  onClick={() => handleAnchorClick('#features')}
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors text-left"
                >
                  Features
                </button>
                <button
                  onClick={() => handleAnchorClick('#how-it-works')}
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors text-left"
                >
                  How It Works
                </button>
                <button
                  onClick={() => handleAnchorClick('#get-started')}
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors text-left"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Design. Vote. Earn. */}
      <section id="hero" className="relative overflow-hidden min-h-[90vh] flex items-center">

        <div className="relative container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                  <Zap className="w-4 h-4 text-white" />
                  <span className="text-sm font-medium text-white">Next-Gen Football Kit Design</span>
                </div>

                <div className="space-y-4">
                  <h1 className="text-6xl md:text-8xl font-bold leading-tight text-white">
                    <span className="block">
                      Design.
                    </span>
                    <span className="block">
                      Vote.
                    </span>
                    <span className="block">
                      Earn.
                    </span>
                  </h1>
                </div>

                <p className="text-xl text-white/80 max-w-xl leading-relaxed">
                  Your jersey, your token, your share of the revenue.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg group"
                  asChild
                >
                  <Link href="/builder">
                    Create your design
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20"
                  asChild
                >
                  <Link href="/gallery">
                    Explore Gallery
                  </Link>
                </Button>
              </div>

              {/* Stats */}
            </div>

            {/* Right Content - 3D Jersey Preview */}
            <div className="relative">
              <Image src="/barca-jersey.webp" alt="3D Jersey Preview" width={450} height={450} />
            </div>
          </div>
        </div>
      </section>

      {/* From Prompt to Jersey Section */}
      <section id="features" className="relative py-24">

        <div className="relative container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - 3D Preview */}
              <Image src="/image-prompt.webp" alt="3D Jersey Preview" width={500} height={450} />

            {/* Right - Content */}
            <div className="order-1 lg:order-2 space-y-8">
              <div className="space-y-6">
                <h2 className="text-5xl font-bold text-white">
                  From prompt to jersey in under{" "}
                  <span className="text-white">
                    60 seconds
                  </span>
                </h2>

                <p className="text-xl text-white/80 leading-relaxed">
                  Describe your idea. Watch it turn into a 3D jersey with AI-generated textures and real-time previews.
                </p>
              </div>

              {/* Example Prompt */}
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                    <Paintbrush className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white/80">Example prompt:</span>
                </div>
                <div className="bg-white/20 rounded-lg p-4 border border-white/30">
                  <p className="text-white font-medium">
                    "Golden dragon with lightning patterns on a deep blue background"
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/40 rounded-full flex items-center justify-center">
                    <Zap className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-medium text-white">AI-Powered</div>
                    <div className="text-sm text-white/70">AI Integration</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-500/40 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Real-time</div>
                    <div className="text-sm text-white/70">Instant Preview</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="relative py-24">

        <div className="relative container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              How it works?
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Five simple steps to create, vote, and earn from your football kit designs
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-8 max-w-7xl mx-auto">
            {/* Step 1 - Connect Wallet */}
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/20 dark:to-primary/30" />
              <CardContent className="relative p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-primary dark:text-primary/90">Connect your wallet</h3>
                <p className="text-sm text-primary/70 dark:text-primary/60 leading-relaxed">
                  We support SIWE and detect your Fan Tokens automatically.
                </p>
              </CardContent>
            </Card>

            {/* Step 2 - Generate Design */}
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/20 dark:to-primary/30" />
              <CardContent className="relative p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Paintbrush className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-primary dark:text-primary/90">Generate a design</h3>
                <p className="text-sm text-primary/70 dark:text-primary/60 leading-relaxed">
                  Type a short prompt and customize colors and collar style.
                </p>
              </CardContent>
            </Card>

            {/* Step 3 - Burn & Mint */}
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/20 dark:to-primary/30" />
              <CardContent className="relative p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Flame className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-primary dark:text-primary/90">Burn & Mint</h3>
                <p className="text-sm text-primary/70 dark:text-primary/60 leading-relaxed">
                  Burn 0.25 FT to mint your unique design as a public NFT.
                </p>
              </CardContent>
            </Card>

            {/* Step 4 - Get Votes */}
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/20 dark:to-primary/30" />
              <CardContent className="relative p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-primary dark:text-primary/90">Get votes</h3>
                <p className="text-sm text-primary/70 dark:text-primary/60 leading-relaxed">
                  Other fans vote for 24h using their tokens — no whales allowed.
                </p>
              </CardContent>
            </Card>

            {/* Step 5 - Rewards */}
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/20 dark:to-primary/30" />
              <CardContent className="relative p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-primary dark:text-primary/90">Rewards</h3>
                <p className="text-sm text-primary/70 dark:text-primary/60 leading-relaxed">
                  If you win, your jersey go into production. You earn 7% of all sales.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="get-started" className="relative py-24 overflow-hidden">

        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-6xl font-bold text-white">
                <span className="block">
                  Ready to Design
                </span>
                <span className="block">
                  the Future?
                </span>
              </h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Join thousands of creators building the next generation of football fashion on Chiliz
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg group"
                asChild
              >
                <Link href="/builder">
                  Start Creating Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20"
                asChild
              >
                <Link href="/gallery">
                  Explore Gallery
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10">

        <div className="relative container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">
                Kitra
              </h3>
              <p className="text-white/70">
                The future of football kit design is here. Powered by Chiliz.
              </p>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">CHZ</span>
                </div>
                Built on Chiliz Blockchain
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-white">Platform</h4>
              <ul className="space-y-2 text-white/70">
                <li><Link href="/gallery" className="hover:text-white transition-colors">Gallery</Link></li>
                <li><Link href="/builder" className="hover:text-white transition-colors">Builder</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-white">Community</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" target="_blank" className="hover:text-white transition-colors">Discord</a></li>
                <li><a href="#" target="_blank" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" target="_blank" className="hover:text-white transition-colors">GitHub</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-white">Resources</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" target="_blank" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" target="_blank" className="hover:text-white transition-colors">Smart Contracts</a></li>
                <li><a href="#" target="_blank" className="hover:text-white transition-colors">Chiliz Chain</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 mt-12 pt-8 text-center text-white/70">
            <p>&copy; 2025 Kitra. Built with ❤️ for the Paris 2025 Hackathon.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
