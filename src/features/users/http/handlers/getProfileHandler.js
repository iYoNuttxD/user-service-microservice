import { asyncHandler } from '../../../../infra/utils/errorHandling.js';

export function createGetProfileHandler(getUserProfileUseCase) {
  return asyncHandler(async (req, res) => {
    // Get user ID from JWT or use 'me' as identifier
    const userId = req.user?.userId || req.params.userId;

    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          statusCode: 401
        }
      });
    }

    const profile = await getUserProfileUseCase.execute({
      userId,
      requestingUserId: userId
    });

    res.status(200).json({
      data: profile,
      message: 'Profile retrieved successfully'
    });
  });
}
