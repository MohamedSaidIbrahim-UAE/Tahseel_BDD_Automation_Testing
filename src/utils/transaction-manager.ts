/**
 * Transaction Manager Utility
 * 
 * Provides test data setup for shared revenue test scenarios:
 * - Transaction posting to shared services
 * - Revenue entity configuration
 * - Sharing rule management (mid-period updates)
 * 
 * Used by shared-revenues.steps.ts for Given step implementations
 */

import { World } from '../fixtures/world.fixture';

/**
 * Transaction data structure
 */
export interface Transaction {
  service: string;
  amount: number;
  entities: string;
  date: Date;
  paymentMethod?: string;
}

/**
 * Sharing rule structure
 */
export interface SharingRule {
  service: string;
  entityA: string;
  entityB: string;
  splitPercentage: number; // e.g., 50 for 50/50
  effectiveDate: Date;
}

/**
 * Transaction Manager - Handles test data setup
 */
export class TransactionManager {
  private world: World;
  private transactions: Transaction[] = [];
  private sharingRules: Map<string, SharingRule> = new Map();

  constructor(world: World) {
    this.world = world;
  }

  /**
   * Parse split rule string (e.g., "50/50", "60/40")
   * @param splitRuleStr - Format: "XX/YY"
   * @returns - Split percentage (entity A's percentage)
   */
  parseSplitRule(splitRuleStr: string): number {
    const match = splitRuleStr.match(/^(\d+)\/(\d+)$/);
    if (!match) {
      throw new Error(
        `Invalid split rule format: "${splitRuleStr}". Expected format: "50/50", "60/40", etc.`
      );
    }

    const entityAPercent = parseInt(match[1], 10);
    const entityBPercent = parseInt(match[2], 10);

    if (entityAPercent + entityBPercent !== 100) {
      throw new Error(
        `Split percentages must sum to 100. Got ${entityAPercent} + ${entityBPercent} = ${entityAPercent + entityBPercent}`
      );
    }

    return entityAPercent;
  }

  /**
   * Post transactions under a shared service
   * @param service - Service name
   * @param transactionsData - Array of transaction records
   * @param date - Transaction date
   */
  async postTransactions(
    service: string,
    transactionsData: Array<{ Service: string; Amount: string; Entities: string }>,
    date: Date
  ): Promise<void> {
    this.world.addLog(`📝 Posting ${transactionsData.length} transactions for ${service} on ${date.toISOString().split('T')[0]}`);

    for (const record of transactionsData) {
      const transaction: Transaction = {
        service: record.Service || service,
        amount: parseFloat(record.Amount),
        entities: record.Entities,
        date,
      };

      // Validate transaction
      if (isNaN(transaction.amount)) {
        throw new Error(`Invalid transaction amount: "${record.Amount}"`);
      }

      if (transaction.amount <= 0) {
        throw new Error(`Transaction amount must be positive: ${transaction.amount}`);
      }

      this.transactions.push(transaction);
      this.world.addLog(`  ✅ Posted: ${service} | ${transaction.amount} AED | ${transaction.entities}`);
    }
  }

  /**
   * Update sharing rule (mid-period change)
   * @param service - Service name
   * @param entityA - First entity name
   * @param entityB - Second entity name
   * @param splitRule - Split rule (e.g., "60/40")
   * @param effectiveDate - Date when change becomes effective
   */
  async updateSharingRule(
    service: string,
    entityA: string,
    entityB: string,
    splitRule: string,
    effectiveDate: Date
  ): Promise<void> {
    const splitPercentage = this.parseSplitRule(splitRule);

    const rule: SharingRule = {
      service,
      entityA,
      entityB,
      splitPercentage,
      effectiveDate,
    };

    this.sharingRules.set(service, rule);

    this.world.addLog(
      `📋 Sharing rule updated for ${service}: ${splitRule} split (${entityA} ${splitPercentage}%, ${entityB} ${100 - splitPercentage}%) effective ${effectiveDate.toISOString().split('T')[0]}`
    );
  }

  /**
   * Get sharing rule for a service
   * @param service - Service name
   * @returns - Sharing rule or undefined if not found
   */
  getShareRule(service: string): SharingRule | undefined {
    return this.sharingRules.get(service);
  }

  /**
   * Calculate transaction split based on rule
   * @param transaction - Transaction to split
   * @param rule - Sharing rule
   * @returns - Object with entityA and entityB amounts
   */
  calculateSplit(
    transaction: Transaction,
    rule: SharingRule
  ): { entityA: number; entityB: number } {
    const entityAAmount = (transaction.amount * rule.splitPercentage) / 100;
    const entityBAmount = transaction.amount - entityAAmount;

    return {
      entityA: Math.round(entityAAmount * 100) / 100, // Round to 2 decimals
      entityB: Math.round(entityBAmount * 100) / 100,
    };
  }

  /**
   * Get all posted transactions
   */
  getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  /**
   * Get transactions for a specific date
   * @param date - Target date
   */
  getTransactionsByDate(date: Date): Transaction[] {
    const dateStr = date.toISOString().split('T')[0];
    return this.transactions.filter((t) => t.date.toISOString().split('T')[0] === dateStr);
  }

  /**
   * Get total amount for transactions
   * @param transactions - Optional filter, uses all if not provided
   */
  getTotalAmount(transactions?: Transaction[]): number {
    const list = transactions || this.transactions;
    return list.reduce((sum, t) => sum + t.amount, 0);
  }

  /**
   * Clear all test data (for cleanup)
   */
  clear(): void {
    this.transactions = [];
    this.sharingRules.clear();
    this.world.addLog('🧹 Transaction manager cleared');
  }

  /**
   * Get summary of posted transactions
   */
  getSummary(): string {
    const totalAmount = this.getTotalAmount();
    const ruleCount = this.sharingRules.size;

    return `Transactions: ${this.transactions.length}, Total: ${totalAmount} AED, Rules: ${ruleCount}`;
  }
}
