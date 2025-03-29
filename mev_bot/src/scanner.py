import requests
from web3 import Web3
from config.settings import INFURA_PROJECT_ID, OPENSEA_API_KEY

w3 = Web3(Web3.HTTPProvider(f"https://mainnet.infura.io/v3/{INFURA_PROJECT_ID}"))
OPENSEA_API_URL = "https://api.opensea.io/api/v1/assets"

def has_eth(wallet):
    if not Web3.is_address(wallet):
        print(f"Invalid wallet address: {wallet}")  # Debugging: Print invalid addresses
        return False
    wallet = Web3.to_checksum_address(wallet)  # Convert to checksum format
    return w3.eth.get_balance(wallet) > 0

def has_nft(wallet):
    if not Web3.is_address(wallet):
        print(f"Invalid wallet address: {wallet}")  # Debugging: Print invalid addresses
        return False
    wallet = Web3.to_checksum_address(wallet)  # Convert to checksum format
    params = {"owner": wallet, "limit": 1}
    headers = {"Accept": "application/json", "X-API-KEY": OPENSEA_API_KEY}
    response = requests.get(OPENSEA_API_URL, params=params, headers=headers)
    return len(response.json().get("assets", [])) > 0

def scan_wallets():
    # Replace with actual wallet addresses
    wallets = [
        "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",  # Example wallet 1
        "invalid_wallet",                             # Invalid wallet
        "0x267be1c1d684f78cb4f6a176c4911b741e4ffdc0"  # Example wallet 2
    ]

    # Filter only valid Ethereum addresses and convert to checksum format
    valid_wallets = [Web3.to_checksum_address(w) for w in wallets if Web3.is_address(w)]
    print("Valid wallets:", valid_wallets)  # Debugging: Print valid wallets
    return [w for w in valid_wallets if has_eth(w) or has_nft(w)]