export interface UserSettings {
  graphicsPreset: 'low' | 'medium' | 'high';
  cameraMode: 'side' | 'third';
  fov: number;
  sfxVolume: number;
  ambientVolume: number;
  isMuted: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  graphicsPreset: 'medium',
  cameraMode: 'side',
  fov: 70,
  sfxVolume: 0.8,
  ambientVolume: 0.6,
  isMuted: false
};

const STORAGE_KEYS = {
  HIGH_SCORE: 'dinodash_high_score',
  BEST_DISTANCE: 'dinodash_best_distance',
  SETTINGS: 'dinodash_settings',
  WALLET: 'dinodash_wallet',
  LIFETIME_COINS: 'dinodash_lifetime_coins',
  UNLOCKED_DINOS: 'dinodash_unlocked_dinos',
  EQUIPPED_DINO: 'dinodash_equipped_dino'
};

const memoryStore: Record<string, string> = {};

function safeGet(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {}
  return memoryStore[key] || null;
}

function safeSet(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } catch {}
  memoryStore[key] = value;
}

export class Storage {
  public static getHighScore(): number {
    const val = safeGet(STORAGE_KEYS.HIGH_SCORE);
    return val ? parseInt(val, 10) || 0 : 0;
  }

  public static setHighScore(score: number): boolean {
    const current = this.getHighScore();
    if (score > current) {
      safeSet(STORAGE_KEYS.HIGH_SCORE, score.toString());
      return true; // New record!
    }
    return false;
  }

  public static getBestDistance(): number {
    const val = safeGet(STORAGE_KEYS.BEST_DISTANCE);
    return val ? parseInt(val, 10) || 0 : 0;
  }

  public static setBestDistance(dist: number): boolean {
    const current = this.getBestDistance();
    if (dist > current) {
      safeSet(STORAGE_KEYS.BEST_DISTANCE, Math.floor(dist).toString());
      return true;
    }
    return false;
  }

  public static getSettings(): UserSettings {
    const val = safeGet(STORAGE_KEYS.SETTINGS);
    if (val) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(val) };
      } catch {}
    }
    return { ...DEFAULT_SETTINGS };
  }

  public static saveSettings(settings: Partial<UserSettings>): void {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    safeSet(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  }

  // --- Economy & Dinosaur Unlock Progression ---

  public static getWallet(): number {
    const val = safeGet(STORAGE_KEYS.WALLET);
    return val ? Math.max(0, parseInt(val, 10) || 0) : 0;
  }

  public static addCoins(amount: number): number {
    if (amount <= 0) return this.getWallet();
    const current = this.getWallet();
    const updated = current + Math.floor(amount);
    safeSet(STORAGE_KEYS.WALLET, updated.toString());

    // Also update lifetime coins
    const lifetime = this.getLifetimeCoins() + Math.floor(amount);
    safeSet(STORAGE_KEYS.LIFETIME_COINS, lifetime.toString());

    return updated;
  }

  public static spendCoins(amount: number): boolean {
    const current = this.getWallet();
    const cost = Math.floor(amount);
    if (cost < 0 || current < cost) {
      return false;
    }
    const updated = current - cost;
    safeSet(STORAGE_KEYS.WALLET, updated.toString());
    return true;
  }

  public static getLifetimeCoins(): number {
    const val = safeGet(STORAGE_KEYS.LIFETIME_COINS);
    return val ? Math.max(0, parseInt(val, 10) || 0) : 0;
  }

  public static getUnlockedDinos(): string[] {
    const val = safeGet(STORAGE_KEYS.UNLOCKED_DINOS);
    if (val) {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Always ensure classic_rex is present
          if (!parsed.includes('classic_rex')) {
            parsed.unshift('classic_rex');
          }
          return parsed;
        }
      } catch {}
    }
    // Default: starter classic_rex unlocked
    const initial = ['classic_rex'];
    safeSet(STORAGE_KEYS.UNLOCKED_DINOS, JSON.stringify(initial));
    return initial;
  }

  public static isDinoUnlocked(id: string): boolean {
    if (id === 'classic_rex') return true;
    const unlocked = this.getUnlockedDinos();
    return unlocked.includes(id);
  }

  public static unlockDino(id: string): boolean {
    const unlocked = this.getUnlockedDinos();
    if (unlocked.includes(id)) {
      return false; // Already unlocked
    }
    unlocked.push(id);
    safeSet(STORAGE_KEYS.UNLOCKED_DINOS, JSON.stringify(unlocked));
    return true;
  }

  public static getEquippedDino(): string {
    const val = safeGet(STORAGE_KEYS.EQUIPPED_DINO);
    if (val && this.isDinoUnlocked(val)) {
      return val;
    }
    // Default fallback
    return 'classic_rex';
  }

  public static setEquippedDino(id: string): boolean {
    if (!this.isDinoUnlocked(id)) {
      return false;
    }
    safeSet(STORAGE_KEYS.EQUIPPED_DINO, id);
    return true;
  }

  public static clearMemoryStore(): void {
    for (const k in memoryStore) {
      delete memoryStore[k];
    }
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
    } catch {}
  }
}
