require("dotenv").config();
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const contractAddress = fs.readFileSync("deploy_contract.txt", "utf8").trim();
    const contract = await ethers.getContractAt("AutoCollectorV3", contractAddress);
    const [signer] = await ethers.getSigners();

    const walletToRegister = "0xYourWalletAddressHere"; // Replace with actual wallet address
    console.log(`Registering wallet: ${walletToRegister}`);

    const tx = await contract.registerWallet(walletToRegister);
    await tx.wait();
    console.log("Wallet registered successfully.");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
