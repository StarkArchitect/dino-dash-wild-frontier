import * as THREE from 'three';
import { DinoVariant, SkinType } from '../entities/DinoCatalog';

export class TextureGenerator {
  private static cache: Map<string, THREE.Texture> = new Map();

  /**
   * Generates or retrieves the customized diffuse skin texture for a specific dinosaur variant.
   */
  public static createSkinTextureForVariant(variant: DinoVariant): THREE.CanvasTexture {
    const cacheKey = `dino_skin_${variant.visual.skinType}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as THREE.CanvasTexture;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const skinType = variant.visual.skinType;
    this.renderSkinByType(ctx, skinType, variant);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set(cacheKey, texture);
    return texture;
  }

  private static renderSkinByType(
    ctx: CanvasRenderingContext2D,
    skinType: SkinType,
    variant: DinoVariant
  ): void {
    const pHex = `#${variant.visual.primaryColor.toString(16).padStart(6, '0')}`;
    const bHex = `#${variant.visual.bellyColor.toString(16).padStart(6, '0')}`;
    const aHex = `#${variant.visual.accentColor.toString(16).padStart(6, '0')}`;

    switch (skinType) {
      case 'swift_raptor': {
        // Golden cheetah sprint stripes & feather vanes
        const grad = ctx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0.0, aHex);
        grad.addColorStop(0.4, pHex);
        grad.addColorStop(1.0, bHex);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        // Cheetah predator rosettes & spots
        ctx.fillStyle = 'rgba(70, 20, 5, 0.6)';
        for (let i = 0; i < 90; i++) {
          const sx = (i * 73) % 512;
          const sy = (i * 47) % 512;
          ctx.beginPath();
          ctx.arc(sx, sy, 4 + (i % 5), 0, Math.PI * 2);
          ctx.fill();
        }

        // Aerodynamic chevron feather vanes
        ctx.strokeStyle = 'rgba(255, 235, 180, 0.4)';
        ctx.lineWidth = 2;
        for (let y = 30; y < 512; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(256, y + 20);
          ctx.lineTo(512, y);
          ctx.stroke();
        }
        break;
      }

      case 'coin_hunter': {
        // Gilded metallic hexagonal gold tessellation
        const grad = ctx.createLinearGradient(0, 0, 512, 512);
        grad.addColorStop(0.0, '#78350f');
        grad.addColorStop(0.5, '#eab308');
        grad.addColorStop(1.0, '#fef08a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        // Gold ingots & shimmering metallic scales
        for (let r = 0; r < 24; r++) {
          for (let c = 0; c < 24; c++) {
            const cx = c * 22 + (r % 2) * 11;
            const cy = r * 22;
            ctx.fillStyle = (r + c) % 2 === 0 ? 'rgba(254, 240, 138, 0.7)' : 'rgba(180, 83, 9, 0.5)';
            ctx.fillRect(cx, cy, 18, 18);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.strokeRect(cx, cy, 18, 18);
          }
        }
        break;
      }

      case 'jumper_rex': {
        // Vivid emerald scales with jade tendon striations
        const grad = ctx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0.0, aHex);
        grad.addColorStop(0.5, pHex);
        grad.addColorStop(1.0, bHex);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        // Spring muscle fibers
        ctx.strokeStyle = 'rgba(167, 243, 208, 0.5)';
        ctx.lineWidth = 3;
        for (let x = 0; x < 512; x += 32) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.bezierCurveTo(x + 25, 200, x - 25, 350, x, 512);
          ctx.stroke();
        }
        this.renderHexScales(ctx, 'rgba(6, 78, 59, 0.5)');
        break;
      }

      case 'ironhide_triceratops': {
        // Weathered basalt rock & heavy osteoderm armor scutes
        ctx.fillStyle = pHex;
        ctx.fillRect(0, 0, 512, 512);

        // Heavy rock cracks
        ctx.strokeStyle = 'rgba(20, 20, 20, 0.75)';
        ctx.lineWidth = 3;
        for (let i = 0; i < 18; i++) {
          const sx = (i * 61) % 512;
          ctx.beginPath();
          ctx.moveTo(sx, 0);
          ctx.lineTo(sx + 30, 160);
          ctx.lineTo(sx - 20, 320);
          ctx.lineTo(sx + 10, 512);
          ctx.stroke();
        }

        // Armored stone rivets
        for (let y = 20; y < 512; y += 48) {
          for (let x = 20; x < 512; x += 48) {
            ctx.fillStyle = '#1c1917';
            ctx.beginPath();
            ctx.arc(x, y, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#a8a29e';
            ctx.beginPath();
            ctx.arc(x - 2, y - 2, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      }

      case 'ember_rex': {
        // Charcoal obsidian crust with glowing molten lava fissures
        ctx.fillStyle = '#18181b';
        ctx.fillRect(0, 0, 512, 512);

        // Fiery molten magma veins
        for (let v = 0; v < 14; v++) {
          const vx = (v * 77) % 512;
          // Outer glow
          ctx.strokeStyle = 'rgba(249, 115, 22, 0.8)';
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.moveTo(vx, 0);
          ctx.bezierCurveTo(vx + 40, 150, vx - 50, 320, vx + 20, 512);
          ctx.stroke();

          // Hot white-yellow molten core
          ctx.strokeStyle = 'rgba(254, 240, 138, 0.95)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(vx, 0);
          ctx.bezierCurveTo(vx + 40, 150, vx - 50, 320, vx + 20, 512);
          ctx.stroke();
        }
        break;
      }

      case 'shadow_raptor': {
        // Deep obsidian purple with bioluminescent violet circuitry
        ctx.fillStyle = '#09090b';
        ctx.fillRect(0, 0, 512, 512);

        this.renderHexScales(ctx, 'rgba(139, 92, 246, 0.25)');

        // Neon violet bio-luminescent runes
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 10;
        for (let i = 0; i < 8; i++) {
          const x = i * 64 + 20;
          ctx.strokeRect(x, 40, 30, 80);
          ctx.strokeRect(x + 10, 160, 20, 120);
          ctx.strokeRect(x, 320, 30, 80);
        }
        ctx.shadowBlur = 0;
        break;
      }

      case 'frost_spinosaurus': {
        // Arctic ice glacier with crystalline frost fractals
        const grad = ctx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0.0, '#0369a1');
        grad.addColorStop(0.5, '#38bdf8');
        grad.addColorStop(1.0, '#f0f9ff');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        // Ice crystal fractures
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 24; i++) {
          const sx = (i * 47) % 512;
          const sy = (i * 63) % 512;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + 35, sy + 40);
          ctx.lineTo(sx - 20, sy + 70);
          ctx.lineTo(sx + 40, sy + 90);
          ctx.stroke();
        }
        break;
      }

      case 'classic':
      default: {
        // Olive-sand reptilian camouflage (classic)
        const grad = ctx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0.0, '#3a4435');
        grad.addColorStop(0.3, '#4d5945');
        grad.addColorStop(0.7, '#6b7a5e');
        grad.addColorStop(1.0, '#b8af8a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        this.renderHexScales(ctx, 'rgba(25, 30, 22, 0.45)');

        // Predator dorsal tiger-stripes
        ctx.fillStyle = 'rgba(25, 32, 24, 0.35)';
        for (let i = 0; i < 8; i++) {
          ctx.beginPath();
          const sx = i * 64 + 10;
          ctx.moveTo(sx, 0);
          ctx.bezierCurveTo(sx + 20, 100, sx - 15, 200, sx + 10, 320);
          ctx.bezierCurveTo(sx + 35, 220, sx + 45, 120, sx + 30, 0);
          ctx.closePath();
          ctx.fill();
        }
        break;
      }
    }
  }

  private static renderHexScales(ctx: CanvasRenderingContext2D, strokeColor: string): void {
    const numRows = 24;
    const numCols = 24;
    const cellW = 512 / numCols;
    const cellH = 512 / numRows;

    for (let r = 0; r < numRows; r++) {
      const offsetX = (r % 2) * (cellW * 0.5);
      for (let c = 0; c < numCols; c++) {
        const cx = c * cellW + offsetX;
        const cy = r * cellH;
        const radius = cellW * 0.42;

        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /**
   * Generates a bump/normal map for crisp reptilian skin scales.
   */
  public static createDinoBumpMap(): THREE.CanvasTexture {
    if (this.cache.has('dino_bump')) {
      return this.cache.get('dino_bump') as THREE.CanvasTexture;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 256, 256);

    const numRows = 24;
    const numCols = 24;
    const cellW = 256 / numCols;
    const cellH = 256 / numRows;

    for (let r = 0; r < numRows; r++) {
      const offsetX = (r % 2) * (cellW * 0.5);
      for (let c = 0; c < numCols; c++) {
        const cx = c * cellW + offsetX;
        const cy = r * cellH;
        const radius = cellW * 0.42;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.8, '#888888');
        grad.addColorStop(1, '#333333');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set('dino_bump', texture);
    return texture;
  }

  /**
   * Procedural desert sand ground texture with multi-scale wind ripples & mineral grain.
   */
  public static createSandTexture(): THREE.CanvasTexture {
    if (this.cache.has('sand')) {
      return this.cache.get('sand') as THREE.CanvasTexture;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Rich desert base gradient
    const baseGrad = ctx.createLinearGradient(0, 0, 512, 512);
    baseGrad.addColorStop(0.0, '#cf955d');
    baseGrad.addColorStop(0.5, '#c58b52');
    baseGrad.addColorStop(1.0, '#b87c44');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, 512, 512);

    // Multi-frequency organic wind ripple dunes
    for (let y = 0; y < 512; y += 14) {
      const isCrest = (y / 14) % 2 === 0;
      ctx.fillStyle = isCrest ? 'rgba(245, 195, 140, 0.35)' : 'rgba(145, 90, 45, 0.25)';
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= 512; x += 16) {
        // Harmonic dune ripple perturbation
        const wave = Math.sin(x * 0.025 + y * 0.04) * 4.5 + Math.cos(x * 0.06 - y * 0.02) * 2.2;
        ctx.lineTo(x, y + wave);
      }
      ctx.lineTo(512, y + 10);
      ctx.lineTo(0, y + 10);
      ctx.closePath();
      ctx.fill();
    }

    // Natural desert pebble & sand grain noise
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 18;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.82));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.65));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    // Balanced repeat avoids high-frequency tiling patterns on Intel UHD
    texture.repeat.set(10, 16);
    this.cache.set('sand', texture);
    return texture;
  }

  /**
   * Procedural Saguaro Cactus vertical fluting and thorn spine clusters.
   */
  public static createCactusTexture(): THREE.CanvasTexture {
    if (this.cache.has('cactus')) {
      return this.cache.get('cactus') as THREE.CanvasTexture;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#3f683a';
    ctx.fillRect(0, 0, 256, 256);

    const fluteWidth = 256 / 8;
    for (let f = 0; f < 8; f++) {
      const fx = f * fluteWidth;
      const grad = ctx.createLinearGradient(fx, 0, fx + fluteWidth, 0);
      grad.addColorStop(0.0, 'rgba(25, 45, 20, 0.7)');
      grad.addColorStop(0.5, 'rgba(100, 160, 90, 0.6)');
      grad.addColorStop(1.0, 'rgba(25, 45, 20, 0.7)');
      ctx.fillStyle = grad;
      ctx.fillRect(fx, 0, fluteWidth, 256);

      for (let y = 8; y < 256; y += 24) {
        ctx.fillStyle = '#d4c29a';
        ctx.beginPath();
        ctx.arc(fx + fluteWidth * 0.5, y, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(fx + fluteWidth * 0.5 - 4, y - 2);
        ctx.lineTo(fx + fluteWidth * 0.5 + 4, y + 2);
        ctx.moveTo(fx + fluteWidth * 0.5 - 4, y + 2);
        ctx.lineTo(fx + fluteWidth * 0.5 + 4, y - 2);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set('cactus', texture);
    return texture;
  }

  /**
   * Procedural Canyon Cliff Strata texture with natural geological waviness and mineral deposits.
   */
  public static createCanyonStrataTexture(): THREE.CanvasTexture {
    if (this.cache.has('canyon_strata')) {
      return this.cache.get('canyon_strata') as THREE.CanvasTexture;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Rich sedimentary geological strata colors
    const strataColors = [
      '#7b2816', // Dark hematite rust
      '#a64528', // Rich terracotta
      '#8f371e', // Red sandstone
      '#bd5a33', // Warm canyon ochre
      '#d27c49', // Desert apricot sandstone
      '#c1683c', // Raw sienna
      '#5c2012', // Deep shale fissure
      '#df9c69'  // Pale limestone bed
    ];

    // Draw organically wavy sedimentary beds
    let currentY = 0;
    let bandIdx = 0;
    while (currentY < 512) {
      const bandHeight = Math.floor(14 + ((bandIdx * 19) % 36));
      const color = strataColors[bandIdx % strataColors.length];
      bandIdx++;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, currentY);
      for (let x = 0; x <= 512; x += 32) {
        const wave = Math.sin(x * 0.015 + bandIdx * 1.7) * 4.0;
        ctx.lineTo(x, currentY + wave);
      }
      ctx.lineTo(512, Math.min(512, currentY + bandHeight + 6));
      ctx.lineTo(0, Math.min(512, currentY + bandHeight + 6));
      ctx.closePath();
      ctx.fill();

      // Bedding contact shadow seam
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.fillRect(0, currentY + bandHeight - 2, 512, 2.5);

      // Micro-lamination striation line inside the rock bed
      ctx.strokeStyle = 'rgba(255, 230, 200, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, currentY + bandHeight * 0.5);
      ctx.lineTo(512, currentY + bandHeight * 0.5);
      ctx.stroke();

      currentY += bandHeight;
    }

    // Vertical mineral rain streak washes
    for (let s = 0; s < 18; s++) {
      const sx = (s * 31) % 512;
      const sw = 12 + (s % 5) * 6;
      const grad = ctx.createLinearGradient(sx, 0, sx + sw, 0);
      grad.addColorStop(0.0, 'rgba(40, 15, 8, 0.0)');
      grad.addColorStop(0.5, 'rgba(40, 15, 8, 0.08)');
      grad.addColorStop(1.0, 'rgba(40, 15, 8, 0.0)');
      ctx.fillStyle = grad;
      ctx.fillRect(sx, 0, sw, 512);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 2);
    this.cache.set('canyon_strata', texture);
    return texture;
  }
}
