import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/infrastructure/app.module';
import { DomainExceptionFilter } from './../src/infrastructure/filters/domain-exception.filter';
import { spawn, ChildProcess } from 'child_process';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';

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
        // Ignore error
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

  afterAll(async () => {
    if (app) await app.close();
    if (hcmMock) hcmMock.kill();
    // Give it a moment to release the file
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (existsSync(dbPath)) {
      try {
        unlinkSync(dbPath);
      } catch {
        // Ignore error
      }
    }
  });

  describe('Happy Path Flow', () => {
    it('Given a valid employee with enough balance, When a request is created and approved, Then it should be SYNCED in ExampleHR and deducted in HCM', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const syncRes = await request(app.getHttpServer())
        .post('/sync/batch')
        .send();
      expect(syncRes.status).toBe(200);

      // 1. Create Request
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const createRes = await request(app.getHttpServer())
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const requestId = createRes.body.id;

      // 2. Approve Request (Triggers Sync)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const approveRes = await request(app.getHttpServer())
        .patch(`/time-off/${String(requestId)}/approve`)
        .send({ managerId: 'MGR-001' });

      expect(approveRes.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(approveRes.body.status).toBe('SYNCED');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(approveRes.body.hcmRefId).toBeDefined();

      // 3. Verify Mock HCM balance deduction
      const hcmRes = await fetch(
        'http://localhost:3001/balances/EMP-001/LOC-001',
      );
      const hcmData = (await hcmRes.json()) as { balance: number };
      expect(hcmData.balance).toBe(20.5); // 25.5 - 5
    });
  });

  describe('Double-Spending Protection', () => {
    it('Given a balance of 10 days, When two requests of 6 days are made, Then the second should be rejected with 422', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await request(app.getHttpServer()).post('/sync/batch').send();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const res1 = await request(app.getHttpServer()).post('/time-off').send({
        employeeId: 'EMP-002',
        locationId: 'LOC-001',
        leaveTypeId: 'VACATION',
        daysRequested: 6,
        startDate: '2026-06-01',
        endDate: '2026-06-07',
      });
      expect(res1.status).toBe(201);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const res2 = await request(app.getHttpServer()).post('/time-off').send({
        employeeId: 'EMP-002',
        locationId: 'LOC-001',
        leaveTypeId: 'VACATION',
        daysRequested: 6,
        startDate: '2026-07-01',
        endDate: '2026-07-07',
      });

      expect(res2.status).toBe(422);
    });
  });

  describe('Idempotency Key Validation', () => {
    it('Given same idempotency key, Then HCM should only deduct balance once', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const createRes = await request(app.getHttpServer())
        .post('/time-off')
        .send({
          employeeId: 'EMP-001',
          locationId: 'LOC-001',
          leaveTypeId: 'VACATION',
          daysRequested: 1,
          startDate: '2026-08-01',
          endDate: '2026-08-02',
        });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const idempotencyKey = createRes.body.idempotencyKey;

      // Mock HCM direct calls
      const headers = {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': String(idempotencyKey),
      };
      const body = JSON.stringify({
        employeeId: 'EMP-001',
        locationId: 'LOC001',
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
