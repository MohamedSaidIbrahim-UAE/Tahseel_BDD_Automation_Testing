/**
 * Revenue Entity Test Data Models
 */

export interface RevenueEntity {
  id: string;
  name: string;
  arName?: string;
  isActive: boolean;
  scope?: string;
}

export interface TransactionData {
  entity: string;
  count: number;
  totalAmount: number;
}

export interface ReportData {
  revenueEntity: string;
  transactionCount: number;
  totalAmount: number;
}

export interface GrandTotal {
  totalTransactions: number;
  totalAmount: number;
  currency: string;
}

export const REVENUE_ENTITIES = {
  ENTITY_A: {
    id: 'entity-a-001',
    name: 'Entity-A',
    isActive: true
  },
  ENTITY_B: {
    id: 'entity-b-001',
    name: 'Entity-B',
    isActive: true
  },
  ENTITY_C: {
    id: 'entity-c-001',
    name: 'Entity-C',
    isActive: true
  }
};

export const TEST_TRANSACTIONS = {
  JUNE_2026: {
    'Entity-A': { count: 50, amount: 100000.00 },
    'Entity-B': { count: 30, amount: 45000.00 },
    'Entity-C': { count: 0, amount: 0.00 }
  }
};

export const EXPECTED_REPORT_DATA = {
  SUMMARY_AGGREGATION: [
    { entity: 'Entity-A', count: 50, amount: 100000.00 },
    { entity: 'Entity-B', count: 30, amount: 45000.00 }
  ],
  GRAND_TOTAL: {
    totalTransactions: 80,
    totalAmount: 145000.00,
    currency: 'AED'
  }
};
