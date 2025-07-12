import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// TODO: Fetch from API
const mockDesigns = [
  {
    id: "1",
    name: "Lightning Bolt Home Kit",
    description: "Electric blue and gold dynamic energy pattern",
    creator: "0x742d...9C4d",
    votes: 156,
    imageUrl: "/placeholder-kit.jpg",
    status: "published",
    tags: ["modern", "blue", "gold"]
  },
  {
    id: "2", 
    name: "Classic Stripes",
    description: "Timeless black and white vertical stripes",
    creator: "0x123a...7B2c",
    votes: 89,
    imageUrl: "/placeholder-kit.jpg",
    status: "candidate",
    tags: ["classic", "black", "white"]
  },
  {
    id: "3",
    name: "Retro Waves",
    description: "80s inspired wavy pattern in neon colors",
    creator: "0x456e...3F8a",
    votes: 234,
    imageUrl: "/placeholder-kit.jpg",
    status: "published",
    tags: ["retro", "neon", "pink"]
  },
  {
    id: "4",
    name: "Minimalist Gradient",
    description: "Clean gradient design with subtle textures",
    creator: "0x789f...2E1b",
    votes: 67,
    imageUrl: "/placeholder-kit.jpg",
    status: "candidate",
    tags: ["minimalist", "gradient", "clean"]
  },
  {
    id: "5",
    name: "Bold Geometric",
    description: "Strong geometric patterns with vibrant colors",
    creator: "0xabc1...5F3d",
    votes: 142,
    imageUrl: "/placeholder-kit.jpg",
    status: "published",
    tags: ["bold", "geometric", "vibrant"]
  },
  {
    id: "6",
    name: "Nature Inspired",
    description: "Organic patterns inspired by natural forms",
    creator: "0xdef4...8G7c",
    votes: 203,
    imageUrl: "/placeholder-kit.jpg",
    status: "candidate",
    tags: ["nature", "organic", "green"]
  }
];

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <span className="text-primary-foreground font-bold">🎨</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Design Gallery</h1>
              <p className="text-muted-foreground">Discover amazing football kit designs created by the community</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground">
                All
              </Button>
              <Button variant="outline" size="sm">Published</Button>
              <Button variant="outline" size="sm">Voting</Button>
              <Button variant="outline" size="sm">New</Button>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Modern</Button>
              <Button variant="outline" size="sm">Classic</Button>
              <Button variant="outline" size="sm">Retro</Button>
              <Button variant="outline" size="sm">Bold</Button>
            </div>
          </div>
        </div>

        {/* Designs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {mockDesigns.map((design) => (
            <Card key={design.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-muted/30 to-muted/60 flex items-center justify-center relative overflow-hidden">
                {/* TODO: Replace with actual design image */}
                <div className="w-32 h-40 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300 border border-primary/10">
                  <span className="text-4xl">👕</span>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge variant={design.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                    {design.status}
                  </Badge>
                </div>
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {design.name}
                </CardTitle>
                <CardDescription className="line-clamp-2">{design.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">by {design.creator}</span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <span>🗳️</span>
                    <span className="font-medium">{design.votes}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {design.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1" asChild>
                    <Link href={`/design/${design.id}`}>View Details</Link>
                  </Button>
                  {design.status === 'candidate' && (
                    <Button size="sm" variant="outline">
                      Vote
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mb-16">
          <Button variant="outline" size="lg" className="px-8">
            Load More Designs
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
                1,234
              </div>
              <div className="text-muted-foreground">Total Designs</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">456</div>
              <div className="text-muted-foreground">Published NFTs</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900 border-violet-200 dark:border-violet-800">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-violet-600 dark:text-violet-400 mb-2">789</div>
              <div className="text-muted-foreground">Active Voters</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 