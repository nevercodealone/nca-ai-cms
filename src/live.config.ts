import { defineLiveCollection, z } from 'astro:content';
import { articlesLoader } from './loaders/articles-loader';

export const articles = defineLiveCollection({
  loader: articlesLoader(),
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
