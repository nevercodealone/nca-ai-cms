import { z } from 'zod';

const envSchema = z.object({
  GOOGLE_GEMINI_API_KEY: z.string().min(1, 'GOOGLE_GEMINI_API_KEY is required'),
  GOOGLE_GEMINI_MODELS: z.string().optional(),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  EDITOR_ADMIN: z.string().min(1, 'EDITOR_ADMIN is required'),
  EDITOR_PASSWORD: z.string().min(1, 'EDITOR_PASSWORD is required'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `${e.path}: ${e.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${errors}`);
  }

  return result.data;
}

export function getEnv(): Env {
  return validateEnv();
}
