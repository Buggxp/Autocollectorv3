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