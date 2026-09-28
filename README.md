# Kalāsetu — Art Beyond Boundaries

> A full-stack platform for independent artists and fading traditional crafts.  
> Built for the "Beyond Reality" hackathon.

---

## ✨ Features

- **Wall of Fame** — Browse artworks filtered by AI-generated tags (medium, technique, cultural influence). No popularity ranking, ever.
- **Self-Upload** — Artists upload their own work. AI moderates content (flagging only 18+, violence, hate symbols, spam) and auto-generates discovery tags.
- **Artist Spotlights** — Magazine-quality editorial features generated about artists on the platform.
- **Craft Archive** — Preserving fading traditional techniques with AI-generated step-by-step breakdowns.
- **Provider-Agnostic AI** — Tries Google Gemini first; if that fails for any reason, automatically falls back to xAI Grok. Transparent to callers, logged for debugging.

---

## 🛠 Tech Stack

| Layer      | Technology                                |
|------------|-------------------------------------------|
| Frontend   | Next.js (Pages Router), React, Vanilla CSS |
| Backend    | Node.js, Express                          |
| Database   | MongoDB (Mongoose) — in-memory fallback   |
| AI         | Google Gemini API + xAI Grok API          |
| Uploads    | Multer (local disk storage)               |

---

## 📁 Project Structure

```
kalasetu/
├── backend/
│   ├── src/
│   │   ├── config/db.js              # MongoDB connection (+ in-memory fallback)
│   │   ├── models/                   # Artist, Artwork, Spotlight, CraftEntry
│   │   ├── services/ai/
│   │   │   ├── geminiProvider.js      # Raw Gemini API calls
│   │   │   ├── grokProvider.js        # Raw Grok API calls
│   │   │   └── index.js              # callAI() with auto-failover
│   │   ├── middleware/upload.js       # Multer config
│   │   ├── routes/                   # Express route modules
│   │   ├── controllers/              # Business logic
│   │   └── app.js                    # Express entry point
│   ├── seed.js                       # Auto-seed on first startup
│   ├── .env.example
│   └── package.json
├── frontend/
│   └── src/
│       ├── pages/                    # Next.js pages
│       ├── components/               # React components
│       └── styles/globals.css        # Design system
├── seed/seedData.js                  # Standalone seed script
└── README.md
```

---

## 🚀 Quick Start

### 1. Clone & configure

```bash
cd kalasetu/backend
cp .env.example .env
# Edit .env — add your API keys:
#   GEMINI_API_KEY=your-key
#   GROK_API_KEY=your-key
# MONGO_URI is optional — leave blank for in-memory MongoDB
```

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Run the app

Open **two terminals**:

```bash
# Terminal 1 — Backend (auto-seeds demo data on first run)
cd backend
npm start          # or: npm run dev (with hot reload)

# Terminal 2 — Frontend
cd frontend
npm run dev
```

### 4. Open in browser

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

---

## 🔑 Environment Variables

| Variable         | Required | Default            | Description                          |
|------------------|----------|--------------------|--------------------------------------|
| `MONGO_URI`      | No       | (in-memory)        | MongoDB connection string            |
| `GEMINI_API_KEY`  | No*      | —                  | Google Gemini API key                |
| `GEMINI_MODEL`    | No       | `gemini-3.8-flash` | Gemini model name                    |
| `GROK_API_KEY`    | No*      | —                  | xAI Grok API key                     |
| `GROK_MODEL`      | No       | `grok-4.7`         | Grok model name                      |
| `PORT`           | No       | `5000`             | Backend server port                  |

*At least one AI key is needed for upload moderation/tagging to work. Without keys, the app still runs — uploads are approved by default with empty tags.

---

## 📡 API Endpoints

| Method | Endpoint                  | Description                                    |
|--------|---------------------------|------------------------------------------------|
| POST   | `/api/artists`            | Create artist profile                          |
| GET    | `/api/artists/:id`        | Get artist + their approved artworks            |
| POST   | `/api/artworks`           | Upload → moderate → tag → save                 |
| GET    | `/api/artworks?tag=x`     | Browse/filter by tags (no popularity sort)      |
| POST   | `/api/spotlights/:artistId` | Generate editorial spotlight                 |
| GET    | `/api/spotlights`         | List all spotlights                            |
| GET    | `/api/spotlights/:id`     | Single spotlight                               |
| POST   | `/api/crafts`             | Submit craft → generate steps → save            |
| GET    | `/api/crafts`             | List all craft entries                         |
| GET    | `/api/crafts/:id`         | Single craft entry                             |

---

## 🎨 Design Principles

1. **No popularity ranking** — Discovery is by tags only, never by likes or engagement.
2. **Self-uploaded art only** — All seed data is fictional. No scraped content.
3. **Scoped moderation** — Content moderation checks only: 18+, violence, hate symbols, spam. Never claims to detect "AI vs. human" art.
4. **Transparent AI failover** — Gemini → Grok, logged but invisible to callers.

---

## 🧪 Demo Data

The app auto-seeds 8 fictional artists, 10 artworks, 3 spotlights, and 2 craft entries on first startup (when the database is empty). All content is original placeholder text — nothing from real artists.

---

## License

MIT
