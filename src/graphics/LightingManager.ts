import * as THREE from 'three';

export class LightingManager {
  public scene: THREE.Scene;
  public dirLight: THREE.DirectionalLight;
  public hemiLight: THREE.HemisphereLight;
  public fog: THREE.FogExp2;

  // Sky dome / stars for night
  private stars: THREE.Points | null = null;
  private moonMesh: THREE.Mesh | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // Atmospheric Fog
    this.fog = new THREE.FogExp2(0xd6a678, 0.009);
    this.scene.fog = this.fog;
    this.scene.background = new THREE.Color(0xd6a678);

    // Hemisphere Ambient Light (Desert sky / warm ground bounce)
    this.hemiLight = new THREE.HemisphereLight(0xffeedd, 0x996633, 0.9);
    this.scene.add(this.hemiLight);

    // Directional Sunlight with Shadows
    this.dirLight = new THREE.DirectionalLight(0xfff3db, 2.2);
    this.dirLight.position.set(25, 45, 30);
    this.dirLight.castShadow = true;

    // Tightly bounded shadow frustum for Intel UHD performance & sharp contact shadows
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 130;
    this.dirLight.shadow.camera.left = -25;
    this.dirLight.shadow.camera.right = 35;
    this.dirLight.shadow.camera.top = 25;
    this.dirLight.shadow.camera.bottom = -15;
    this.dirLight.shadow.bias = -0.0005;

    this.scene.add(this.dirLight);
    this.scene.add(this.dirLight.target);

    this.createNightElements();
  }

  private createNightElements(): void {
    // Night Stars Field
    const starCount = 350;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 600;
      starPos[i * 3 + 1] = 60 + Math.random() * 140;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 600;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.8,
      transparent: true,
      opacity: 0.0 // hidden by default in day
    });

    this.stars = new THREE.Points(starGeo, starMat);
    this.scene.add(this.stars);

    // Glowing Moon Disc
    const moonGeo = new THREE.SphereGeometry(12, 16, 16);
    const moonMat = new THREE.MeshBasicMaterial({
      color: 0xeeffff,
      transparent: true,
      opacity: 0.0
    });
    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.moonMesh.position.set(120, 140, -180);
    this.scene.add(this.moonMesh);
  }

  /**
   * Updates lighting and atmosphere across time of day:
   * 0.00 - 0.30: Golden Morning Desert
   * 0.30 - 0.60: High Noon Bright Desert
   * 0.60 - 0.80: Warm Red Sunset
   * 0.80 - 1.00: Deep Moonlit Night
   */
  public update(timeOfDay: number, playerX: number): void {
    // Move sun target with player along X
    this.dirLight.position.x = playerX + 25;
    this.dirLight.target.position.set(playerX + 5, 0, 0);
    this.dirLight.target.updateMatrixWorld();

    if (this.stars) {
      this.stars.position.x = playerX;
    }
    if (this.moonMesh) {
      this.moonMesh.position.x = playerX + 120;
    }

    // Color interpolation
    if (timeOfDay < 0.3) {
      // Golden Morning
      const t = timeOfDay / 0.3;
      const sky = new THREE.Color().lerpColors(new THREE.Color(0xd6a678), new THREE.Color(0x7bc6ec), t);
      this.scene.background = sky;
      this.fog.color.copy(sky);
      this.dirLight.color.setHex(0xffeaaf);
      this.dirLight.intensity = 2.4;
      this.hemiLight.color.setHex(0xffeedd);
      this.hemiLight.groundColor.setHex(0x996633);
      if (this.stars) (this.stars.material as THREE.PointsMaterial).opacity = 0;
      if (this.moonMesh) (this.moonMesh.material as THREE.MeshBasicMaterial).opacity = 0;
    } else if (timeOfDay < 0.6) {
      // High Noon Bright Desert
      const sky = new THREE.Color(0x7bc6ec);
      this.scene.background = sky;
      this.fog.color.copy(sky);
      this.dirLight.color.setHex(0xffffff);
      this.dirLight.intensity = 2.8;
      this.hemiLight.color.setHex(0xbedeff);
      this.hemiLight.groundColor.setHex(0xcca366);
      if (this.stars) (this.stars.material as THREE.PointsMaterial).opacity = 0;
      if (this.moonMesh) (this.moonMesh.material as THREE.MeshBasicMaterial).opacity = 0;
    } else if (timeOfDay < 0.8) {
      // Warm Red / Amber Sunset
      const t = (timeOfDay - 0.6) / 0.2;
      const sky = new THREE.Color().lerpColors(new THREE.Color(0x7bc6ec), new THREE.Color(0xd95328), t);
      this.scene.background = sky;
      this.fog.color.copy(sky);
      this.dirLight.color.setHex(0xff7733);
      this.dirLight.intensity = 1.9;
      this.hemiLight.color.setHex(0xff8844);
      this.hemiLight.groundColor.setHex(0x442211);
      if (this.stars) (this.stars.material as THREE.PointsMaterial).opacity = t * 0.4;
      if (this.moonMesh) (this.moonMesh.material as THREE.MeshBasicMaterial).opacity = t * 0.5;
    } else {
      // Deep Moonlit Night
      const t = (timeOfDay - 0.8) / 0.2;
      const nightSky = new THREE.Color(0x0a1122);
      this.scene.background = nightSky;
      this.fog.color.copy(nightSky);
      this.dirLight.color.setHex(0x7799cc); // Cool moonlight
      this.dirLight.intensity = 1.2;
      this.hemiLight.color.setHex(0x223355);
      this.hemiLight.groundColor.setHex(0x111622);
      if (this.stars) (this.stars.material as THREE.PointsMaterial).opacity = 0.95;
      if (this.moonMesh) (this.moonMesh.material as THREE.MeshBasicMaterial).opacity = 0.95;
    }
  }

  public setShadowQuality(level: 'off' | 'low' | 'medium' | 'high'): void {
    if (level === 'off') {
      this.dirLight.castShadow = false;
    } else {
      this.dirLight.castShadow = true;
      const size = level === 'high' ? 2048 : (level === 'medium' ? 1024 : 512);
      this.dirLight.shadow.mapSize.width = size;
      this.dirLight.shadow.mapSize.height = size;
      if (this.dirLight.shadow.map) {
        this.dirLight.shadow.map.dispose();
        // @ts-ignore
        this.dirLight.shadow.map = null;
      }
    }
  }
}
