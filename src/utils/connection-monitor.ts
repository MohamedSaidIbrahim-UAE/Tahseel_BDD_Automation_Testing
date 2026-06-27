/**
 * Connection monitor for tracking and reporting network reliability
 * Provides aggregated connection metrics for stage environment diagnostics
 */

import { Page } from '@playwright/test';
import { checkPageHealth, HealthCheckResult } from './connection-health-check';

export interface ConnectionMetrics {
  totalChecks: number;
  healthyChecks: number;
  failedChecks: number;
  averageResponseTime: number;
  consecutiveFailures: number;
  lastCheckTime: number;
  lastError?: string;
  uptime: number; // percentage
}

/**
 * Monitors connection health over time and maintains metrics
 */
export class ConnectionMonitor {
  private page: Page;
  private lastCheckTime: number = 0;
  private connectionIssues: number = 0;
  private readonly ISSUE_THRESHOLD: number = 3;
  private checkInterval: number = 30000;
  private isMonitoring: boolean = false;
  private metrics: {
    totalChecks: number;
    healthyChecks: number;
    failedChecks: number;
    responseTimes: number[];
    consecutiveFailures: number;
    startTime: number;
  };

  constructor(page: Page, checkIntervalMs: number = 30000) {
    this.page = page;
    this.checkInterval = checkIntervalMs;
    this.metrics = {
      totalChecks: 0,
      healthyChecks: 0,
      failedChecks: 0,
      responseTimes: [],
      consecutiveFailures: 0,
      startTime: Date.now(),
    };
  }

  /**
   * Starts continuous connection monitoring
   */
  start(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitorLoop().catch(() => {
      this.isMonitoring = false;
    });
  }

  /**
   * Stops connection monitoring
   */
  stop(): void {
    this.isMonitoring = false;
  }

  /**
   * Performs a health check and updates metrics
   */
  async check(): Promise<HealthCheckResult> {
    const health = await checkPageHealth(this.page, 10000);

    // Update metrics
    this.metrics.totalChecks++;
    this.metrics.responseTimes.push(health.responseTime);

    if (health.isHealthy) {
      this.metrics.healthyChecks++;
      this.metrics.consecutiveFailures = 0;
      this.connectionIssues = Math.max(0, this.connectionIssues - 1);
    } else {
      this.metrics.failedChecks++;
      this.metrics.consecutiveFailures++;
      this.connectionIssues++;
    }

    this.lastCheckTime = Date.now();

    // Keep last 100 response times
    if (this.metrics.responseTimes.length > 100) {
      this.metrics.responseTimes.shift();
    }

    return health;
  }

  /**
   * Internal monitoring loop
   */
  private async monitorLoop(): Promise<void> {
    while (this.isMonitoring) {
      try {
        await this.check();
      } catch (error:any) {
        this.metrics.failedChecks++;
        this.metrics.consecutiveFailures++;
      }

      await new Promise(resolve => setTimeout(resolve, this.checkInterval));
    }
  }

  /**
   * Checks if connection has degraded beyond threshold
   */
  isDegraded(): boolean {
    return this.connectionIssues >= this.ISSUE_THRESHOLD;
  }

  /**
   * Gets consecutive failure count
   */
  getConsecutiveFailures(): number {
    return this.metrics.consecutiveFailures;
  }

  /**
   * Gets aggregated metrics
   */
  getMetrics(): ConnectionMetrics {
    const now = Date.now();
    const uptimeMs = now - this.metrics.startTime;
    const expectedChecks = Math.floor(uptimeMs / this.checkInterval);
    const uptime = expectedChecks > 0
      ? Math.min(100, (this.metrics.healthyChecks / expectedChecks) * 100)
      : 100;

    const averageResponseTime =
      this.metrics.responseTimes.length > 0
        ? this.metrics.responseTimes.reduce((a, b) => a + b, 0) /
          this.metrics.responseTimes.length
        : 0;

    return {
      totalChecks: this.metrics.totalChecks,
      healthyChecks: this.metrics.healthyChecks,
      failedChecks: this.metrics.failedChecks,
      averageResponseTime,
      consecutiveFailures: this.metrics.consecutiveFailures,
      lastCheckTime: this.lastCheckTime,
      uptime: Math.round(uptime * 100) / 100,
    };
  }

  /**
   * Resets all metrics
   */
  reset(): void {
    this.metrics = {
      totalChecks: 0,
      healthyChecks: 0,
      failedChecks: 0,
      responseTimes: [],
      consecutiveFailures: 0,
      startTime: Date.now(),
    };
    this.connectionIssues = 0;
    this.lastCheckTime = 0;
  }

  /**
   * Gets readable status summary
   */
  getStatus(): string {
    const metrics = this.getMetrics();
    return `Connection Monitor - Uptime: ${metrics.uptime}%, ` +
           `Avg Response: ${Math.round(metrics.averageResponseTime)}ms, ` +
           `Consecutive Failures: ${metrics.consecutiveFailures}, ` +
           `Degraded: ${this.isDegraded()}`;
  }
}
