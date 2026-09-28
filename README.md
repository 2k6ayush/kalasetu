# Kalāsetu — Art Beyond Boundaries

> An AI-powered platform for independent artists and traditional crafts.  
> Built for MLH HackDays (Track: "Art Beyond Boundaries") by Team Pair-a-Dox (Shrivathsa Bhat M & Ayush H).

---

## 🎨 Overview

Kalāsetu bridges contemporary independent artists and endangered traditional craft practices. AI is treated strictly as an **intelligent curator and storyteller**, never a creator. 

### Core Principles
1. **Equal Shelf Space:** No likes, no followers, no engagement-based popularity ranking. Every artist gets equal visibility.
2. **AI as Curator, Not Creator:** AI moderates submissions, extracts objective tags, authors editorial features, and structures craft guides—never generating artificial art.
3. **Preserving Heritage:** Archiving fading traditional techniques through step-by-step guides documented directly by practitioners.

---

## ✨ Features

- **Wall of Fame (Discover):** Browse artworks filtered by medium, technique, and cultural influence.
- **Spotlight Blog (Tell):** Editorial-style stories generated for artists using Gemini Text.
- **Heritage Craft Archive (Preserve):** Practitioner-submitted technique details transformed by Gemini into step-by-step guides.
- **Provider-Agnostic AI Failover:** Primary integration with Google Gemini Vision & Text, with automatic fallback to xAI Grok.

---

## 🛠 Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16 (Pages Router), React 19 | Client-side rendering & pages structure |
| **Styling** | Vanilla CSS | Custom dark theme with design tokens (`src/styles/globals.css`) |
| **Backend** | Node.js, Express 4 | REST API server |
| **Database & ORM** | MongoDB, Mongoose 8 | MongoDB Atlas (or automatic fallback to `mongodb-memory-server`) |
| **Storage** | Multer | Local disk storage (`backend/uploads/`) |
| **AI Integration** | `@google/genai` (Gemini), `openai` (Grok) | Gemini 3.8 Flash primary with Grok 4.7 fallback |

---

## 🚀 Setup and Run Instructions

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm

### 2. Configuration
Create a `.env` file in `backend/`:
```bash
cp backend/.env.example backend/.env
```

Set environment variables in `backend/.env`:
- `GEMINI_API_KEY`: Your Google Gemini API key
- `GEMINI_MODEL`: (Optional, default: `gemini-3.8-flash`)
- `GROK_API_KEY`: (Optional fallback)
- `GROK_MODEL`: (Optional fallback, default: `grok-4.7`)
- `MONGO_URI`: (Optional, leave blank to use automatic in-memory MongoDB)
- `PORT`: (Optional, default: `5000`)

### 3. Install Dependencies & Run

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

- **Frontend App:** http://localhost:3000
- **Backend API:** http://localhost:5000

---

## 📡 API Routes

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/artists` | Create an artist profile |
| `GET` | `/api/artists/:id` | Get artist profile & approved artworks |
| `POST` | `/api/artworks` | Upload artwork image, run moderation & tagging |
| `GET` | `/api/artworks` | List & filter approved artworks by tags |
| `POST` | `/api/spotlights/:artistId` | Generate editorial spotlight using Gemini |
| `GET` | `/api/spotlights` | List all spotlights |
| `GET` | `/api/spotlights/:id` | Get single spotlight |
| `POST` | `/api/crafts` | Submit craft & generate step breakdown |
| `GET` | `/api/crafts` | List all craft archive entries |
| `GET` | `/api/crafts/:id` | Get single craft guide |

---

## ⚠️ Known Issues

- **Moderation Fails Open:** If both AI providers fail, artwork is auto-approved by default.
- **No Auth or Rate Limiting:** AI endpoints lack rate limiting and user authentication.
- **Ordering Limitation:** Newest-first sorting does not strictly enforce equal shelf space over time.
- **No Tag Review Step:** AI tags are applied directly to artwork without pre-publication artist review.
- **Non-persistent Local Storage:** In-memory MongoDB fallback and local disk uploads lose data on server restart.
- **No Text Search:** Wall of Fame filtering relies only on dropdown tag matches, lacking free-text search.
- **Model Verification:** `GEMINI_MODEL` (`gemini-3.8-flash`) and `GROK_MODEL` (`grok-4.7`) env defaults need live API verification.

---

## 📁 Repository Structure

```
kalasetu/
├── backend/                  # Node.js / Express REST API
│   ├── src/
│   │   ├── config/           # Database configuration
│   │   ├── controllers/      # Route logic for artworks, crafts, spotlights
│   │   ├── middleware/       # Multer file upload setup
│   │   ├── models/           # Mongoose schemas (Artist, Artwork, CraftEntry, Spotlight)
│   │   ├── routes/           # Express API endpoints
│   │   └── services/ai/      # Gemini & Grok AI providers + failover dispatcher
│   └── seed.js               # Database seeding logic
├── frontend/                 # Next.js frontend application
│   └── src/
│       ├── components/       # Reusable UI components (Navbar, Cards, Filters, Upload)
│       ├── pages/            # Next.js pages router (Wall of Fame, Profile, Spotlights, Crafts)
│       └── styles/           # CSS design system
├── seed/                     # Seed data definitions
├── README.md                 # Project README
└── PROJECT_STATUS.md         # Full project & AI handoff documentation
```
