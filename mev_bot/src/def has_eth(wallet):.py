from web3 import Web3

# Initialize Web3 instance
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))  # Replace with your Ethereum node URL


def has_eth(wallet):
    if not Web3.isAddress(wallet):
        print(f"Invalid wallet address: {wallet}")  # Debugging: Print invalid addresses
        return False
    return w3.eth.get_balance(wallet) > 0