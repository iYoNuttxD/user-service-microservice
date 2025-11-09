import { asyncHandler } from '../../../../infra/utils/errorHandling.js';

export function createLoginHandler(loginUserUseCase) {
  return asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: {
          message: 'Missing required fields: email, password',
          statusCode: 400
        }
      });
    }

    const result = await loginUserUseCase.execute({ email, password });

    res.status(200).json({
      data: result,
      message: 'Login successful'
    });
  });
}
