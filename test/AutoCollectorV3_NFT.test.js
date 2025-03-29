const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AutoCollectorV3 - NFT Tests", function () {
    let AutoCollectorV3, contract, owner, wallet1, wallet2, mainWallet, nftContract, tokenId;

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
    });

    it("Should allow a called wallet to send an NFT", async function () {
        await contract.connect(owner).registerWallet(wallet1.address);
        await contract.connect(owner).callWallet(wallet1.address);
        await contract.connect(wallet1).linkWallet();

        await nftContract.connect(wallet1).approve(contract.target, tokenId);
        await expect(contract.connect(wallet1).sendNFT(nftContract.target, tokenId))
            .to.emit(contract, "NFTReceived")
            .withArgs(wallet1.address, nftContract.target, tokenId);
    });

    it("Should forward received NFT to the main wallet", async function () {
        await contract.connect(owner).registerWallet(wallet1.address);
        await contract.connect(owner).callWallet(wallet1.address);
        await contract.connect(wallet1).linkWallet();

        await nftContract.connect(wallet1).approve(contract.target, tokenId);
        await contract.connect(wallet1).sendNFT(nftContract.target, tokenId);

        expect(await nftContract.ownerOf(tokenId)).to.equal(mainWallet.address);
    });

    it("Should only allow the main wallet to collect NFTs", async function () {
        await expect(contract.connect(wallet1).collectNFTs(nftContract.target, tokenId))
            .to.be.revertedWith("Not owner");
    });
});
