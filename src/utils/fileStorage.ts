import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Lead } from '../types';
import { logger } from './logger';

const DATA_FILE_PATH = join(__dirname, '../data/leads.json');

export const readLeads = (): Lead[] => {
  try {
    const fileContent = readFileSync(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent) as Lead[];
  } catch (error) {
    logger.error('Error reading leads file:', error);
    throw new Error('Failed to read leads data');
  }
};

export const writeLeads = (leads: Lead[]): void => {
  try {
    writeFileSync(DATA_FILE_PATH, JSON.stringify(leads, null, 2), 'utf-8');
  } catch (error) {
    logger.error('Error writing leads file:', error);
    throw new Error('Failed to write leads data');
  }
};

