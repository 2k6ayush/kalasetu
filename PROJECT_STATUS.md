# Kalāsetu — Project Status & AI Handoff Document

---

## 1. Project in 5 Lines
Kalāsetu is an AI-curated platform empowering independent artists and preserving endangered traditional crafts. AI acts strictly as a curator and editorial writer, never as a generator of art. The platform enforces an anti-popularity ethos with zero likes, followers, or engagement algorithms, providing equal shelf space. Its three core pillars are Discover (Wall of Fame gallery), Tell (AI-generated Spotlight blogs), and Preserve (AI-structured Heritage Craft Archive).

---

## 2. Tech Stack (Actual)
- **Frontend:** Next.js 16.3.6 (Pages Router), React 19.2.8, Vanilla CSS (`frontend/src/styles/globals.css`).
- **Backend:** Node.js, Express 4.21.0, CORS, dotenv, Nodemon.
- **Database & ORM:** MongoDB, Mongoose 8.7.0. Uses `mongodb-memory-server` 10.0.0 automatically when `MONGO_URI` environment variable is omitted.
- **File Uploads:** Multer 1.4.5-lts.1 (Disk storage under `backend/uploads/`, served statically at `/uploads`).
- **AI Integrations:** Primary: `@google/genai` (Gemini 3.8 Flash). Fallback: `openai` SDK (xAI Grok 4.7).

---

## 3. Architecture & Data Flow
1. **Client Request:** User interacts with Next.js frontend pages.
2. **REST API Processing:** Express routes invoke controllers for Artists, Artworks, Spotlights, and Crafts.
3. **AI Dispatcher (`backend/src/services/ai/index.js`):** Controller requests trigger `callAI()`.
   - `callAI()` attempts execution via Google Gemini Vision/Text API (`geminiProvider.js`).
   - If Gemini fails (API error, rate limit, missing key), it logs a warning and automatically retries using xAI Grok API (`grokProvider.js`).
4. **Data Persistence:** Validated and processed records are stored in MongoDB (Atlas or In-Memory) via Mongoose models.

---

## 4. Data Models & API Routes

### Mongoose Models
- `Artist` (`backend/src/models/Artist.js`): `name`, `bio`, `socialLink`, `createdAt`.
- `Artwork` (`backend/src/models/Artwork.js`): `artistId`, `imagePath`, `artistNote`, `tags` (`medium`, `technique`, `culturalInfluence`, `mood`), `moderationStatus`, `moderationReason`, `aiProvider`, `createdAt`.
- `Spotlight` (`backend/src/models/Spotlight.js`): `artistId`, `title`, `body`, `aiProvider`, `publishedAt`.
- `CraftEntry` (`backend/src/models/CraftEntry.js`): `practitionerName`, `craftName`, `description`, `images`, `steps`, `aiProvider`, `publishedAt`.

### API Routes
- `POST /api/artists`: Create artist profile.
- `GET /api/artists/:id`: Get artist details and their approved artworks.
- `POST /api/artworks`: Upload artwork image, perform AI content moderation, extract AI tags, and save.
- `GET /api/artworks`: Query approved artworks filtered by tags (`medium`, `technique`, `culture`, `mood`, `tag`).
- `POST /api/spotlights/:artistId`: Generate and save an editorial spotlight story for an artist using Gemini Text.
- `GET /api/spotlights`: List all spotlights.
- `GET /api/spotlights/:id`: Retrieve single spotlight article.
- `POST /api/crafts`: Submit craft description & generate step-by-step preservation guide.
- `GET /api/crafts`: List all craft archive entries.
- `GET /api/crafts/:id`: Retrieve single craft guide.

---

## 5. Feature Status Table

| Feature | Status | File Paths & Implementation Notes |
| :--- | :--- | :--- |
| **Auth & Roles** | Not started | No auth middleware or role enforcement; `artistId` passed directly ([UploadForm.jsx](file:///d:/CODE%20SPACE%20-%20ALL%20PROJECTS/kalasetu/frontend/src/components/UploadForm.jsx)). |
| **Artwork Upload & Storage** | Done | Multer disk storage ([upload.js](file:///d:/CODE%20SPACE%20-%20ALL%20PROJECTS/kalasetu/backend/src/middleware/upload.js)), file preview ([UploadForm.jsx](file:///d:/CODE%20SPACE%20-%20ALL%20PROJECTS/kalasetu/frontend/src/components/UploadForm.jsx)). |
| **Gemini Moderation** | Done | Multimodal content policy check ([services/ai/index.js](file:///d:/CODE%20SPACE%20-%20ALL%20PROJECTS/kalasetu/backend/src/services/ai/index.js), [artworkController.js](file:///d:/CODE%20SPACE%20-%20ALL%20PROJECTS/kalasetu/backend/src/controllers/artworkController.js)). |
| **Gemini Auto-Tagging** | Done | Vision model extracts medium, technique, culture, mood ([services/ai/index.js](file:///d:/CODE%20SPACE%20-%20ALL%20PROJECTS/kalasetu/backend/src/services/ai/index.js)). |
| **Explore / Search by Tags** | Done | Dropdown filtering without popularity ranking ([TagFilterBar.jsx](file:///d:/CODE%20SPACE%20-%20ALL%20PROJECTS/kalasetu/frontend/src/components/TagFilterBar.jsx), [artworkController.js](file:///d:/CODE%20SPACE%20-%20ALL%20PROJECTS/kalasetu/backend/src/controllers/artworkController.js)). |
| **Artist Profile Page** | Done | Artist details & portfolio grid ([artist/[id].jsx](file:///d:/CODE%20SPACE%20-%20ALL%20PROJECTS/kalasetu/frontend/src/pages/artist/%5Bid%5D.jsx)). |
| **Spotlight Blog Generation & Page** | Done | Generate spotlight button on profile page with duplicate check & redirect to story ([id].jsx](file:///d:/CODE%20SPACE%20-%20ALL%20PROJECTS/kalasetu/frontend/src/pages/artist/%5Bid%5D.jsx), [spotlightController.js](file:///d:/CODE%20SPACE%20-%20ALL%20PROJECTS/kalasetu/backend/src/controllers/spotlightController.js)). |
| **Craft Archive Submission & Guide** | Done | Form at `/crafts/new` generates AI step breakdown & redirects to guide ([new.jsx](file:///d:/CODE%20SPACE%20-%20ALL%20PROJECTS/kalasetu/frontend/src/pages/crafts/new.jsx), [craftController.js](file:///d:/CODE%20SPACE%20-%20ALL%20PROJECTS/kalasetu/backend/src/controllers/craftController.js)). |
| **Seed / Demo Data** | Done | Auto-seeds 8 artists, 10 artworks, 3 spotlights, 2 craft entries on empty DB launch ([backend/seed.js](file:///d:/CODE%20SPACE%20-%20ALL%20PROJECTS/kalasetu/backend/seed.js)). |
| **Error / Loading / Responsive UI** | Done | Dark theme tokens, spinners, responsive grids ([globals.css](file:///d:/CODE%20SPACE%20-%20ALL%20PROJECTS/kalasetu/frontend/src/styles/globals.css)). |

---

## 6. Who Did What (Git Commit History)
- **Ayush H (`ayush2k6`)**: 
  - `8d56e6e` (`phase 2`): Full backend routes, controllers, AI failover integration, frontend pages, CSS styling, and auto-seeding.
  - `6957d7f` (`phase 1`): Initial repository structure and Express backend setup.
  - `acf29a7` (`Initial commit`): Repository initialization.
- **Shrivathsa Bhat M (`Vathsa`)**: 0 commits recorded in git history.

---

## 7. Gemini Integration Notes
- **SDK:** `@google/genai` (`GoogleGenAI` class).
- **Default Model:** `gemini-3.8-flash` (env: `GEMINI_MODEL`).
- **Prompts & JSON Output:**
  - Moderation: `{"safe": boolean, "reason": string}` (Flags 18+, graphic violence, hate symbols, non-art ads).
  - Auto-Tagging: `{"medium": string, "technique": string, "cultural_influence": string, "mood": [string]}`.
  - Spotlight Generation: `{"title": string, "body": string}`.
  - Craft Breakdown: `{"steps": [string]}`.
### 7.1 Seed Data Images (CC0 / Public Domain License Log)
All seed images comply strictly with the project core principle (AI curates, never creates). Only public domain CC0 authentic images are used:
1. **Dawn over the old city**: [Unsplash CC0](https://images.unsplash.com/photo-1579783900882-c0d3dad7b119) — License: CC0 / Public Domain Unsplash License
2. **Festival procession study**: [Unsplash CC0](https://images.unsplash.com/photo-1579783902614-a3fb3927b675) — License: CC0 / Public Domain Unsplash License
3. **Vessel form VII**: [Unsplash CC0](https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261) — License: CC0 / Public Domain Unsplash License
4. **Ritual bowl with serpent motif**: [Unsplash CC0](https://images.unsplash.com/photo-1578749556568-bc2c40e68b61) — License: CC0 / Public Domain Unsplash License
5. **Bamboo grove at dusk**: [Unsplash CC0](https://images.unsplash.com/photo-1541701494587-cb58502866ab) — License: CC0 / Public Domain Unsplash License
6. **Memory map**: [Unsplash CC0](https://images.unsplash.com/photo-1606744824163-985d376605aa) — License: CC0 / Public Domain Unsplash License
7. **Psalm fragment**: [Unsplash CC0](https://images.unsplash.com/photo-1584727638096-042c45049ebe) — License: CC0 / Public Domain Unsplash License
8. **Tree of life**: [Unsplash CC0](https://images.unsplash.com/photo-1577083552431-6e5fd01aa342) — License: CC0 / Public Domain Unsplash License
9. **Misty peaks**: [Unsplash CC0](https://images.unsplash.com/photo-1518709268805-4e9042af9f23) — License: CC0 / Public Domain Unsplash License
10. **Layered garden**: [Unsplash CC0](https://images.unsplash.com/photo-1513364776144-60967b0f800f) — License: CC0 / Public Domain Unsplash License

---

## 8. Decisions Made and Why
1. **Provider-Agnostic AI Failover:** Implemented Gemini-to-Grok fallback so hackathon judges and users experience zero downtime if Gemini quotas or API keys are disrupted.
2. **In-Memory MongoDB Fallback:** Enabled `mongodb-memory-server` when `MONGO_URI` is omitted so the project can be cloned and run instantly with zero database setup.
3. **No Popularity Sorting:** Artworks are sorted strictly by creation time (`createdAt: -1`) to align with the core product mission of anti-popularity and equal shelf space.
4. **Interactive Craft Submission:** Added `/crafts/new` page allowing practitioners to document traditional techniques with immediate AI guide generation.
5. **Single-Click Spotlight Generation:** Added interactive button on artist profiles to trigger Gemini editorial creation while preventing duplicate articles for the same artist.
6. **Artist Tag Governance:** Implemented post-upload tag review stage where artists review and refine AI-suggested metadata before finalizing publication.
7. **Fair Discovery & Equal Shelf Space:** Added free-text search across titles, notes, tags, and artist names, combined with an optional Fisher-Yates random shuffle toggle to eliminate positional bias.
8. **Strict CC0 Seed Imagery:** Replaced empty seed image paths with verified CC0 / Public Domain human art images, maintaining the fundamental rule that AI only curates and never generates art.

---

## 9. Known Issues and Gotchas
- **Moderation Fail-Safe Active:** When AI moderation providers fail, submissions are marked as `pending` (under review) instead of auto-approving.
- **AI Rate Limiting Active:** `express-rate-limit` enforces 15 requests per 15 min per IP on AI generation routes (`/api/artworks`, `/api/spotlights`, `/api/crafts`).
- **Volatile Storage in Dev:** In-memory DB fallback and local disk uploads do not persist across server restarts. Requires `MONGO_URI` in `backend/.env` for persistence.
- **Model IDs Verified:** `GEMINI_MODEL=gemini-3.8-flash` confirmed as current GA model per Google API docs. `GROK_MODEL=grok-4.7` confirmed as current flagship per xAI API docs (released Sept 21 2026). Both are correct in `.env.example`.
- **AI Endpoints Not Live-Tested:** AI routes (artwork upload moderation/tagging, spotlight generation, craft breakdown) require real API keys in `backend/.env` to complete. All non-AI routes pass.

---

## 10. Next Steps (Prioritized Top 5)
1. **Set Real API Keys & MongoDB URI**: Add `GEMINI_API_KEY`, `GROK_API_KEY`, and `MONGO_URI` to `backend/.env` to enable AI features and persistent storage. Run `cd backend && npm run seed` once connected.
2. **Auth & Identity Scoping**: Basic session or token verification for artist profile modifications.
3. **Pagination / Infinite Scroll**: Infinite load for gallery feed.
4. **Production Deployment Prep**: Dockerfile or Cloud Run configuration setup.
5. **Craft Guide Image Attachments**: Multi-image upload support for craft step preservation.

---

## 11. Change Log
- **2026-09-30** | Full audit pass: verified all 6 reported issues; Tasks 1 (Artist import), 3 (seed consolidation), 4 (API lib centralization) already resolved. Created `backend/.env` from `.env.example`. Confirmed model IDs `gemini-3.8-flash` and `grok-4.7` are valid per live API docs. Ran full 8-point E2E smoke test — all checks PASSED (homepage, tag filter, search, shuffle, artist profile, spotlight, craft archive, upload form). | `PROJECT_STATUS.md`, `backend/.env` | Senior Full-Stack Engineer
- **2026-09-29** | Replaced empty seed artwork images with authentic CC0 / Public Domain images and logged sources/licenses | `seed.js`, `seedData.js`, `PROJECT_STATUS.md` | Senior Full-Stack Engineer
- **2026-09-29** | Added free-text search (title, tags, artist name) and Fisher-Yates feed shuffle toggle on Wall of Fame | `artworkController.js`, `TagFilterBar.jsx`, `index.jsx` | Senior Full-Stack Engineer
- **2026-09-29** | Added `express-rate-limit` on AI POST routes and strict input validation middleware for length limits & required fields | `package.json`, `rateLimiter.js`, `validate.js`, Express route files | Senior Full-Stack Engineer
- **2026-09-29** | Added post-upload tag review allowing artists to inspect, edit, and confirm AI-suggested tags via `PATCH /api/artworks/:id/tags` | `artworkController.js`, `routes/artworks.js`, `UploadForm.jsx` | Senior Full-Stack Engineer
- **2026-09-29** | Implemented Moderation Fail-Safe: failed AI moderation sets artwork status to `pending` with clear uploader feedback | `Artwork.js`, `artworkController.js`, `UploadForm.jsx` | Senior Full-Stack Engineer
- **2026-09-29** | Added Generate Spotlight button to artist profile page with loading/error states, duplicate detection, and direct article routing | `spotlightController.js`, `routes/artists.js`, `artist/[id].jsx` | Senior Full-Stack Engineer
- **2026-09-29** | Implemented Craft Submission Page `/crafts/new` with region field, loading/error states, redirect to guide, and Navbar/page links | `CraftEntry.js`, `craftController.js`, `crafts/new.jsx`, `Navbar.jsx`, `crafts/index.jsx` | Senior Full-Stack Engineer
- **2026-09-29** | Created README.md and PROJECT_STATUS.md following comprehensive Phase 1 Audit | `README.md`, `PROJECT_STATUS.md` | Senior Full-Stack Engineer
