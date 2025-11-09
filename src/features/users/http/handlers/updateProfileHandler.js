import { asyncHandler } from '../../../../infra/utils/errorHandling.js';

export function createUpdateProfileHandler(updateUserProfileUseCase) {
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

    const { firstName, lastName } = req.body;

    // Build updates object
    const updates = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: {
          message: 'No fields to update',
          statusCode: 400
        }
      });
    }

    const updatedUser = await updateUserProfileUseCase.execute({
      userId,
      requestingUserId: userId,
      updates
    });

    res.status(200).json({
      data: updatedUser,
      message: 'Profile updated successfully'
    });
  });
}
