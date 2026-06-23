/**
 * Authentication Fixtures - Setup and teardown for auth-dependent tests
 * 
 * Provides fixtures for different user roles and authentication states
 */

import { Page } from '@playwright/test';
import { AuthManager } from '../utils/auth.manager';

export interface AuthContext {
  token?: string;
  userId?: string;
  email?: string;
  role?: string;
  storageState?: any;
}

/**
 * Authentication fixtures factory
 */
export class AuthFixtures {
  /**
   * Setup authenticated admin user
   */
  static async setupAdminUser(page: Page, authManager: AuthManager): Promise<AuthContext> {
    // Ensure user is authenticated
    await authManager.ensureAuthenticated();
    
    // Get auth token to verify authentication
    const token = await authManager.getAuthToken();

    return {
      token,
      role: 'admin',
      email: 'admin@example.com',
    };
  }

  /**
   * Setup authenticated regular user
   */
  static async setupRegularUser(page: Page, authManager: AuthManager): Promise<AuthContext> {
    // Ensure user is authenticated
    await authManager.ensureAuthenticated();

    const token = await authManager.getAuthToken();

    return {
      token,
      role: 'user',
      email: 'user@example.com',
    };
  }

  /**
   * Setup read-only user
   */
  static async setupReadOnlyUser(page: Page, authManager: AuthManager): Promise<AuthContext> {
    // Ensure user is authenticated
    await authManager.ensureAuthenticated();

    const token = await authManager.getAuthToken();

    return {
      token,
      role: 'readonly',
      email: 'readonly@example.com',
    };
  }

  /**
   * Clear authentication (logout)
   */
  static async clearAuth(page: Page): Promise<void> {
    await page.context().clearCookies();
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  }

  /**
   * Verify user is authenticated
   */
  static async verifyAuthenticated(page: Page): Promise<boolean> {
    const token = await page.evaluate(() => window.localStorage.getItem('auth_token'));
    return !!token;
  }

  /**
   * Get current user info
   */
  static async getCurrentUser(page: Page): Promise<AuthContext | null> {
    const userJson = await page.evaluate(() => window.localStorage.getItem('user_info'));
    if (!userJson) {
      return null;
    }

    try {
      const user = JSON.parse(userJson);
      return {
        userId: user.id,
        email: user.email,
        role: user.role,
      };
    } catch {
      return null;
    }
  }
}

/**
 * RBAC (Role-Based Access Control) fixtures
 */
export class RBACFixtures {
  /**
   * Check if user has permission for action
   */
  static async verifyUserCanPerform(
    page: Page,
    action: string
  ): Promise<boolean> {
    const user = await AuthFixtures.getCurrentUser(page);
    if (!user) {
      return false;
    }

    // Check if action button is visible
    const actionButtonSelectors = [
      `[aria-label="${action}"]`,
      `button:has-text("${action}")`,
      `[data-action="${action}"]`,
    ];

    for (const selector of actionButtonSelectors) {
      try {
        const visible = await page.locator(selector).first().isVisible();
        if (visible) {
          return true;
        }
      } catch {
        // Continue to next selector
      }
    }

    return false;
  }

  /**
   * Verify user cannot perform action
   */
  static async verifyUserCannotPerform(
    page: Page,
    action: string
  ): Promise<boolean> {
    const canPerform = await this.verifyUserCanPerform(page, action);
    return !canPerform;
  }

  /**
   * Verify all permitted actions are visible
   */
  static async verifyPermittedActionsVisible(
    page: Page,
    actions: string[]
  ): Promise<boolean> {
    for (const action of actions) {
      const canPerform = await this.verifyUserCanPerform(page, action);
      if (!canPerform) {
        return false;
      }
    }
    return true;
  }

  /**
   * Verify all forbidden actions are hidden
   */
  static async verifyForbiddenActionsHidden(
    page: Page,
    actions: string[]
  ): Promise<boolean> {
    for (const action of actions) {
      const canPerform = await this.verifyUserCanPerform(page, action);
      if (canPerform) {
        return false;
      }
    }
    return true;
  }
}
