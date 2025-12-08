require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",

  defaultNetwork: "hardhat",

  networks: {
    hardhat: {
      chainId: 31337
    },

    localhost: {
      url: "http://127.0.0.1:8545"
    },

    // ⭐ TESTNET (thêm vào đây để deploy)
    sepolia: {
      url: process.env.SEPOLIA_RPC,        // RPC từ Alchemy / Infura
      accounts: [process.env.PRIVATE_KEY], // ví test
      
    },

  },

  paths: {
    artifacts: "../backend/src/artifacts",
  },
};
