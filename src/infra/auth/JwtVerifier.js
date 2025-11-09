import * as jose from 'jose';
import { logger } from '../utils/logger.js';
import { UnauthorizedError } from '../utils/errorHandling.js';

export class JwtVerifier {
  constructor(config = {}) {
    this.config = {
      issuer: config.issuer || process.env.AUTH_JWT_ISSUER || 'user-service',
      audience: config.audience || process.env.AUTH_JWT_AUDIENCE || 'microservices',
      secret: config.secret || process.env.AUTH_JWT_SECRET,
      jwksUri: config.jwksUri || process.env.AUTH_JWKS_URI
    };

    this.jwks = null;

    if (this.config.jwksUri) {
      this.jwks = jose.createRemoteJWKSet(new URL(this.config.jwksUri));
    }
  }

  async verify(token) {
    try {
      let payload;

      if (this.jwks) {
        // Verify using JWKS
        const { payload: p } = await jose.jwtVerify(token, this.jwks, {
          issuer: this.config.issuer,
          audience: this.config.audience
        });
        payload = p;
      } else if (this.config.secret) {
        // Verify using shared secret
        const secret = new TextEncoder().encode(this.config.secret);
        const { payload: p } = await jose.jwtVerify(token, secret, {
          issuer: this.config.issuer,
          audience: this.config.audience
        });
        payload = p;
      } else {
        throw new Error('No JWT verification method configured');
      }

      logger.debug('JWT token verified', { userId: payload.sub });

      return {
        userId: payload.sub,
        email: payload.email,
        roles: payload.roles || []
      };
    } catch (error) {
      logger.error('JWT verification failed', { error: error.message });
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
}

export function createAuthMiddleware(jwtVerifier) {
  return async (req, res, next) => {
    const jwtRequired = process.env.AUTH_JWT_REQUIRED !== 'false';

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      if (jwtRequired) {
        return next(new UnauthorizedError('Authorization header missing'));
      }
      return next();
    }

    if (!authHeader.startsWith('Bearer ')) {
      return next(new UnauthorizedError('Invalid authorization header format'));
    }

    const token = authHeader.substring(7);

    try {
      const decoded = await jwtVerifier.verify(token);
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
}
