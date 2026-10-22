import * as THREE from 'three';

export class Pterosaur {
  public group: THREE.Group;
  public leftWing: THREE.Group;
  public rightWing: THREE.Group;
  private wingFlapTime: number = 0;
  public flightAltitude: 'high' | 'low';

  constructor(altitude: 'high' | 'low') {
    this.flightAltitude = altitude;
    this.group = new THREE.Group();
    this.group.name = 'Pterosaur';

    // Flyer PBR materials
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x6b4423,
      roughness: 0.7,
      metalness: 0.1
    });

    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x9c6644,
      roughness: 0.6,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    const beakMat = new THREE.MeshStandardMaterial({
      color: 0xca8a04,
      roughness: 0.35,
      metalness: 0.2
    });

    // 1. Torso
    const torsoGeo = new THREE.ConeGeometry(0.28, 1.1, 6);
    torsoGeo.rotateZ(Math.PI * 0.5);
    const torso = new THREE.Mesh(torsoGeo, bodyMat);
    torso.castShadow = true;
    this.group.add(torso);

    // 2. Head with Prehistoric Crest & Long Beak
    const headGroup = new THREE.Group();
    headGroup.position.set(0.55, 0.1, 0);
    this.group.add(headGroup);

    // Cranium
    const skullGeo = new THREE.ConeGeometry(0.18, 0.5, 5);
    skullGeo.rotateZ(-Math.PI * 0.5);
    const skull = new THREE.Mesh(skullGeo, bodyMat);
    skull.position.set(0.15, 0, 0);
    headGroup.add(skull);

    // Swept-back head crest
    const crestGeo = new THREE.ConeGeometry(0.14, 0.65, 4);
    crestGeo.rotateZ(Math.PI * 0.7);
    const crest = new THREE.Mesh(crestGeo, beakMat);
    crest.position.set(-0.25, 0.2, 0);
    headGroup.add(crest);

    // Sharp Beak
    const beakGeo = new THREE.ConeGeometry(0.09, 0.75, 4);
    beakGeo.rotateZ(-Math.PI * 0.5);
    const beak = new THREE.Mesh(beakGeo, beakMat);
    beak.position.set(0.65, -0.05, 0);
    headGroup.add(beak);

    // 3. Articulated Wings (Span ~3.2 meters)
    this.leftWing = new THREE.Group();
    this.leftWing.position.set(0.1, 0.05, 0.22);
    this.group.add(this.leftWing);

    // Left Wing Membrane
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(0.3, 1.6);
    wingShape.lineTo(-0.4, 1.4);
    wingShape.lineTo(-0.8, 0);
    wingShape.closePath();

    const wingGeo = new THREE.ShapeGeometry(wingShape);
    wingGeo.rotateX(-Math.PI * 0.5);

    const leftWingMesh = new THREE.Mesh(wingGeo, wingMat);
    leftWingMesh.castShadow = true;
    this.leftWing.add(leftWingMesh);

    // Right Wing
    this.rightWing = new THREE.Group();
    this.rightWing.position.set(0.1, 0.05, -0.22);
    this.group.add(this.rightWing);

    const rightWingGeo = wingGeo.clone();
    rightWingGeo.rotateX(Math.PI);
    const rightWingMesh = new THREE.Mesh(rightWingGeo, wingMat);
    rightWingMesh.castShadow = true;
    this.rightWing.add(rightWingMesh);

    // Orient facing oncoming player (-X direction)
    this.group.rotation.y = Math.PI;
  }

  public update(delta: number): void {
    // Rhythmic wing flapping
    this.wingFlapTime += delta * 9.0;
    const flap = Math.sin(this.wingFlapTime) * 0.65;

    this.leftWing.rotation.x = flap;
    this.rightWing.rotation.x = -flap;

    // Subtle flight undulation
    this.group.position.y += Math.cos(this.wingFlapTime) * 0.006;
  }
}
