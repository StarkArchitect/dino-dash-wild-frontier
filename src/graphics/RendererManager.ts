import * as THREE from 'three';

export type GraphicsPreset = 'low' | 'medium' | 'high';

export class RendererManager {
  public renderer: THREE.WebGLRenderer;
  public container: HTMLElement;
  public currentPreset: GraphicsPreset = 'medium';

  constructor(container: HTMLElement, initialPreset: GraphicsPreset = 'medium') {
    this.container = container;
    this.currentPreset = initialPreset;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);
    this.applyPreset(initialPreset);
    this.resize();
  }

  public applyPreset(preset: GraphicsPreset): void {
    this.currentPreset = preset;

    if (preset === 'low') {
      this.renderer.shadowMap.enabled = false;
      this.renderer.setPixelRatio(0.85);
    } else if (preset === 'medium') {
      this.renderer.shadowMap.enabled = true;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    } else {
      // High
      this.renderer.shadowMap.enabled = true;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    }

    this.resize();
  }

  public resize(): void {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height);
  }

  public render(scene: THREE.Scene, camera: THREE.Camera): void {
    this.renderer.render(scene, camera);
  }

  public dispose(): void {
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
