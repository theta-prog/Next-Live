import { build } from '../../index.js';

export async function createTestApp(opts: { mockGoogle?: boolean; skipDb?: boolean } = {}) {
  if (opts.mockGoogle) process.env.MOCK_GOOGLE = 'true';
  if (opts.skipDb) process.env.SKIP_DB = 'true';
  process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test_secret';
  const app = await build();
  return app;
}
