import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createUsersRouter } from '../features/users/http/router.js';
import { errorHandler } from '../infra/utils/errorHandling.js';
import { logger } from '../infra/utils/logger.js';
import { createMetricsMiddleware } from '../infra/metrics/metricsRegistry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function createApp(container) {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS
  const corsOrigin = process.env.CORS_ORIGIN || '*';
  app.use(cors({
    origin: corsOrigin === '*' ? '*' : corsOrigin.split(','),
    credentials: true
  }));

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Correlation ID middleware
  app.use((req, res, next) => {
    req.correlationId = req.headers['x-correlation-id'] || uuidv4();
    res.setHeader('X-Correlation-Id', req.correlationId);
    next();
  });

  // Request logging
  app.use((req, res, next) => {
    logger.info('Incoming request', {
      method: req.method,
      path: req.path,
      correlationId: req.correlationId
    });
    next();
  });

  // Metrics middleware
  app.use(createMetricsMiddleware(container.metricsRegistry));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later'
  });
  app.use(limiter);

  // API version
  const apiVersion = process.env.API_VERSION || 'v1';

  // Health check
  app.get(`/api/${apiVersion}/health`, async (req, res) => {
    const mongoHealth = await container.mongoClient.healthCheck();
    const natsHealth = await container.eventPublisher.healthCheck();

    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        mongodb: mongoHealth,
        nats: natsHealth
      }
    };

    const isHealthy = mongoHealth.status === 'connected';
    res.status(isHealthy ? 200 : 503).json(health);
  });

  // Metrics endpoint
  app.get(`/api/${apiVersion}/metrics`, async (req, res) => {
    if (process.env.ENABLE_METRICS !== 'false') {
      res.set('Content-Type', container.metricsRegistry.getContentType());
      res.send(await container.metricsRegistry.getMetrics());
    } else {
      res.status(404).json({ error: 'Metrics endpoint disabled' });
    }
  });

  // Swagger documentation
  if (process.env.ENABLE_SWAGGER !== 'false') {
    try {
      const openapiPath = join(__dirname, '../../docs/openapi.yaml');
      const openapiContent = readFileSync(openapiPath, 'utf8');
      const openapiSpec = YAML.parse(openapiContent);

      app.use('/api-docs', swaggerUi.serve);
      app.get('/api-docs', swaggerUi.setup(openapiSpec));
      app.get('/api-docs/openapi.yaml', (req, res) => {
        res.setHeader('Content-Type', 'text/yaml');
        res.send(openapiContent);
      });
    } catch (error) {
      logger.warn('Failed to load OpenAPI spec, serving fallback', { error: error.message });
      
      // Fallback: serve a basic JSON response
      app.get('/api-docs', (req, res) => {
        res.json({
          info: {
            title: 'User Service API',
            version: '1.0.0',
            description: 'OpenAPI specification not available'
          },
          paths: {}
        });
      });
    }
  }

  // API routes
  app.use(`/api/${apiVersion}/users`, createUsersRouter(container));

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: {
        message: 'Route not found',
        statusCode: 404,
        path: req.path
      }
    });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
