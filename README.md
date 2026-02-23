# 🏠 RoomiE — Roommate Finder Platform

A production-grade, full-stack web application for finding roommates and shared accommodation in India.

**Stack:** React + Vite · Node.js + Express · MongoDB · Socket.io · Cloudinary

---

## Features

- **Auth** — JWT-based register/login with protected routes
- **Listings** — Create, browse, filter, and delete listings with Cloudinary image upload
- **Real-time Chat** — Socket.io powered messaging between users
- **Saved Listings** — Save/unsave listings and view your shortlist
- **Profile** — Edit bio, age, gender, lifestyle preferences
- **Responsive** — Mobile-first design with hamburger nav

---

## Local Development

### 1. Install dependencies

```bash
# From root
npm run install:all
# or manually:
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment variables

```bash
# Server
cp server/.env.example server/.env
# Fill in MONGO_URI, JWT_SECRET, CLOUDINARY_* values

# Client
cp client/.env.example client/.env
# Already configured for local dev
```

### 3. Run both servers

```bash
# From root (requires concurrently)
npm install
npm run dev

# Or run separately:
cd server && npm run dev   # → http://localhost:5000
cd client && npm run dev   # → http://localhost:5173
```

---

## Deployment

### Backend → Railway

1. Push `server/` to a GitHub repo
2. Create a new Railway project → connect repo
3. Add all env vars from `server/.env.example`
4. Set `CLIENT_URL` to your Vercel frontend URL

### Frontend → Vercel

1. Push `client/` to GitHub
2. Import to Vercel — it auto-detects Vite
3. Set `VITE_API_URL` and `VITE_SOCKET_URL` to your Railway backend URL
4. `vercel.json` handles SPA routing automatically

---

## Project Structure

```
roomie/
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── api/         # Axios instance with interceptors
│   │   ├── components/  # Navbar, ListingCard
│   │   ├── context/     # AuthContext
│   │   └── pages/       # All page components
│   └── vercel.json
└── server/          # Node.js + Express backend
    ├── models/      # User, Listing, Message
    ├── routes/      # auth, listings, users, messages, upload
    ├── middleware/  # JWT auth middleware
    └── Procfile
```
