/**
 * Centralised API endpoint resolver.
 * Derives the correct API base URL from the current environment's BASE_URL.
 *
 * Environments:
 *   local  → http://192.168.5.110/ETC/api
 *   stage  → https://stgmasar.srta.gov.ae/masar-api/api
 *   prod   → https://masar.srta.gov.ae/masar-api/api  (extend as needed)
 */

import { config } from './config';

function resolveApiBase(): string {
  const base = config.baseUrl.replace(/\/$/, '');

  // Local dev environment
  if (base.includes('192.168.5.110')) {
    return 'http://192.168.5.110/ETC/api';
  }
  // Stage environment
  if (base.includes('stgmasar')) {
    return 'https://stgmasar.srta.gov.ae/masar-api/api';
  }
  // Production — extend when known
  return base.replace('/masar', '/masar-api/api');
}

function resolvePassesApiBase(): string {
  const base = config.baseUrl.replace(/\/$/, '');
  if (base.includes('192.168.5.110')) {
    return 'http://192.168.5.110/ETC';
  }
  if (base.includes('stgmasar')) {
    return 'https://stgmasar.srta.gov.ae/masar-api';
  }
  return base.replace('/masar', '/masar-api');
}

export const apiBase = resolveApiBase();
export const passesApiBase = resolvePassesApiBase();

export const ApiEndpoints = {
  companyProfiles: {
    getAll: `${apiBase}/CompanyProfile/GetAll`,
  },
  trucks: {
    getAll: `${apiBase}/Truck/GetAll`,
  },
  permits: {
    getAll: `${apiBase}/Permit/GetAll`,
    getDetails: (id: string | number) => `${apiBase}/Permit/getPermitDetails/${id}`,
  },
  passes: {
    getAll: `${passesApiBase}/ETCPasses/GetAll`,
    getDetails: (id: string | number) => `${passesApiBase}/ETCPasses/getPassDetails/${id}`,
  },
} as const;
