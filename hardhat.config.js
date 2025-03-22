require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

console.log("Loaded SEPOLIA_RPC_URL:", process.env.REACT_APP_SEPOLIA_RPC_URL);
console.log("Loaded PRIVATE_KEY:", process.env.REACT_APP_PRIVATE_KEY);
console.log("Loaded ETHERSCAN_API_KEY:", process.env.ETHERSCAN_API_KEY);


module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.REACT_APP_SEPOLIA_RPC_URL,
      accounts: [process.env.REACT_APP_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
