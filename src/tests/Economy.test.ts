import { describe, it, expect, beforeEach } from 'vitest';
import { Storage } from '../utils/Storage';
import { GameStateManager } from '../core/GameState';

describe('Persistent Coin Economy & Progression', () => {
  beforeEach(() => {
    Storage.clearMemoryStore();
  });

  it('starts with a wallet of 0 and classic_rex unlocked & equipped', () => {
    expect(Storage.getWallet()).toBe(0);
    expect(Storage.getUnlockedDinos()).toContain('classic_rex');
    expect(Storage.getEquippedDino()).toBe('classic_rex');
  });

  it('correctly credits coins to wallet and lifetime tracking', () => {
    const balance = Storage.addCoins(250);
    expect(balance).toBe(250);
    expect(Storage.getWallet()).toBe(250);
    expect(Storage.getLifetimeCoins()).toBe(250);

    Storage.addCoins(100);
    expect(Storage.getWallet()).toBe(350);
    expect(Storage.getLifetimeCoins()).toBe(350);
  });

  it('deducts coins on valid purchases and rejects insufficient funds', () => {
    Storage.addCoins(500);

    // Spend 300
    const success1 = Storage.spendCoins(300);
    expect(success1).toBe(true);
    expect(Storage.getWallet()).toBe(200);

    // Attempt to spend 300 when only 200 available
    const success2 = Storage.spendCoins(300);
    expect(success2).toBe(false);
    expect(Storage.getWallet()).toBe(200); // Balance unaltered
  });

  it('manages dinosaur unlock state without duplicates', () => {
    expect(Storage.isDinoUnlocked('swift_raptor')).toBe(false);

    const unlocked = Storage.unlockDino('swift_raptor');
    expect(unlocked).toBe(true);
    expect(Storage.isDinoUnlocked('swift_raptor')).toBe(true);

    // Duplicate unlock attempt
    const duplicate = Storage.unlockDino('swift_raptor');
    expect(duplicate).toBe(false);
  });

  it('prevents equipping locked dinosaurs and allows equipping unlocked ones', () => {
    // Attempt equip locked dino
    const equipFail = Storage.setEquippedDino('shadow_raptor');
    expect(equipFail).toBe(false);
    expect(Storage.getEquippedDino()).toBe('classic_rex');

    // Unlock and equip
    Storage.unlockDino('shadow_raptor');
    const equipSuccess = Storage.setEquippedDino('shadow_raptor');
    expect(equipSuccess).toBe(true);
    expect(Storage.getEquippedDino()).toBe('shadow_raptor');
  });

  it('verifies Ironhide Triceratops shield collision absorption in GameStateManager', () => {
    Storage.unlockDino('ironhide_triceratops');
    Storage.setEquippedDino('ironhide_triceratops');

    const state = new GameStateManager();
    state.startRun();

    expect(state.shieldChargesRemaining).toBe(1);

    // First collision: should be absorbed by shield!
    const survived1 = state.absorbHitWithShield();
    expect(survived1).toBe(true);
    expect(state.shieldChargesRemaining).toBe(0);
    expect(state.invulnerabilityTimer).toBeGreaterThan(0);

    // Immediate second hit during invulnerability grace period: should survive
    const survived2 = state.absorbHitWithShield();
    expect(survived2).toBe(true);

    // Advance time past grace period
    state.update(2.0);
    expect(state.invulnerabilityTimer).toBe(0);

    // Next collision: no shield left, should be fatal
    const survived3 = state.absorbHitWithShield();
    expect(survived3).toBe(false);
  });
});
