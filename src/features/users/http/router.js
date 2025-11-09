import { Router } from 'express';
import { createRegisterUserHandler } from './handlers/registerUserHandler.js';
import { createLoginHandler } from './handlers/loginHandler.js';
import { createGetProfileHandler } from './handlers/getProfileHandler.js';
import { createUpdateProfileHandler } from './handlers/updateProfileHandler.js';
import { createChangePasswordHandler } from './handlers/changePasswordHandler.js';

export function createUsersRouter(container) {
  const router = Router();

  // Get use cases and middleware from container
  const registerUserUseCase = container.registerUserUseCase;
  const loginUserUseCase = container.loginUserUseCase;
  const getUserProfileUseCase = container.getUserProfileUseCase;
  const updateUserProfileUseCase = container.updateUserProfileUseCase;
  const changePasswordUseCase = container.changePasswordUseCase;
  const authMiddleware = container.authMiddleware;

  // Public routes
  router.post('/register', createRegisterUserHandler(registerUserUseCase));
  router.post('/login', createLoginHandler(loginUserUseCase));

  // Protected routes (require JWT when enabled)
  router.get('/me', authMiddleware, createGetProfileHandler(getUserProfileUseCase));
  router.put('/me', authMiddleware, createUpdateProfileHandler(updateUserProfileUseCase));
  router.put('/me/password', authMiddleware, createChangePasswordHandler(changePasswordUseCase));

  return router;
}
