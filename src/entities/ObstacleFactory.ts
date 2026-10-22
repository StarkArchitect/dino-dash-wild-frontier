import * as THREE from 'three';
import { TextureGenerator } from '../graphics/TextureGenerator';
import { Pterosaur } from './Pterosaur';

export type ObstacleType = 'cactus_small' | 'cactus_large' | 'rock_cluster' | 'pterosaur_high' | 'pterosaur_low';

export interface ObstacleInstance {
  id: number;
  type: ObstacleType;
  group: THREE.Group;
  posX: number;
  posY: number;
  posZ: number;
  width: number;
  height: number;
  depth: number;
  pterosaurRef?: Pterosaur;
}

export class ObstacleFactory {
  private static cactusMat: THREE.MeshStandardMaterial | null = null;
  private static rockMat: THREE.MeshStandardMaterial | null = null;
  private static nextId: number = 1;

  private static getCactusMaterial(): THREE.MeshStandardMaterial {
    if (!this.cactusMat) {
      const tex = TextureGenerator.createCactusTexture();
      this.cactusMat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.75,
        metalness: 0.05
      });
    }
    return this.cactusMat;
  }

  private static getRockMaterial(): THREE.MeshStandardMaterial {
    if (!this.rockMat) {
      this.rockMat = new THREE.MeshStandardMaterial({
        color: 0x8a5238,
        roughness: 0.9,
        metalness: 0.05
      });
    }
    return this.rockMat;
  }

  public static createObstacle(type: ObstacleType, x: number): ObstacleInstance {
    const id = this.nextId++;
    let group = new THREE.Group();
    let width = 1.0;
    let height = 2.0;
    let depth = 1.0;
    let posY = 0;
    let pterosaurRef: Pterosaur | undefined = undefined;

    switch (type) {
      case 'cactus_small': {
        height = 1.85;
        width = 0.8;
        depth = 0.8;
        const trunkGeo = new THREE.CylinderGeometry(0.3, 0.35, height, 8);
        const trunk = new THREE.Mesh(trunkGeo, this.getCactusMaterial());
        trunk.position.y = height * 0.5;
        trunk.castShadow = true;
        group.add(trunk);
        break;
      }

      case 'cactus_large': {
        height = 3.2;
        width = 1.8;
        depth = 1.2;
        const trunkGeo = new THREE.CylinderGeometry(0.4, 0.45, height, 8);
        const trunk = new THREE.Mesh(trunkGeo, this.getCactusMaterial());
        trunk.position.y = height * 0.5;
        trunk.castShadow = true;
        group.add(trunk);

        // Arm 1
        const arm1 = new THREE.Group();
        arm1.position.set(0, height * 0.45, 0.4);
        const h1 = new THREE.Mesh(
          new THREE.CylinderGeometry(0.25, 0.25, 0.7, 6).rotateX(Math.PI * 0.5),
          this.getCactusMaterial()
        );
        h1.position.z = 0.35;
        const v1 = new THREE.Mesh(
          new THREE.CylinderGeometry(0.24, 0.25, 1.4, 6),
          this.getCactusMaterial()
        );
        v1.position.set(0, 0.7, 0.7);
        v1.castShadow = true;
        arm1.add(h1, v1);
        group.add(arm1);

        // Arm 2
        const arm2 = new THREE.Group();
        arm2.position.set(0, height * 0.55, -0.4);
        const h2 = new THREE.Mesh(
          new THREE.CylinderGeometry(0.25, 0.25, 0.6, 6).rotateX(-Math.PI * 0.5),
          this.getCactusMaterial()
        );
        h2.position.z = -0.3;
        const v2 = new THREE.Mesh(
          new THREE.CylinderGeometry(0.24, 0.25, 1.2, 6),
          this.getCactusMaterial()
        );
        v2.position.set(0, 0.6, -0.6);
        v2.castShadow = true;
        arm2.add(h2, v2);
        group.add(arm2);
        break;
      }

      case 'rock_cluster': {
        height = 0.95;
        width = 2.2;
        depth = 1.4;

        // Cluster of 3 sandstone boulders
        const r1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8, 1), this.getRockMaterial());
        r1.position.set(-0.5, 0.45, 0);
        r1.castShadow = true;

        const r2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.65, 1), this.getRockMaterial());
        r2.position.set(0.4, 0.35, 0.2);
        r2.castShadow = true;

        const r3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5, 1), this.getRockMaterial());
        r3.position.set(0.1, 0.25, -0.35);
        r3.castShadow = true;

        group.add(r1, r2, r3);
        break;
      }

      case 'pterosaur_high': {
        // High altitude flyer: must crouch/duck!
        posY = 2.45;
        height = 1.1;
        width = 1.8;
        depth = 2.8;

        pterosaurRef = new Pterosaur('high');
        group.add(pterosaurRef.group);
        break;
      }

      case 'pterosaur_low': {
        // Low altitude flyer: must jump over!
        posY = 0.85;
        height = 1.1;
        width = 1.8;
        depth = 2.8;

        pterosaurRef = new Pterosaur('low');
        group.add(pterosaurRef.group);
        break;
      }
    }

    group.position.set(x, posY, 0);

    return {
      id,
      type,
      group,
      posX: x,
      posY,
      posZ: 0,
      width,
      height,
      depth,
      pterosaurRef
    };
  }
}
