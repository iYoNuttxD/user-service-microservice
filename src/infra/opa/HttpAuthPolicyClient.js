import { IAuthPolicyClient } from '../../domain/ports/IAuthPolicyClient.js';
import { logger } from '../utils/logger.js';

export class HttpAuthPolicyClient extends IAuthPolicyClient {
  constructor(config = {}) {
    super();
    this.config = {
      url: config.url || process.env.OPA_URL || 'http://localhost:8181',
      policyPath: config.policyPath || process.env.OPA_POLICY_PATH || '/v1/data/users/allow',
      timeoutMs: config.timeoutMs || parseInt(process.env.OPA_TIMEOUT_MS) || 3000,
      failOpen: config.failOpen !== undefined ? config.failOpen : (process.env.OPA_FAIL_OPEN !== 'false')
    };
  }

  async isAllowed(input) {
    try {
      const url = `${this.config.url}${this.config.policyPath}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OPA responded with status ${response.status}`);
      }

      const result = await response.json();
      const allowed = result.result === true || result.result?.allow === true;

      logger.debug('OPA policy check', { input, allowed });

      return allowed;
    } catch (error) {
      logger.error('OPA policy check failed', { 
        error: error.message,
        failOpen: this.config.failOpen 
      });

      // Fail open/closed based on configuration
      if (this.config.failOpen) {
        logger.warn('OPA check failed, allowing request (fail-open mode)');
        return true;
      }

      return false;
    }
  }

  async checkPolicy({ user, action, resource, context = {} }) {
    const input = {
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles
      },
      action,
      resource,
      ...context
    };

    return await this.isAllowed(input);
  }

  async healthCheck() {
    try {
      const url = `${this.config.url}/health`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        return { status: 'connected', url: this.config.url };
      }

      return { status: 'error', message: `OPA responded with ${response.status}` };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }
}
