import { Request, Response, NextFunction } from 'express';
import * as yup from 'yup';
import { CreateLeadDto, UpdateLeadDto } from '../types';
import { AppError } from './errorHandler';

const createLeadSchema = yup.object().shape({
  name: yup.string().required('Name is required').min(1, 'Name cannot be empty'),
  company: yup.string().required('Company is required').min(1, 'Company cannot be empty'),
  email: yup.string().required('Email is required').email('Invalid email address'),
  status: yup.string().oneOf(['active', 'inactive'], 'Status must be either "active" or "inactive"').required('Status is required'),
});

const updateLeadSchema = yup.object().shape({
  name: yup.string().min(1, 'Name cannot be empty').optional(),
  company: yup.string().min(1, 'Company cannot be empty').optional(),
  email: yup.string().email('Invalid email address').optional(),
  status: yup.string().oneOf(['active', 'inactive'], 'Status must be either "active" or "inactive"').optional(),
}).test('at-least-one-field', 'At least one field must be provided', (value) => {
  return value && Object.keys(value).length > 0;
});

export const validateCreateLead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await createLeadSchema.validate(req.body, { abortEarly: false });
    next();
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

export const validateUpdateLead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await updateLeadSchema.validate(req.body, { abortEarly: false });
    next();
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
