import { defineDb, defineTable, column } from 'astro:db';

// Site settings (hero, imprint, CTA config)
const SiteSettings = defineTable({
  columns: {
    key: column.text({ primaryKey: true }),
    value: column.text(),
    updatedAt: column.date({ default: new Date() }),
  },
});

// Scheduled posts for content planner
const ScheduledPosts = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    input: column.text(),
    inputType: column.text(), // 'url' | 'keywords'
    scheduledDate: column.date(),
    status: column.text({ default: 'pending' }), // 'pending' | 'generated' | 'published'
    generatedTitle: column.text({ optional: true }),
    generatedDescription: column.text({ optional: true }),
    generatedContent: column.text({ optional: true }),
    generatedTags: column.text({ optional: true }), // JSON string
    generatedImageData: column.text({ optional: true }), // base64 webp
    generatedImageAlt: column.text({ optional: true }),
    publishedPath: column.text({ optional: true }),
    createdAt: column.date({ default: new Date() }),
  },
});

// AI Prompts (editable)
const Prompts = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    name: column.text(),
    category: column.text(), // 'content' | 'image' | 'analysis'
    promptText: column.text(),
    updatedAt: column.date({ default: new Date() }),
  },
});

export default defineDb({
  tables: { SiteSettings, Prompts, ScheduledPosts },
});
