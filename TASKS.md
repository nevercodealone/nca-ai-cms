# NCA Content Marketing System - Development Tickets

## Epic 1: Project Setup & Infrastructure

### Ticket 1.1: Configure Astro Content Collections
**Priority:** High
**Effort:** S

- [ ] Define Content Collection schema in `src/content/config.ts`
- [ ] Implement frontmatter validation with Zod
- [ ] Create directory structure `src/content/{year}/{month}/`
- [ ] Generate TypeScript types for Article, SEOMetadata

**Acceptance Criteria:**
- Schema validates: title, description, date, tags, source
- Missing required fields throw build errors

---

### Ticket 1.2: Vitest Setup
**Priority:** High
**Effort:** S

- [ ] Install and configure Vitest
- [ ] Create test directory structure (`src/__tests__/`)
- [ ] Configure coverage reporter
- [ ] Add npm scripts: `test`, `test:watch`, `test:coverage`

**Acceptance Criteria:**
- `npm test` runs all tests
- Coverage report is generated

---

### Ticket 1.3: Environment & Secrets Setup
**Priority:** High
**Effort:** S

- [ ] Create `.env.example` with required variables
- [ ] Configure AI API key (OpenAI/Anthropic)
- [ ] Add `.env` to `.gitignore`
- [ ] Implement environment validation on startup

**Acceptance Criteria:**
- App does not start without valid API keys
- No secrets in repository

---

## Epic 2: Domain Layer (DDD)

### Ticket 2.1: Implement Article Entity
**Priority:** High
**Effort:** M

- [ ] Create `src/domain/entities/Article.ts`
- [ ] Properties: title, description, content, date, tags, source, slug
- [ ] Slug generation from title (kebab-case, handle umlauts)
- [ ] Unit tests for Article Entity

**Acceptance Criteria:**
```typescript
const article = new Article({ title: 'HTML Accessibility Grundlagen' });
expect(article.slug).toBe('html-accessibility-grundlagen');
```

---

### Ticket 2.2: Implement Value Objects
**Priority:** Medium
**Effort:** M

- [ ] `Slug` Value Object with validation
- [ ] `SEOMetadata` Value Object (title max 60, description max 155)
- [ ] `ContentBlock` Value Object for structured content
- [ ] Unit tests for all Value Objects

**Acceptance Criteria:**
- SEOMetadata throws error for too long title
- Slug only allows lowercase, numbers, hyphens

---

### Ticket 2.3: Implement Source Entity
**Priority:** Medium
**Effort:** S

- [ ] Create `src/domain/entities/Source.ts`
- [ ] URL validation
- [ ] Domain extraction (e.g., "developer.mozilla.org")
- [ ] Unit tests

**Acceptance Criteria:**
- Only HTTPS URLs accepted
- Invalid URLs throw error

---

## Epic 3: Content Generation Service

### Ticket 3.1: ContentGenerator Service Structure
**Priority:** High
**Effort:** M

- [ ] Create `src/services/ContentGenerator.ts`
- [ ] Define interface for AI provider
- [ ] Implement dependency injection for AI client
- [ ] Error handling & retry logic

**Acceptance Criteria:**
- Service is testable with mock AI client
- Errors are thrown cleanly

---

### Ticket 3.2: Source Content Fetcher
**Priority:** High
**Effort:** M

- [ ] Fetch URL content
- [ ] Convert HTML to Markdown/text
- [ ] Extract relevant content (main content area)
- [ ] Rate limiting for external requests

**Acceptance Criteria:**
- MDN pages are parsed correctly
- Timeouts are handled

---

### Ticket 3.3: AI Prompt Engineering
**Priority:** High
**Effort:** L

- [ ] Develop system prompt for German technical articles
- [ ] Integrate tonality instructions
- [ ] SEO optimization in prompt
- [ ] CTA integration for consulting services
- [ ] Prompt templates for different topics

**Acceptance Criteria:**
- Generated text is in German
- Text contains call-to-action
- Minimum 800 words

---

### Ticket 3.4: Integration Test with Real AI Service
**Priority:** High
**Effort:** M

- [ ] Integration test setup (separate test script)
- [ ] Test real AI API call
- [ ] Content validation with assertions
- [ ] CI integration (optional, has cost)

**Acceptance Criteria:**
```typescript
const result = await generator.generate(MDN_URL);
expect(result.content).toContain('Barrierefreiheit');
expect(result.content.length).toBeGreaterThan(800);
```

---

## Epic 4: File Writer Service

### Ticket 4.1: Implement FileWriter Service
**Priority:** High
**Effort:** M

- [ ] Create `src/services/FileWriter.ts`
- [ ] Frontmatter generation (YAML)
- [ ] Write Markdown file
- [ ] Auto-create directory (year/month)

**Acceptance Criteria:**
- File is saved in correct path
- Frontmatter is valid YAML

---

### Ticket 4.2: Filename Generation
**Priority:** Medium
**Effort:** S

- [ ] Generate slug from title
- [ ] Collision check (file already exists?)
- [ ] Suffix for duplicates (-2, -3, etc.)

**Acceptance Criteria:**
- No overwrite without warning
- Filenames are URL-safe

---

## Epic 5: Image Generation

### Ticket 5.1: ImageGenerator Service
**Priority:** Medium
**Effort:** L

- [ ] Create `src/services/ImageGenerator.ts`
- [ ] AI Image API integration (DALL-E / Stable Diffusion)
- [ ] Prompt generation from article title
- [ ] Image download and storage

**Acceptance Criteria:**
- Image saved as WebP
- Resolution: 1200x630px

---

### Ticket 5.2: Alt-Text Generation
**Priority:** Low
**Effort:** S

- [ ] Generate German alt-text
- [ ] Save alt-text in frontmatter
- [ ] Accessibility compliant

**Acceptance Criteria:**
- Alt-text describes image content
- Max 125 characters

---

## Epic 6: Editor Interface

### Ticket 6.1: Editor Route & Layout
**Priority:** High
**Effort:** M

- [ ] Create `/editor` route in Astro
- [ ] Basic layout with header
- [ ] React Island for interactive components
- [ ] Styling (Tailwind or CSS)

**Acceptance Criteria:**
- Route is accessible
- Basic layout is in place

---

### Ticket 6.2: URL Input Component
**Priority:** High
**Effort:** S

- [ ] Input field for source URL
- [ ] URL validation (client-side)
- [ ] Submit handler

**Acceptance Criteria:**
- Only valid URLs are accepted
- Errors are displayed

---

### Ticket 6.3: Topics Dropdown
**Priority:** Medium
**Effort:** S

- [ ] Dropdown with 22 accessibility topics
- [ ] Topic selection affects generation
- [ ] Multi-select optional

**Acceptance Criteria:**
- All topics from claude.md available
- Selection is passed to generator

---

### Ticket 6.4: Content Preview
**Priority:** High
**Effort:** M

- [ ] Markdown preview component
- [ ] Live preview of generated content
- [ ] Frontmatter display
- [ ] Scroll container for long text

**Acceptance Criteria:**
- Markdown renders correctly
- Code blocks have syntax highlighting

---

### Ticket 6.5: Action Buttons
**Priority:** High
**Effort:** M

- [ ] "Generate Text" button with loading state
- [ ] "Generate File" button (saves MD)
- [ ] "Regenerate" button
- [ ] "Save" button with success feedback

**Acceptance Criteria:**
- Loading spinner during generation
- Success/error messages are displayed

---

### Ticket 6.6: Server Actions for Editor
**Priority:** High
**Effort:** M

- [ ] Astro Server Action for text generation
- [ ] Server Action for file saving
- [ ] Error handling & response format
- [ ] CORS configuration if needed

**Acceptance Criteria:**
- Actions work without page reload
- Errors are returned to client

---

## Epic 7: Quality Assurance

### Ticket 7.1: Pre-commit Hooks
**Priority:** Medium
**Effort:** S

- [ ] Install Husky
- [ ] Configure lint-staged
- [ ] ESLint + Prettier on commit
- [ ] Unit tests on commit

**Acceptance Criteria:**
- Commit is blocked on lint errors
- Tests must be green

---

### Ticket 7.2: CI Pipeline
**Priority:** Medium
**Effort:** M

- [ ] Create GitHub Actions workflow
- [ ] Lint, type-check, unit tests
- [ ] Build validation
- [ ] Optional: Integration tests

**Acceptance Criteria:**
- PR cannot be merged on failure
- Build status is displayed

---

### Ticket 7.3: E2E Tests for Editor
**Priority:** Low
**Effort:** L

- [ ] Playwright setup
- [ ] Test editor flow (enter URL → generate → save)
- [ ] Test error states

**Acceptance Criteria:**
- Happy path works
- Errors are displayed correctly

---

## Prioritized Order

### Sprint 1: Foundation
1. Ticket 1.1: Astro Content Collections
2. Ticket 1.2: Vitest Setup
3. Ticket 1.3: Environment Setup
4. Ticket 2.1: Article Entity

### Sprint 2: Core Services
5. Ticket 2.2: Value Objects
6. Ticket 3.1: ContentGenerator Structure
7. Ticket 3.2: Source Content Fetcher
8. Ticket 3.3: AI Prompt Engineering

### Sprint 3: File Operations
9. Ticket 4.1: FileWriter Service
10. Ticket 3.4: Integration Tests
11. Ticket 4.2: Filename Generation

### Sprint 4: Editor UI
12. Ticket 6.1: Editor Route
13. Ticket 6.2: URL Input
14. Ticket 6.4: Content Preview
15. Ticket 6.5: Action Buttons
16. Ticket 6.6: Server Actions

### Sprint 5: Polish & QA
17. Ticket 6.3: Topics Dropdown
18. Ticket 7.1: Pre-commit Hooks
19. Ticket 7.2: CI Pipeline
20. Ticket 5.1: ImageGenerator (optional)

---

*Created: 2025-12-07*
