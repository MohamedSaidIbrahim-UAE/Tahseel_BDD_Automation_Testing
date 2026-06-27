/**
 * Step Base Class
 * 
 * Provides a foundation for all step definitions with:
 * - Centralized error handling
 * - Consistent logging
 * - Type safety
 * - Common utilities
 */

import { World } from '../../fixtures/world.fixture';
import { resolveActivePage } from '../active-page-resolver';
import { testContext } from '../test-context';

export abstract class StepBase {
  protected world: World;

  constructor(world: World) {
    this.world = world;
  }

  /**
   * Resolve active page with type safety
   */
  protected resolveActivePage<T = any>(requiredMethod?: string): T {
    return resolveActivePage(this.world, requiredMethod) as T;
  }

  /**
   * Get page from test context
   */
  protected getTestContextPage<T = any>(): T {
    return testContext.getPage() as T;
  }

  /**
   * Log message through World fixture
   */
  protected log(message: string): void {
    this.world.addLog(message);
  }

  /**
   * Log success message
   */
  protected logSuccess(message: string): void {
    this.log(`✅ ${message}`);
  }

  /**
   * Log warning message
   */
  protected logWarning(message: string): void {
    this.log(`⚠️ ${message}`);
  }

  /**
   * Log error message (doesn't throw)
   */
  protected logError(message: string): void {
    this.log(`❌ ${message}`);
  }

  /**
   * Safe async execution with error handling
   */
  protected async safeExecute<T>(
    fn: () => Promise<T>,
    errorMessage: string = 'Operation failed'
  ): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      this.logError(`${errorMessage}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Parse ISO date string with validation
   */
  protected parseDate(dateStr: string): Date {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new Error(
        `Invalid date format: "${dateStr}". Expected ISO format: YYYY-MM-DD (e.g., 2026-06-15)`
      );
    }
    return date;
  }

  /**
   * Validate required step context
   */
  protected validateContext(contextKey: string, value: any): void {
    if (value === undefined || value === null) {
      throw new Error(
        `Missing test context: "${contextKey}". Ensure prerequisite steps have executed successfully.`
      );
    }
  }

  /**
   * Store data in World context
   */
  protected storeInContext(key: string, value: any): void {
    (this.world as any)[key] = value;
  }

  /**
   * Retrieve data from World context
   */
  protected getFromContext<T = any>(key: string): T | undefined {
    return (this.world as any)[key];
  }

  /**
   * Retrieve data from World context with fallback
   */
  protected getFromContextOrDefault<T = any>(key: string, defaultValue: T): T {
    return (this.world as any)[key] ?? defaultValue;
  }
}
