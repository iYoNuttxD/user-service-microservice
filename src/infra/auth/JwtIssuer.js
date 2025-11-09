import * as jose from 'jose';
import { logger } from '../utils/logger.js';

export class JwtIssuer {
  constructor(config = {}) {
    this.config = {
      issuer: config.issuer || process.env.AUTH_JWT_ISSUER || 'user-service',
      audience: config.audience || process.env.AUTH_JWT_AUDIENCE || 'microservices',
      expiresIn: config.expiresIn || process.env.AUTH_JWT_EXPIRES_IN || '1h',
      secret: config.secret || process.env.AUTH_JWT_SECRET
    };

    if (!this.config.secret) {
      logger.warn('JWT secret not configured, tokens cannot be issued');
    }
  }

  async issueToken(user) {
    if (!this.config.secret) {
      throw new Error('JWT secret not configured');
    }

    try {
      const secret = new TextEncoder().encode(this.config.secret);

      const payload = {
        sub: user.id,
        email: user.email.value || user.email,
        roles: user.roles.map(r => (typeof r === 'string' ? r : r.value)),
        iss: this.config.issuer,
        aud: this.config.audience
      };

      const token = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(this.config.expiresIn)
        .sign(secret);

      logger.debug('JWT token issued', { userId: user.id });

      return token;
    } catch (error) {
      logger.error('Failed to issue JWT token', { error: error.message });
      throw error;
    }
  }

  getExpiresIn() {
    return this.config.expiresIn;
  }
}
