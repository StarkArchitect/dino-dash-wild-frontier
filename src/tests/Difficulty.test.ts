import { describe, it, expect } from 'vitest';
import { GameStateManager } from '../core/GameState';

describe('Difficulty and Speed Progression Tests', () => {
  it('gradually accelerates speed as distance increases', () => {
    const gameState = new GameStateManager();
    gameState.startRun();
    const startSpeed = gameState.currentSpeed;

    // Simulate 50 seconds of running at 100ms ticks
    for (let i = 0; i < 500; i++) {
      gameState.update(0.1);
    }

    expect(gameState.currentSpeed).toBeGreaterThan(startSpeed);
    expect(gameState.currentSpeed).toBeLessThanOrEqual(gameState.maxSpeed);
  });

  it('clamps maximum speed at defined limit', () => {
    const gameState = new GameStateManager();
    gameState.startRun();

    // Fast-forward distance to 10,000 meters
    gameState.distance = 10000;
    gameState.update(1.0);

    expect(gameState.currentSpeed).toBe(gameState.maxSpeed);
  });
});
