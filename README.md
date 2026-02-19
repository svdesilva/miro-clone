# Miro Clone

A real-time collaborative whiteboard application built with Next.js, inspired by Miro.

## Tech Stack

- **Next.js 16** - Full-stack React framework
- **Clerk** - Authentication & user management
- **Liveblocks** - Real-time collaboration (cursors, shared canvas)
- **Fabric.js** - Canvas drawing & manipulation
- **Zustand** - State management
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - UI components

## Getting Started

### Prerequisites

- Node.js 18+ (recommend 20+ LTS)
- A [Clerk](https://clerk.com) account (free tier available)
- A [Liveblocks](https://liveblocks.io) account (free tier available)

### 1. Clone the repo

```bash
git clone https://github.com/nischal-b/miro_clone.git
cd miro_clone
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Then open `.env.local` and fill in your API keys:

- **Clerk keys**: Get them from [Clerk Dashboard](https://dashboard.clerk.com) > API Keys
- **Liveblocks secret key**: Get it from [Liveblocks Dashboard](https://liveblocks.io/dashboard/apikeys)

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- User authentication (sign up / sign in)
- Create, rename, and delete boards
- Real-time collaborative canvas editing
- Live cursors showing other users
- Drawing tools (shapes, text, freehand)
- Undo/redo support
