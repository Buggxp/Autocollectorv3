import sys
import os

# Add the mev_bot directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from scanner import scan_wallets
from notifier import send_notification
from db import insert_wallet, check_if_sent
import time

def main():
    while True:
        wallets = scan_wallets()
        if not wallets:
            print("No valid wallets found. Retrying in 1 hour...")
            time.sleep(3600)
            continue

        for wallet in wallets:
            if not check_if_sent(wallet):
                insert_wallet(wallet)
                send_notification(wallet)
        time.sleep(3600)  # Run every hour

if __name__ == "__main__":
    main()
