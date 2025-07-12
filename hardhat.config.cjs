require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  etherscan: {
    apiKey: {
      chiliz_spicy: "chiliz_spicy", // apiKey is not required, just set a placeholder
    },
    customChains: [
      {
        network: "chiliz_spicy",
        chainId: 88882,
        urls: {
          apiURL: "https://api.routescan.io/v2/network/testnet/evm/88882/etherscan",
          browserURL: "https://testnet.chiliscan.com"
        }
      }
    ]
  },
  networks: {
    spicy: {
      url: process.env.CHZ_RPC_URL || "https://spicy-rpc.chiliz.com",
      accounts: process.env.BLOCKCHAIN_PRIVATE_KEY ? [process.env.BLOCKCHAIN_PRIVATE_KEY] : [],
      chainId: 88882,
      gas: 5000000,        // Increased gas limit
      gasPrice: 15000000000, // Increased gas price (15 Gwei)
      timeout: 120000,     // 2 minute timeout
      gasMultiplier: 1.5,  // Multiply gas estimates by 1.5
    },
    hardhat: {
      chainId: 1337,
    },
  },
  paths: {
    sources: "./src/infra/blockchain/contracts",
    tests: "./tests/contracts",
    cache: "./cache",
    artifacts: "./artifacts",
  },
}; 