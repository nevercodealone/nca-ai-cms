export function getEnvVariable(
  variable: string,
  defaultValue?: string
): string {
  // Try process.env first (Node.js / SSR)
  const value = process.env[variable];

  if (value) {
    return value;
  }

  // Return default if provided
  if (defaultValue !== undefined) {
    return defaultValue;
  }

  // Throw if required variable is missing
  console.error(`Missing required environment variable: ${variable}`);
  throw new Error(`Environment variable ${variable} is not set`);
}
