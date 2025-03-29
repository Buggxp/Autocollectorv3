require("dotenv").config();
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const contractAddress = fs.readFileSync("deploy_contract.txt", "utf8").trim();
    const contract = await ethers.getContractAt("AutoCollectorV3", contractAddress);
    const [signer] = await ethers.getSigners();

    const nftContract = "0xYourNFTContractAddressHere"; // Replace with actual NFT contract address
    const tokenId = 1; // Replace with actual token ID

    console.log(`Sending NFT (Token ID: ${tokenId}) to contract...`);
    const tx = await contract.sendNFT(nftContract, tokenId, { from: signer.address });
    await tx.wait();

    console.log("NFT sent successfully.");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
