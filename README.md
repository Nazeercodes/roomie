# RoomiE

Find a roommate. Split the rent. Live better.

RoomiE is a roommate-finder web app built for people looking to share accommodation and cut down on rent. Users can post listings, browse by city, chat in real time, and save listings they like.

---

## Tech Stack

- **Frontend** — React + Vite
- **Backend** — Python + FastAPI
- **Database** — PostgreSQL (SQLAlchemy)
- **Auth** — JWT (access tokens, protected routes)
- **Real-time** — WebSockets (FastAPI)
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
# Set up backend
cd server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env    # fill in DATABASE_URL, JWT_SECRET, CLOUDINARY_*

# Run backend
uvicorn main:app --reload

# Set up frontend
cd ../client
npm install
npm run dev
# frontend → http://localhost:5173
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
└── server/          # FastAPI API
    ├── models.py    # SQLAlchemy models
    ├── routers/     # auth, listings, users, messages, upload
    ├── database.py  # Database connection
    └── main.py      # Entry point & WebSockets
```
