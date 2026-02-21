# NCA Content Marketing

AI-powered content management system for creating articles with generated hero images. Customize prompts for any topic or industry.

## What This Project Does

- Generate SEO-optimized articles from URLs or keywords using Google Gemini
- Create matching hero images with Google Imagen
- Edit and customize AI prompts via a web interface
- Publish articles instantly without rebuilding the site

## Prerequisites

- Node.js 18+
- Google Cloud account with Gemini API access
- (Optional) Turso account for production database

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Environment File

Create a `.env` file in the project root:

```env
EDITOR_ADMIN="admin"
EDITOR_PASSWORD="admin"
GOOGLE_GEMINI_API_KEY=your-gemini-api-key
```

### 3. Start Development Server

```bash
npm run dev
```

On first start, the database is automatically created and seeded with default content.

Open [http://localhost:4321](http://localhost:4321) to see the homepage.

## Database & Seed Data

This project uses **AstroDB** (SQLite in development, Turso in production).

### What Gets Seeded

When you first run `npm run dev`, the database is populated with default values. These are configured for web accessibility content but can be changed to any topic via the Settings tab:

**Site Settings:**
| Key | Description |
|-----|-------------|
| `hero_kicker` | Small text above the hero title |
| `hero_title` | Main hero headline |
| `hero_title_accent` | Highlighted part of title |
| `hero_description` | Hero subtitle text |
| `cta_url` | Link for call-to-action buttons |
| `cta_style` | Style guidelines for AI-generated CTAs |
| `imprint_content` | Full impressum page (Markdown) |
| `core_tags` | Default tags for all articles (JSON array) |

**AI Prompts:**
| ID | Purpose |
|----|---------|
| `system_prompt` | Main instructions for article generation |
| `cta_prompt` | Instructions for generating article CTAs |
| `source_analysis` | How to analyze source URLs |
| `keyword_research` | How to research keywords |
| `image_prompt` | Style instructions for hero images |
| `filename_prompt` | How to name generated images |
| `alt_text_template` | Template for image alt text |

### Resetting the Database

Delete the `.astro` folder and restart the dev server:

```bash
rm -rf .astro
npm run dev
```

## Using the Editor

### Access the Editor

1. Go to [http://localhost:4321/editor](http://localhost:4321/editor)
2. Log in with your `EDITOR_ADMIN` and `EDITOR_PASSWORD` credentials

### Generate Tab

1. Enter a **URL** (to analyze and create an article from existing content)
   OR enter **keywords** (to research and write a fresh article)
2. Click **Generieren** - this creates both text and hero image
3. Preview the generated content
4. Click **Veröffentlichen** to save the article

### Settings Tab

Click the **Einstellungen** tab to customize:

**AI Prompts** - Edit the instructions that control AI generation:

- Change the writing style, tone, or requirements
- Modify image generation prompts
- Adjust CTA generation rules

**Website Settings** - Edit site content:

- Hero section text
- CTA links and styling
- Impressum content (Markdown supported)

Changes take effect immediately for new article generation.

## Project Structure

```
├── db/
│   ├── config.ts          # Database schema
│   └── seed.ts            # Default data
├── src/
│   ├── components/
│   │   └── Editor.tsx     # Main editor with Settings tab
│   ├── domain/            # DDD entities and value objects
│   ├── pages/
│   │   ├── api/           # API endpoints
│   │   ├── editor.astro   # Editor page
│   │   └── index.astro    # Homepage
│   └── services/
│       ├── ArticleService.ts      # Runtime article loading
│       ├── ContentGenerator.ts    # AI text generation
│       ├── ImageGenerator.ts      # AI image generation
│       └── PromptService.ts       # Database prompts access
└── PROJECT.md             # Detailed project description
```

## Commands

| Command            | Action                   |
| ------------------ | ------------------------ |
| `npm run dev`      | Start development server |
| `npm run build`    | Build for production     |
| `npm test`         | Run tests                |
| `npx tsc --noEmit` | Type check               |

## Production Deployment

### Environment Variables

```env
EDITOR_ADMIN="your-secure-admin"
EDITOR_PASSWORD="your-secure-password"
GOOGLE_GEMINI_API_KEY=your-gemini-api-key
ASTRO_DB_REMOTE_URL=libsql://your-db.turso.io
ASTRO_DB_APP_TOKEN=your-turso-token
```

### GitLab CI/CD with Docker

Set variables in **GitLab > Settings > CI/CD > Variables**. The pipeline builds a Docker image and deploys to your server. Articles persist via volume mount.

```yaml
# .gitlab-ci.yml uses these variables:
# EDITOR_ADMIN, EDITOR_PASSWORD, GOOGLE_GEMINI_API_KEY
# ASTRO_DB_REMOTE_URL, ASTRO_DB_APP_TOKEN
```

## Article Storage

Articles are stored in the filesystem, not the database:

```
nca-ai-cms-content/{YEAR}/{MONTH}/{SLUG}/
├── index.md      # Article content (Markdown + frontmatter)
└── hero.webp     # Generated hero image
```

This allows articles to appear immediately without rebuilding the site.

## License

MIT - Never Code Alone
