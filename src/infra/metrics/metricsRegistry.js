import { register, Counter, Histogram } from 'prom-client';

export class MetricsRegistry {
  constructor() {
    this.register = register;

    // User registration metrics
    this.usersRegisteredTotal = new Counter({
      name: 'users_registered_total',
      help: 'Total number of users registered',
      registers: [register]
    });

    // Login metrics
    this.userLoginAttemptsTotal = new Counter({
      name: 'user_login_attempts_total',
      help: 'Total number of login attempts',
      labelNames: ['result'],
      registers: [register]
    });

    // HTTP metrics
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'path', 'status'],
      registers: [register]
    });

    this.httpRequestDurationMs = new Histogram({
      name: 'http_request_duration_ms',
      help: 'HTTP request duration in milliseconds',
      labelNames: ['method', 'path', 'status'],
      buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
      registers: [register]
    });

    // Profile update metrics
    this.profileUpdatesTotal = new Counter({
      name: 'profile_updates_total',
      help: 'Total number of profile updates',
      registers: [register]
    });

    // Password change metrics
    this.passwordChangesTotal = new Counter({
      name: 'password_changes_total',
      help: 'Total number of password changes',
      labelNames: ['result'],
      registers: [register]
    });

    // Event publishing metrics
    this.eventsPublishedTotal = new Counter({
      name: 'events_published_total',
      help: 'Total number of events published',
      labelNames: ['subject'],
      registers: [register]
    });
  }

  recordUserRegistered() {
    this.usersRegisteredTotal.inc();
  }

  recordLoginAttempt(success) {
    this.userLoginAttemptsTotal.inc({ result: success ? 'success' : 'failure' });
  }

  recordHttpRequest(method, path, statusCode, durationMs) {
    this.httpRequestsTotal.inc({ method, path, status: statusCode });
    this.httpRequestDurationMs.observe({ method, path, status: statusCode }, durationMs);
  }

  recordProfileUpdate() {
    this.profileUpdatesTotal.inc();
  }

  recordPasswordChange(success) {
    this.passwordChangesTotal.inc({ result: success ? 'success' : 'failure' });
  }

  recordEventPublished(subject) {
    this.eventsPublishedTotal.inc({ subject });
  }

  async getMetrics() {
    return await this.register.metrics();
  }

  getContentType() {
    return this.register.contentType;
  }
}

export function createMetricsMiddleware(metricsRegistry) {
  return (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const path = req.route?.path || req.path;
      metricsRegistry.recordHttpRequest(req.method, path, res.statusCode, duration);
    });

    next();
  };
}
