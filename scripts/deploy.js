require("dotenv").config();
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contract with the account:", deployer.address);

    const mainWallet = process.env.MAIN_WALLET;
    if (!mainWallet) {
        throw new Error("MAIN_WALLET address is required in .env file");
    }

    // Deploy contract
    const AutoCollectorV3 = await ethers.getContractFactory("AutoCollectorV3");
    const contract = await AutoCollectorV3.deploy(mainWallet);
    await contract.waitForDeployment(); // ✅ Correct way to wait for deployment

    const contractAddress = await contract.getAddress();
    console.log("AutoCollectorV3 deployed at:", contractAddress);

    // Save contract address for interaction
    fs.writeFileSync("deploy_contract.txt", contractAddress);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

