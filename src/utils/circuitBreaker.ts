/**
 * Circuit Breaker Pattern Implementation
 * Provides resilience for external service calls (Redis, etc.)
 */

import logger from './logger';

// ============================================
// Types and Interfaces
// ============================================

export interface CircuitBreakerOptions {
  /** Number of failures before opening the circuit */
  failureThreshold: number;
  /** Time in ms before attempting reset */
  resetTimeout: number;
  /** Number of successful requests needed in half-open state to close */
  halfOpenRequests: number;
  /** Name for logging purposes */
  name: string;
  /** Optional callback when circuit opens */
  onOpen?: () => void;
  /** Optional callback when circuit closes */
  onClose?: () => void;
  /** Optional callback when circuit transitions to half-open */
  onHalfOpen?: () => void;
}

export enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation - requests go through
  OPEN = 'OPEN', // Failing - reject requests, use fallback
  HALF_OPEN = 'HALF_OPEN', // Testing - limited requests to check recovery
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailure: Date | null;
  lastSuccess: Date | null;
  totalRequests: number;
  fallbackRequests: number;
}

// ============================================
// Circuit Breaker Class
// ============================================

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private lastFailure: Date | null = null;
  private lastSuccess: Date | null = null;
  private halfOpenAttempts: number = 0;
  private totalRequests: number = 0;
  private fallbackRequests: number = 0;

  constructor(private options: CircuitBreakerOptions) {}

  /**
   * Execute an operation with circuit breaker protection
   * @param operation - The primary operation to execute
   * @param fallback - Fallback function when circuit is open or operation fails
   */
  async execute<T>(operation: () => Promise<T>, fallback: () => T | Promise<T>): Promise<T> {
    this.totalRequests++;

    // If circuit is open, use fallback directly
    if (this.isOpen()) {
      this.fallbackRequests++;
      logger.warn(`Circuit breaker ${this.options.name} is OPEN, using fallback`, {
        state: this.state,
        failures: this.failures,
        lastFailure: this.lastFailure,
      });
      return fallback();
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error as Error);
      this.fallbackRequests++;
      return fallback();
    }
  }

  /**
   * Check if the circuit is open (should use fallback)
   */
  private isOpen(): boolean {
    if (this.state === CircuitState.OPEN) {
      // Check if we should attempt reset (transition to half-open)
      if (this.shouldAttemptReset()) {
        this.transitionTo(CircuitState.HALF_OPEN);
        this.halfOpenAttempts = 0;
        return false;
      }
      return true;
    }
    return false;
  }

  /**
   * Check if enough time has passed to attempt reset
   */
  private shouldAttemptReset(): boolean {
    if (!this.lastFailure) return false;
    return Date.now() - this.lastFailure.getTime() > this.options.resetTimeout;
  }

  /**
   * Handle successful operation
   */
  private onSuccess(): void {
    this.successes++;
    this.lastSuccess = new Date();

    if (this.state === CircuitState.HALF_OPEN) {
      this.halfOpenAttempts++;

      if (this.halfOpenAttempts >= this.options.halfOpenRequests) {
        this.transitionTo(CircuitState.CLOSED);
        this.failures = 0;
        logger.info(`Circuit breaker ${this.options.name} CLOSED - service recovered`, {
          halfOpenAttempts: this.halfOpenAttempts,
        });
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Reset failure count on success in closed state
      this.failures = 0;
    }
  }

  /**
   * Handle failed operation
   */
  private onFailure(error: Error): void {
    this.failures++;
    this.lastFailure = new Date();

    logger.error(`Circuit breaker ${this.options.name} operation failed`, {
      error: error.message,
      failures: this.failures,
      threshold: this.options.failureThreshold,
      state: this.state,
    });

    if (this.state === CircuitState.HALF_OPEN) {
      // Failure in half-open state reopens the circuit
      this.transitionTo(CircuitState.OPEN);
      logger.error(
        `Circuit breaker ${this.options.name} reopened due to failure in HALF_OPEN state`
      );
    } else if (this.failures >= this.options.failureThreshold) {
      // Threshold exceeded, open the circuit
      this.transitionTo(CircuitState.OPEN);
      logger.error(`Circuit breaker ${this.options.name} OPENED after ${this.failures} failures`, {
        threshold: this.options.failureThreshold,
      });
    }
  }

  /**
   * Transition to a new state
   */
  private transitionTo(newState: CircuitState): void {
    const previousState = this.state;
    this.state = newState;

    logger.info(`Circuit breaker ${this.options.name} state transition`, {
      from: previousState,
      to: newState,
    });

    // Trigger callbacks
    switch (newState) {
      case CircuitState.OPEN:
        this.options.onOpen?.();
        break;
      case CircuitState.CLOSED:
        this.options.onClose?.();
        break;
      case CircuitState.HALF_OPEN:
        this.options.onHalfOpen?.();
        break;
    }
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get circuit breaker statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailure: this.lastFailure,
      lastSuccess: this.lastSuccess,
      totalRequests: this.totalRequests,
      fallbackRequests: this.fallbackRequests,
    };
  }

  /**
   * Force the circuit to open (useful for testing or manual intervention)
   */
  forceOpen(): void {
    this.transitionTo(CircuitState.OPEN);
    this.lastFailure = new Date();
  }

  /**
   * Force the circuit to close (useful for testing or manual intervention)
   */
  forceClose(): void {
    this.transitionTo(CircuitState.CLOSED);
    this.failures = 0;
  }

  /**
   * Reset the circuit breaker to initial state
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.lastFailure = null;
    this.lastSuccess = null;
    this.halfOpenAttempts = 0;
    this.totalRequests = 0;
    this.fallbackRequests = 0;
  }
}

// ============================================
// Default Circuit Breakers
// ============================================

/**
 * Circuit breaker for Redis operations
 */
export const redisCircuitBreaker = new CircuitBreaker({
  name: 'redis',
  failureThreshold: parseInt(process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD || '5', 10),
  resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT || '30000', 10),
  halfOpenRequests: parseInt(process.env.CIRCUIT_BREAKER_HALF_OPEN_REQUESTS || '3', 10),
  onOpen: () => {
    logger.error('[ALERT] Redis circuit breaker OPENED - using fallback rate limiting');
  },
  onClose: () => {
    logger.info('[ALERT] Redis circuit breaker CLOSED - service recovered');
  },
  onHalfOpen: () => {
    logger.info('Redis circuit breaker entering HALF_OPEN state - testing recovery');
  },
});

export default CircuitBreaker;
