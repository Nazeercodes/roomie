from fastapi import WebSocket
from typing import Dict

class ConnectionManager:
    def __init__(self):
        # user_id -> websocket
        self.active: Dict[str, WebSocket] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active[user_id] = websocket
        await self.broadcast({"type": "status", "userId": user_id, "online": True})
        await websocket.send_json({"type": "online_users", "users": list(self.active.keys())})

    async def disconnect(self, user_id: str):
        if user_id in self.active:
            self.active.pop(user_id)
            await self.broadcast({"type": "status", "userId": user_id, "online": False})

    async def send_to_user(self, user_id: str, data: dict):
        ws = self.active.get(user_id)
        if ws:
            try:
                await ws.send_json(data)
            except Exception:
                await self.disconnect(user_id)

    async def broadcast(self, data: dict):
        dead_connections = []
        for uid, ws in self.active.items():
            try:
                await ws.send_json(data)
            except Exception:
                dead_connections.append(uid)
        
        for uid in dead_connections:
            await self.disconnect(uid)

manager = ConnectionManager()
