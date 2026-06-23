/**
 * Selector Strategy Pattern - Multiple strategies for locating elements
 * 
 * This module implements a flexible selector strategy pattern to handle
 * different ways of locating elements on pages, with fallback chains.
 */

import { Page, Locator } from '@playwright/test';

/**
 * Represents a strategy for finding elements on a page
 */
export interface SelectorStrategy {
  /**
   * Find a single element using this strategy
   */
  findElement(selector: string): Promise<Locator | null>;

  /**
   * Find multiple elements using this strategy
   */
  findElements(selector: string): Promise<Locator[]>;

  /**
   * Validate that this strategy can find the element
   */
  validate(selector: string): Promise<boolean>;

  /**
   * Get strategy name for logging
   */
  getName(): string;
}

/**
 * Strategy for finding elements by accessibility role
 */
export class RoleBasedStrategy implements SelectorStrategy {
  constructor(private page: Page) {}

  async findElement(selector: string): Promise<Locator | null> {
    try {
      const loc = this.page.locator(`[role="${selector}"]`).first();
      const count = await loc.count();
      return count > 0 ? loc : null;
    } catch {
      return null;
    }
  }

  async findElements(selector: string): Promise<Locator[]> {
    try {
      const locs = this.page.locator(`[role="${selector}"]`);
      const count = await locs.count();
      const result: Locator[] = [];
      for (let i = 0; i < count; i++) {
        result.push(locs.nth(i));
      }
      return result;
    } catch {
      return [];
    }
  }

  async validate(selector: string): Promise<boolean> {
    return (await this.findElement(selector)) !== null;
  }

  getName(): string {
    return 'RoleBasedStrategy';
  }
}

/**
 * Strategy for finding elements by test ID (data-testid attribute)
 */
export class TestIdStrategy implements SelectorStrategy {
  constructor(private page: Page) {}

  async findElement(selector: string): Promise<Locator | null> {
    try {
      const loc = this.page.locator(`[data-testid="${selector}"]`).first();
      const count = await loc.count();
      return count > 0 ? loc : null;
    } catch {
      return null;
    }
  }

  async findElements(selector: string): Promise<Locator[]> {
    try {
      const locs = this.page.locator(`[data-testid="${selector}"]`);
      const count = await locs.count();
      const result: Locator[] = [];
      for (let i = 0; i < count; i++) {
        result.push(locs.nth(i));
      }
      return result;
    } catch {
      return [];
    }
  }

  async validate(selector: string): Promise<boolean> {
    return (await this.findElement(selector)) !== null;
  }

  getName(): string {
    return 'TestIdStrategy';
  }
}

/**
 * Strategy for finding elements by label text (aria-label)
 */
export class LabelBasedStrategy implements SelectorStrategy {
  constructor(private page: Page) {}

  async findElement(selector: string): Promise<Locator | null> {
    try {
      const loc = this.page.locator(`[aria-label="${selector}"]`).first();
      const count = await loc.count();
      return count > 0 ? loc : null;
    } catch {
      return null;
    }
  }

  async findElements(selector: string): Promise<Locator[]> {
    try {
      const locs = this.page.locator(`[aria-label="${selector}"]`);
      const count = await locs.count();
      const result: Locator[] = [];
      for (let i = 0; i < count; i++) {
        result.push(locs.nth(i));
      }
      return result;
    } catch {
      return [];
    }
  }

  async validate(selector: string): Promise<boolean> {
    return (await this.findElement(selector)) !== null;
  }

  getName(): string {
    return 'LabelBasedStrategy';
  }
}

/**
 * Strategy for finding elements by CSS selector
 */
export class CssStrategy implements SelectorStrategy {
  constructor(private page: Page) {}

  async findElement(selector: string): Promise<Locator | null> {
    try {
      const loc = this.page.locator(selector).first();
      const count = await loc.count();
      return count > 0 ? loc : null;
    } catch {
      return null;
    }
  }

  async findElements(selector: string): Promise<Locator[]> {
    try {
      const locs = this.page.locator(selector);
      const count = await locs.count();
      const result: Locator[] = [];
      for (let i = 0; i < count; i++) {
        result.push(locs.nth(i));
      }
      return result;
    } catch {
      return [];
    }
  }

  async validate(selector: string): Promise<boolean> {
    return (await this.findElement(selector)) !== null;
  }

  getName(): string {
    return 'CssStrategy';
  }
}

/**
 * Strategy for finding elements by text content
 */
export class TextBasedStrategy implements SelectorStrategy {
  constructor(private page: Page) {}

  async findElement(selector: string): Promise<Locator | null> {
    try {
      const loc = this.page.locator(`text="${selector}"`).first();
      const count = await loc.count();
      return count > 0 ? loc : null;
    } catch {
      return null;
    }
  }

  async findElements(selector: string): Promise<Locator[]> {
    try {
      const locs = this.page.locator(`text="${selector}"`);
      const count = await locs.count();
      const result: Locator[] = [];
      for (let i = 0; i < count; i++) {
        result.push(locs.nth(i));
      }
      return result;
    } catch {
      return [];
    }
  }

  async validate(selector: string): Promise<boolean> {
    return (await this.findElement(selector)) !== null;
  }

  getName(): string {
    return 'TextBasedStrategy';
  }
}

/**
 * Selector resolver with fallback chain - tries multiple strategies
 */
export class SelectorResolver {
  private strategies: SelectorStrategy[];

  constructor(
    page: Page,
    customStrategies?: SelectorStrategy[]
  ) {
    // Default strategy order - most specific to least specific
    this.strategies = customStrategies || [
      new TestIdStrategy(page),
      new RoleBasedStrategy(page),
      new LabelBasedStrategy(page),
      new TextBasedStrategy(page),
      new CssStrategy(page),
    ];
  }

  /**
   * Find element using first matching strategy
   */
  async findElement(selector: string): Promise<Locator | null> {
    for (const strategy of this.strategies) {
      const element = await strategy.findElement(selector);
      if (element) {
        console.log(`[SelectorResolver] Found element using ${strategy.getName()}: ${selector}`);
        return element;
      }
    }
    console.warn(`[SelectorResolver] No element found with selector: ${selector}`);
    return null;
  }

  /**
   * Find all elements using first matching strategy
   */
  async findElements(selector: string): Promise<Locator[]> {
    for (const strategy of this.strategies) {
      const elements = await strategy.findElements(selector);
      if (elements.length > 0) {
        console.log(`[SelectorResolver] Found ${elements.length} elements using ${strategy.getName()}: ${selector}`);
        return elements;
      }
    }
    return [];
  }

  /**
   * Try all strategies and return which ones work
   */
  async validateAll(selector: string): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    for (const strategy of this.strategies) {
      const valid = await strategy.validate(selector);
      results.set(strategy.getName(), valid);
    }
    return results;
  }
}
