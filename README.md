# RoomiE

Find a roommate. Split the rent. Live better.

RoomiE is a roommate-finder web app built for people looking to share accommodation and cut down on rent. Users can post listings, browse by city, chat in real time, and save listings they like.

---

## Tech Stack

- **Frontend** — React + Vite
- **Backend** — Node.js, Express
- **Database** — MongoDB (Mongoose)
- **Auth** — JWT (access tokens, protected routes)
- **Real-time** — Socket.io
- **Image uploads** — Cloudinary

---

## Features

- Register / login with JWT auth
- Post and browse listings with filters (city, rent, gender preference)
- Upload listing images via Cloudinary
- Real-time chat between users (Socket.io)
- Save listings to a personal shortlist
- Edit your profile (bio, age, gender, lifestyle)
- Fully responsive — works on mobile

---

## Getting Started

```bash
# Install dependencies
npm run install:all

# Set up environment variables
cp server/.env.example server/.env    # fill in MONGO_URI, JWT_SECRET, CLOUDINARY_*
# client/.env is already set for local dev

# Run both servers
npm run dev
# frontend → http://localhost:5173
# backend  → http://localhost:5000
```

---

## Deployment

- **Backend** → [Railway](https://railway.app) — connects to GitHub, add env vars, done
- **Frontend** → [Vercel](https://vercel.com) — auto-detects Vite, set `VITE_API_URL` to Railway URL

---

## Project Structure

```
roomie/
├── client/          # React + Vite
│   ├── src/
│   │   ├── api/         # Axios instance
│   │   ├── components/  # Navbar, ListingCard
│   │   ├── context/     # AuthContext
│   │   └── pages/       # Home, Browse, Chat, Profile, ...
│   └── vercel.json
└── server/          # Express API
    ├── models/      # User, Listing, Message
    ├── routes/      # auth, listings, users, messages, upload
    └── middleware/  # JWT auth
```
