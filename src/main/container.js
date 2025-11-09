import { createMongoClient } from '../infra/db/mongoClient.js';
import { MongoUserRepository } from '../infra/repositories/MongoUserRepository.js';
import { BcryptPasswordHasher } from '../infra/crypto/BcryptPasswordHasher.js';
import { NatsEventPublisher } from '../infra/messaging/NatsEventPublisher.js';
import { HttpAuthPolicyClient } from '../infra/opa/HttpAuthPolicyClient.js';
import { JwtIssuer } from '../infra/auth/JwtIssuer.js';
import { JwtVerifier, createAuthMiddleware } from '../infra/auth/JwtVerifier.js';
import { MetricsRegistry } from '../infra/metrics/metricsRegistry.js';
import { UserDomainService } from '../domain/services/UserDomainService.js';
import { RegisterUserUseCase } from '../features/users/application/usecases/RegisterUserUseCase.js';
import { LoginUserUseCase } from '../features/users/application/usecases/LoginUserUseCase.js';
import { GetUserProfileUseCase } from '../features/users/application/usecases/GetUserProfileUseCase.js';
import { UpdateUserProfileUseCase } from '../features/users/application/usecases/UpdateUserProfileUseCase.js';
import { ChangePasswordUseCase } from '../features/users/application/usecases/ChangePasswordUseCase.js';

export class Container {
  constructor() {
    this._instances = {};
  }

  // Infrastructure
  get mongoClient() {
    if (!this._instances.mongoClient) {
      this._instances.mongoClient = createMongoClient();
    }
    return this._instances.mongoClient;
  }

  get userRepository() {
    if (!this._instances.userRepository) {
      this._instances.userRepository = new MongoUserRepository();
    }
    return this._instances.userRepository;
  }

  get passwordHasher() {
    if (!this._instances.passwordHasher) {
      this._instances.passwordHasher = new BcryptPasswordHasher();
    }
    return this._instances.passwordHasher;
  }

  get eventPublisher() {
    if (!this._instances.eventPublisher) {
      this._instances.eventPublisher = new NatsEventPublisher();
    }
    return this._instances.eventPublisher;
  }

  get authPolicyClient() {
    if (!this._instances.authPolicyClient) {
      this._instances.authPolicyClient = new HttpAuthPolicyClient();
    }
    return this._instances.authPolicyClient;
  }

  get jwtIssuer() {
    if (!this._instances.jwtIssuer) {
      this._instances.jwtIssuer = new JwtIssuer();
    }
    return this._instances.jwtIssuer;
  }

  get jwtVerifier() {
    if (!this._instances.jwtVerifier) {
      this._instances.jwtVerifier = new JwtVerifier();
    }
    return this._instances.jwtVerifier;
  }

  get metricsRegistry() {
    if (!this._instances.metricsRegistry) {
      this._instances.metricsRegistry = new MetricsRegistry();
    }
    return this._instances.metricsRegistry;
  }

  // Domain Services
  get userDomainService() {
    if (!this._instances.userDomainService) {
      this._instances.userDomainService = new UserDomainService(this.passwordHasher);
    }
    return this._instances.userDomainService;
  }

  // Use Cases
  get registerUserUseCase() {
    if (!this._instances.registerUserUseCase) {
      this._instances.registerUserUseCase = new RegisterUserUseCase(
        this.userRepository,
        this.userDomainService,
        this.eventPublisher,
        this.metricsRegistry
      );
    }
    return this._instances.registerUserUseCase;
  }

  get loginUserUseCase() {
    if (!this._instances.loginUserUseCase) {
      this._instances.loginUserUseCase = new LoginUserUseCase(
        this.userRepository,
        this.userDomainService,
        this.jwtIssuer,
        this.metricsRegistry
      );
    }
    return this._instances.loginUserUseCase;
  }

  get getUserProfileUseCase() {
    if (!this._instances.getUserProfileUseCase) {
      this._instances.getUserProfileUseCase = new GetUserProfileUseCase(
        this.userRepository
      );
    }
    return this._instances.getUserProfileUseCase;
  }

  get updateUserProfileUseCase() {
    if (!this._instances.updateUserProfileUseCase) {
      this._instances.updateUserProfileUseCase = new UpdateUserProfileUseCase(
        this.userRepository,
        this.userDomainService,
        this.eventPublisher,
        this.metricsRegistry
      );
    }
    return this._instances.updateUserProfileUseCase;
  }

  get changePasswordUseCase() {
    if (!this._instances.changePasswordUseCase) {
      this._instances.changePasswordUseCase = new ChangePasswordUseCase(
        this.userRepository,
        this.userDomainService,
        this.metricsRegistry
      );
    }
    return this._instances.changePasswordUseCase;
  }

  // Middleware
  get authMiddleware() {
    if (!this._instances.authMiddleware) {
      this._instances.authMiddleware = createAuthMiddleware(this.jwtVerifier);
    }
    return this._instances.authMiddleware;
  }
}

export function createContainer() {
  return new Container();
}
