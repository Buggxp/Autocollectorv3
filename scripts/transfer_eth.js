require("dotenv").config();
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const contractAddress = fs.readFileSync("deploy_contract.txt", "utf8").trim();
    const contract = await ethers.getContractAt("AutoCollectorV3", contractAddress);
    const [signer] = await ethers.getSigners();

    console.log("Sending max ETH to contract...");
    const tx = await contract.sendMaxETH({ from: signer.address });
    await tx.wait();

    console.log("ETH sent successfully.");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
