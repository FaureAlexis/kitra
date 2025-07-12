# Blockchain Deployment Guide

## Overview

This guide covers the blockchain infrastructure for the Kitra football kit design platform, including smart contract compilation, deployment strategies, and troubleshooting.

## Smart Contracts

### DesignCandidate.sol
- **Type**: ERC-721 NFT contract
- **Purpose**: Manages football kit design NFTs
- **Features**: Minting, ownership transfer, metadata management
- **Size**: 8,397 bytes (within 24KB limit)

### KitraGovernor.sol
- **Type**: OpenZeppelin Governor contract
- **Purpose**: Community governance for design approval
- **Features**: Proposal creation, voting, execution
- **Integration**: Works with DesignCandidate for NFT governance

## Deployment Environment

### Network Configuration
- **Network**: Chiliz Spicy Testnet
- **Chain ID**: 88882
- **RPC URL**: https://spicy-rpc.chiliz.com
- **Block Time**: ~3 seconds
- **Gas Limit**: 30,000,000 per block

### Current Network Conditions
- **Gas Price**: Extremely high (~2,501 Gwei)
- **Block Utilization**: Low (~0.3%)
- **RPC Performance**: Excellent (21ms response time)

## Compilation

### Prerequisites
```bash
# Install dependencies
pnpm install

# Compile contracts
pnpm run blockchain:compile
```

### Configuration
- **Solidity Version**: 0.8.20
- **Optimizer**: Enabled (200 runs)
- **Paths**: Contracts in `src/infra/blockchain/contracts/`

## Deployment Strategies

### 1. Standard Deployment
```bash
pnpm run blockchain:deploy
```
- **Gas Price**: Capped at 100 Gwei
- **Cost**: ~0.19 CHZ
- **Status**: ❌ Currently failing due to low gas price

### 2. Quick Deployment
```bash
pnpm run blockchain:deploy:quick
```
- **Gas Price**: Safe capped price
- **Timeout**: 60 seconds
- **Status**: ❌ Currently failing due to low gas price

### 3. Aggressive Deployment (Recommended)
```bash
pnpm run blockchain:deploy:aggressive
```
- **Gas Price**: 60% of network price (~1,500 Gwei)
- **Cost**: ~2.87 CHZ
- **Status**: ✅ Should work with current network conditions

### 4. Nuclear Deployment (Guaranteed)
```bash
pnpm run blockchain:deploy:nuclear
```
- **Gas Price**: Full network price (~2,501 Gwei)
- **Cost**: ~4.78 CHZ
- **Status**: ✅ Guaranteed to work (expensive)

## Diagnostic Tools

### Network Analysis
```bash
pnpm run blockchain:diagnostics
```
**Output:**
- Gas price analysis
- Network connectivity test
- Contract size validation
- Block time analysis
- Transaction simulation

### Transaction Monitoring
```bash
pnpm run blockchain:monitor [tx_hash]
```
**Features:**
- Transaction status checking
- Nonce conflict detection
- Network condition analysis
- Gas price recommendations

## Current Issues

### 1. Extreme Gas Prices
- **Problem**: Network returns 2,501 Gwei (50-250x normal)
- **Impact**: Standard deployment costs 25x more than expected
- **Solution**: Use aggressive or nuclear deployment strategies

### 2. Pending Transaction Conflicts
- **Problem**: 5 pending transactions stuck in mempool
- **Impact**: New transactions fail due to nonce conflicts
- **Solution**: Deployment scripts use explicit nonce management

### 3. Gas Price Multiplication
- **Problem**: Original scripts multiplied already high gas prices
- **Impact**: 2,501 Gwei × 2 = 5,002 Gwei (extremely expensive)
- **Solution**: Implemented gas price capping at reasonable levels

## Troubleshooting

### Common Issues

#### Deployment Timeout
```bash
# Check transaction status
pnpm run blockchain:monitor <transaction_hash>

# Analyze network conditions
pnpm run blockchain:diagnostics
```

#### Insufficient Gas Price
```bash
# Use aggressive deployment
pnpm run blockchain:deploy:aggressive

# Or nuclear deployment for guaranteed success
pnpm run blockchain:deploy:nuclear
```

#### Nonce Conflicts
```bash
# Check pending transactions
pnpm run blockchain:monitor

# Clear with higher gas price deployment
pnpm run blockchain:deploy:aggressive
```

### Error Messages

#### "Deployment timeout after 2 minutes"
- **Cause**: Gas price too low for network conditions
- **Solution**: Use aggressive or nuclear deployment

#### "Transaction not found on network"
- **Cause**: RPC propagation issues
- **Solution**: Check different RPC endpoint or retry

#### "Insufficient funds"
- **Cause**: Not enough CHZ for gas costs
- **Solution**: Get more CHZ from faucet or wait for lower gas prices

## Environment Variables

### Required
```bash
# .env file
BLOCKCHAIN_PRIVATE_KEY=your_private_key_here
CHZ_RPC_URL=https://spicy-rpc.chiliz.com
```

### After Deployment
```bash
# Add to .env after successful deployment
DESIGN_CANDIDATE_ADDRESS=0x...
GOVERNOR_ADDRESS=0x...
```

## Cost Analysis

### Gas Estimates
- **DesignCandidate Deployment**: 1,910,579 gas
- **KitraGovernor Deployment**: ~4,000,000 gas

### Cost Scenarios (Current Network)
| Strategy | Gas Price | DesignCandidate Cost | Total Cost |
|----------|-----------|---------------------|------------|
| Standard | 100 Gwei | 0.19 CHZ | ❌ Fails |
| Aggressive | 1,500 Gwei | 2.87 CHZ | ✅ Works |
| Nuclear | 2,501 Gwei | 4.78 CHZ | ✅ Guaranteed |

## Next Steps

1. **Deploy DesignCandidate**: Use aggressive deployment strategy
2. **Deploy KitraGovernor**: After DesignCandidate is deployed
3. **Update Frontend**: Connect to deployed contract addresses
4. **Test Integration**: Verify NFT minting and governance voting

## Scripts Reference

```bash
# Compilation
pnpm run blockchain:compile

# Deployment
pnpm run blockchain:deploy           # Standard (currently failing)
pnpm run blockchain:deploy:quick     # Quick (currently failing)
pnpm run blockchain:deploy:aggressive # Aggressive (recommended)
pnpm run blockchain:deploy:nuclear   # Nuclear (guaranteed)

# Diagnostics
pnpm run blockchain:diagnostics     # Network analysis
pnpm run blockchain:monitor         # Transaction monitoring

# Verification
pnpm run blockchain:verify          # Contract verification
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Kitra Platform                           │
├─────────────────────────────────────────────────────────────┤
│                    Frontend (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│                    API Layer                               │
├─────────────────────────────────────────────────────────────┤
│                    Blockchain Service                      │
├─────────────────────────────────────────────────────────────┤
│  DesignCandidate (NFT)    │    KitraGovernor (Governance)  │
├─────────────────────────────────────────────────────────────┤
│                    Chiliz Spicy Testnet                   │
└─────────────────────────────────────────────────────────────┘
```

## Status

- ✅ **Contracts**: Compiled successfully
- ✅ **Network**: Connected to Chiliz Spicy
- ✅ **Tools**: Diagnostic and monitoring ready
- ❌ **Deployment**: Blocked by extreme gas prices
- 🔄 **Recommended**: Use aggressive deployment strategy

## Support

For deployment issues:
1. Run diagnostics to identify the problem
2. Use transaction monitor to check pending transactions
3. Choose appropriate deployment strategy based on gas prices
4. Monitor deployment progress with transaction hash 