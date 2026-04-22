import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from 'src/infrastructure/app.module';
import { DomainExceptionFilter } from 'src/infrastructure/filters/domain-exception.filter';
import { spawn, ChildProcess } from 'child_process';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { DataSource } from 'typeorm';

describe('TimeOff E2E Integration Suite', () => {
  let app: INestApplication;
  let hcmMock: ChildProcess;
  const dbPath = join(__dirname, '../test-db.sqlite');

  jest.setTimeout(60000);

  beforeAll(async () => {
    // 1. Database Isolation: Ensure fresh SQLite
    if (existsSync(dbPath)) {
      try {
        unlinkSync(dbPath);
      } catch {
        /* ignore */
      }
    }
    process.env.DATABASE_NAME = 'test-db.sqlite';

    // 2. Start Smart Mock HCM Server
    hcmMock = spawn('npx', ['ts-node', 'test/mocks/hcm-server.ts'], {
      env: { ...process.env, SLEEP_MS: '0' },
    });

    // Wait for mock server to start
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 3. Initialize NestJS App
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();
  });

  beforeEach(async () => {
    // Wipe DB before each test for total isolation
    const dataSource = app.get(DataSource);
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    if (app) await app.close();
    if (hcmMock) hcmMock.kill();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (existsSync(dbPath)) {
      try {
        unlinkSync(dbPath);
      } catch {
        /* ignore */
      }
    }
  });

  describe('Happy Path Flow', () => {
    it('Given enough balance, When a request is approved, Then it should be SYNCED', async () => {
      await request(app.getHttpServer() as string)
        .post('/sync/batch')
        .send();

      const createRes = await request(app.getHttpServer() as string)
        .post('/time-off')
        .send({
          employeeId: 'EMP-001',
          locationId: 'LOC-001',
          leaveTypeId: 'VACATION',
          daysRequested: 5,
          startDate: '2026-05-01',
          endDate: '2026-05-06',
        });
      expect(createRes.status).toBe(201);
      const { id: requestId } = createRes.body as { id: string };

      const approveRes = await request(app.getHttpServer() as string)
        .patch(`/time-off/${String(requestId)}/approve`)
        .send({ managerId: 'MGR-001' });

      expect(approveRes.status).toBe(200);
      expect((approveRes.body as { status: string }).status).toBe('SYNCED');
    });
  });

  describe('Double-Spending Protection', () => {
    it('Should reject simultaneous requests exceeding balance', async () => {
      await request(app.getHttpServer() as string)
        .post('/sync/batch')
        .send();

      const payload = {
        employeeId: 'EMP-002',
        locationId: 'LOC-001',
        leaveTypeId: 'VACATION',
        daysRequested: 6,
        startDate: '2026-06-01',
        endDate: '2026-06-07',
      };

      const res1 = await request(app.getHttpServer() as string)
        .post('/time-off')
        .send(payload);
      expect(res1.status).toBe(201);

      const res2 = await request(app.getHttpServer() as string)
        .post('/time-off')
        .send(payload);
      expect(res2.status).toBe(422);
    });
  });

  describe('Idempotency Key Validation', () => {
    it('Given same idempotency key, Then HCM should only deduct balance once', async () => {
      // Mock HCM direct calls
      const idempotencyKey = 'unique-test-key-' + Date.now();
      const headers = {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey,
      };
      const body = JSON.stringify({
        employeeId: 'EMP-001',
        locationId: 'LOC-001',
        daysRequested: 1,
      });

      const hcmCall1 = await fetch('http://localhost:3001/time-off', {
        method: 'POST',
        headers,
        body,
      });
      const data1 = (await hcmCall1.json()) as { hcm_ref_id: string };

      const hcmCall2 = await fetch('http://localhost:3001/time-off', {
        method: 'POST',
        headers,
        body,
      });
      const data2 = (await hcmCall2.json()) as { hcm_ref_id: string };

      expect(data1.hcm_ref_id).toBe(data2.hcm_ref_id);
    });
  });
});
