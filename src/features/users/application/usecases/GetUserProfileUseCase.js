import { NotFoundError, UnauthorizedError } from '../../../../infra/utils/errorHandling.js';
import { UserProfile } from '../../../../domain/entities/UserProfile.js';

export class GetUserProfileUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ userId, requestingUserId }) {
    // Check if user is requesting their own profile
    if (userId !== requestingUserId) {
      throw new UnauthorizedError('You can only view your own profile');
    }

    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return new UserProfile({
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email.value,
      roles: user.roles.map(r => r.value),
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt
    });
  }
}
