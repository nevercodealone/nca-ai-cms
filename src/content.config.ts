import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Define articles to prevent auto-generation - but use live collection at runtime
// This loader won't find anything since we use index.md in folders
const articles = defineCollection({
  loader: glob({ pattern: '**/index.md', base: './nca-ai-cms-content' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    createdAt: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
  }),
});

export const collections = { articles };
