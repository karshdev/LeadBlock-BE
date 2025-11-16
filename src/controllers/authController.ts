import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/User';
import { generateToken } from '../utils/auth';
import { AppError } from '../middleware/errorHandler';
import * as yup from 'yup';

const loginSchema = yup.object().shape({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
});

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await loginSchema.validate(req.body, { abortEarly: false });
    const user = await UserModel.validateLogin(req.body);

    if (!user) {
      const error: AppError = new Error('Invalid username or password');
      error.statusCode = 401;
      return next(error);
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errorMessage = error.errors.join(', ');
      const err: AppError = new Error(errorMessage);
      err.statusCode = 400;
      return next(err);
    }
    next(error);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // User is attached by auth middleware
    const authReq = req as any;
    if (authReq.user) {
      res.status(200).json({
        success: true,
        data: {
          id: authReq.user.userId,
          username: authReq.user.username,
          role: authReq.user.role,
        },
      });
    } else {
      const error: AppError = new Error('User not found');
      error.statusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
};

