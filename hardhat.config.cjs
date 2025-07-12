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
  networks: {
    spicy: {
      url: process.env.CHZ_RPC_URL || "https://spicy-rpc.chiliz.com",
      accounts: process.env.BLOCKCHAIN_PRIVATE_KEY ? [process.env.BLOCKCHAIN_PRIVATE_KEY] : [],
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
}; 