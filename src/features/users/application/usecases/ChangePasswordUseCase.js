import { NotFoundError, UnauthorizedError } from '../../../../infra/utils/errorHandling.js';

export class ChangePasswordUseCase {
  constructor(userRepository, userDomainService, metricsRegistry) {
    this.userRepository = userRepository;
    this.userDomainService = userDomainService;
    this.metricsRegistry = metricsRegistry;
  }

  async execute({ userId, requestingUserId, currentPassword, newPassword }) {
    // Check if user is changing their own password
    if (userId !== requestingUserId) {
      throw new UnauthorizedError('You can only change your own password');
    }

    try {
      // Get user
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Change password using domain service
      const updatedUser = await this.userDomainService.changeUserPassword(
        user,
        currentPassword,
        newPassword
      );

      // Save updated user
      await this.userRepository.update(updatedUser.id, {
        passwordHash: updatedUser.passwordHash.value,
        updatedAt: updatedUser.updatedAt
      });

      // Record metrics
      this.metricsRegistry?.recordPasswordChange(true);

      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      this.metricsRegistry?.recordPasswordChange(false);
      throw error;
    }
  }
}
