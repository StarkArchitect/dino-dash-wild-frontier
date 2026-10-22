import * as THREE from 'three';
import { TextureGenerator } from '../graphics/TextureGenerator';

export class CanyonScenery {
  public group: THREE.Group;
  private mesaMaterial: THREE.MeshStandardMaterial;
  private cactusMaterial: THREE.MeshStandardMaterial;
  private rockMaterial: THREE.MeshStandardMaterial;

  private sceneryItems: THREE.Object3D[] = [];
  private itemPool: THREE.Object3D[] = [];

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'CanyonScenery';

    const strataTex = TextureGenerator.createCanyonStrataTexture();
    const cactusTex = TextureGenerator.createCactusTexture();

    this.mesaMaterial = new THREE.MeshStandardMaterial({
      map: strataTex,
      roughness: 0.88,
      metalness: 0.05
    });

    this.cactusMaterial = new THREE.MeshStandardMaterial({
      map: cactusTex,
      roughness: 0.75,
      metalness: 0.05
    });

    this.rockMaterial = new THREE.MeshStandardMaterial({
      color: 0x8a5238,
      roughness: 0.9,
      metalness: 0.05
    });
  }

  /**
   * Spawns scenic background canyon elements for a given chunk region [startX, endX].
   */
  public generateChunkScenery(startX: number, endX: number): THREE.Group {
    const chunkGroup = new THREE.Group();
    const length = endX - startX;

    // 1. Distant Red-Rock Mesas & Buttes
    // North wall (Z = -46 to -72): majestic background silhouette behind runner for cinematic side-view
    // South wall (Z = +52 to +74): well beyond the side-view camera (+17.0) with strict clearance
    const numMesas = 4;
    for (let i = 0; i < numMesas; i++) {
      const isNorth = Math.random() > 0.35;
      const mesa = this.createMesa(isNorth);
      const x = startX + Math.random() * length;
      const z = isNorth ? -(46 + Math.random() * 26) : (52 + Math.random() * 22);
      mesa.position.set(x, 0, z);
      chunkGroup.add(mesa);
    }

    // 2. Background Scenery Cacti (along desert canyon floor Z = -7.0 to -19.0)
    // Ensures zero visual occlusion between side-view camera (Z = +17.0) and playable corridor (Z = 0)
    const numCacti = 7;
    for (let c = 0; c < numCacti; c++) {
      const cactus = this.createSceneryCactus();
      const x = startX + Math.random() * length;
      const z = -(7.0 + Math.random() * 12);
      cactus.position.set(x, 0, z);
      cactus.scale.setScalar(0.7 + Math.random() * 0.7);
      cactus.rotation.y = Math.random() * Math.PI * 2;
      chunkGroup.add(cactus);
    }

    // 3. Desert Rocks / Boulders (along canyon floor base Z = -6.0 to -18.0)
    // Clean sightlines with zero foreground camera obstructions
    const numRocks = 6;
    for (let r = 0; r < numRocks; r++) {
      const rock = this.createRock();
      const x = startX + Math.random() * length;
      const z = -(6.0 + Math.random() * 12);
      rock.position.set(x, 0, z);
      rock.scale.set(
        0.6 + Math.random() * 0.9,
        0.4 + Math.random() * 0.7,
        0.6 + Math.random() * 0.9
      );
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      chunkGroup.add(rock);
    }

    return chunkGroup;
  }

  private createMesa(isNorth: boolean = true): THREE.Group {
    const mesa = new THREE.Group();

    // Stepped tabular sandstone butte
    const width = isNorth ? (22 + Math.random() * 14) : (16 + Math.random() * 8);
    const height = 18 + Math.random() * 22;

    // Main cliff base
    const baseGeo = new THREE.CylinderGeometry(width * 0.75, width * 0.9, height, 7);
    const baseMesh = new THREE.Mesh(baseGeo, this.mesaMaterial);
    baseMesh.position.y = height * 0.5;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    mesa.add(baseMesh);

    // Flat capstone rock table
    const capGeo = new THREE.CylinderGeometry(width * 0.68, width * 0.75, 2.5, 7);
    const capMesh = new THREE.Mesh(capGeo, this.mesaMaterial);
    capMesh.position.y = height + 1.25;
    mesa.add(capMesh);

    return mesa;
  }

  private createSceneryCactus(): THREE.Group {
    const cactus = new THREE.Group();
    const trunkH = 4.5 + Math.random() * 2.5;

    // Main column
    const trunkGeo = new THREE.CylinderGeometry(0.38, 0.42, trunkH, 8);
    const trunk = new THREE.Mesh(trunkGeo, this.cactusMaterial);
    trunk.position.y = trunkH * 0.5;
    trunk.castShadow = true;
    cactus.add(trunk);

    // Left curved arm
    if (Math.random() > 0.25) {
      const armH = 2.2;
      const arm = new THREE.Group();
      arm.position.set(0, trunkH * 0.5, 0.4);

      // Horizontal branch
      const horizGeo = new THREE.CylinderGeometry(0.26, 0.28, 0.9, 6);
      horizGeo.rotateX(Math.PI * 0.5);
      const horizMesh = new THREE.Mesh(horizGeo, this.cactusMaterial);
      horizMesh.position.z = 0.45;
      arm.add(horizMesh);

      // Upward branch
      const vertGeo = new THREE.CylinderGeometry(0.24, 0.26, armH, 6);
      const vertMesh = new THREE.Mesh(vertGeo, this.cactusMaterial);
      vertMesh.position.set(0, armH * 0.5, 0.9);
      vertMesh.castShadow = true;
      arm.add(vertMesh);

      cactus.add(arm);
    }

    // Right curved arm
    if (Math.random() > 0.35) {
      const armH = 2.0;
      const arm = new THREE.Group();
      arm.position.set(0, trunkH * 0.62, -0.4);

      const horizGeo = new THREE.CylinderGeometry(0.26, 0.28, 0.8, 6);
      horizGeo.rotateX(-Math.PI * 0.5);
      const horizMesh = new THREE.Mesh(horizGeo, this.cactusMaterial);
      horizMesh.position.z = -0.4;
      arm.add(horizMesh);

      const vertGeo = new THREE.CylinderGeometry(0.24, 0.26, armH, 6);
      const vertMesh = new THREE.Mesh(vertGeo, this.cactusMaterial);
      vertMesh.position.set(0, armH * 0.5, -0.8);
      vertMesh.castShadow = true;
      arm.add(vertMesh);

      cactus.add(arm);
    }

    return cactus;
  }

  private createRock(): THREE.Mesh {
    const rockGeo = new THREE.DodecahedronGeometry(1.2, 1);
    const rockMesh = new THREE.Mesh(rockGeo, this.rockMaterial);
    rockMesh.position.y = 0.6;
    rockMesh.castShadow = true;
    rockMesh.receiveShadow = true;
    return rockMesh;
  }
}
