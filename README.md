# AnoNote 🕶️

> Anonymous end-to-end encrypted notes

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Zustand](https://img.shields.io/badge/Zustand-764ABC?style=for-the-badge&logo=react&logoColor=white)](https://github.com/pmndrs/zustand)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

AnoNote is a full-stack, privacy-first note-taking application where **all data is encrypted on the client side** before it ever reaches the server. The server stores only encrypted ciphertext — it never sees your passwords, titles, or content. Zero-knowledge by design.

Works as a **Progressive Web App (PWA)**: install it on your phone or desktop and use it like a native app.

---

## ✨ Features

- **End-to-end encryption** — AES-256-GCM with PBKDF2 key derivation, all in the browser via the Web Crypto API
- **Zero-knowledge architecture** — the server stores only encrypted blobs; passwords never leave the client
- **Anonymous** — register with just a username (no email, no personal data)
- **Installable PWA** — works offline with service worker caching and a home-screen install prompt
- **Dark / light theme** — persists preference with OS-level default detection
- **Session management** — JWT-based auth with server-side token blacklisting for logout
- **Rate limiting** — auth endpoints protected by `express-rate-limit` (10 attempts per 15 min)
- **Responsive UI** — built with Tailwind CSS and Radix UI primitives

---

## 🧱 Tech Stack

### Frontend

| Library | Purpose |
|---|---|
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Vite 8** | Build tool and dev server |
| **Tailwind CSS 3** | Utility-first styling with dark mode |
| **Zustand** | Lightweight state management |
| **React Router 7** | Client-side routing |
| **Radix UI** | Accessible, headless UI primitives (Dialog, DropdownMenu, Toast, etc.) |
| **Lucide React** | Icon set |
| **Vitest** | Unit and integration tests (jsdom environment) |
| **vite-plugin-pwa** | PWA manifest, service worker, and Workbox caching |

### Backend

| Library | Purpose |
|---|---|
| **Node.js** | Runtime |
| **Express 4** | HTTP server and routing |
| **TypeScript** | Type safety (compiled with `tsc`) |
| **tsx** | TypeScript execution in development (watch mode) |
| **Mongoose** | MongoDB ODM (schemas, models, queries) |
| **jsonwebtoken** | JWT signing and verification |
| **bcryptjs** | Password hashing (12 salt rounds) |
| **express-rate-limit** | Rate limiting middleware |
| **dotenv** | Environment variable loading |

### Cryptographic Layer

- **Web Crypto API** (`crypto.subtle`) — all encryption/decryption runs in the browser
- **PBKDF2** — key derivation (600,000 iterations, SHA-256, 16-byte salt)
- **AES-256-GCM** — symmetric encryption (256-bit key, 12-byte IV)
- **Key material** is **never sent to the server** — only ciphertext, IV, and salt cross the wire

---

## 📐 Architecture

```
┌──────────────────────────────────────────────────┐
│                   Browser (Client)                │
│                                                   │
│  ┌──────────────┐    ┌─────────────────────────┐  │
│  │   Zustand     │    │   Web Crypto API        │  │
│  │   Stores      │    │   (AES-256-GCM + PBKDF2)│  │
│  │  (auth/notes) │    │                         │  │
│  └──────┬───────┘    │  plaintext → ciphertext  │  │
│         │            │  ciphertext → plaintext  │  │
│         │            └──────────┬──────────────┘  │
│         │                       │                  │
│         ▼                       ▼                  │
│  ┌─────────────────────────────────────────────┐  │
│  │           API Client (fetch)                 │  │
│  │  only encrypted{Title,Content,iv,salt}      │  │
│  └──────────────────┬──────────────────────────┘  │
└─────────────────────┼────────────────────────────┘
                      │ HTTPS
┌─────────────────────┼────────────────────────────┐
│  ┌──────────────────▼──────────────────────────┐  │
│  │            Express Server                    │  │
│  │                                              │  │
│  │  POST /api/auth/register → create user       │  │
│  │  POST /api/auth/login    → issue JWT         │  │
│  │  POST /api/auth/logout   → blacklist JWT     │  │
│  │                                              │  │
│  │  ┌──────────────────────┐                    │  │
│  │  │  authMiddleware      │  JWT verification  │  │
│  │  │  + tokenBlacklist    │  + revocation      │  │
│  │  └──────────────────────┘                    │  │
│  │                                              │  │
│  │  GET    /api/notes      → list notes         │  │
│  │  POST   /api/notes      → create note        │  │
│  │  PUT    /api/notes/:id  → update note        │  │
│  │  DELETE /api/notes/:id  → delete note        │  │
│  └──────────────────┬──────────────────────────┘  │
│                     │                              │
│  ┌──────────────────▼──────────────────────────┐  │
│  │              MongoDB                         │  │
│  │  Users: { username, password(bcrypt), salt } │  │
│  │  Notes: { encryptedTitle, encryptedContent,  │  │
│  │           iv, ivContent, salt, userId }      │  │
│  └─────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
anonote/
├── client/                          # React frontend (Vite)
│   ├── public/                      # Static assets (favicon, PWA icons)
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/                # LoginForm, RegisterForm
│   │   │   ├── notes/               # NoteList, NoteCard, NoteEditor
│   │   │   ├── ui/                  # shadcn-style primitives (button, card, dialog, etc.)
│   │   │   ├── pwa-install-prompt.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── hooks/                   # use-theme, use-toast
│   │   ├── lib/                     # api.ts (fetch wrapper), crypto.ts (Web Crypto), utils.ts
│   │   ├── pages/                   # login-page, register-page, notes-page
│   │   ├── store/                   # auth-store.ts, note-store.ts (Zustand)
│   │   ├── App.tsx                  # Router setup
│   │   └── main.tsx                 # Entry point
│   ├── tailwind.config.js
│   ├── vite.config.ts               # PWA plugin + Vitest config + path aliases
│   └── vercel.json                  # SPA rewrites for deployment
│
├── server/                          # Express backend
│   ├── src/
│   │   ├── config/                  # db.ts (MongoDB connection), auth.ts (JWT secret)
│   │   ├── controllers/             # auth-controller.ts, note-controller.ts
│   │   ├── lib/                     # token-blacklist.ts (in-memory JWT revocation)
│   │   ├── middleware/              # auth-middleware.ts (JWT guard + blacklist check)
│   │   ├── models/                  # user.ts, note.ts (Mongoose schemas)
│   │   ├── routes/                  # auth-routes.ts, note-routes.ts
│   │   ├── types/                   # Express type augmentation + JwtPayload
│   │   └── index.ts                 # Server entry point
│   ├── .env.example                 # Environment template
│   └── tsconfig.json
│
├── package.json                     # Root orchestrator (concurrently runs both)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) >= 18
- [MongoDB](https://www.mongodb.com) instance (local or Atlas)

### Setup

```bash
# Clone the repository
git clone https://github.com/<your-username>/anonote.git
cd anonote

# Install dependencies (root, client, server)
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..

# Configure environment
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/anonote
JWT_SECRET=<generate-a-strong-random-secret>
```

### Run Development

```bash
# From root — starts both client and server concurrently
npm run dev
```

- **Client**: http://localhost:5173
- **Server**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health

### Build for Production

```bash
npm run build        # builds client
npm start            # starts server (serves API only; client goes to Vercel/static host)
```

---

## 📡 API Reference

All endpoints prefixed with `/api`.

### Authentication

| Method | Endpoint | Auth | Description | Rate Limit |
|---|---|---|---|---|
| `POST` | `/auth/register` | No | Create account | 10/15min |
| `POST` | `/auth/login` | No | Sign in | 10/15min |
| `POST` | `/auth/logout` | Yes | Revoke current JWT | — |

**Register / Login request body:**

```json
{
  "username": "alice",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJI...",
  "userId": "665a1b2c...",
  "username": "alice",
  "salt": "a1b2c3d4e5f6..."
}
```

### Notes

All note endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/notes` | List all user's notes (sorted by updatedAt desc) |
| `POST` | `/notes` | Create a note |
| `PUT` | `/notes/:id` | Update a note |
| `DELETE` | `/notes/:id` | Delete a note |

**Create / Update request body:**

```json
{
  "encryptedTitle": "<base64 ciphertext of title>",
  "encryptedContent": "<base64 ciphertext of content>",
  "iv": "<base64 IV for title>",
  "ivContent": "<base64 IV for content>",
  "salt": "<base64 salt used for key derivation>"
}
```

**Note response:**

```json
{
  "_id": "665a1b2c...",
  "userId": "665a1b2c...",
  "encryptedTitle": "...",
  "encryptedContent": "...",
  "iv": "...",
  "ivContent": "...",
  "salt": "...",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

---

## 🔐 Security

### Encryption Flow

1. **Registration / Login**: When you create an account, the server generates a random 16-byte hex salt. This salt is returned alongside your JWT.
2. **Key Derivation**: Your password and the salt are fed into **PBKDF2** (600,000 iterations, SHA-256) in the browser to derive a 256-bit AES key. The key never leaves your browser.
3. **Encryption**: Each note title and content is encrypted separately with **AES-256-GCM**, each using a fresh random 12-byte IV. The ciphertext, IVs, and salt are sent to the server.
4. **Decryption**: When you fetch notes, the ciphertext, IVs, and salt come down; the browser derives the same key from your password (stored in `sessionStorage` for the session) and decrypts locally.
5. **Password**: Stored in `sessionStorage` — cleared when you close the tab. The password is **never** stored on the server.

### Server Security

- Passwords hashed with **bcrypt** (12 salt rounds)
- JWT tokens signed with a server secret, include a unique `jti` claim
- Logout adds the `jti` to an **in-memory blacklist** (cleaned every 60 seconds)
- Auth endpoints rate-limited to **10 requests per 15 minutes**
- All other note endpoints require valid, non-revoked JWT

---

## 🌐 Deployment

### Client (Vercel / Static Host)

The client is configured for Vercel with SPA rewrites via `vercel.json`. It builds with `npm run build` (outputs to `client/dist`).

```bash
cd client
npm run build
vercel --prod
```

### Server

The server can be deployed to any Node.js host (Railway, Render, Fly.io, etc.).

```bash
cd server
npm run build
npm start
```

Set the same environment variables as `.env` plus `CLIENT_URL` for CORS.

---

## 🧪 Testing

```bash
cd client
npm test              # Vitest
npm run lint          # ESLint
```

---

## 📄 License

MIT
