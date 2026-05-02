import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { Server } from 'http';
import { createTestApp } from './helpers/create-test-app';

const AMENITY_1_ID = 1;
const AMENITY_UNKNOWN_ID = 9999;
const USER_97_ID = 97;
const USER_UNKNOWN_ID = 88888;
const DATE_2020_06_20 = 1592611200000;
const TEST_USER = `e2e_test_${Date.now()}`;
const TEST_PASS = 'testpassword123';

describe('Reservations API (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let bearerToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── Health ────────────────────────────────────────────────────────────────

  describe('GET /health', () => {
    it('returns 200 with status ok', async () => {
      const { status, body } = await request(server).get('/health');
      expect(status).toBe(200);
      expect(body).toEqual({ status: 'ok' });
    });
  });

  // ─── Amenity reservations ──────────────────────────────────────────────────

  describe('GET /amenities/:id/reservations', () => {
    it('returns 200 with reservations for known amenity and date', async () => {
      const { status, body } = await request(server)
        .get(`/amenities/${AMENITY_1_ID}/reservations`)
        .query({ date: DATE_2020_06_20 });

      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);

      const first = body[0] as Record<string, unknown>;
      expect(first).toMatchObject({
        reservationId: expect.any(Number),
        userId: expect.any(Number),
        startTime: expect.stringMatching(/^\d{2}:\d{2}$/),
        duration: expect.any(Number),
        amenityName: 'Mitel Networks Corporation',
      });
    });

    it('returns sorted ascending by startTime', async () => {
      const { body } = await request(server)
        .get(`/amenities/${AMENITY_1_ID}/reservations`)
        .query({ date: DATE_2020_06_20 });

      const times = (body as Array<{ startTime: string }>).map(
        (r) => r.startTime,
      );
      expect(times).toEqual([...times].sort());
    });

    it('returns 200 empty array for known amenity with no reservations on date', async () => {
      const { status, body } = await request(server)
        .get(`/amenities/${AMENITY_1_ID}/reservations`)
        .query({ date: 1000000000000 }); // 2001 — no reservations

      expect(status).toBe(200);
      expect(body).toEqual([]);
    });

    it('returns 404 for unknown amenity', async () => {
      const { status, body } = await request(server)
        .get(`/amenities/${AMENITY_UNKNOWN_ID}/reservations`)
        .query({ date: DATE_2020_06_20 });

      expect(status).toBe(404);
      expect((body as { message: string }).message).toContain('not found');
    });

    it('returns 400 when date is missing', async () => {
      const { status } = await request(server).get(
        `/amenities/${AMENITY_1_ID}/reservations`,
      );
      expect(status).toBe(400);
    });

    it('returns 400 for non-numeric amenity id', async () => {
      const { status } = await request(server)
        .get('/amenities/abc/reservations')
        .query({ date: DATE_2020_06_20 });
      expect(status).toBe(400);
    });

    it('normalizes mid-day timestamp to same day', async () => {
      const midDay = DATE_2020_06_20 + 12 * 60 * 60 * 1000;
      const { body: bodyMid } = await request(server)
        .get(`/amenities/${AMENITY_1_ID}/reservations`)
        .query({ date: midDay });

      const { body: bodyStart } = await request(server)
        .get(`/amenities/${AMENITY_1_ID}/reservations`)
        .query({ date: DATE_2020_06_20 });

      expect(bodyMid).toEqual(bodyStart);
    });
  });

  // ─── User reservations ─────────────────────────────────────────────────────

  describe('GET /users/:id/reservations', () => {
    it('returns 200 with reservations grouped by day', async () => {
      const { status, body } = await request(server).get(
        `/users/${USER_97_ID}/reservations`,
      );

      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);

      const day = (body as Array<{ date: number; reservations: unknown[] }>)[0];
      expect(typeof day?.date).toBe('number');
      expect(Array.isArray(day?.reservations)).toBe(true);
      expect(day?.reservations[0]).toMatchObject({
        reservationId: expect.any(Number),
        amenityId: expect.any(Number),
        amenityName: expect.any(String),
        startTime: expect.stringMatching(/^\d{2}:\d{2}$/),
        duration: expect.any(Number),
      });
    });

    it('days are sorted ascending', async () => {
      const { body } = await request(server).get(
        `/users/${USER_97_ID}/reservations`,
      );
      const dates = (body as Array<{ date: number }>).map((d) => d.date);
      expect(dates).toEqual([...dates].sort((a, b) => a - b));
    });

    it('returns 200 empty array for unknown user (no existence leak)', async () => {
      const { status, body } = await request(server).get(
        `/users/${USER_UNKNOWN_ID}/reservations`,
      );
      expect(status).toBe(200);
      expect(body).toEqual([]);
    });

    it('returns 400 for non-numeric user id', async () => {
      const { status } = await request(server).get('/users/abc/reservations');
      expect(status).toBe(400);
    });
  });

  // ─── Auth ──────────────────────────────────────────────────────────────────

  describe('POST /auth/register', () => {
    it('returns 201 with success body for new user', async () => {
      const { status, body } = await request(server)
        .post('/auth/register')
        .send({ username: TEST_USER, password: TEST_PASS });
      expect(status).toBe(201);
      expect((body as { success: boolean }).success).toBe(true);
      expect(typeof (body as { message: string }).message).toBe('string');
    });

    it('returns 409 for duplicate username', async () => {
      const { status, body } = await request(server)
        .post('/auth/register')
        .send({ username: TEST_USER, password: TEST_PASS });
      expect(status).toBe(409);
      expect((body as { message: string }).message).toContain('already taken');
    });

    it('returns 400 when username is too short', async () => {
      const { status } = await request(server)
        .post('/auth/register')
        .send({ username: 'ab', password: TEST_PASS });
      expect(status).toBe(400);
    });

    it('returns 400 when password is too short', async () => {
      const { status } = await request(server)
        .post('/auth/register')
        .send({ username: 'validuser99', password: 'short' });
      expect(status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('returns 200 with accessToken for valid credentials', async () => {
      const { status, body } = await request(server)
        .post('/auth/login')
        .send({ username: TEST_USER, password: TEST_PASS });

      expect(status).toBe(200);
      expect(typeof (body as { accessToken: string }).accessToken).toBe(
        'string',
      );
      expect(
        (body as { accessToken: string }).accessToken.length,
      ).toBeGreaterThan(20);
      bearerToken = (body as { accessToken: string }).accessToken;
    });

    it('returns 401 for wrong password', async () => {
      const { status } = await request(server)
        .post('/auth/login')
        .send({ username: TEST_USER, password: 'wrongpassword' });
      expect(status).toBe(401);
    });

    it('returns 401 for unknown user', async () => {
      const { status } = await request(server)
        .post('/auth/login')
        .send({ username: 'doesnotexist99', password: TEST_PASS });
      expect(status).toBe(401);
    });
  });

  // ─── CSV parse ─────────────────────────────────────────────────────────────

  describe('POST /csv/parse', () => {
    it('returns 401 without token', async () => {
      const { status } = await request(server)
        .post('/csv/parse')
        .attach('file', Buffer.from('id,name\n1,Gym'), {
          filename: 'test.csv',
          contentType: 'text/csv',
        });
      expect(status).toBe(401);
    });

    it('returns 200 with parsed rows for comma CSV', async () => {
      const csv = 'id,name\n1,Gym\n2,Pool';
      const { status, body } = await request(server)
        .post('/csv/parse')
        .set('Authorization', `Bearer ${bearerToken}`)
        .attach('file', Buffer.from(csv), {
          filename: 'test.csv',
          contentType: 'text/csv',
        });

      expect(status).toBe(200);
      expect(body).toEqual([
        { id: '1', name: 'Gym' },
        { id: '2', name: 'Pool' },
      ]);
    });

    it('returns 200 with parsed rows for semicolon CSV', async () => {
      const csv = 'id;name\n1;Gym\n2;Pool';
      const { status, body } = await request(server)
        .post('/csv/parse')
        .set('Authorization', `Bearer ${bearerToken}`)
        .attach('file', Buffer.from(csv), {
          filename: 'test.csv',
          contentType: 'text/csv',
        });

      expect(status).toBe(200);
      expect(body).toHaveLength(2);
    });

    it('returns 400 when no file is sent', async () => {
      const { status } = await request(server)
        .post('/csv/parse')
        .set('Authorization', `Bearer ${bearerToken}`);
      expect(status).toBe(400);
    });

    it('returns 415 for wrong MIME type', async () => {
      const { status } = await request(server)
        .post('/csv/parse')
        .set('Authorization', `Bearer ${bearerToken}`)
        .attach('file', Buffer.from('{"key":"value"}'), {
          filename: 'data.json',
          contentType: 'application/json',
        });
      expect(status).toBe(415);
    });
  });
});
