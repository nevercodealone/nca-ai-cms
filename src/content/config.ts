import { defineCollection, z } from 'astro:content';

const articlesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(60, 'Title must be max 60 characters for SEO'),
    description: z
      .string()
      .max(155, 'Description must be max 155 characters for SEO'),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    source: z.string().url('Source must be a valid URL'),
    image: z.string().optional(),
    imageAlt: z.string().max(125).optional(),
  }),
});

export const collections = {
  articles: articlesCollection,
};
