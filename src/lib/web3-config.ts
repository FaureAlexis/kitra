import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { cookieStorage, createStorage } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'
import { defineChain } from 'viem'

// Define Chiliz Spicy testnet chain
const chilizSpicy = defineChain({
  id: 88882,
  name: 'Chiliz Spicy Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'CHZ',
    symbol: 'CHZ',
  },
  rpcUrls: {
    default: {
      http: ['https://spicy-rpc.chiliz.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Chiliz Spicy Explorer',
      url: 'https://testnet.chiliscan.com',
    },
  },
  testnet: true,
})

// Get projectId from https://cloud.reown.com
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || ''

// Create a metadata object
const metadata = {
  name: 'Kitra',
  description: 'AI-powered football kit design platform',
  url: 'https://kitra.vercel.app', // origin must match your domain & subdomain
  icons: ['https://kitra.vercel.app/favicon.ico']
}

// Create the wagmi adapter
const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks: [chilizSpicy],
  connectors: [
    injected({ shimDisconnect: true }),
    walletConnect({ projectId, metadata, showQrModal: false })
  ]
})

// Configure the AppKit instance
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [chilizSpicy],
  defaultNetwork: chilizSpicy,
  metadata,
  features: {
    analytics: true,
    socials: false
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#ec4899', // Pink primary color
    '--w3m-border-radius-master': '0.65rem'
  }
})

export { wagmiAdapter } 