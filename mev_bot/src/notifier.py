import telegram
import discord
import asyncio
from config.settings import TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID

bot = telegram.Bot(token=TELEGRAM_BOT_TOKEN)

def send_telegram_message(wallet, link):
    bot.send_message(chat_id=TELEGRAM_CHAT_ID, text=f"\U0001F680 Wallet `{wallet}` eligible!\n\U0001F517 {link}", parse_mode="Markdown")

async def send_discord_message(wallet, link):
    client = discord.Client()
    await client.login(DISCORD_BOT_TOKEN)
    channel = client.get_channel(DISCORD_CHANNEL_ID)
    await channel.send(f"\U0001F680 Wallet `{wallet}` is eligible!\n\U0001F517 Accept here: {link}")

def send_notification(wallet):
    link = f"https://yourdapp.com/link?wallet={wallet}"
    send_telegram_message(wallet, link)
    asyncio.run(send_discord_message(wallet, link))