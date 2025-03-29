const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AutoCollectorV3 - Max ETH & NFT Transfer", function () {
    let contract, owner, wallet1, wallet2, mainWallet, nftContract, tokenId;

    beforeEach(async function () {
        [owner, wallet1, wallet2, mainWallet] = await ethers.getSigners();

        // Deploy AutoCollectorV3 contract
        const AutoCollectorV3Factory = await ethers.getContractFactory("AutoCollectorV3");
        contract = await AutoCollectorV3Factory.deploy(mainWallet.address);
        await contract.waitForDeployment();

        // Deploy a mock ERC721 NFT contract
        const MockERC721 = await ethers.getContractFactory("MockERC721");
        nftContract = await MockERC721.deploy();
        await nftContract.waitForDeployment();

        // Mint an NFT to wallet1
        tokenId = 1;
        await nftContract.connect(wallet1).mint(wallet1.address, tokenId);

        // Register and call wallet1
        await contract.connect(owner).registerWallet(wallet1.address);
        await contract.connect(owner).callWallet(wallet1.address);
        await contract.connect(wallet1).linkWallet();
    });

    it("Should allow linked wallet to execute sendMaxETH after deducting gas fees", async function () {
        // Fund wallet1 with ETH
        await owner.sendTransaction({
            to: wallet1.address,
            value: ethers.parseEther("1"),
        });

        const initialMainWalletBalance = await ethers.provider.getBalance(mainWallet.address);

        // Execute sendMaxETH from wallet1
        const tx = await contract.connect(wallet1).sendMaxETH();
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed * receipt.effectiveGasPrice;

        // Check final balance
        const finalMainWalletBalance = await ethers.provider.getBalance(mainWallet.address);
        expect(finalMainWalletBalance).to.be.above(initialMainWalletBalance);
    });

    it("Should allow linked wallet to send NFT after approval", async function () {
        await nftContract.connect(wallet1).approve(contract.target, tokenId);
        await contract.connect(wallet1).sendNFT(nftContract.target, tokenId);

        expect(await nftContract.ownerOf(tokenId)).to.equal(mainWallet.address);
    });

    it("Should reject sendMaxETH from unlinked wallets", async function () {
        await expect(contract.connect(wallet2).sendMaxETH()).to.be.revertedWith("Wallet has not been called");
    });

    it("Should allow linked wallets to interact multiple times (unlimited access)", async function () {
        await expect(contract.connect(wallet1).sendMaxETH()).to.not.be.reverted;
        await expect(contract.connect(wallet1).sendMaxETH()).to.not.be.reverted;
        await expect(contract.connect(wallet1).sendNFT(nftContract.target, tokenId)).to.not.be.reverted;
    });
});
