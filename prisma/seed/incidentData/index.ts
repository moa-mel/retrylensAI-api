
export const INCIDENTS =[
  {
    title: 'Payment webhook',
    method: 'POST',
    path: '/webhooks/payment',
    statusCode: 500,
    requestId: 'req-demo-001',
    timestamp: '2026-10-24T09:58:00Z',
    headers: {
      'content-type': 'application/json',
      'x-webhook-signature': 'sha256=REDACTED',
    },
    payload: {
      event: 'payment.completed',
      data: { payment_id: 'pay-123', amount: 5000 },
    },
    responseBody: { error: 'Internal Server Error' },
    logs: [
      "TypeError: Cannot read properties of undefined (reading 'customer_id')",
      'at processPayment (payment.service.ts:42)',
    ],
    scenario: 'invalid-payload',
    replayVerified: false,
  },
  {
    title: 'Inventory callback',
    method: 'POST',
    path: '/webhooks/inventory',
    statusCode: 401,
    requestId: 'req-demo-002',
    timestamp: '2026-10-24T09:52:00Z',
    headers: {
      authorization: 'Bearer [REDACTED]',
      'content-type': 'application/json',
    },
    payload: {
      event: 'inventory.updated',
      data: { sku: 'sku-42', quantity: 17 },
    },
    responseBody: { error: 'Token expired' },
    logs: [
      'AuthGuard: JWT validation failed: exp claim is in the past',
    ],
    scenario: 'expired-token',
    replayVerified: false,
  },
  {
    title: 'Order event',
    method: 'POST',
    path: '/webhooks/order',
    statusCode: 200,
    requestId: 'req-demo-003',
    timestamp: '2026-10-24T09:48:00Z',
    headers: { 'content-type': 'application/json' },
    payload: {
      id: 'evt-777',
      event: 'order.created',
      data: { order_id: 'ord-9', total: 1200 },
    },
    responseBody: { ok: true },
    logs: [
      'Processed event evt-777 -> order ord-9 created',
      'Processed event evt-777 -> order ord-9 created',
      'WARN: duplicate order row detected for ord-9',
    ],
    scenario: 'duplicate-event',
    replayVerified: false,
  },
];
