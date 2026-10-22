import { DINO_CATALOG, DinoCatalogHelper, DinoVariant } from '../entities/DinoCatalog';
import { Storage } from '../utils/Storage';
import { EventBus } from '../core/EventBus';
import { ShopPreview } from './ShopPreview';

export class ShopModal {
  private modalEl: HTMLElement;
  private previewCanvas: HTMLCanvasElement;
  private preview: ShopPreview | null = null;

  // Header
  private walletDisplay: HTMLElement;
  private btnClose: HTMLElement;

  // Selected Dino Details
  private dinoRarity: HTMLElement;
  private dinoName: HTMLElement;
  private dinoSpecies: HTMLElement;
  private dinoDesc: HTMLElement;
  private dinoSpecial: HTMLElement;

  // Stat values & bars
  private statSpeedVal: HTMLElement;
  private statSpeedBar: HTMLElement;
  private statJumpVal: HTMLElement;
  private statJumpBar: HTMLElement;
  private statMagnetVal: HTMLElement;
  private statMagnetBar: HTMLElement;
  private statCoinsVal: HTMLElement;
  private statCoinsBar: HTMLElement;
  private statScoreVal: HTMLElement;
  private statScoreBar: HTMLElement;
  private statShieldVal: HTMLElement;

  // Action
  private btnAction: HTMLButtonElement;
  private actionMsg: HTMLElement;

  // Carousel
  private carouselTrack: HTMLElement;

  private selectedId: string = 'classic_rex';
  private onReturnCallback: (() => void) | null = null;

  constructor() {
    this.modalEl = document.getElementById('shop-screen')!;
    this.previewCanvas = document.getElementById('shop-preview-canvas') as HTMLCanvasElement;

    this.walletDisplay = document.getElementById('shop-wallet-val')!;
    this.btnClose = document.getElementById('btn-close-shop')!;

    this.dinoRarity = document.getElementById('shop-dino-rarity')!;
    this.dinoName = document.getElementById('shop-dino-name')!;
    this.dinoSpecies = document.getElementById('shop-dino-species')!;
    this.dinoDesc = document.getElementById('shop-dino-desc')!;
    this.dinoSpecial = document.getElementById('shop-dino-special')!;

    this.statSpeedVal = document.getElementById('stat-speed-val')!;
    this.statSpeedBar = document.getElementById('stat-speed-bar')!;
    this.statJumpVal = document.getElementById('stat-jump-val')!;
    this.statJumpBar = document.getElementById('stat-jump-bar')!;
    this.statMagnetVal = document.getElementById('stat-magnet-val')!;
    this.statMagnetBar = document.getElementById('stat-magnet-bar')!;
    this.statCoinsVal = document.getElementById('stat-coins-val')!;
    this.statCoinsBar = document.getElementById('stat-coins-bar')!;
    this.statScoreVal = document.getElementById('stat-score-val')!;
    this.statScoreBar = document.getElementById('stat-score-bar')!;
    this.statShieldVal = document.getElementById('stat-shield-val')!;

    this.btnAction = document.getElementById('btn-shop-action') as HTMLButtonElement;
    this.actionMsg = document.getElementById('shop-action-msg')!;
    this.carouselTrack = document.getElementById('shop-carousel-track')!;

    this.bindEvents();
  }

  private initPreviewIfNeeded(): void {
    if (!this.preview && this.previewCanvas) {
      this.preview = new ShopPreview(this.previewCanvas);
    }
  }

  private bindEvents(): void {
    this.btnClose.addEventListener('click', () => {
      EventBus.emit('uiClick');
      this.close();
    });

    this.btnAction.addEventListener('click', () => {
      this.handleActionClick();
    });
  }

  public open(onReturn?: () => void): void {
    this.onReturnCallback = onReturn || null;
    this.modalEl.classList.add('active');

    this.initPreviewIfNeeded();
    if (this.preview) {
      this.preview.start();
    }

    this.selectedId = Storage.getEquippedDino();
    this.renderCarousel();
    this.selectDino(this.selectedId);
    this.updateWalletDisplay();
  }

  public close(): void {
    this.modalEl.classList.remove('active');
    if (this.preview) {
      this.preview.stop();
    }
    if (this.onReturnCallback) {
      this.onReturnCallback();
      this.onReturnCallback = null;
    }
  }

  public updateWalletDisplay(): void {
    const wallet = Storage.getWallet();
    this.walletDisplay.textContent = wallet.toLocaleString();
  }

  private renderCarousel(): void {
    this.carouselTrack.innerHTML = '';
    const unlocked = Storage.getUnlockedDinos();
    const equipped = Storage.getEquippedDino();

    DINO_CATALOG.forEach(dino => {
      const card = document.createElement('div');
      card.className = `shop-dino-card rarity-${dino.rarity}`;
      if (dino.id === this.selectedId) card.classList.add('selected');
      if (dino.id === equipped) card.classList.add('equipped');

      const isOwned = unlocked.includes(dino.id);

      card.innerHTML = `
        <div class="card-rarity-tag">${dino.rarity.toUpperCase()}</div>
        <div class="card-icon">${this.getDinoEmoji(dino.id)}</div>
        <div class="card-title">${dino.name}</div>
        <div class="card-status-badge">
          ${dino.id === equipped ? '★ EQUIPPED' : isOwned ? 'OWNED' : `🪙 ${dino.price}`}
        </div>
      `;

      card.addEventListener('click', () => {
        EventBus.emit('uiClick');
        this.selectDino(dino.id);
      });

      this.carouselTrack.appendChild(card);
    });
  }

  private selectDino(id: string): void {
    this.selectedId = id;
    const variant = DinoCatalogHelper.getVariantById(id);

    // Update 3D preview
    if (this.preview) {
      this.preview.setVariant(variant);
    }

    // Update Text Details
    this.dinoRarity.textContent = variant.rarity.toUpperCase();
    this.dinoRarity.className = `rarity-badge rarity-${variant.rarity}`;
    this.dinoName.textContent = variant.name;
    this.dinoSpecies.textContent = variant.species;
    this.dinoDesc.textContent = variant.description;
    this.dinoSpecial.textContent = variant.specialAbility;

    // Update Stats Bars (100% is baseline)
    const stats = variant.stats;
    this.statSpeedVal.textContent = `${Math.round(stats.speedModifier * 100)}%`;
    this.statSpeedBar.style.width = `${Math.min(100, (stats.speedModifier / 1.25) * 100)}%`;

    this.statJumpVal.textContent = `${Math.round(stats.jumpForceModifier * 100)}%`;
    this.statJumpBar.style.width = `${Math.min(100, (stats.jumpForceModifier / 1.25) * 100)}%`;

    this.statMagnetVal.textContent = `${Math.round(stats.coinRadiusModifier * 100)}%`;
    this.statMagnetBar.style.width = `${Math.min(100, (stats.coinRadiusModifier / 1.6) * 100)}%`;

    this.statCoinsVal.textContent = `${Math.round(stats.coinEarningsModifier * 100)}%`;
    this.statCoinsBar.style.width = `${Math.min(100, (stats.coinEarningsModifier / 1.25) * 100)}%`;

    this.statScoreVal.textContent = `${Math.round(stats.scoreMultiplier * 100)}%`;
    this.statScoreBar.style.width = `${Math.min(100, (stats.scoreMultiplier / 1.3) * 100)}%`;

    this.statShieldVal.textContent = stats.shieldCharges > 0 
      ? '🛡️ Kinetic Barrier (1 Lethal Hit Absorbed)' 
      : 'Standard (0 Defenses)';

    // Update Action Button State
    this.updateActionButton(variant);

    // Update Selected Highlight in Carousel
    const cards = this.carouselTrack.querySelectorAll('.shop-dino-card');
    cards.forEach((c, idx) => {
      c.classList.toggle('selected', DINO_CATALOG[idx].id === id);
    });
  }

  private updateActionButton(variant: DinoVariant): void {
    const equipped = Storage.getEquippedDino();
    const isOwned = Storage.isDinoUnlocked(variant.id);
    const wallet = Storage.getWallet();

    this.actionMsg.textContent = '';
    this.actionMsg.className = 'action-msg';

    if (variant.id === equipped) {
      this.btnAction.textContent = '✓ CURRENTLY EQUIPPED';
      this.btnAction.disabled = true;
      this.btnAction.className = 'btn btn-secondary btn-equipped';
    } else if (isOwned) {
      this.btnAction.textContent = 'EQUIP DINOSAUR';
      this.btnAction.disabled = false;
      this.btnAction.className = 'btn btn-primary pulse';
    } else {
      // Locked: needs purchase
      if (wallet >= variant.price) {
        this.btnAction.textContent = `UNLOCK FOR ${variant.price.toLocaleString()} 🪙`;
        this.btnAction.disabled = false;
        this.btnAction.className = 'btn btn-primary btn-unlock pulse';
      } else {
        const short = variant.price - wallet;
        this.btnAction.textContent = `LOCKED — NEED ${variant.price.toLocaleString()} 🪙`;
        this.btnAction.disabled = true;
        this.btnAction.className = 'btn btn-secondary btn-locked';
        this.actionMsg.textContent = `Collect ${short.toLocaleString()} more coins in the Badlands to unlock!`;
        this.actionMsg.classList.add('text-warning');
      }
    }
  }

  private handleActionClick(): void {
    const variant = DinoCatalogHelper.getVariantById(this.selectedId);
    const equipped = Storage.getEquippedDino();
    const isOwned = Storage.isDinoUnlocked(variant.id);

    if (variant.id === equipped) return;

    if (isOwned) {
      // Equip directly
      Storage.setEquippedDino(variant.id);
      EventBus.emit('uiClick');
      EventBus.emit('dinoEquippedChanged', variant);
      this.renderCarousel();
      this.updateActionButton(variant);
      this.actionMsg.textContent = `Successfully equipped ${variant.name}!`;
      this.actionMsg.classList.add('text-success');
    } else {
      // Purchase and unlock
      const success = Storage.spendCoins(variant.price);
      if (success) {
        Storage.unlockDino(variant.id);
        Storage.setEquippedDino(variant.id);
        EventBus.emit('shopPurchase');
        EventBus.emit('dinoEquippedChanged', variant);
        this.updateWalletDisplay();
        this.renderCarousel();
        this.updateActionButton(variant);
        this.actionMsg.textContent = `🎉 Unlocked and equipped ${variant.name}!`;
        this.actionMsg.classList.add('text-success');
      } else {
        this.actionMsg.textContent = 'Insufficient coins!';
        this.actionMsg.classList.add('text-warning');
      }
    }
  }

  private getDinoEmoji(id: string): string {
    switch (id) {
      case 'swift_raptor': return '🐆';
      case 'coin_hunter': return '🪙';
      case 'jumper_rex': return '🦘';
      case 'ironhide_triceratops': return '🛡️';
      case 'ember_rex': return '🔥';
      case 'shadow_raptor': return '🌑';
      case 'frost_spinosaurus': return '❄️';
      case 'classic_rex':
      default: return '🦖';
    }
  }
}
