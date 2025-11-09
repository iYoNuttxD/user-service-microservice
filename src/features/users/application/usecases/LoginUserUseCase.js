import { UnauthorizedError } from '../../../../infra/utils/errorHandling.js';

export class LoginUserUseCase {
  constructor(userRepository, userDomainService, jwtIssuer, metricsRegistry) {
    this.userRepository = userRepository;
    this.userDomainService = userDomainService;
    this.jwtIssuer = jwtIssuer;
    this.metricsRegistry = metricsRegistry;
  }

  async execute({ email, password }) {
    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(email);
      
      if (!user) {
        this.metricsRegistry?.recordLoginAttempt(false);
        throw new UnauthorizedError('Invalid credentials');
      }

      // Authenticate user using domain service
      const authenticatedUser = await this.userDomainService.authenticateUser(user, password);

      // Update last login time
      await this.userRepository.update(authenticatedUser.id, {
        lastLoginAt: authenticatedUser.lastLoginAt
      });

      // Issue JWT token
      const token = await this.jwtIssuer.issueToken(authenticatedUser);

      // Record metrics
      this.metricsRegistry?.recordLoginAttempt(true);

      return {
        token,
        expiresIn: this.jwtIssuer.getExpiresIn(),
        user: authenticatedUser.toPublic()
      };
    } catch (error) {
      this.metricsRegistry?.recordLoginAttempt(false);
      throw error;
    }
  }
}
