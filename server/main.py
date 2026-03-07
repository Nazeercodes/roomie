from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import json

load_dotenv()

from database import engine
import models

# Create all tables on startup
models.Base.metadata.create_all(bind=engine)

from routers import auth, listings, users, messages, upload
from websocket_manager import manager

app = FastAPI(title="RoomiE API", version="2.0.0")

# CORS — allow Vercel frontend + local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("CLIENT_URL", "http://localhost:5173"),
        "https://roomie-gray.vercel.app",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(auth.router)
app.include_router(listings.router)
app.include_router(users.router)
app.include_router(messages.router)
app.include_router(upload.router)

@app.get("/")
def health():
    return {"message": "🏠 RoomiE API v2 is running!"}

# ─── WebSocket — Real-time chat ──────────────────────────
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, userId: str = Query(...)):
    await manager.connect(userId, websocket)
    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)

            receiver_id = data.get("receiverId")
            message = data.get("message")

            if receiver_id and message:
                await manager.send_to_user(receiver_id, {"message": message})
    except WebSocketDisconnect:
        manager.disconnect(userId)
