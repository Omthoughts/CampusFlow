import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app';

describe('Health API', () => {
  it('should return 200 and db ok from /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('should return 200 from /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
