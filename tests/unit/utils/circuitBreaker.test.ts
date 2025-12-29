/**
 * Circuit Breaker Tests
 */

import { CircuitBreaker, CircuitState } from '../../../src/utils/circuitBreaker';

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker;
  const defaultOptions = {
    name: 'test',
    failureThreshold: 3,
    resetTimeout: 1000,
    halfOpenRequests: 2,
  };

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker(defaultOptions);
  });

  afterEach(() => {
    circuitBreaker.reset();
  });

  describe('CLOSED state', () => {
    it('should start in CLOSED state', () => {
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should execute operation normally when circuit is closed', async () => {
      const result = await circuitBreaker.execute(
        async () => 'success',
        () => 'fallback'
      );
      expect(result).toBe('success');
    });

    it('should track failures and remain closed below threshold', async () => {
      // First two failures - still below threshold
      await circuitBreaker.execute(
        async () => {
          throw new Error('fail');
        },
        () => 'fallback'
      );
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);

      await circuitBreaker.execute(
        async () => {
          throw new Error('fail');
        },
        () => 'fallback'
      );
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should open after reaching failure threshold', async () => {
      // Trigger 3 failures (threshold)
      for (let i = 0; i < 3; i++) {
        await circuitBreaker.execute(
          async () => {
            throw new Error('fail');
          },
          () => 'fallback'
        );
      }
      expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);
    });

    it('should reset failure count on success', async () => {
      // Two failures
      await circuitBreaker.execute(
        async () => {
          throw new Error('fail');
        },
        () => 'fallback'
      );
      await circuitBreaker.execute(
        async () => {
          throw new Error('fail');
        },
        () => 'fallback'
      );

      // Success resets counter
      await circuitBreaker.execute(
        async () => 'success',
        () => 'fallback'
      );

      // Two more failures should not open circuit
      await circuitBreaker.execute(
        async () => {
          throw new Error('fail');
        },
        () => 'fallback'
      );
      await circuitBreaker.execute(
        async () => {
          throw new Error('fail');
        },
        () => 'fallback'
      );

      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should use fallback when operation fails', async () => {
      const result = await circuitBreaker.execute(
        async () => {
          throw new Error('fail');
        },
        () => 'fallback'
      );
      expect(result).toBe('fallback');
    });
  });

  describe('OPEN state', () => {
    beforeEach(async () => {
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await circuitBreaker.execute(
          async () => {
            throw new Error('fail');
          },
          () => 'fallback'
        );
      }
    });

    it('should use fallback immediately when circuit is open', async () => {
      const result = await circuitBreaker.execute(
        async () => 'success',
        () => 'fallback'
      );
      expect(result).toBe('fallback');
    });

    it('should not execute operation when circuit is open', async () => {
      let operationCalled = false;
      await circuitBreaker.execute(
        async () => {
          operationCalled = true;
          return 'success';
        },
        () => 'fallback'
      );
      expect(operationCalled).toBe(false);
    });

    it('should transition to HALF_OPEN after timeout', async () => {
      // Wait for reset timeout
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Make a request - should trigger HALF_OPEN
      await circuitBreaker.execute(
        async () => 'success',
        () => 'fallback'
      );

      expect(circuitBreaker.getState()).toBe(CircuitState.HALF_OPEN);
    });
  });

  describe('HALF_OPEN state', () => {
    beforeEach(async () => {
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await circuitBreaker.execute(
          async () => {
            throw new Error('fail');
          },
          () => 'fallback'
        );
      }

      // Wait for reset timeout
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Trigger transition to HALF_OPEN
      await circuitBreaker.execute(
        async () => 'success',
        () => 'fallback'
      );
    });

    it('should be in HALF_OPEN state after timeout and request', () => {
      expect(circuitBreaker.getState()).toBe(CircuitState.HALF_OPEN);
    });

    it('should close circuit after enough successful requests', async () => {
      // Need 2 successful requests (halfOpenRequests)
      await circuitBreaker.execute(
        async () => 'success',
        () => 'fallback'
      );

      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should reopen circuit on failure in HALF_OPEN state', async () => {
      await circuitBreaker.execute(
        async () => {
          throw new Error('fail');
        },
        () => 'fallback'
      );

      expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);
    });
  });

  describe('Statistics', () => {
    it('should track total requests', async () => {
      await circuitBreaker.execute(
        async () => 'success',
        () => 'fallback'
      );
      await circuitBreaker.execute(
        async () => 'success',
        () => 'fallback'
      );

      const stats = circuitBreaker.getStats();
      expect(stats.totalRequests).toBe(2);
    });

    it('should track successes', async () => {
      await circuitBreaker.execute(
        async () => 'success',
        () => 'fallback'
      );

      const stats = circuitBreaker.getStats();
      expect(stats.successes).toBe(1);
    });

    it('should track failures', async () => {
      await circuitBreaker.execute(
        async () => {
          throw new Error('fail');
        },
        () => 'fallback'
      );

      const stats = circuitBreaker.getStats();
      expect(stats.failures).toBe(1);
    });

    it('should track fallback requests', async () => {
      await circuitBreaker.execute(
        async () => {
          throw new Error('fail');
        },
        () => 'fallback'
      );

      const stats = circuitBreaker.getStats();
      expect(stats.fallbackRequests).toBe(1);
    });

    it('should track last failure time', async () => {
      await circuitBreaker.execute(
        async () => {
          throw new Error('fail');
        },
        () => 'fallback'
      );

      const stats = circuitBreaker.getStats();
      expect(stats.lastFailure).toBeInstanceOf(Date);
    });

    it('should track last success time', async () => {
      await circuitBreaker.execute(
        async () => 'success',
        () => 'fallback'
      );

      const stats = circuitBreaker.getStats();
      expect(stats.lastSuccess).toBeInstanceOf(Date);
    });
  });

  describe('Manual control', () => {
    it('should force open the circuit', () => {
      circuitBreaker.forceOpen();
      expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);
    });

    it('should force close the circuit', async () => {
      // Open it first
      for (let i = 0; i < 3; i++) {
        await circuitBreaker.execute(
          async () => {
            throw new Error('fail');
          },
          () => 'fallback'
        );
      }
      expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);

      // Force close
      circuitBreaker.forceClose();
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should reset all state', async () => {
      // Make some requests
      await circuitBreaker.execute(
        async () => 'success',
        () => 'fallback'
      );
      await circuitBreaker.execute(
        async () => {
          throw new Error('fail');
        },
        () => 'fallback'
      );

      // Reset
      circuitBreaker.reset();

      const stats = circuitBreaker.getStats();
      expect(stats.state).toBe(CircuitState.CLOSED);
      expect(stats.failures).toBe(0);
      expect(stats.successes).toBe(0);
      expect(stats.totalRequests).toBe(0);
      expect(stats.fallbackRequests).toBe(0);
      expect(stats.lastFailure).toBeNull();
      expect(stats.lastSuccess).toBeNull();
    });
  });

  describe('Callbacks', () => {
    it('should call onOpen when circuit opens', async () => {
      const onOpen = jest.fn();
      const cb = new CircuitBreaker({
        ...defaultOptions,
        onOpen,
      });

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await cb.execute(
          async () => {
            throw new Error('fail');
          },
          () => 'fallback'
        );
      }

      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when circuit closes', async () => {
      const onClose = jest.fn();
      const cb = new CircuitBreaker({
        ...defaultOptions,
        onClose,
      });

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await cb.execute(
          async () => {
            throw new Error('fail');
          },
          () => 'fallback'
        );
      }

      // Wait for reset timeout
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Close it with successful requests
      await cb.execute(
        async () => 'success',
        () => 'fallback'
      );
      await cb.execute(
        async () => 'success',
        () => 'fallback'
      );

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onHalfOpen when transitioning to half-open', async () => {
      const onHalfOpen = jest.fn();
      const cb = new CircuitBreaker({
        ...defaultOptions,
        onHalfOpen,
      });

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await cb.execute(
          async () => {
            throw new Error('fail');
          },
          () => 'fallback'
        );
      }

      // Wait for reset timeout
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Trigger half-open
      await cb.execute(
        async () => 'success',
        () => 'fallback'
      );

      expect(onHalfOpen).toHaveBeenCalledTimes(1);
    });
  });
});
