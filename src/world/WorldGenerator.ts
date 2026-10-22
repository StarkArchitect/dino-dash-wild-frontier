import * as THREE from 'three';
import { TextureGenerator } from '../graphics/TextureGenerator';
import { CanyonScenery } from './CanyonScenery';

interface Chunk {
  group: THREE.Group;
  startX: number;
  endX: number;
}

export class WorldGenerator {
  public group: THREE.Group;
  private scenery: CanyonScenery;
  private chunks: Chunk[] = [];
  private chunkLength: number = 75;
  private numChunks: number = 5;
  private nextChunkStartX: number = -75;

  private groundMaterial: THREE.MeshStandardMaterial;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'WorldGenerator';

    this.scenery = new CanyonScenery();
    this.group.add(this.scenery.group);

    const sandTex = TextureGenerator.createSandTexture();
    this.groundMaterial = new THREE.MeshStandardMaterial({
      map: sandTex,
      roughness: 0.94,
      metalness: 0.02
    });

    this.initChunks();
  }

  private initChunks(): void {
    for (let i = 0; i < this.numChunks; i++) {
      const startX = this.nextChunkStartX;
      const endX = startX + this.chunkLength;
      const chunkGroup = this.createChunk(startX, endX);
      this.group.add(chunkGroup);
      this.chunks.push({ group: chunkGroup, startX, endX });
      this.nextChunkStartX = endX;
    }
  }

  private createChunk(startX: number, endX: number): THREE.Group {
    const chunkGroup = new THREE.Group();
    const length = endX - startX;
    const midX = (startX + endX) * 0.5;

    // 1. Playable Ground Corridor & Desert Floor
    // High-resolution subdivided mesh for perfectly smooth normal blending without creasing
    const groundGeo = new THREE.PlaneGeometry(length, 180, 16, 36);
    groundGeo.rotateX(-Math.PI * 0.5);

    // Natural sand undulation with smooth Hermite transition to preserve flat running track
    // Height is a pure function of Z to ensure 100% mathematical normal continuity across chunk boundaries
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i);
      const absZ = Math.abs(z);
      
      // Keep central playable track (|z| <= 5.5) completely flat, smoothly taper into desert flanks
      if (absZ > 5.5) {
        const t = Math.min(1, (absZ - 5.5) / 24);
        const smoothT = t * t * (3 - 2 * t);
        const height = (Math.sin(absZ * 0.09) * 0.8 + (absZ - 5.5) * 0.05) * smoothT;
        pos.setY(i, height);
      } else {
        pos.setY(i, 0);
      }
    }
    groundGeo.computeVertexNormals();

    const groundMesh = new THREE.Mesh(groundGeo, this.groundMaterial);
    groundMesh.position.set(midX, 0, 0);
    groundMesh.receiveShadow = true;
    chunkGroup.add(groundMesh);

    // 2. Canyon Scenery (Mesas, background cacti, rocks)
    const sceneryGroup = this.scenery.generateChunkScenery(startX, endX);
    chunkGroup.add(sceneryGroup);

    return chunkGroup;
  }

  public update(playerX: number): void {
    // Check if the oldest chunk is far behind the player
    const recycleThreshold = playerX - this.chunkLength * 1.5;

    if (this.chunks.length > 0 && this.chunks[0].endX < recycleThreshold) {
      const oldChunk = this.chunks.shift()!;
      this.group.remove(oldChunk.group);

      // Dispose child geometries/materials in chunkGroup to avoid memory leaks
      oldChunk.group.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
        }
      });

      // Spawn new chunk at the front
      const startX = this.nextChunkStartX;
      const endX = startX + this.chunkLength;
      const newChunkGroup = this.createChunk(startX, endX);
      this.group.add(newChunkGroup);
      this.chunks.push({ group: newChunkGroup, startX, endX });
      this.nextChunkStartX = endX;
    }
  }

  public reset(): void {
    // Clean all existing chunks
    this.chunks.forEach(chunk => {
      this.group.remove(chunk.group);
      chunk.group.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
        }
      });
    });
    this.chunks = [];
    this.nextChunkStartX = -75;
    this.initChunks();
  }
}
