/**
 * Port for OPA authorization policy checks
 * To be implemented by infrastructure layer
 */
export class IAuthPolicyClient {
  async isAllowed(input) {
    throw new Error('Method not implemented');
  }

  async checkPolicy({ user, action, resource, context = {} }) {
    throw new Error('Method not implemented');
  }
}
