# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run init-db    # Initialize SQLite database (run once)
npm run dev        # Start dev server on http://localhost:3000
npm run build      # Regenerate static site from database
```

Individual scripts can be run directly:
```bash
node src/transcript.js <youtube-url>   # Fetch transcript
node src/thumbnail.js <youtube-url>    # Download thumbnail
node src/db.js init                    # Init database schema
```

There are no tests or linting configured.

## Architecture

This is a Node.js application that fact-checks YouTube finance/investing videos and generates a static HTML site with results. No frameworks or bundlers — vanilla JS throughout.

### Custom Claude Commands

- **`/fact-check <youtube-url>`** — Fact-check a YouTube video and produce a polished article-quality transcript (see pipeline below)

### Fact-Checking Pipeline

The `/fact-check` custom Claude command orchestrates the full workflow:
1. **Fetch transcript** (`src/transcript.js`) — extracts video ID, fetches via YouTube innertube API with Android UA fallback, parses XML captions into timestamped text
2. **Analyze claims** — Claude identifies verifiable financial claims and researches each one
3. **Transform transcript** — Editorially reshapes raw transcript into polished, structured prose with section headings, introduction, and conclusion (stored as `transcript_article`)
4. **Save results** (`src/db.js`) — stores video metadata, verdict, individual claims, and article transcript to SQLite
5. **Download thumbnail** (`src/thumbnail.js`) — saves to `site/thumbnails/`
6. **Generate site** (`src/generate-site.js`) — builds static HTML index page + per-video detail pages (article transcript shown by default, raw transcript available via toggle)
7. **Commit and push** — automatically commit all changed files (database, site HTML, thumbnails) and push to the remote repository. This step must always happen at the end of every `/fact-check` run without asking the user.

### Key Modules

- **`src/db.js`** — sql.js (WebAssembly SQLite) wrapper. Database persists at `data/factchecker.db` as a binary file. Exports `initDb()`, `saveResult()`, `listVideos()`, `getVideo()`, `saveDb()`.
- **`src/transcript.js`** — Two-method transcript fetcher: innertube API (primary) → watch page scraping (fallback). Returns both readable (with timestamps) and plain text versions.
- **`src/generate-site.js`** — Generates `site/index.html` (video grid) and `site/video/{id}.html` (detail pages with embedded video, verdict badges, claim cards, full transcript).
- **`scripts/dev-server.js`** — Simple HTTP static file server with `.html` extension auto-mapping.

### Database Schema

Two tables: `videos` (metadata, transcript, transcript_article, overall verdict/summary) and `claims` (individual claims linked to video by `video_id` foreign key). The `transcript_article` column stores the editorially polished article version of the transcript. Seven verdict levels: TRUE, MOSTLY TRUE, MISLEADING, MIXED, UNVERIFIABLE, MOSTLY FALSE, FALSE.

### Static Site Output

All generated HTML goes in `site/`. Dark theme with Inter (body text) + JetBrains Mono (accents: verdict badges, timestamps, metadata, section labels, footer). Verdict badges are color-coded (green→red spectrum). The site is fully static with no client-side JS.
