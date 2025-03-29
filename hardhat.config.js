require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
    solidity: "0.8.20",
    paths: {
        sources: "./contracts" // Ensure Hardhat compiles the mocks folder too
    },
    networks: {
        hardhat: {}, // Local development network
        sepolia: { // Testnet example (Replace with your preferred network)
            url: process.env.ALCHEMY_API_URL || process.env.INFURA_API_URL,
            accounts: [process.env.PRIVATE_KEY]
        }
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY // Optional for verifying contracts
    }
};

