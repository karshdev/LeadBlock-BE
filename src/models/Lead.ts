import { Lead, CreateLeadDto, UpdateLeadDto } from '../types';
import { readLeads, writeLeads } from '../utils/fileStorage';
import { v4 as uuidv4 } from 'uuid';

export class LeadModel {
  static findAll(status?: 'active' | 'inactive'): Lead[] {
    const leads = readLeads();
    if (status) {
      return leads.filter(lead => lead.status === status);
    }
    return leads;
  }

  static findById(id: string): Lead | undefined {
    const leads = readLeads();
    return leads.find(lead => lead.id === id);
  }

  static create(data: CreateLeadDto): Lead {
    const leads = readLeads();
    const now = new Date().toISOString();
    const newLead: Lead = {
      id: uuidv4(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    leads.push(newLead);
    writeLeads(leads);
    return newLead;
  }

  static update(id: string, data: UpdateLeadDto): Lead | null {
    const leads = readLeads();
    const index = leads.findIndex(lead => lead.id === id);
    
    if (index === -1) {
      return null;
    }

    const updatedLead: Lead = {
      ...leads[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    leads[index] = updatedLead;
    writeLeads(leads);
    return updatedLead;
  }

  static delete(id: string): boolean {
    const leads = readLeads();
    const index = leads.findIndex(lead => lead.id === id);
    
    if (index === -1) {
      return false;
    }

    leads.splice(index, 1);
    writeLeads(leads);
    return true;
  }
}

