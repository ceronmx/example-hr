import express, { Request, Response } from 'express';
import { randomUUID } from 'crypto';

const app = express();
app.use(express.json());

// In-memory state
const balances: Record<string, number> = {
  'EMP-001-LOC-001': 25.5,
  'EMP-002-LOC-001': 10.0,
};

const processedIdempotencyKeys: Map<string, string> = new Map();

// Fault Injection Configuration
const SLEEP_MS = Number(process.env.SLEEP_MS) || 0;
const ERROR_CHANCE = 0.0; // Temporarily disabled for baseline stability

app.use(async (req, res, next) => {
  // Simulate network latency
  if (SLEEP_MS > 0) {
    await new Promise((resolve) => setTimeout(resolve, SLEEP_MS));
  }

  // Random 500 Internal Server Error
  if (ERROR_CHANCE > 0 && Math.random() < ERROR_CHANCE) {
    console.log(
      `[HCM-MOCK] Injected Chaos: Returning 500 for ${req.method} ${req.url}`,
    );
    return res.status(500).json({
      error: 'HCM_INTERNAL_ERROR',
      message: 'Random fault injected by mock server',
    });
  }

  next();
});

// GET /balances - Returns all balances for batch sync
app.get('/balances', (req: Request, res: Response) => {
  const result = Object.entries(balances).map(([key, balance]) => {
    // Actually we used EMP-001-LOC-001. Let's fix the key format to be easier.
    // Or just parse it specifically.
    return {
      employeeId: key.split('-').slice(0, 2).join('-'),
      locationId: key.split('-').slice(2).join('-'),
      leaveTypeId: 'VACATION',
      balance,
    };
  });
  console.log(`[HCM-MOCK] GET All Balances: ${JSON.stringify(result)}`);
  res.json(result);
});

// GET /balances/:employeeId/:locationId
app.get('/balances/:employeeId/:locationId', (req: Request, res: Response) => {
  const { employeeId, locationId } = req.params;
  const key = `${String(employeeId)}-${String(locationId)}`;
  const balance = balances[key] ?? 20.0; // Default if not found

  console.log(`[HCM-MOCK] GET Balance for ${key}: ${balance}`);
  res.json({ balance });
});

// POST /time-off
app.post('/time-off', (req: Request, res: Response) => {
  const idempotencyKey = req.header('X-Idempotency-Key');
  const { employeeId, locationId, daysRequested } = req.body as {
    employeeId: string;
    locationId: string;
    daysRequested: number;
  };

  if (!idempotencyKey) {
    return res.status(400).json({ error: 'MISSING_IDEMPOTENCY_KEY' });
  }

  // Check Idempotency
  if (processedIdempotencyKeys.has(idempotencyKey)) {
    const existingRefId = processedIdempotencyKeys.get(idempotencyKey);
    console.log(
      `[HCM-MOCK] Idempotency Hit: ${idempotencyKey} -> ${existingRefId}`,
    );
    return res.json({ hcm_ref_id: existingRefId });
  }

  // Logic: Deduct balance
  const key = `${employeeId}-${locationId}`;
  const currentBalance = balances[key] ?? 20.0;

  if (currentBalance < daysRequested) {
    return res.status(422).json({ error: 'INSUFFICIENT_HCM_BALANCE' });
  }

  const newBalance = currentBalance - daysRequested;
  balances[key] = newBalance;

  const hcmRefId = `HCM-${randomUUID().substring(0, 8).toUpperCase()}`;
  processedIdempotencyKeys.set(idempotencyKey, hcmRefId);

  console.log(
    `[HCM-MOCK] Processed request. New balance for ${key}: ${newBalance}. Ref: ${hcmRefId}`,
  );
  res.status(201).json({ hcm_ref_id: hcmRefId });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(
    `[HCM-MOCK] Smart HCM Mock Server running on http://localhost:${PORT}`,
  );
});
