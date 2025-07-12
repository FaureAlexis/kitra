# Kitra - AI-Powered Football Kit Design Platform

A Next.js 14 application that enables users to design, vote on, and mint unique football kits using AI technology on the Chiliz Spicy testnet.

## 🚀 Features

- **AI-Powered Design**: Generate unique football kit textures using OpenAI's DALL-E 3
- **3D Visualization**: Preview designs in real-time with Three.js
- **Decentralized Voting**: Community governance using token-weighted voting
- **NFT Minting**: Mint winning designs as NFTs with royalties
- **SIWE Authentication**: Sign in with Ethereum for secure access
- **Clean Architecture**: Domain-driven design with clear separation of concerns

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Web3**: Reown AppKit (formerly Web3Modal), Wagmi v2, Viem
- **3D Graphics**: React Three Fiber, Three.js, Leva
- **AI Integration**: Mastra workflow with OpenAI DALL-E 3
- **Blockchain**: Chiliz Spicy testnet, Ethers.js
- **Storage**: Pinata IPFS
- **Authentication**: Sign-In with Ethereum (SIWE)
- **Testing**: Vitest, Playwright
- **Deployment**: Vercel, GitHub Actions

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/kitra.git
   cd kitra
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with the following variables:
   ```bash
   # Reown AppKit Project ID (get from https://cloud.reown.com)
   NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id_here
   
   # OpenAI API Key
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Pinata API Keys
   PINATA_API_KEY=your_pinata_api_key_here
   PINATA_SECRET_API_KEY=your_pinata_secret_api_key_here
   
   # JWT Secret for SIWE authentication
   JWT_SECRET=your_jwt_secret_here
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

## 🏗️ Architecture

The application follows Clean Architecture principles:

```
src/
├── domain/             # Business logic and entities
│   ├── models/         # Domain models (Design, User, Vote)
│   └── value-objects/  # Value objects (Address, TokenId)
├── app-services/       # Application services
│   ├── design-service.ts
│   ├── voting-service.ts
│   └── generate-kit.ts
├── infra/             # Infrastructure layer
│   └── blockchain/    # Smart contracts and blockchain interactions
├── app/               # Next.js App Router
│   ├── (public)/      # Public routes
│   ├── (auth)/        # Authentication routes
│   ├── (protected)/   # Protected routes
│   └── api/           # API routes
├── components/        # UI components
│   └── ui/            # Reusable UI components
└── lib/               # Shared utilities
    └── web3-config.ts # Web3 configuration
```

## 🔧 Development

### Running Tests

```bash
# Unit tests
pnpm test

# End-to-end tests
pnpm test:e2e

# Run tests in watch mode
pnpm test:watch
```

### Linting and Formatting

```bash
# Lint code
pnpm lint

# Format code
pnpm format

# Check formatting
pnpm format:check
```

### Blockchain Development

```bash
# Compile smart contracts
pnpm blockchain:compile

# Deploy to Chiliz Spicy testnet
pnpm blockchain:deploy

# Verify contracts
pnpm blockchain:verify
```

## 🌐 Deployment

The application is configured for deployment on Vercel with automated CI/CD via GitHub Actions.

### Manual Deployment

```bash
pnpm deploy
```

### CI/CD Pipeline

The GitHub Actions workflow automatically:
- Runs linting and tests
- Builds the application
- Deploys to Vercel
- Runs E2E tests against the deployed application

## 📱 Usage

1. **Connect Wallet**: Use the Reown AppKit to connect your Ethereum wallet
2. **Sign In**: Authenticate using Sign-In with Ethereum (SIWE)
3. **Create Design**: Use the AI-powered builder to generate football kit designs
4. **Submit for Voting**: Submit your design to the community for voting
5. **Vote**: Use your tokens to vote on design candidates
6. **Mint NFT**: Winning designs are minted as NFTs with creator royalties

## 🎨 Design System

The application uses a clean, modern design system with:
- **Primary Color**: Pink (`#ec4899`)
- **Typography**: Inter font family
- **Components**: Radix UI primitives with custom styling
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first design approach

## 🔐 Authentication

Authentication is handled via Sign-In with Ethereum (SIWE):
- Secure wallet-based authentication
- No passwords or traditional accounts required
- Session management with JWT tokens
- Automatic wallet connection via Reown AppKit

## 🧪 Testing Strategy

- **Unit Tests**: Domain models and business logic
- **Integration Tests**: API routes and services
- **E2E Tests**: Full user workflows
- **Coverage Target**: 80%+ code coverage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- OpenAI for DALL-E 3 API
- Chiliz for the Spicy testnet
- Reown (formerly WalletConnect) for AppKit
- The open-source community for the amazing tools and libraries
