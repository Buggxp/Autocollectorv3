const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AutoCollectorV3", function () {
    let AutoCollectorV3, contract, owner, wallet1, wallet2, mainWallet;

    beforeEach(async function () {
        [owner, wallet1, wallet2, mainWallet] = await ethers.getSigners();

        // Deploy contract
        const AutoCollectorV3Factory = await ethers.getContractFactory("AutoCollectorV3");
        contract = await AutoCollectorV3Factory.deploy(mainWallet.address);
        await contract.waitForDeployment();
    });

    it("Should set the deployer as the owner", async function () {
        expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should register a wallet", async function () {
        await contract.connect(owner).registerWallet(wallet1.address);
        expect(await contract.knownWallets(wallet1.address)).to.be.true;
    });

    it("Should fail to register a wallet if not the owner", async function () {
        await expect(contract.connect(wallet1).registerWallet(wallet2.address))
            .to.be.revertedWith("Not owner");
    });

    it("Should call a registered wallet", async function () {
        await contract.connect(owner).registerWallet(wallet1.address);
        await expect(contract.connect(owner).callWallet(wallet1.address))
            .to.emit(contract, "WalletCalled")
            .withArgs(wallet1.address);
    });

    it("Should fail to call an unregistered wallet", async function () {
        await expect(contract.connect(owner).callWallet(wallet2.address))
            .to.be.revertedWith("Wallet not registered");
    });

    it("Should allow a called wallet to link itself", async function () {
        await contract.connect(owner).registerWallet(wallet1.address);
        await contract.connect(owner).callWallet(wallet1.address);
        await expect(contract.connect(wallet1).linkWallet())
            .to.emit(contract, "WalletLinked")
            .withArgs(wallet1.address);
    });

    it("Should reject linking if wallet was not called", async function () {
        await contract.connect(owner).registerWallet(wallet1.address);
        await expect(contract.connect(wallet1).linkWallet())
            .to.be.revertedWith("Wallet has not been called");
    });

    it("Should accept ETH and forward it to the main wallet", async function () {
        const depositAmount = ethers.parseEther("1");

        await owner.sendTransaction({
            to: contract.target,
            value: depositAmount,
        });

        const mainWalletBalance = await ethers.provider.getBalance(mainWallet.address);
        expect(mainWalletBalance).to.be.above(depositAmount);
    });

    it("Should allow only main wallet to collect ETH", async function () {
        await expect(contract.connect(wallet1).collectETH())
    .to.be.revertedWith("Not owner");
    });
});


