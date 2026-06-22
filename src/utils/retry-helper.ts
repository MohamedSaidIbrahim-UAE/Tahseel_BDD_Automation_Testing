/**
 * Retry utility for handling transient failures with exponential backoff
 * Particularly useful for stage environment which has slow/unreliable infrastructure
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error, nextDelay: number) => void;
}

/**
 * Executes an async function with retry logic and exponential backoff
 * @param fn - Async function to execute
 * @param options - Retry configuration
 * @returns Promise with the result of fn
 * @throws Error if all retries fail
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: Error | undefined;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error:any) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw new Error(
          `Failed after ${maxRetries + 1} attempts: ${lastError.message}`
        );
      }

      delay = Math.min(delay * backoffMultiplier, maxDelay);

      if (onRetry) {
        onRetry(attempt + 1, lastError, delay);
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Executes an async function with immediate retry on failure (no delay)
 * @param fn - Async function to execute
 * @param maxAttempts - Maximum number of attempts
 * @returns Promise with the result of fn
 */
export async function retryImmediate<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error:any) {
      lastError = error as Error;
      if (attempt === maxAttempts - 1) {
        throw lastError;
      }
    }
  }

  throw lastError;
}

/**
 * Wraps a promise with a timeout
 * @param promise - Promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @param timeoutMessage - Optional custom timeout message
 * @returns Promise that rejects if timeout is exceeded
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage?: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(timeoutMessage || `Operation timeout after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}
