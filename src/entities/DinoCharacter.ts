import * as THREE from 'three';
import { TextureGenerator } from '../graphics/TextureGenerator';
import { DinoVariant, DinoCatalogHelper } from './DinoCatalog';

export class DinoCharacter {
  public group: THREE.Group;

  // Hierarchical skeletal parts for animation
  public pelvis: THREE.Group;
  public spine: THREE.Group;
  public chest: THREE.Group;
  public neck: THREE.Group;
  public head: THREE.Group;
  public jaw: THREE.Group;

  // Hind limbs
  public leftThigh: THREE.Group;
  public leftShin: THREE.Group;
  public leftFoot: THREE.Group;

  public rightThigh: THREE.Group;
  public rightShin: THREE.Group;
  public rightFoot: THREE.Group;

  // Forearms
  public leftShoulder: THREE.Group;
  public leftArm: THREE.Group;
  public rightShoulder: THREE.Group;
  public rightArm: THREE.Group;

  // Articulated tail segments
  public tailSegments: THREE.Group[] = [];

  // Dinosaur PBR materials
  private skinMaterial: THREE.MeshStandardMaterial;
  private underbellyMaterial: THREE.MeshStandardMaterial;
  private boneMaterial: THREE.MeshStandardMaterial;
  private clawMaterial: THREE.MeshStandardMaterial;
  private eyeMaterial: THREE.MeshStandardMaterial;
  private pupilMaterial: THREE.MeshBasicMaterial;

  // Accessory groups for visual variants
  private frillGroup: THREE.Group;
  private hornsGroup: THREE.Group;
  private sailGroup: THREE.Group;
  private crestGroup: THREE.Group;
  private wingPlumesGroupL: THREE.Group;
  private wingPlumesGroupR: THREE.Group;
  private armorScutesGroup: THREE.Group;
  private shieldSphere: THREE.Mesh;
  private shieldTime: number = 0;

  public currentVariant: DinoVariant;

  constructor(variantId: string = 'classic_rex') {
    this.currentVariant = DinoCatalogHelper.getVariantById(variantId);
    this.group = new THREE.Group();
    this.group.name = 'DinoCharacter';

    // Initialize PBR Materials
    const skinDiff = TextureGenerator.createSkinTextureForVariant(this.currentVariant);
    const skinBump = TextureGenerator.createDinoBumpMap();

    this.skinMaterial = new THREE.MeshStandardMaterial({
      map: skinDiff,
      bumpMap: skinBump,
      bumpScale: this.currentVariant.visual.bumpScale ?? 0.08,
      roughness: this.currentVariant.visual.roughness ?? 0.72,
      metalness: this.currentVariant.visual.metalness ?? 0.08,
      emissive: new THREE.Color(this.currentVariant.visual.emissiveColor ?? 0x000000),
      emissiveIntensity: this.currentVariant.visual.emissiveIntensity ?? 0
    });

    this.underbellyMaterial = new THREE.MeshStandardMaterial({
      color: this.currentVariant.visual.bellyColor,
      bumpMap: skinBump,
      bumpScale: 0.04,
      roughness: 0.85,
      metalness: 0.0
    });

    this.boneMaterial = new THREE.MeshStandardMaterial({
      color: this.currentVariant.visual.accentColor,
      roughness: 0.65,
      metalness: 0.15
    });

    this.clawMaterial = new THREE.MeshStandardMaterial({
      color: this.currentVariant.visual.clawColor,
      roughness: 0.35,
      metalness: 0.25
    });

    this.eyeMaterial = new THREE.MeshStandardMaterial({
      color: this.currentVariant.visual.eyeColor,
      emissive: new THREE.Color(this.currentVariant.visual.eyeEmissive),
      emissiveIntensity: 0.5,
      roughness: 0.15,
      metalness: 0.1
    });

    this.pupilMaterial = new THREE.MeshBasicMaterial({
      color: 0x050505
    });

    // Build the articulated anatomical hierarchy
    this.pelvis = new THREE.Group();
    this.spine = new THREE.Group();
    this.chest = new THREE.Group();
    this.neck = new THREE.Group();
    this.head = new THREE.Group();
    this.jaw = new THREE.Group();

    this.leftThigh = new THREE.Group();
    this.leftShin = new THREE.Group();
    this.leftFoot = new THREE.Group();

    this.rightThigh = new THREE.Group();
    this.rightShin = new THREE.Group();
    this.rightFoot = new THREE.Group();

    this.leftShoulder = new THREE.Group();
    this.leftArm = new THREE.Group();
    this.rightShoulder = new THREE.Group();
    this.rightArm = new THREE.Group();

    // Variant accessory containers
    this.frillGroup = new THREE.Group();
    this.hornsGroup = new THREE.Group();
    this.sailGroup = new THREE.Group();
    this.crestGroup = new THREE.Group();
    this.wingPlumesGroupL = new THREE.Group();
    this.wingPlumesGroupR = new THREE.Group();
    this.armorScutesGroup = new THREE.Group();

    // Defensive shield sphere
    const shieldGeo = new THREE.SphereGeometry(1.65, 24, 24);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.38,
      roughness: 0.1,
      metalness: 0.9,
      wireframe: false,
      side: THREE.DoubleSide
    });
    this.shieldSphere = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldSphere.position.set(0.3, 1.3, 0);
    this.shieldSphere.visible = false;
    this.group.add(this.shieldSphere);

    this.buildSkeletonAndMesh();
    this.buildAccessoryMeshes();
    this.applyVariant(this.currentVariant);
  }

  private buildSkeletonAndMesh(): void {
    // Ground to hip height is ~1.45m
    this.pelvis.position.set(0, 1.45, 0);
    this.group.add(this.pelvis);

    // 1. Pelvis / Hip Body Geometry
    const hipGeo = new THREE.BoxGeometry(0.7, 0.75, 0.95);
    const hipMesh = new THREE.Mesh(hipGeo, this.skinMaterial);
    hipMesh.castShadow = true;
    hipMesh.receiveShadow = true;
    this.pelvis.add(hipMesh);

    // 2. Spine & Chest (inclined slightly forward in running stance)
    this.spine.position.set(0.3, 0.1, 0);
    this.spine.rotation.z = -0.15;
    this.pelvis.add(this.spine);

    const chestGeo = new THREE.ConeGeometry(0.55, 1.1, 8);
    chestGeo.rotateZ(-Math.PI * 0.5);
    const chestMesh = new THREE.Mesh(chestGeo, this.skinMaterial);
    chestMesh.position.set(0.4, 0.05, 0);
    chestMesh.castShadow = true;
    chestMesh.receiveShadow = true;
    this.spine.add(chestMesh);

    // Standard dorsal spines along back
    for (let i = 0; i < 5; i++) {
      const spinePlateGeo = new THREE.ConeGeometry(0.08, 0.28, 4);
      const spinePlate = new THREE.Mesh(spinePlateGeo, this.boneMaterial);
      spinePlate.position.set(0.1 + i * 0.2, 0.38, 0);
      spinePlate.rotation.z = -0.25;
      spinePlate.castShadow = true;
      this.spine.add(spinePlate);
    }

    // 3. Neck
    this.neck.position.set(0.85, 0.15, 0);
    this.neck.rotation.z = 0.35;
    this.spine.add(this.neck);

    const neckGeo = new THREE.CylinderGeometry(0.24, 0.34, 0.65, 8);
    neckGeo.rotateZ(Math.PI * 0.45);
    const neckMesh = new THREE.Mesh(neckGeo, this.skinMaterial);
    neckMesh.position.set(0.25, 0.1, 0);
    neckMesh.castShadow = true;
    this.neck.add(neckMesh);

    // 4. Head & Skull
    this.head.position.set(0.5, 0.18, 0);
    this.neck.add(this.head);

    // Cranium
    const craniumGeo = new THREE.BoxGeometry(0.5, 0.38, 0.44);
    const craniumMesh = new THREE.Mesh(craniumGeo, this.skinMaterial);
    craniumMesh.position.set(0, 0.05, 0);
    craniumMesh.castShadow = true;
    this.head.add(craniumMesh);

    // Snout / Upper Jaw
    const snoutGeo = new THREE.BoxGeometry(0.65, 0.28, 0.34);
    const snoutMesh = new THREE.Mesh(snoutGeo, this.skinMaterial);
    snoutMesh.position.set(0.48, -0.02, 0);
    snoutMesh.castShadow = true;
    this.head.add(snoutMesh);

    // Nostrils
    const nostrilGeo = new THREE.SphereGeometry(0.035, 6, 6);
    const leftNostril = new THREE.Mesh(nostrilGeo, this.boneMaterial);
    leftNostril.position.set(0.74, 0.07, 0.1);
    const rightNostril = new THREE.Mesh(nostrilGeo, this.boneMaterial);
    rightNostril.position.set(0.74, 0.07, -0.1);
    this.head.add(leftNostril, rightNostril);

    // Sharp Upper Teeth
    for (let t = 0; t < 6; t++) {
      const toothGeo = new THREE.ConeGeometry(0.025, 0.08, 4);
      toothGeo.rotateX(Math.PI);
      const toothL = new THREE.Mesh(toothGeo, this.clawMaterial);
      toothL.position.set(0.24 + t * 0.08, -0.16, 0.15);
      const toothR = new THREE.Mesh(toothGeo, this.clawMaterial);
      toothR.position.set(0.24 + t * 0.08, -0.16, -0.15);
      this.head.add(toothL, toothR);
    }

    // Expressive Amber Eyes with Pupils
    const eyeGeo = new THREE.SphereGeometry(0.09, 12, 12);
    const pupilGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.12, 6);
    pupilGeo.rotateX(Math.PI * 0.5);

    // Left Eye
    const leftEye = new THREE.Mesh(eyeGeo, this.eyeMaterial);
    leftEye.position.set(0.12, 0.15, 0.22);
    const leftPupil = new THREE.Mesh(pupilGeo, this.pupilMaterial);
    leftPupil.position.set(0.14, 0.15, 0.28);
    this.head.add(leftEye, leftPupil);

    // Right Eye
    const rightEye = new THREE.Mesh(eyeGeo, this.eyeMaterial);
    rightEye.position.set(0.12, 0.15, -0.22);
    const rightPupil = new THREE.Mesh(pupilGeo, this.pupilMaterial);
    rightPupil.position.set(0.14, 0.15, -0.28);
    this.head.add(rightEye, rightPupil);

    // Lower Hinged Jaw
    this.jaw.position.set(0.15, -0.18, 0);
    this.head.add(this.jaw);

    const lowerJawGeo = new THREE.BoxGeometry(0.62, 0.14, 0.3);
    const lowerJawMesh = new THREE.Mesh(lowerJawGeo, this.underbellyMaterial);
    lowerJawMesh.position.set(0.32, 0, 0);
    lowerJawMesh.castShadow = true;
    this.jaw.add(lowerJawMesh);

    // 5. Forearms
    this.buildForearm(this.leftShoulder, this.leftArm, 0.26);
    this.buildForearm(this.rightShoulder, this.rightArm, -0.26);
    this.spine.add(this.leftShoulder);
    this.spine.add(this.rightShoulder);

    // 6. Hind Limbs
    this.buildLeg(this.leftThigh, this.leftShin, this.leftFoot, 0.38);
    this.buildLeg(this.rightThigh, this.rightShin, this.rightFoot, -0.38);
    this.pelvis.add(this.leftThigh);
    this.pelvis.add(this.rightThigh);

    // 7. Counterbalanced Tail
    let parentNode: THREE.Group = this.pelvis;
    let tailSegLength = 0.55;
    let tailRadius = 0.26;

    for (let s = 0; s < 5; s++) {
      const segGroup = new THREE.Group();
      if (s === 0) {
        segGroup.position.set(-0.45, 0.05, 0);
      } else {
        segGroup.position.set(-tailSegLength, 0, 0);
      }
      parentNode.add(segGroup);
      this.tailSegments.push(segGroup);

      const rTop = tailRadius * 0.72;
      const segGeo = new THREE.CylinderGeometry(rTop, tailRadius, tailSegLength, 8);
      segGeo.rotateZ(Math.PI * 0.5);
      const segMesh = new THREE.Mesh(segGeo, this.skinMaterial);
      segMesh.position.set(-tailSegLength * 0.5, 0, 0);
      segMesh.castShadow = true;
      segMesh.receiveShadow = true;
      segGroup.add(segMesh);

      const tailSpineGeo = new THREE.ConeGeometry(0.05, 0.18, 4);
      const tailSpine = new THREE.Mesh(tailSpineGeo, this.boneMaterial);
      tailSpine.position.set(-tailSegLength * 0.5, tailRadius + 0.06, 0);
      tailSpine.rotation.z = -0.4;
      segGroup.add(tailSpine);

      tailRadius = rTop;
      tailSegLength *= 0.92;
      parentNode = segGroup;
    }
  }

  private buildAccessoryMeshes(): void {
    // 1. Triceratops Bony Neck Shield / Frill
    const frillGeo = new THREE.CylinderGeometry(0.65, 0.35, 0.12, 12, 1, false, 0, Math.PI);
    frillGeo.rotateX(Math.PI * 0.5);
    frillGeo.rotateZ(Math.PI * 0.2);
    const frillMesh = new THREE.Mesh(frillGeo, this.skinMaterial);
    frillMesh.castShadow = true;
    this.frillGroup.add(frillMesh);

    // Frill edge spikes / epoccipitals
    for (let p = 0; p < 7; p++) {
      const angle = (p / 6) * Math.PI - Math.PI * 0.5;
      const spikeGeo = new THREE.ConeGeometry(0.04, 0.14, 4);
      const spike = new THREE.Mesh(spikeGeo, this.boneMaterial);
      spike.position.set(-Math.cos(angle) * 0.65, Math.sin(angle) * 0.65, 0);
      spike.rotation.z = angle;
      this.frillGroup.add(spike);
    }
    this.frillGroup.position.set(-0.15, 0.28, 0);
    this.head.add(this.frillGroup);

    // 2. Triceratops Horns (2 brow horns + 1 nasal horn)
    const browHornGeo = new THREE.ConeGeometry(0.08, 0.55, 6);
    browHornGeo.rotateX(Math.PI * 0.15);

    const browHornL = new THREE.Mesh(browHornGeo, this.boneMaterial);
    browHornL.position.set(0.18, 0.38, 0.22);
    browHornL.rotation.z = -Math.PI * 0.35;
    browHornL.castShadow = true;

    const browHornR = new THREE.Mesh(browHornGeo, this.boneMaterial);
    browHornR.position.set(0.18, 0.38, -0.22);
    browHornR.rotation.z = -Math.PI * 0.35;
    browHornR.castShadow = true;

    const nasalHornGeo = new THREE.ConeGeometry(0.06, 0.32, 6);
    const nasalHorn = new THREE.Mesh(nasalHornGeo, this.boneMaterial);
    nasalHorn.position.set(0.72, 0.22, 0);
    nasalHorn.rotation.z = -Math.PI * 0.25;
    nasalHorn.castShadow = true;

    this.hornsGroup.add(browHornL, browHornR, nasalHorn);
    this.head.add(this.hornsGroup);

    // 3. Spinosaurus Majestic Dorsal Sail
    const sailShape = new THREE.Shape();
    sailShape.moveTo(0, 0);
    sailShape.quadraticCurveTo(0.4, 0.95, 0.8, 0);
    sailShape.lineTo(0, 0);
    const extrudeSettings = { depth: 0.08, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 };
    const sailGeo = new THREE.ExtrudeGeometry(sailShape, extrudeSettings);
    sailGeo.rotateY(Math.PI * 0.5);
    const sailMesh = new THREE.Mesh(sailGeo, this.skinMaterial);
    sailMesh.position.set(0.0, 0.35, -0.04);
    sailMesh.castShadow = true;
    this.sailGroup.add(sailMesh);

    // Sail structural neural spine struts
    for (let s = 0; s < 5; s++) {
      const strutGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.9, 4);
      const strut = new THREE.Mesh(strutGeo, this.boneMaterial);
      strut.position.set(0.15 + s * 0.14, 0.75, 0);
      strut.rotation.z = -0.15 + s * 0.06;
      this.sailGroup.add(strut);
    }
    this.spine.add(this.sailGroup);

    // 4. Feathered Raptor Crest
    for (let f = 0; f < 5; f++) {
      const plumeGeo = new THREE.ConeGeometry(0.04, 0.35 - f * 0.04, 4);
      plumeGeo.rotateZ(-Math.PI * 0.45);
      const plume = new THREE.Mesh(plumeGeo, this.boneMaterial);
      plume.position.set(-0.18 - f * 0.06, 0.22 + f * 0.02, 0);
      plume.castShadow = true;
      this.crestGroup.add(plume);
    }
    this.head.add(this.crestGroup);

    // 5. Raptor Forearm Wing Plumes
    for (let w = 0; w < 4; w++) {
      const wingGeo = new THREE.ConeGeometry(0.03, 0.28, 4);
      wingGeo.rotateZ(Math.PI * 0.45);

      const wingL = new THREE.Mesh(wingGeo, this.boneMaterial);
      wingL.position.set(-0.06, -0.1 - w * 0.06, 0.08);
      this.wingPlumesGroupL.add(wingL);

      const wingR = new THREE.Mesh(wingGeo, this.boneMaterial);
      wingR.position.set(-0.06, -0.1 - w * 0.06, -0.08);
      this.wingPlumesGroupR.add(wingR);
    }
    this.leftArm.add(this.wingPlumesGroupL);
    this.rightArm.add(this.wingPlumesGroupR);

    // 6. Armored Osteoderm Scutes
    for (let a = 0; a < 6; a++) {
      const scuteGeo = new THREE.DodecahedronGeometry(0.07);
      const scuteL = new THREE.Mesh(scuteGeo, this.boneMaterial);
      scuteL.position.set(0.1 + a * 0.12, 0.2, 0.32);
      const scuteR = new THREE.Mesh(scuteGeo, this.boneMaterial);
      scuteR.position.set(0.1 + a * 0.12, 0.2, -0.32);
      this.armorScutesGroup.add(scuteL, scuteR);
    }
    this.spine.add(this.armorScutesGroup);
  }

  public applyVariant(variant: DinoVariant): void {
    this.currentVariant = variant;

    // 1. Update skin texture
    const newTex = TextureGenerator.createSkinTextureForVariant(variant);
    this.skinMaterial.map = newTex;
    this.skinMaterial.bumpScale = variant.visual.bumpScale ?? 0.08;
    this.skinMaterial.roughness = variant.visual.roughness ?? 0.72;
    this.skinMaterial.metalness = variant.visual.metalness ?? 0.08;
    this.skinMaterial.emissive = new THREE.Color(variant.visual.emissiveColor ?? 0x000000);
    this.skinMaterial.emissiveIntensity = variant.visual.emissiveIntensity ?? 0;
    this.skinMaterial.needsUpdate = true;

    // 2. Update accent & bone colors
    this.underbellyMaterial.color.setHex(variant.visual.bellyColor);
    this.underbellyMaterial.needsUpdate = true;

    this.boneMaterial.color.setHex(variant.visual.accentColor);
    this.boneMaterial.needsUpdate = true;

    this.clawMaterial.color.setHex(variant.visual.clawColor);
    this.clawMaterial.needsUpdate = true;

    this.eyeMaterial.color.setHex(variant.visual.eyeColor);
    this.eyeMaterial.emissive.setHex(variant.visual.eyeEmissive);
    this.eyeMaterial.needsUpdate = true;

    // 3. Toggle silhouette accessories
    this.frillGroup.visible = !!variant.visual.hasFrill;
    this.hornsGroup.visible = !!variant.visual.hasHorns;
    this.sailGroup.visible = !!variant.visual.hasSail;
    this.crestGroup.visible = !!variant.visual.hasFeatherCrest;
    this.wingPlumesGroupL.visible = !!variant.visual.hasForearmWings;
    this.wingPlumesGroupR.visible = !!variant.visual.hasForearmWings;
    this.armorScutesGroup.visible = !!variant.visual.hasArmorPlates;
  }

  public setShieldVisible(visible: boolean): void {
    this.shieldSphere.visible = visible;
  }

  public updateShieldAura(delta: number): void {
    if (!this.shieldSphere.visible) return;
    this.shieldTime += delta;
    // Gentle pulsating sphere breathing
    const scale = 1.0 + Math.sin(this.shieldTime * 6.0) * 0.05;
    this.shieldSphere.scale.set(scale, scale, scale);
    this.shieldSphere.rotation.y += delta * 1.5;
  }

  private buildForearm(shoulder: THREE.Group, forearm: THREE.Group, zOffset: number): void {
    shoulder.position.set(0.65, -0.15, zOffset);
    shoulder.rotation.z = 0.4;

    const bicepGeo = new THREE.CylinderGeometry(0.09, 0.12, 0.35, 6);
    const bicepMesh = new THREE.Mesh(bicepGeo, this.skinMaterial);
    bicepMesh.position.set(0, -0.16, 0);
    shoulder.add(bicepMesh);

    forearm.position.set(0, -0.32, 0);
    forearm.rotation.z = -1.1;
    shoulder.add(forearm);

    const armGeo = new THREE.CylinderGeometry(0.07, 0.09, 0.32, 6);
    const armMesh = new THREE.Mesh(armGeo, this.skinMaterial);
    armMesh.position.set(0, -0.15, 0);
    forearm.add(armMesh);

    // Raptor Claws
    for (let c = 0; c < 3; c++) {
      const clawGeo = new THREE.ConeGeometry(0.03, 0.16, 4);
      clawGeo.rotateZ(-Math.PI * 0.4);
      const clawMesh = new THREE.Mesh(clawGeo, this.clawMaterial);
      clawMesh.position.set(0.12, -0.3, (c - 1) * 0.05);
      forearm.add(clawMesh);
    }
  }

  private buildLeg(
    thigh: THREE.Group,
    shin: THREE.Group,
    foot: THREE.Group,
    zOffset: number
  ): void {
    thigh.position.set(0, -0.1, zOffset);

    const thighGeo = new THREE.CylinderGeometry(0.22, 0.16, 0.72, 8);
    const thighMesh = new THREE.Mesh(thighGeo, this.skinMaterial);
    thighMesh.position.set(0, -0.34, 0);
    thighMesh.castShadow = true;
    thigh.add(thighMesh);

    shin.position.set(0, -0.68, 0);
    thigh.add(shin);

    const shinGeo = new THREE.CylinderGeometry(0.14, 0.09, 0.68, 8);
    const shinMesh = new THREE.Mesh(shinGeo, this.skinMaterial);
    shinMesh.position.set(0.05, -0.32, 0);
    shinMesh.castShadow = true;
    shin.add(shinMesh);

    foot.position.set(0.05, -0.66, 0);
    shin.add(foot);

    const footBaseGeo = new THREE.BoxGeometry(0.38, 0.1, 0.28);
    const footBase = new THREE.Mesh(footBaseGeo, this.skinMaterial);
    footBase.position.set(0.1, 0.02, 0);
    footBase.castShadow = true;
    foot.add(footBase);

    for (let i = 0; i < 3; i++) {
      const toeClawGeo = new THREE.ConeGeometry(0.045, 0.22, 4);
      toeClawGeo.rotateZ(-Math.PI * 0.5);
      const toeClaw = new THREE.Mesh(toeClawGeo, this.clawMaterial);
      toeClaw.position.set(0.32, 0, (i - 1) * 0.1);
      toeClaw.castShadow = true;
      foot.add(toeClaw);
    }
  }

  public resetPose(): void {
    this.pelvis.position.set(0, 1.45, 0);
    this.pelvis.rotation.set(0, 0, 0);
    this.spine.rotation.set(0, 0, -0.15);
    this.neck.rotation.set(0, 0, 0.35);
    this.head.rotation.set(0, 0, 0);
    this.jaw.rotation.set(0, 0, 0);

    this.leftThigh.rotation.set(0, 0, 0);
    this.leftShin.rotation.set(0, 0, 0);
    this.leftFoot.rotation.set(0, 0, 0);

    this.rightThigh.rotation.set(0, 0, 0);
    this.rightShin.rotation.set(0, 0, 0);
    this.rightFoot.rotation.set(0, 0, 0);

    this.leftShoulder.rotation.set(0, 0, 0.4);
    this.rightShoulder.rotation.set(0, 0, 0.4);

    this.tailSegments.forEach((seg, i) => {
      seg.rotation.set(0, 0, Math.sin(i * 0.2) * 0.08);
    });
  }
}
