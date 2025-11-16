import { Request, Response, NextFunction } from 'express';
import { LeadService } from '../services/leadService';
import { AppError } from '../middleware/errorHandler';

export const getAllLeads = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const status = req.query.status as 'active' | 'inactive' | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;

    const result = LeadService.getAllLeads(status, page, limit, search);
    res.status(200).json({
      success: true,
      data: result.leads,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const lead = LeadService.getLeadById(id);

    if (!lead) {
      const error: AppError = new Error(`Lead with id ${id} not found`);
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

export const createLead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = LeadService.createLead(req.body);
    res.status(201).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const lead = LeadService.updateLead(id, req.body);

    if (!lead) {
      const error: AppError = new Error(`Lead with id ${id} not found`);
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = LeadService.deleteLead(id);

    if (!deleted) {
      const error: AppError = new Error(`Lead with id ${id} not found`);
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

