import { describe, it, expect } from 'vitest';
import { CollisionMath, BoundingBox3D } from '../utils/Collisions';

describe('CollisionMath Unit Tests', () => {
  it('detects collision when player runs into a small cactus', () => {
    // Player standing at (10, 0, 0)
    const playerBox = CollisionMath.getPlayerBox(10, 0, 0, false);
    // Cactus at (10, 0, 0)
    const cactusBox = CollisionMath.getObstacleBox(10, 0, 0, 0.8, 1.85, 0.8);

    const isHit = CollisionMath.checkAABB(playerBox, cactusBox, 0.1);
    expect(isHit).toBe(true);
  });

  it('avoids collision when player jumps over a small cactus', () => {
    // Player jumping high at Y = 2.5
    const playerBox = CollisionMath.getPlayerBox(10, 2.5, 0, false);
    // Cactus height is 1.85 (maxY = 1.85)
    const cactusBox = CollisionMath.getObstacleBox(10, 0, 0, 0.8, 1.85, 0.8);

    const isHit = CollisionMath.checkAABB(playerBox, cactusBox, 0.1);
    expect(isHit).toBe(false);
  });

  it('avoids high flying pterosaur when crouching/ducking', () => {
    // High pterosaur at posY = 2.45, height = 1.1 -> spans Y from 2.45 to 3.55
    const flyerBox = CollisionMath.getObstacleBox(15, 2.45, 0, 1.8, 1.1, 2.8);

    // Player crouching at (15, 0, 0): maxY is only ~1.05
    const crouchPlayerBox = CollisionMath.getPlayerBox(15, 0, 0, true);
    const crouchHit = CollisionMath.checkAABB(crouchPlayerBox, flyerBox, 0.1);
    expect(crouchHit).toBe(false);

    // Standing player at (15, 0, 0): maxY is ~2.2 -> near or overlapping lower boundary
    // But flyer is at 2.45, so if player jumps, they definitely hit it!
    const jumpingPlayerBox = CollisionMath.getPlayerBox(15, 1.0, 0, false);
    const jumpHit = CollisionMath.checkAABB(jumpingPlayerBox, flyerBox, 0.1);
    expect(jumpHit).toBe(true);
  });

  it('does not collide when obstacle is far along X', () => {
    const playerBox = CollisionMath.getPlayerBox(0, 0, 0, false);
    const cactusBox = CollisionMath.getObstacleBox(20, 0, 0, 0.8, 1.85, 0.8);

    const isHit = CollisionMath.checkAABB(playerBox, cactusBox, 0.1);
    expect(isHit).toBe(false);
  });
});
