/**
 * Self-Healing Locator Utility
 *
 * Advanced locator management with:
 * - Automatic fallback detection
 * - Performance tracking
 * - Selector effectiveness scoring
 * - Self-learning system
 * - Real-time optimization
 *
 * @category Utilities
 * @module self-healing-locator
 */

import { Page, Locator } from '@playwright/test';

/**
 * Selector performance metrics
 */
export interface SelectorMetrics {
  selector: string;
  successCount: number;
  failureCount: number;
  averageTime: number;
  lastUsed: Date;
  reliability: number; // 0-1 score
  rank: number;
}

/**
 * Healing suggestion
 */
export interface HealingSuggestion {
  originalSelector: string;
  suggestedSelectors: string[];
  reason: string;
  confidence: number; // 0-1
  action: 'update' | 'add_fallback' | 'optimize' | 'deprecate';
}

/**
 * Test execution metrics
 */
export interface ExecutionMetrics {
  scenarioName: string;
  stepName: string;
  selectorUsed: string;
  duration: number;
  success: boolean;
  error?: string;
  timestamp: Date;
  screenshot?: string;
}

/**
 * Self-Healing Locator Manager
 * Tracks selector performance and provides automatic healing suggestions
 */
export class SelfHealingLocatorManager {
  private page: Page;
  private selectorMetrics: Map<string, SelectorMetrics> = new Map();
  private executionHistory: ExecutionMetrics[] = [];
  private failurePatterns: Map<string, number> = new Map(); // Failure cause -> count
  private successPatterns: Map<string, number> = new Map(); // Successful selector patterns

  constructor(page: Page) {
    this.page = page;
    this.initializeMetrics();
  }

  /**
   * Initialize metrics tracking
   */
  private initializeMetrics(): void {
    console.log('🔧 Self-Healing Locator Manager initialized');
  }

  /**
   * Record selector usage and success/failure
   */
  async recordSelectorUsage(
    selector: string,
    success: boolean,
    duration: number,
    error?: string,
    scenarioContext?: { scenario: string; step: string }
  ): Promise<void> {
    const metrics = this.selectorMetrics.get(selector) || {
      selector,
      successCount: 0,
      failureCount: 0,
      averageTime: 0,
      lastUsed: new Date(),
      reliability: 1.0,
      rank: 1,
    };

    if (success) {
      metrics.successCount++;
      this.recordSuccessPattern(selector);
    } else {
      metrics.failureCount++;
      if (error) {
        this.recordFailurePattern(error);
      }
    }

    // Update average time
    const totalUses = metrics.successCount + metrics.failureCount;
    metrics.averageTime = (metrics.averageTime * (totalUses - 1) + duration) / totalUses;

    // Update reliability score (0-1)
    metrics.reliability = metrics.successCount / totalUses;

    // Update rank based on reliability and speed
    metrics.rank = metrics.reliability * 0.7 + (1 - Math.min(metrics.averageTime / 5000, 1)) * 0.3;

    metrics.lastUsed = new Date();

    this.selectorMetrics.set(selector, metrics);

    // Record execution
    this.executionHistory.push({
      scenarioName: scenarioContext?.scenario || 'Unknown',
      stepName: scenarioContext?.step || 'Unknown',
      selectorUsed: selector,
      duration,
      success,
      error,
      timestamp: new Date(),
    });
  }

  /**
   * Record successful selector pattern for future reference
   */
  private recordSuccessPattern(selector: string): void {
    const count = this.successPatterns.get(selector) || 0;
    this.successPatterns.set(selector, count + 1);
  }

  /**
   * Record failure pattern for analysis
   */
  private recordFailurePattern(error: string): void {
    const count = this.failurePatterns.get(error) || 0;
    this.failurePatterns.set(error, count + 1);
  }

  /**
   * Analyze DOM and suggest alternative selectors
   */
  async suggestAlternativeSelectors(
    originalSelector: string,
    element?: Locator
  ): Promise<HealingSuggestion | null> {
    try {
      if (!element) {
        return null;
      }

      // Get element attributes for analysis
      const elementInfo = await element.evaluate((el: any) => ({
        tag: el.tagName.toLowerCase(),
        id: el.id,
        className: el.className,
        dataTestId: el.getAttribute('data-testid'),
        ariaLabel: el.getAttribute('aria-label'),
        role: el.getAttribute('role'),
        name: el.getAttribute('name'),
        type: el.getAttribute('type'),
        text: el.textContent?.substring(0, 50) || '',
      }));

      const suggestions: string[] = [];

      // Prioritize different selector strategies
      if (elementInfo.dataTestId) {
        suggestions.push(`[data-testid="${elementInfo.dataTestId}"]`);
      }

      if (elementInfo.id) {
        suggestions.push(`#${elementInfo.id}`);
      }

      if (elementInfo.ariaLabel) {
        suggestions.push(`[aria-label="${elementInfo.ariaLabel}"]`);
      }

      if (elementInfo.role) {
        suggestions.push(`[role="${elementInfo.role}"]`);
      }

      if (elementInfo.name) {
        suggestions.push(`[name="${elementInfo.name}"]`);
      }

      if (elementInfo.className) {
        const classes = elementInfo.className.split(' ').filter((c: string) => c.length > 0);
        if (classes.length > 0) {
          suggestions.push(`.${classes.join('.')}`);
        }
      }

      if (elementInfo.text && elementInfo.text.length > 0) {
        suggestions.push(`:has-text("${elementInfo.text.trim()}")`);
      }

      return {
        originalSelector,
        suggestedSelectors: suggestions.filter((s) => s !== originalSelector),
        reason: 'Auto-discovered from DOM analysis',
        confidence: 0.8,
        action: suggestions.length > 0 ? 'add_fallback' : 'deprecate',
      };
    } catch (error) {
      console.warn(`Could not analyze selector: ${originalSelector}`, error);
      return null;
    }
  }

  /**
   * Get healing suggestions based on performance data
   */
  getSuggestionsForPerformance(): HealingSuggestion[] {
    const suggestions: HealingSuggestion[] = [];

    // Find underperforming selectors
    const sortedMetrics = Array.from(this.selectorMetrics.values())
      .sort((a, b) => a.reliability - b.reliability);

    for (const metrics of sortedMetrics.slice(0, 5)) {
      if (metrics.reliability < 0.7) {
        suggestions.push({
          originalSelector: metrics.selector,
          suggestedSelectors: [],
          reason: `Low reliability: ${(metrics.reliability * 100).toFixed(1)}%`,
          confidence: 0.9,
          action: 'add_fallback',
        });
      }

      if (metrics.averageTime > 3000 && metrics.reliability > 0.5) {
        suggestions.push({
          originalSelector: metrics.selector,
          suggestedSelectors: [],
          reason: `Slow performance: ${metrics.averageTime.toFixed(0)}ms average`,
          confidence: 0.7,
          action: 'optimize',
        });
      }
    }

    return suggestions;
  }

  /**
   * Get most reliable selectors by tag pattern
   */
  getMostReliableSelectors(limit: number = 5): SelectorMetrics[] {
    return Array.from(this.selectorMetrics.values())
      .sort((a, b) => b.rank - a.rank)
      .slice(0, limit);
  }

  /**
   * Generate healing report
   */
  generateHealingReport(): string {
    const report: string[] = [];

    report.push('\n📊 SELF-HEALING LOCATOR REPORT');
    report.push('================================\n');

    // Summary
    report.push(`Total Selectors Tracked: ${this.selectorMetrics.size}`);
    report.push(`Total Executions: ${this.executionHistory.length}`);

    const successfulExecutions = this.executionHistory.filter((e) => e.success).length;
    const successRate = ((successfulExecutions / this.executionHistory.length) * 100).toFixed(1);
    report.push(`Overall Success Rate: ${successRate}%\n`);

    // Top performers
    report.push('🏆 Top Performing Selectors:');
    const topSelectors = this.getMostReliableSelectors(3);
    topSelectors.forEach((selector, idx) => {
      report.push(
        `  ${idx + 1}. ${selector.selector.substring(0, 60)}... ` +
          `(Reliability: ${(selector.reliability * 100).toFixed(1)}%, Rank: ${selector.rank.toFixed(2)})`
      );
    });
    report.push('');

    // Failure patterns
    report.push('❌ Common Failure Patterns:');
    const sortedFailures = Array.from(this.failurePatterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    sortedFailures.forEach(([error, count]) => {
      report.push(`  - ${error}: ${count} occurrences`);
    });
    report.push('');

    // Performance metrics
    report.push('⚡ Performance Summary:');
    const avgTimes = Array.from(this.selectorMetrics.values()).map((m) => m.averageTime);
    if (avgTimes.length > 0) {
      const avgTime = avgTimes.reduce((a, b) => a + b, 0) / avgTimes.length;
      report.push(`  Average Selector Lookup: ${avgTime.toFixed(0)}ms`);
      report.push(`  Fastest: ${Math.min(...avgTimes).toFixed(0)}ms`);
      report.push(`  Slowest: ${Math.max(...avgTimes).toFixed(0)}ms`);
    }
    report.push('');

    // Recommendations
    const suggestions = this.getSuggestionsForPerformance();
    if (suggestions.length > 0) {
      report.push('💡 Recommended Improvements:');
      suggestions.slice(0, 5).forEach((suggestion, idx) => {
        report.push(
          `  ${idx + 1}. [${suggestion.action.toUpperCase()}] ${suggestion.reason}`
        );
      });
    }

    report.push('\n================================');

    return report.join('\n');
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): {
    selectorMetrics: SelectorMetrics[];
    failurePatterns: Map<string, number>;
    successPatterns: Map<string, number>;
    executionHistory: ExecutionMetrics[];
  } {
    return {
      selectorMetrics: Array.from(this.selectorMetrics.values()),
      failurePatterns: this.failurePatterns,
      successPatterns: this.successPatterns,
      executionHistory: this.executionHistory,
    };
  }

  /**
   * Reset metrics (for new test run)
   */
  reset(): void {
    this.selectorMetrics.clear();
    this.executionHistory = [];
    this.failurePatterns.clear();
    this.successPatterns.clear();
    console.log('🔄 Self-Healing metrics reset for new test run');
  }

  /**
   * Get health score (0-1)
   */
  getHealthScore(): number {
    if (this.executionHistory.length === 0) {
      return 1.0;
    }

    const successRate = this.executionHistory.filter((e) => e.success).length / this.executionHistory.length;
    const avgReliability = Array.from(this.selectorMetrics.values())
      .reduce((sum, m) => sum + m.reliability, 0) / this.selectorMetrics.size || 1.0;

    return (successRate * 0.6 + avgReliability * 0.4);
  }
}

/**
 * Global singleton instance
 */
let globalHealingManager: SelfHealingLocatorManager | null = null;

/**
 * Get or create global healing manager
 */
export function getOrCreateHealingManager(page: Page): SelfHealingLocatorManager {
  if (!globalHealingManager) {
    globalHealingManager = new SelfHealingLocatorManager(page);
  }
  return globalHealingManager;
}

/**
 * Get current healing manager
 */
export function getHealingManager(): SelfHealingLocatorManager | null {
  return globalHealingManager;
}

/**
 * Reset global healing manager
 */
export function resetHealingManager(): void {
  if (globalHealingManager) {
    globalHealingManager.reset();
  }
  globalHealingManager = null;
}
