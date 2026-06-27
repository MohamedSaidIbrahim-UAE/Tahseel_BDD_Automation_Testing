/**
 * Step Registry
 * 
 * Central registry for managing step class instances with:
 * - Singleton pattern for step classes
 * - Type-safe instance management
 * - Easy access from hooks
 */

import { World } from '../../fixtures/world.fixture';
import { StepBase } from './step-base';

export class StepRegistry {
  private static instances: Map<string, StepBase> = new Map();

  /**
   * Register or get step instance
   */
  static registerStep<T extends StepBase>(
    key: string,
    StepClass: new (world: World) => T,
    world: World
  ): T {
    const registryKey = `${key}:${StepClass.name}`;

    if (this.instances.has(registryKey)) {
      return this.instances.get(registryKey) as T;
    }

    const instance = new StepClass(world);
    this.instances.set(registryKey, instance);
    return instance;
  }

  /**
   * Get registered step instance
   */
  static getStep<T extends StepBase>(key: string, StepClass: new (world: World) => T): T | undefined {
    const registryKey = `${key}:${StepClass.name}`;
    return this.instances.get(registryKey) as T | undefined;
  }

  /**
   * Clear all instances for cleanup
   */
  static clear(): void {
    this.instances.clear();
  }

  /**
   * Clear specific instance
   */
  static clearInstance<T extends StepBase>(key: string, StepClass: new (world: World) => T): void {
    const registryKey = `${key}:${StepClass.name}`;
    this.instances.delete(registryKey);
  }

  /**
   * Get all registered instances
   */
  static getAllInstances(): Map<string, StepBase> {
    return new Map(this.instances);
  }

  /**
   * Get instance count
   */
  static getInstanceCount(): number {
    return this.instances.size;
  }
}
