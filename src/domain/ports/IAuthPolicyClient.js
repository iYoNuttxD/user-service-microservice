/**
 * Port for OPA authorization policy checks
 * To be implemented by infrastructure layer
 */
export class IAuthPolicyClient {
  async isAllowed(_input) {
    throw new Error('Method not implemented');
  }

  async checkPolicy({ user: _user, action: _action, resource: _resource, context: _context = {} }) {
    throw new Error('Method not implemented');
  }
}
