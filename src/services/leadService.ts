import { Lead, CreateLeadDto, UpdateLeadDto } from '../types';
import { LeadModel } from '../models/Lead';

export interface PaginatedResult<T> {
  leads: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class LeadService {
  static getAllLeads(
    status?: 'active' | 'inactive',
    page: number = 1,
    limit: number = 10,
    search?: string
  ): PaginatedResult<Lead> {
    let leads = LeadModel.findAll(status);

    // Apply search filter
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      leads = leads.filter(
        (lead) =>
          lead.name.toLowerCase().includes(searchLower) ||
          lead.email.toLowerCase().includes(searchLower) ||
          lead.company.toLowerCase().includes(searchLower)
      );
    }

    // Calculate pagination
    const total = leads.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLeads = leads.slice(startIndex, endIndex);

    return {
      leads: paginatedLeads,
      page,
      limit,
      total,
      totalPages,
    };
  }

  static getLeadById(id: string): Lead | null {
    const lead = LeadModel.findById(id);
    return lead || null;
  }

  static createLead(data: CreateLeadDto): Lead {
    return LeadModel.create(data);
  }

  static updateLead(id: string, data: UpdateLeadDto): Lead | null {
    return LeadModel.update(id, data);
  }

  static deleteLead(id: string): boolean {
    return LeadModel.delete(id);
  }
}

