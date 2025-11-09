import { asyncHandler } from '../../../../infra/utils/errorHandling.js';
import { ROLES } from '../../../../domain/value-objects/Role.js';

export function createRegisterUserHandler(registerUserUseCase) {
  return asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName, roles } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: {
          message: 'Missing required fields: email, password, firstName, lastName',
          statusCode: 400
        }
      });
    }

    // Default to USER role if not specified
    const userRoles = roles && Array.isArray(roles) ? roles : [ROLES.USER];

    const user = await registerUserUseCase.execute({
      email,
      password,
      firstName,
      lastName,
      roles: userRoles
    });

    res.status(201).json({
      data: user,
      message: 'User registered successfully'
    });
  });
}
