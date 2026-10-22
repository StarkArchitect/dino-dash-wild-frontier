import { EventBus } from './EventBus';
import { Storage } from '../utils/Storage';
import { DinoCatalogHelper, DinoVariant } from '../entities/DinoCatalog';

export enum State {
  TITLE = 'TITLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER'
}

export class GameStateManager {
  private currentState: State = State.TITLE;
  public score: number = 0;
  public distance: number = 0;
  public highScore: number = 0;
  public bestDistance: number = 0;
  
  // Economy & Coins
  public wallet: number = 0;
  public runCoins: number = 0;

  // Active Dinosaur & Attributes
  public equippedDinoId: string = 'classic_rex';
  public equippedVariant: DinoVariant;
  public shieldChargesRemaining: number = 0;
  public invulnerabilityTimer: number = 0;

  // Speed metrics (m/s)
  public initialSpeed: number = 16.0;
  public currentSpeed: number = 16.0;
  public maxSpeed: number = 34.0;
  public accelerationRate: number = 0.22; // Speed increase per 100 meters

  // Active camera mode: 'side' or 'third'
  public cameraMode: 'side' | 'third' = 'side';

  // Environmental time of day progress (0.0 to 1.0 cycle)
  public timeOfDay: number = 0.15; // 0.15 = Golden morning, 0.45 = High noon, 0.75 = Sunset, 0.95 = Moonlight Night

  constructor() {
    this.highScore = Storage.getHighScore();
    this.bestDistance = Storage.getBestDistance();
    this.wallet = Storage.getWallet();

    this.equippedDinoId = Storage.getEquippedDino();
    this.equippedVariant = DinoCatalogHelper.getVariantById(this.equippedDinoId);

    const settings = Storage.getSettings();
    this.cameraMode = settings.cameraMode;

    this.applyDinoStats();

    EventBus.on('dinoEquippedChanged', (variant: DinoVariant) => {
      this.equippedDinoId = variant.id;
      this.equippedVariant = variant;
      this.applyDinoStats();
    });
  }

  public refreshEquippedDino(): DinoVariant {
    this.equippedDinoId = Storage.getEquippedDino();
    this.equippedVariant = DinoCatalogHelper.getVariantById(this.equippedDinoId);
    this.applyDinoStats();
    EventBus.emit('dinoEquippedChanged', this.equippedVariant);
    return this.equippedVariant;
  }

  private applyDinoStats(): void {
    const stats = this.equippedVariant.stats;
    this.initialSpeed = 16.0 * stats.speedModifier;
    this.maxSpeed = 34.0 * stats.speedModifier;
  }

  public getState(): State {
    return this.currentState;
  }

  public setState(newState: State): void {
    if (this.currentState === newState) return;
    const oldState = this.currentState;
    this.currentState = newState;
    EventBus.emit('gameStateChange', { from: oldState, to: newState });
  }

  public startRun(): void {
    this.refreshEquippedDino();
    this.score = 0;
    this.distance = 0;
    this.runCoins = 0;
    this.wallet = Storage.getWallet();
    this.shieldChargesRemaining = this.equippedVariant.stats.shieldCharges;
    this.invulnerabilityTimer = 0;

    this.currentSpeed = this.initialSpeed;
    this.timeOfDay = 0.15;
    this.setState(State.PLAYING);
    EventBus.emit('runStarted');
  }

  public addRunCoin(amount: number = 1): number {
    this.runCoins += amount;
    return this.runCoins;
  }

  /**
   * Evaluates if a collision can be absorbed by shield or active invulnerability.
   * Returns true if player survives, false if collision is fatal.
   */
  public absorbHitWithShield(): boolean {
    if (this.invulnerabilityTimer > 0) {
      // Still in post-hit invulnerability grace period
      return true;
    }

    if (this.shieldChargesRemaining > 0) {
      this.shieldChargesRemaining--;
      this.invulnerabilityTimer = 1.35; // 1.35s grace window
      EventBus.emit('shieldDeflect', {
        remaining: this.shieldChargesRemaining
      });
      return true; // Survived!
    }

    return false; // Fatal crash
  }

  public update(delta: number): void {
    if (this.currentState !== State.PLAYING) return;

    if (this.invulnerabilityTimer > 0) {
      this.invulnerabilityTimer = Math.max(0, this.invulnerabilityTimer - delta);
    }

    // Advance distance
    const distDelta = this.currentSpeed * delta;
    this.distance += distDelta;

    // Difficulty & speed acceleration
    if (this.currentSpeed < this.maxSpeed) {
      this.currentSpeed = Math.min(
        this.maxSpeed,
        this.initialSpeed + (this.distance / 100) * this.accelerationRate
      );
    }

    // Score accumulation (10 points per meter * equipped scoreMultiplier)
    const baseScoreDelta = Math.floor(distDelta * 1.5);
    const scoreDelta = Math.round(baseScoreDelta * this.equippedVariant.stats.scoreMultiplier);
    const oldScore = this.score;
    this.score += scoreDelta;

    // Check for milestone sound/event every 100 points
    if (Math.floor(this.score / 100) > Math.floor(oldScore / 100)) {
      EventBus.emit('scoreMilestone', this.score);
    }

    // Time of day cycle: full day-dusk-night cycle every 800 meters
    this.timeOfDay = (this.distance % 800) / 800;

    EventBus.emit('hudUpdate', {
      score: this.score,
      distance: Math.floor(this.distance),
      speed: Math.round(this.currentSpeed * 3.6),
      highScore: Math.max(this.highScore, this.score),
      cameraMode: this.cameraMode,
      timeOfDay: this.timeOfDay,
      runCoins: this.runCoins,
      wallet: this.wallet,
      shieldCharges: this.shieldChargesRemaining,
      invulnerable: this.invulnerabilityTimer > 0
    });
  }

  public triggerGameOver(): { isNewRecord: boolean } {
    if (this.currentState === State.GAME_OVER) return { isNewRecord: false };
    
    this.setState(State.GAME_OVER);

    // Deposit earned run coins into persistent wallet
    if (this.runCoins > 0) {
      this.wallet = Storage.addCoins(this.runCoins);
    } else {
      this.wallet = Storage.getWallet();
    }

    const isNewRecord = Storage.setHighScore(this.score);
    if (isNewRecord) {
      this.highScore = this.score;
    }
    Storage.setBestDistance(this.distance);
    this.bestDistance = Math.max(this.bestDistance, Math.floor(this.distance));

    EventBus.emit('gameOver', {
      finalScore: this.score,
      distance: Math.floor(this.distance),
      highScore: this.highScore,
      runCoins: this.runCoins,
      wallet: this.wallet,
      isNewRecord
    });

    return { isNewRecord };
  }

  public toggleCameraMode(): 'side' | 'third' {
    this.cameraMode = this.cameraMode === 'side' ? 'third' : 'side';
    Storage.saveSettings({ cameraMode: this.cameraMode });
    EventBus.emit('cameraModeToggled', this.cameraMode);
    return this.cameraMode;
  }

  public setCameraMode(mode: 'side' | 'third'): void {
    if (this.cameraMode !== mode) {
      this.cameraMode = mode;
      Storage.saveSettings({ cameraMode: this.cameraMode });
      EventBus.emit('cameraModeToggled', this.cameraMode);
    }
  }
}
