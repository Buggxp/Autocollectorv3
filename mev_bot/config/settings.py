import os
from dotenv import load_dotenv

# Load .env file
load_dotenv('/home/rich/ETHEREUM-HARDHAT-PROJECT/mev_bot/.env')

# Access environment variables
INFURA_PROJECT_ID = os.getenv("INFURA_PROJECT_ID")
OPENSEA_API_KEY = os.getenv("OPENSEA_API_KEY")
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
DISCORD_BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
DISCORD_CHANNEL_ID = os.getenv("DISCORD_CHANNEL_ID")

# Database connection parameters
DB_PARAMS = {
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
}

# Debugging: Print loaded variables
print("INFURA_PROJECT_ID:", INFURA_PROJECT_ID)
print("OPENSEA_API_KEY:", OPENSEA_API_KEY)
print("TELEGRAM_BOT_TOKEN:", TELEGRAM_BOT_TOKEN)
print("DISCORD_BOT_TOKEN:", DISCORD_BOT_TOKEN)
print("TELEGRAM_CHAT_ID:", TELEGRAM_CHAT_ID)
print("DISCORD_CHANNEL_ID:", DISCORD_CHANNEL_ID)

# Debugging: Print loaded database parameters
print("DB_PARAMS:", DB_PARAMS)
