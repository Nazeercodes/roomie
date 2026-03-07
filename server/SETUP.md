# RoomiE — FastAPI Backend Setup

## 1. Create a PostgreSQL database

Go to [Render.com](https://render.com) → New → PostgreSQL → Free tier  
Copy the **External Database URL** — you'll need it for the env file.

## 2. Set up environment variables

Create a `.env` file in the `server/` folder:

```
DATABASE_URL=postgresql://user:password@host:5432/roomie
JWT_SECRET=pick_any_long_random_string
JWT_EXPIRE_DAYS=7
CLOUDINARY_CLOUD_NAME=dvtogpjp1
CLOUDINARY_API_KEY=182655548431545
CLOUDINARY_API_SECRET=KrbtLin2Hcm9TPSnJotCfM0_Gfg
CLIENT_URL=https://roomie-gray.vercel.app
```

> Cloudinary credentials stay the same — copy from your old `.env`

## 3. Install dependencies & run locally

```bash
cd server
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Server runs at: http://localhost:8000  
API docs (free!): http://localhost:8000/docs

## 4. Update frontend .env

In `client/.env`:
```
VITE_API_URL=http://localhost:8000/api
VITE_SOCKET_URL=http://localhost:8000
```

For production (Vercel):
```
VITE_API_URL=https://your-render-backend-url.onrender.com/api
VITE_SOCKET_URL=https://your-render-backend-url.onrender.com
```

## 5. Replace Chat.jsx

Copy the provided `Chat.jsx` → `client/src/pages/Chat.jsx`  
(Replaces socket.io with native WebSocket)

## 6. Remove socket.io from frontend

```bash
cd client
npm uninstall socket.io-client
```

## 7. Deploy backend to Render

- Go to Render → New → Web Service
- Connect your GitHub repo
- Root directory: `server`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Add all env variables from step 2

## What changed vs the old Node backend

| Feature | Old (Node) | New (Python) |
|---------|-----------|--------------|
| Framework | Express | FastAPI |
| Database | MongoDB | PostgreSQL |
| ORM | Mongoose | SQLAlchemy |
| Auth | jsonwebtoken | python-jose |
| Real-time | Socket.io | Native WebSocket |
| Field names | camelCase (_id) | snake_case (id) |
| Auto API docs | ❌ | ✅ /docs |

## Field name changes (frontend)

The backend now uses snake_case. Key changes in API responses:
- `_id` → `id`
- `postedBy` → `posted_by` / `owner`
- `createdAt` → `created_at`
- `bhkType` → `bhk_type`
- `availableFrom` → `available_from`
- `genderPreference` → `gender_preference`
- `isActive` → `is_active`
- `conversationId` → `conversation_id`
- `senderId` / `receiverId` → `sender_id` / `receiver_id`
