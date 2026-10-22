import { describe, it, expect, beforeEach } from 'vitest';
import { GameStateManager, State } from '../core/GameState';
import { Storage } from '../utils/Storage';

describe('GameStateManager Tests', () => {
  let gameState: GameStateManager;

  beforeEach(() => {
    Storage.clearMemoryStore();
    gameState = new GameStateManager();
  });

  it('starts in TITLE state', () => {
    expect(gameState.getState()).toBe(State.TITLE);
  });

  it('transitions to PLAYING when run is started', () => {
    gameState.startRun();
    expect(gameState.getState()).toBe(State.PLAYING);
    expect(gameState.score).toBe(0);
    expect(gameState.distance).toBe(0);
    expect(gameState.currentSpeed).toBe(gameState.initialSpeed);
  });

  it('updates distance, speed, and score on update loop', () => {
    gameState.startRun();
    const dt = 1.0; // 1 second
    gameState.update(dt);

    expect(gameState.distance).toBeCloseTo(gameState.initialSpeed * dt);
    expect(gameState.score).toBeGreaterThan(0);
  });

  it('toggles camera mode without resetting run progress', () => {
    gameState.startRun();
    gameState.update(2.0);
    const distBefore = gameState.distance;
    const scoreBefore = gameState.score;

    const initialMode = gameState.cameraMode;
    const newMode = gameState.toggleCameraMode();

    expect(newMode).not.toBe(initialMode);
    expect(gameState.distance).toBe(distBefore);
    expect(gameState.score).toBe(scoreBefore);
    expect(gameState.getState()).toBe(State.PLAYING);
  });

  it('triggers game over and persists high scores correctly', () => {
    gameState.startRun();
    gameState.score = 500;
    gameState.distance = 250;

    const res = gameState.triggerGameOver();
    expect(gameState.getState()).toBe(State.GAME_OVER);
    expect(res.isNewRecord).toBe(true);
    expect(gameState.highScore).toBe(500);

    // Another run with lower score should not overwrite record
    const secondRun = new GameStateManager();
    secondRun.startRun();
    secondRun.score = 300;
    const res2 = secondRun.triggerGameOver();
    expect(res2.isNewRecord).toBe(false);
    expect(secondRun.highScore).toBe(500);
  });
});
