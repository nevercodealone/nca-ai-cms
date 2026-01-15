import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getEnvVariable } from './envUtils';

describe('getEnvVariable', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns value from process.env', () => {
    process.env.TEST_VAR = 'test-value';
    expect(getEnvVariable('TEST_VAR')).toBe('test-value');
  });

  it('returns default value when variable is not set', () => {
    delete process.env.MISSING_VAR;
    expect(getEnvVariable('MISSING_VAR', 'default')).toBe('default');
  });

  it('throws error when variable is missing and no default', () => {
    delete process.env.REQUIRED_VAR;
    expect(() => getEnvVariable('REQUIRED_VAR')).toThrow(
      'Environment variable REQUIRED_VAR is not set'
    );
  });

  it('prefers process.env over default value', () => {
    process.env.PREF_VAR = 'from-env';
    expect(getEnvVariable('PREF_VAR', 'default')).toBe('from-env');
  });

  it('returns empty string if set to empty', () => {
    process.env.EMPTY_VAR = '';
    expect(getEnvVariable('EMPTY_VAR', 'default')).toBe('default');
  });
});
