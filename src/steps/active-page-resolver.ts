import { World } from '../fixtures/world.fixture';
import { testContext } from './test-context';

/**
 * Returns the active page object from TestContext, or null if not set.
 */
export function getActivePageFromContext(): any {
  try {
    return testContext.getPage();
  } catch {
    return null;
  }
}

function hasPageMethod(target: any, method?: string): boolean {
  if (!method || !target || typeof target !== 'object') return false;
  if (method === 'rawPage') {
    return (target as any).rawPage !== undefined;
  }
  return typeof target[method] === 'function';
}

function findFallbackPageObjectByMethod(world: World, method?: string): any | null {
  if (!method) return null;
  return Object.values(world).find(value =>
    value && typeof value === 'object' && hasPageMethod(value, method)
  ) || null;
}

function findFallbackPageObject(world: World): any | null {
  return Object.values(world).find(value =>
    value && typeof value === 'object' && typeof (value as any).rawPage === 'object'
  ) || null;
}

export function resolveActivePage(world: World, requiredMethod?: string): any {
  const activePage = getActivePageFromContext();
  if (activePage && (!requiredMethod || hasPageMethod(activePage, requiredMethod))) {
    return activePage;
  }

  const fallbackByMethod = findFallbackPageObjectByMethod(world, requiredMethod);
  if (fallbackByMethod) return fallbackByMethod;

  const fallbackPage = findFallbackPageObject(world);
  if (fallbackPage) return fallbackPage;

  throw new Error(
    'Active page instance not set in test context and no page object was found on World. ' +
    'Ensure the navigation step calls testContext.setPage(), set World.page, or initialize World page objects.'
  );
}
