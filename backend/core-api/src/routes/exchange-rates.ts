import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

/**
 * Mid-market rates relative to USD (refreshed weekly; real-time rates require an FX data provider).
 * These are realistic reference values — production would query a live feed (e.g. Open Exchange Rates).
 */
const BASE_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.924,
  GBP: 0.792,
  JPY: 149.55,
  CAD: 1.362,
  AUD: 1.531,
  CHF: 0.891,
  CNY: 7.243,
  INR: 83.12,
  MXN: 17.15,
  BRL: 4.972,
  SGD: 1.342,
  HKD: 7.823,
  NOK: 10.545,
  SEK: 10.418,
  DKK: 6.894,
  NZD: 1.628,
  ZAR: 18.635,
  AED: 3.673,
  SAR: 3.751,
  KWD: 0.308,
  QAR: 3.641,
  THB: 35.12,
  MYR: 4.712,
  IDR: 15695.0,
};

export default async function exchangeRateRoutes(fastify: FastifyInstance) {
  // GET /api/exchange-rates?from=USD&to=EUR
  fastify.get(
    '/',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'Get exchange rate between two currencies',
        tags: ['Exchange Rates'],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          required: ['from', 'to'],
          properties: {
            from: { type: 'string', minLength: 3, maxLength: 3, description: 'Source currency ISO code' },
            to: { type: 'string', minLength: 3, maxLength: 3, description: 'Target currency ISO code' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  from: { type: 'string' },
                  to: { type: 'string' },
                  rate: { type: 'number' },
                  inverseRate: { type: 'number' },
                  fee: { type: 'number', description: 'Wire transfer fee percentage' },
                  updatedAt: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { from = 'USD', to = 'EUR' } = request.query as { from: string; to: string };

        const fromCode = from.toUpperCase();
        const toCode = to.toUpperCase();

        const fromRate = BASE_RATES[fromCode];
        const toRate = BASE_RATES[toCode];

        if (!fromRate) {
          return reply.status(400).send({
            success: false,
            error: { code: 'UNSUPPORTED_CURRENCY', message: `Currency '${fromCode}' is not supported` },
          });
        }

        if (!toRate) {
          return reply.status(400).send({
            success: false,
            error: { code: 'UNSUPPORTED_CURRENCY', message: `Currency '${toCode}' is not supported` },
          });
        }

        // Cross-rate via USD base
        const rate = toRate / fromRate;
        const inverseRate = fromRate / toRate;

        // Wire transfer fee: 0.5% for major currencies, 1% for others
        const majorCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF'];
        const fee = majorCurrencies.includes(toCode) ? 0.5 : 1.0;

        reply.send({
          success: true,
          data: {
            from: fromCode,
            to: toCode,
            rate: Number(rate.toFixed(6)),
            inverseRate: Number(inverseRate.toFixed(6)),
            fee,
            updatedAt: new Date().toISOString(),
          },
        });
      } catch (error) {
        fastify.log.error('Exchange rate error:', error);
        reply.status(500).send({
          success: false,
          error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch exchange rate' },
        });
      }
    }
  );

  // GET /api/exchange-rates/supported — list all supported currencies
  fastify.get(
    '/supported',
    {
      preHandler: [fastify.authenticate],
      schema: {
        description: 'List all supported currencies and their current rates vs USD',
        tags: ['Exchange Rates'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const currencies = Object.entries(BASE_RATES).map(([code, rate]) => ({
        code,
        rate,
        updatedAt: new Date().toISOString(),
      }));

      reply.send({ success: true, data: { base: 'USD', currencies } });
    }
  );
}
