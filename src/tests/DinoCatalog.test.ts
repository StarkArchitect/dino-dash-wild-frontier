import { describe, it, expect } from 'vitest';
import { DINO_CATALOG, DinoCatalogHelper } from '../entities/DinoCatalog';

describe('DinoCatalog & Attributes', () => {
  it('defines 8 distinct dinosaur variants', () => {
    expect(DINO_CATALOG.length).toBe(8);
  });

  it('provides Classic Rex as the free starter dinosaur', () => {
    const starter = DinoCatalogHelper.getVariantById('classic_rex');
    expect(starter.price).toBe(0);
    expect(starter.rarity).toBe('common');
    expect(starter.stats.speedModifier).toBe(1.0);
    expect(starter.stats.jumpForceModifier).toBe(1.0);
  });

  it('guarantees all 8 variants have valid, positive attribute multipliers', () => {
    for (const dino of DINO_CATALOG) {
      expect(dino.id).toBeTruthy();
      expect(dino.name).toBeTruthy();
      expect(dino.species).toBeTruthy();
      expect(dino.description).toBeTruthy();
      expect(dino.stats.speedModifier).toBeGreaterThan(0.8);
      expect(dino.stats.speedModifier).toBeLessThan(1.5);
      expect(dino.stats.jumpForceModifier).toBeGreaterThan(0.8);
      expect(dino.stats.coinRadiusModifier).toBeGreaterThanOrEqual(1.0);
      expect(dino.stats.coinEarningsModifier).toBeGreaterThanOrEqual(1.0);
      expect(dino.stats.scoreMultiplier).toBeGreaterThanOrEqual(1.0);
    }
  });

  it('verifies Ironhide Triceratops has kinetic shield and anatomical frill/horns', () => {
    const ironhide = DinoCatalogHelper.getVariantById('ironhide_triceratops');
    expect(ironhide.stats.shieldCharges).toBe(1);
    expect(ironhide.visual.hasFrill).toBe(true);
    expect(ironhide.visual.hasHorns).toBe(true);
    expect(ironhide.visual.hasArmorPlates).toBe(true);
  });

  it('verifies Frost Spinosaurus has majestic dorsal sail', () => {
    const spino = DinoCatalogHelper.getVariantById('frost_spinosaurus');
    expect(spino.visual.hasSail).toBe(true);
    expect(spino.stats.coinRadiusModifier).toBeGreaterThan(1.1);
  });

  it('falls back to Classic Rex safely for unrecognized variant IDs', () => {
    const fallback = DinoCatalogHelper.getVariantById('non_existent_dino_xyz');
    expect(fallback.id).toBe('classic_rex');
  });
});
