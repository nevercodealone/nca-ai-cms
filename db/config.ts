import { defineDb, defineTable, column } from 'astro:db';

// Site settings (hero, imprint, CTA config)
const SiteSettings = defineTable({
  columns: {
    key: column.text({ primaryKey: true }),
    value: column.text(),
    updatedAt: column.date({ default: new Date() }),
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
  tables: { SiteSettings, Prompts },
});
