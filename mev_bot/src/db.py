import psycopg2
from config.settings import DB_PARAMS

def connect_db():
    return psycopg2.connect(**DB_PARAMS)

def insert_wallet(wallet):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("INSERT INTO sent_messages (wallet_address) VALUES (%s) ON CONFLICT (wallet_address) DO NOTHING;", (wallet,))
    conn.commit()
    cur.close()
    conn.close()

def check_if_sent(wallet):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("SELECT last_sent_time FROM sent_messages WHERE wallet_address = %s;", (wallet,))
    result = cur.fetchone()
    conn.close()
    return result is not None