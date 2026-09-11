# GoooG - Character Recognition & Spaced Repetition Game

A fast, responsive web application for character guessing and memory retention, built with **React**, **TypeScript**, **Tailwind CSS**, and **Dexie (IndexedDB)**. Deployed seamlessly to **Cloudflare Pages**.

---

## 🌟 Key Features

### 1. Dynamic Lobby with 4 Horizontal Category Cards
- **Four Category Cards**:
  - `Sluts`
  - `Trans`
  - `Twinks`
  - `Mix All` (Shuffled pool across all categories)
- **Live Random Portraits**: Every page refresh displays random portraits from each category's character pool.
- **Game Setup Modal**: Clicking any card lets you configure the number of rounds (5, 10, 20, or All) and pick between two distinct game modes.

### 2. Dual Gameplay Modes
- **Classic Mode**:
  - 1 large portrait on the left.
  - Multi-photo carousel dots/arrows to inspect all available photos for that character (1 to 6 photos).
  - 3 candidate character names on the right.
  - Keyboard shortcuts (`1`, `2`, `3`).
- **Match Mode**:
  - Target character name displayed prominently at the top.
  - Two distinct portraits shown side-by-side (Card A vs Card B).
  - Click the matching photo or use `←` and `→` arrow keys.

### 3. Smart Post-Game Screen & Mistake Review
- Instant performance metrics: Final Score, Accuracy %, Time taken, and Streaks.
- Visual breakdown of missed characters (portrait, correct name, your choice).
- **"Review Mistakes Only" Button**: Re-launches the game immediately with *only* the characters you got wrong for targeted reinforcement.

### 4. Character Gallery & Full Management (CRUD)
- Browse all characters with real-time name and category search.
- **Active in Game Toggle**: Enable or disable any character from appearing in game rounds without deleting them.
- Add/Edit characters manually: Supports name, category, and **1 to 6 photo URLs** with live thumbnail preview.
- Backup & Restore: Export and import the entire character database as JSON.

### 5. Analytics & Spaced Repetition (SRS)
- Powered by the **SuperMemo SM-2 algorithm**.
- Calculates interval, repetition count, and ease factors based on your answers.
- Retention stages: `New`, `Learning`, `Reviewing`, `Mastered`.
- **"Start Review Session"**: One-click review of all characters currently due for review.

### 6. Smart Scraper
- Filter by Category, Page number, or search by Character Name.
- **Row-by-Row Layout**: Clean card presentation with profile avatar and details.
- **Horizontal Photo Strip**: Scroll through all available scraped photos and select 1 to 6 photos per character before importing.
- Serverless Cloudflare Pages Function proxy (`/functions/api/scrape.ts`) for CORS handling.

---

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
```
Output will be generated in `dist/`.

---

## ☁️ Deployment to Cloudflare Pages

1. Push this repository to GitHub under `GoooG`.
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select the `GoooG` repository.
4. Set build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Click **Save and Deploy**. Cloudflare Pages will automatically build and host the site with global CDN distribution!
