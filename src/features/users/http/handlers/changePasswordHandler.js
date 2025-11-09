import { asyncHandler } from '../../../../infra/utils/errorHandling.js';

export function createChangePasswordHandler(changePasswordUseCase) {
  return asyncHandler(async (req, res) => {
    // Get user ID from JWT
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          statusCode: 401
        }
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: {
          message: 'Missing required fields: currentPassword, newPassword',
          statusCode: 400
        }
      });
    }

    const result = await changePasswordUseCase.execute({
      userId,
      requestingUserId: userId,
      currentPassword,
      newPassword
    });

    res.status(200).json({
      data: result,
      message: 'Password changed successfully'
    });
  });
}
