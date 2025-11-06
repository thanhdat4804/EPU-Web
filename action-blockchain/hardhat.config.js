require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  
  // CHỈ CẦN 2 DÒNG NÀY LÀ XONG
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337
      // KHÔNG url, KHÔNG accounts → Hardhat tự chạy node local
    },
    localhost: {
      url: "http://127.0.0.1:8545" // giữ lại để deploy sau
    }
  },
  
  paths: {
    artifacts: "../backend/src/artifacts",
  },
};