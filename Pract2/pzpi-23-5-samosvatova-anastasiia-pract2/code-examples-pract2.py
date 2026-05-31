import os
import asyncio
from flask import app
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from slack_bolt.app import App
from slack_bolt.adapter.socket_mode import SocketModeHandler
client = WebClient(token=os.environ.get("SLACK_BOT_TOKEN"))

def fetch_all_channels():
    channels = []
    cursor = None
    try:
        while True:
            response = client.conversations_list(cursor=cursor, types="public_channel", limit=100)
            channels.extend(response["channels"])
            
            cursor = response.get("response_metadata", {}).get("next_cursor")
            if not cursor:
                break
        return channels
    except SlackApiError as e:
        print(f"Помилка API: {e.response['error']}")

def get_user_details(user_id: str):
    try:
        result = client.users_info(user=user_id)
        user_info = result["user"]
        return {
            "real_name": user_info["real_name"],
            "status_text": user_info["profile"]["status_text"],
            "status_emoji": user_info["profile"]["status_emoji"]
        }
    except Exception as e:
        return f"Помилка: {str(e)}"
    
    app = App(token=os.environ.get("SLACK_BOT_TOKEN"))

@app.message("привіт")
def message_hello(message, say):
    say(f"Вітаю, <@{message['user']}>! Я працюю через Socket Mode на Python.")

async def fetch_service_data(service_id: str):
    await asyncio.sleep(1) 
    return {"status": "active", "id": service_id}

if __name__ == "__main__":
    handler = SocketModeHandler(app, os.environ.get("SLACK_APP_TOKEN"))
    handler.start()