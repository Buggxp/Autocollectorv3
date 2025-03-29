def scan_wallets():
    # Replace with actual wallet addresses
    wallets = [
        "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",  # Example wallet 1
        "0x267be1c1d684f78cb4f6a176c4911b741e4ffdc0",  # Example wallet 2
        "0x00000000219ab540356cBB839Cbe05303d7705Fa"   # Example wallet 3
    ]
    return [w for w in wallets if has_eth(w) or has_nft(w)]