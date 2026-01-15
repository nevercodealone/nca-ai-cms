function getEnvVariable(variable, defaultValue) {
  const value = process.env[variable];
  if (value) {
    return value;
  }
  console.error(`Missing required environment variable: ${variable}`);
  throw new Error(`Environment variable ${variable} is not set`);
}

export { getEnvVariable as g };
