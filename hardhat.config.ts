import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    spicy: {
      url: process.env.CHZ_RPC_URL || "https://spicy-rpc.chiliz.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 88882,
      gas: 2100000,
      gasPrice: 8000000000,
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
  etherscan: {
    apiKey: {
      spicy: process.env.CHILIZ_SCAN_API_KEY || "dummy-key",
    },
    customChains: [
      {
        network: "spicy",
        chainId: 88882,
        urls: {
          apiURL: "https://api.chiliscan.com/api",
          browserURL: "https://chiliscan.com/",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};

export default config; 