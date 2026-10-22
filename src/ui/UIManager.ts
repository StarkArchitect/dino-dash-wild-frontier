import { EventBus } from '../core/EventBus';
import { Storage } from '../utils/Storage';
import { GameStateManager, State } from '../core/GameState';
import { GraphicsPreset } from '../graphics/RendererManager';
import { ShopModal } from './ShopModal';

export class UIManager {
  private gameState: GameStateManager;
  private shopModal: ShopModal;

  // Screens
  private titleScreen: HTMLElement;
  private hudScreen: HTMLElement;
  private pauseScreen: HTMLElement;
  private settingsScreen: HTMLElement;
  private gameOverScreen: HTMLElement;

  // Title Screen Elements
  private btnPlay: HTMLElement;
  private btnOpenShop: HTMLElement;
  private btnCamSelect: HTMLElement;
  private titleCamLabel: HTMLElement;
  private btnOpenSettings: HTMLElement;
  private titleBestScore: HTMLElement;
  private titleBestDistance: HTMLElement;
  private titleWalletCoins: HTMLElement;

  // HUD Elements
  private hudScore: HTMLElement;
  private hudCoins: HTMLElement;
  private hudDistance: HTMLElement;
  private hudSpeed: HTMLElement;
  private hudHighScore: HTMLElement;
  private hudCamToggle: HTMLElement;
  private hudCamModeText: HTMLElement;
  private hudShieldBox: HTMLElement;
  private hudShieldCount: HTMLElement;
  private btnMute: HTMLElement;
  private btnPause: HTMLElement;
  private touchJump: HTMLElement;
  private touchCrouch: HTMLElement;

  // Pause Elements
  private btnResume: HTMLElement;
  private btnPauseShop: HTMLElement;
  private btnPauseRestart: HTMLElement;
  private btnPauseSettings: HTMLElement;
  private btnPauseMenu: HTMLElement;
  private pauseDist: HTMLElement;
  private pauseScore: HTMLElement;
  private pauseCoins: HTMLElement;

  // Settings Elements
  private presetButtons: NodeListOf<HTMLButtonElement>;
  private camPrefButtons: NodeListOf<HTMLButtonElement>;
  private sliderFov: HTMLInputElement;
  private fovVal: HTMLElement;
  private sliderSfx: HTMLInputElement;
  private sfxVal: HTMLElement;
  private sliderAmb: HTMLInputElement;
  private ambVal: HTMLElement;
  private btnCloseSettings: HTMLElement;

  // Game Over Elements
  private goScore: HTMLElement;
  private goCoins: HTMLElement;
  private goDistance: HTMLElement;
  private goWallet: HTMLElement;
  private newRecordBadge: HTMLElement;
  private btnRestart: HTMLElement;
  private btnGoShop: HTMLElement;
  private btnGoMenu: HTMLElement;

  constructor(gameState: GameStateManager) {
    this.gameState = gameState;
    this.shopModal = new ShopModal();

    // Query DOM
    this.titleScreen = document.getElementById('title-screen')!;
    this.hudScreen = document.getElementById('hud-screen')!;
    this.pauseScreen = document.getElementById('pause-screen')!;
    this.settingsScreen = document.getElementById('settings-screen')!;
    this.gameOverScreen = document.getElementById('game-over-screen')!;

    this.btnPlay = document.getElementById('btn-play')!;
    this.btnOpenShop = document.getElementById('btn-open-shop')!;
    this.btnCamSelect = document.getElementById('btn-camera-select')!;
    this.titleCamLabel = document.getElementById('title-cam-label')!;
    this.btnOpenSettings = document.getElementById('btn-open-settings')!;
    this.titleBestScore = document.getElementById('title-best-score')!;
    this.titleBestDistance = document.getElementById('title-best-distance')!;
    this.titleWalletCoins = document.getElementById('title-wallet-coins')!;

    this.hudScore = document.getElementById('hud-score')!;
    this.hudCoins = document.getElementById('hud-coins')!;
    this.hudDistance = document.getElementById('hud-distance')!;
    this.hudSpeed = document.getElementById('hud-speed')!;
    this.hudHighScore = document.getElementById('hud-high-score')!;
    this.hudCamToggle = document.getElementById('hud-cam-toggle')!;
    this.hudCamModeText = document.getElementById('hud-cam-mode-text')!;
    this.hudShieldBox = document.getElementById('hud-shield-box')!;
    this.hudShieldCount = document.getElementById('hud-shield-count')!;
    this.btnMute = document.getElementById('btn-mute')!;
    this.btnPause = document.getElementById('btn-pause')!;
    this.touchJump = document.getElementById('touch-jump')!;
    this.touchCrouch = document.getElementById('touch-crouch')!;

    this.btnResume = document.getElementById('btn-resume')!;
    this.btnPauseShop = document.getElementById('btn-pause-shop')!;
    this.btnPauseRestart = document.getElementById('btn-pause-restart')!;
    this.btnPauseSettings = document.getElementById('btn-pause-settings')!;
    this.btnPauseMenu = document.getElementById('btn-pause-menu')!;
    this.pauseDist = document.getElementById('pause-dist')!;
    this.pauseScore = document.getElementById('pause-score')!;
    this.pauseCoins = document.getElementById('pause-coins')!;

    this.presetButtons = document.querySelectorAll('#preset-selector .toggle-btn');
    this.camPrefButtons = document.querySelectorAll('#camera-pref-selector .toggle-btn');
    this.sliderFov = document.getElementById('slider-fov') as HTMLInputElement;
    this.fovVal = document.getElementById('fov-val')!;
    this.sliderSfx = document.getElementById('slider-sfx') as HTMLInputElement;
    this.sfxVal = document.getElementById('sfx-val')!;
    this.sliderAmb = document.getElementById('slider-amb') as HTMLInputElement;
    this.ambVal = document.getElementById('amb-val')!;
    this.btnCloseSettings = document.getElementById('btn-close-settings')!;

    this.goScore = document.getElementById('go-score')!;
    this.goCoins = document.getElementById('go-coins')!;
    this.goDistance = document.getElementById('go-distance')!;
    this.goWallet = document.getElementById('go-wallet')!;
    this.newRecordBadge = document.getElementById('new-record-badge')!;
    this.btnRestart = document.getElementById('btn-restart')!;
    this.btnGoShop = document.getElementById('btn-go-shop')!;
    this.btnGoMenu = document.getElementById('btn-go-menu')!;

    this.initUI();
    this.bindEvents();
  }

  private initUI(): void {
    const settings = Storage.getSettings();
    this.titleBestScore.textContent = this.gameState.highScore.toString();
    this.titleBestDistance.textContent = this.gameState.bestDistance.toString();
    this.titleWalletCoins.textContent = Storage.getWallet().toLocaleString();
    this.hudHighScore.textContent = this.gameState.highScore.toString();
    this.updateCameraLabels(this.gameState.cameraMode);

    // Init settings controls
    this.updatePresetButtons(settings.graphicsPreset);
    this.updateCamPrefButtons(settings.cameraMode);
    if (this.sliderFov) this.sliderFov.value = settings.fov.toString();
    if (this.fovVal) this.fovVal.textContent = settings.fov.toString();
    if (this.sliderSfx) this.sliderSfx.value = Math.round(settings.sfxVolume * 100).toString();
    if (this.sfxVal) this.sfxVal.textContent = Math.round(settings.sfxVolume * 100).toString();
    if (this.sliderAmb) this.sliderAmb.value = Math.round(settings.ambientVolume * 100).toString();
    if (this.ambVal) this.ambVal.textContent = Math.round(settings.ambientVolume * 100).toString();
    this.updateMuteIcon(settings.isMuted);
  }

  private bindEvents(): void {
    // --- Title Actions ---
    this.btnPlay.addEventListener('click', () => {
      EventBus.emit('uiClick');
      EventBus.emit('requestStartRun');
    });

    this.btnOpenShop.addEventListener('click', () => {
      EventBus.emit('uiClick');
      this.openShop('title');
    });

    this.btnCamSelect.addEventListener('click', () => {
      EventBus.emit('uiClick');
      const newMode = this.gameState.toggleCameraMode();
      this.updateCameraLabels(newMode);
    });

    this.btnOpenSettings.addEventListener('click', () => {
      EventBus.emit('uiClick');
      this.openSettings('title');
    });

    // --- HUD Actions ---
    this.hudCamToggle.addEventListener('click', () => {
      EventBus.emit('uiClick');
      const newMode = this.gameState.toggleCameraMode();
      this.updateCameraLabels(newMode);
    });

    this.btnMute.addEventListener('click', () => {
      EventBus.emit('uiClick');
      EventBus.emit('inputToggleMute');
    });

    this.btnPause.addEventListener('click', () => {
      EventBus.emit('uiClick');
      EventBus.emit('inputTogglePause');
    });

    // Touch Jump
    this.touchJump.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      EventBus.emit('inputJump');
    });
    this.touchJump.addEventListener('pointerup', () => {
      EventBus.emit('inputJumpRelease');
    });

    // Touch Crouch
    this.touchCrouch.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      EventBus.emit('inputCrouchStart');
    });
    this.touchCrouch.addEventListener('pointerup', () => {
      EventBus.emit('inputCrouchEnd');
    });

    // --- Pause Actions ---
    this.btnResume.addEventListener('click', () => {
      EventBus.emit('uiClick');
      EventBus.emit('requestResume');
    });

    this.btnPauseShop.addEventListener('click', () => {
      EventBus.emit('uiClick');
      this.openShop('pause');
    });

    this.btnPauseRestart.addEventListener('click', () => {
      EventBus.emit('uiClick');
      EventBus.emit('requestRestart');
    });

    this.btnPauseSettings.addEventListener('click', () => {
      EventBus.emit('uiClick');
      this.openSettings('pause');
    });

    this.btnPauseMenu.addEventListener('click', () => {
      EventBus.emit('uiClick');
      EventBus.emit('requestReturnMenu');
    });

    // --- Game Over Actions ---
    this.btnRestart.addEventListener('click', () => {
      EventBus.emit('uiClick');
      EventBus.emit('requestRestart');
    });

    this.btnGoShop.addEventListener('click', () => {
      EventBus.emit('uiClick');
      this.openShop('game_over');
    });

    this.btnGoMenu.addEventListener('click', () => {
      EventBus.emit('uiClick');
      EventBus.emit('requestReturnMenu');
    });

    // --- Settings Modal Actions ---
    this.presetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        EventBus.emit('uiClick');
        const preset = btn.dataset.preset as GraphicsPreset;
        this.updatePresetButtons(preset);
        EventBus.emit('graphicsPresetChanged', preset);
        Storage.saveSettings({ graphicsPreset: preset });
      });
    });

    this.camPrefButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        EventBus.emit('uiClick');
        const cam = btn.dataset.cam as 'side' | 'third';
        this.updateCamPrefButtons(cam);
        this.gameState.setCameraMode(cam);
        this.updateCameraLabels(cam);
      });
    });

    this.sliderFov.addEventListener('input', () => {
      const val = parseInt(this.sliderFov.value, 10);
      this.fovVal.textContent = val.toString();
      EventBus.emit('fovChanged', val);
      Storage.saveSettings({ fov: val });
    });

    this.sliderSfx.addEventListener('input', () => {
      const val = parseInt(this.sliderSfx.value, 10);
      this.sfxVal.textContent = val.toString();
      const amb = parseInt(this.sliderAmb.value, 10) / 100;
      EventBus.emit('volumeChanged', { sfx: val / 100, ambient: amb });
    });

    this.sliderAmb.addEventListener('input', () => {
      const val = parseInt(this.sliderAmb.value, 10);
      this.ambVal.textContent = val.toString();
      const sfx = parseInt(this.sliderSfx.value, 10) / 100;
      EventBus.emit('volumeChanged', { sfx, ambient: val / 100 });
    });

    this.btnCloseSettings.addEventListener('click', () => {
      EventBus.emit('uiClick');
      this.closeSettings();
    });

    // --- System Events ---
    EventBus.on('gameStateChange', ({ to }) => {
      this.onStateChange(to);
    });

    EventBus.on('hudUpdate', (data) => {
      this.hudScore.textContent = data.score.toString();
      this.hudDistance.textContent = data.distance.toString();
      this.hudSpeed.textContent = data.speed.toString();
      this.hudHighScore.textContent = data.highScore.toString();
      this.hudCoins.textContent = data.runCoins.toString();

      // Shield indicator in HUD
      if (data.shieldCharges > 0) {
        this.hudShieldBox.classList.remove('hidden');
        this.hudShieldCount.textContent = data.shieldCharges.toString();
      } else {
        this.hudShieldBox.classList.add('hidden');
      }
    });

    EventBus.on('cameraModeToggled', (mode: 'side' | 'third') => {
      this.updateCameraLabels(mode);
    });

    EventBus.on('muteToggled', (isMuted: boolean) => {
      this.updateMuteIcon(isMuted);
    });

    EventBus.on('gameOver', (data) => {
      this.showGameOver(data);
    });
  }

  private onStateChange(state: State): void {
    // Hide all overlays first
    this.titleScreen.classList.remove('active');
    this.hudScreen.classList.remove('active');
    this.pauseScreen.classList.remove('active');
    this.settingsScreen.classList.remove('active');
    this.gameOverScreen.classList.remove('active');

    switch (state) {
      case State.TITLE:
        this.titleScreen.classList.add('active');
        this.titleBestScore.textContent = this.gameState.highScore.toString();
        this.titleBestDistance.textContent = this.gameState.bestDistance.toString();
        this.titleWalletCoins.textContent = Storage.getWallet().toLocaleString();
        break;

      case State.PLAYING:
        this.hudScreen.classList.add('active');
        break;

      case State.PAUSED:
        this.hudScreen.classList.add('active');
        this.pauseDist.textContent = `${Math.floor(this.gameState.distance)}m`;
        this.pauseScore.textContent = this.gameState.score.toString();
        this.pauseCoins.textContent = this.gameState.runCoins.toString();
        this.pauseScreen.classList.add('active');
        break;

      case State.GAME_OVER:
        this.hudScreen.classList.add('active');
        this.gameOverScreen.classList.add('active');
        break;
    }
  }

  private showGameOver(data: {
    finalScore: number;
    distance: number;
    highScore: number;
    runCoins: number;
    wallet: number;
    isNewRecord: boolean;
  }): void {
    this.goScore.textContent = data.finalScore.toString();
    this.goCoins.textContent = `+${data.runCoins.toLocaleString()} 🪙`;
    this.goDistance.textContent = `${data.distance} m`;
    this.goWallet.textContent = `${data.wallet.toLocaleString()} 🪙`;

    if (data.isNewRecord) {
      this.newRecordBadge.classList.remove('hidden');
    } else {
      this.newRecordBadge.classList.add('hidden');
    }
  }

  // --- Shop Navigation ---
  private sourceScreenBeforeShop: 'title' | 'pause' | 'game_over' = 'title';

  private openShop(source: 'title' | 'pause' | 'game_over'): void {
    this.sourceScreenBeforeShop = source;
    if (source === 'title') {
      this.titleScreen.classList.remove('active');
    } else if (source === 'pause') {
      this.pauseScreen.classList.remove('active');
    } else if (source === 'game_over') {
      this.gameOverScreen.classList.remove('active');
    }

    this.shopModal.open(() => {
      // Callback when shop closes
      if (this.sourceScreenBeforeShop === 'title') {
        this.titleScreen.classList.add('active');
        this.titleWalletCoins.textContent = Storage.getWallet().toLocaleString();
      } else if (this.sourceScreenBeforeShop === 'pause') {
        this.pauseScreen.classList.add('active');
      } else if (this.sourceScreenBeforeShop === 'game_over') {
        this.gameOverScreen.classList.add('active');
        this.goWallet.textContent = `${Storage.getWallet().toLocaleString()} 🪙`;
      }
    });
  }

  // --- Settings Navigation ---
  private sourceScreenBeforeSettings: 'title' | 'pause' = 'title';

  private openSettings(source: 'title' | 'pause'): void {
    this.sourceScreenBeforeSettings = source;
    if (source === 'title') {
      this.titleScreen.classList.remove('active');
    } else if (source === 'pause') {
      this.pauseScreen.classList.remove('active');
    }
    this.settingsScreen.classList.add('active');
  }

  private closeSettings(): void {
    this.settingsScreen.classList.remove('active');
    if (this.sourceScreenBeforeSettings === 'title') {
      this.titleScreen.classList.add('active');
    } else if (this.sourceScreenBeforeSettings === 'pause') {
      this.pauseScreen.classList.add('active');
    }
  }

  private updateCameraLabels(mode: 'side' | 'third'): void {
    const isSide = mode === 'side';
    this.titleCamLabel.textContent = isSide ? 'SIDE VIEW' : '3RD PERSON';
    this.hudCamModeText.textContent = isSide ? 'MODE: SIDE-VIEW [V]' : 'MODE: 3RD PERSON [V]';
    this.updateCamPrefButtons(mode);
  }

  private updatePresetButtons(preset: GraphicsPreset): void {
    this.presetButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.preset === preset);
    });
  }

  private updateCamPrefButtons(cam: 'side' | 'third'): void {
    this.camPrefButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.cam === cam);
    });
  }

  private updateMuteIcon(isMuted: boolean): void {
    this.btnMute.textContent = isMuted ? '🔇' : '🔊';
  }
}
