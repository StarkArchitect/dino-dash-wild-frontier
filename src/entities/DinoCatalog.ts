export type DinoRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface DinoStats {
  speedModifier: number;      // Multiplier on base running speed (e.g. 1.08 = +8%)
  jumpForceModifier: number;  // Multiplier on jump takeoff force (e.g. 1.15 = +15%)
  coinRadiusModifier: number; // Multiplier on coin magnet attraction radius (e.g. 1.5 = +50%)
  coinEarningsModifier: number; // Multiplier on coins earned (e.g. 1.15 = +15%)
  scoreMultiplier: number;    // Multiplier on score earned over distance (e.g. 1.20 = +20%)
  shieldCharges: number;      // Obstacle collision shield charges per run (e.g. 1 for Ironhide)
}

export type SkinType = 
  | 'classic'
  | 'swift_raptor'
  | 'coin_hunter'
  | 'jumper_rex'
  | 'ironhide_triceratops'
  | 'ember_rex'
  | 'shadow_raptor'
  | 'frost_spinosaurus';

export interface DinoVisualConfig {
  skinType: SkinType;
  primaryColor: number;
  bellyColor: number;
  accentColor: number;
  clawColor: number;
  eyeColor: number;
  eyeEmissive: number;
  hasFrill?: boolean;         // Triceratops neck frill
  hasHorns?: boolean;         // 3 Ceratopsian horns
  hasSail?: boolean;          // Spinosaurus dorsal sail
  hasFeatherCrest?: boolean;  // Raptor head & tail plumage
  hasForearmWings?: boolean;  // Raptor feathered arm plumes
  hasArmorPlates?: boolean;   // Dermal scutes along flanks
  emissiveColor?: number;
  emissiveIntensity?: number;
  roughness?: number;
  metalness?: number;
  bumpScale?: number;
}

export interface DinoVariant {
  id: string;
  name: string;
  species: string;
  rarity: DinoRarity;
  description: string;
  specialAbility: string;
  price: number; // 0 = Free starter
  stats: DinoStats;
  visual: DinoVisualConfig;
}

export const DINO_CATALOG: DinoVariant[] = [
  {
    id: 'classic_rex',
    name: 'Classic Rex',
    species: 'Tyrannosaurid Raptor',
    rarity: 'common',
    description: 'The iconic badlands survivor. Well-balanced running endurance and agility.',
    specialAbility: 'None (Balanced Baseline)',
    price: 0,
    stats: {
      speedModifier: 1.0,
      jumpForceModifier: 1.0,
      coinRadiusModifier: 1.0,
      coinEarningsModifier: 1.0,
      scoreMultiplier: 1.0,
      shieldCharges: 0
    },
    visual: {
      skinType: 'classic',
      primaryColor: 0x4d5945,
      bellyColor: 0xdec89e,
      accentColor: 0x2d3a29,
      clawColor: 0x1f1a17,
      eyeColor: 0xf59e0b,
      eyeEmissive: 0xb45309,
      roughness: 0.72,
      metalness: 0.08,
      bumpScale: 0.08
    }
  },
  {
    id: 'swift_raptor',
    name: 'Swift Raptor',
    species: 'Dromaeosaurid Hunter',
    rarity: 'uncommon',
    description: 'Bred for pure velocity with aerodynamic feather plumes and cheetah-like stripes.',
    specialAbility: '+8% Sprint Velocity, Agile Acceleration',
    price: 500,
    stats: {
      speedModifier: 1.08,
      jumpForceModifier: 0.98,
      coinRadiusModifier: 1.0,
      coinEarningsModifier: 1.0,
      scoreMultiplier: 1.05,
      shieldCharges: 0
    },
    visual: {
      skinType: 'swift_raptor',
      primaryColor: 0xd97706,
      bellyColor: 0xfef3c7,
      accentColor: 0x78350f,
      clawColor: 0x27272a,
      eyeColor: 0xef4444,
      eyeEmissive: 0x991b1b,
      hasFeatherCrest: true,
      hasForearmWings: true,
      roughness: 0.62,
      metalness: 0.12,
      bumpScale: 0.07
    }
  },
  {
    id: 'coin_hunter',
    name: 'Coin Hunter',
    species: 'Aurodon Gilded Raptor',
    rarity: 'uncommon',
    description: 'Covered in lustrous metallic scales that generate an electro-magnetic coin field.',
    specialAbility: '+50% Coin Magnet Radius, +5% Extra Earnings',
    price: 800,
    stats: {
      speedModifier: 0.98,
      jumpForceModifier: 1.0,
      coinRadiusModifier: 1.5,
      coinEarningsModifier: 1.05,
      scoreMultiplier: 1.0,
      shieldCharges: 0
    },
    visual: {
      skinType: 'coin_hunter',
      primaryColor: 0xeab308,
      bellyColor: 0xfef08a,
      accentColor: 0xb45309,
      clawColor: 0x78350f,
      eyeColor: 0x38bdf8,
      eyeEmissive: 0x0284c7,
      roughness: 0.28,
      metalness: 0.85,
      bumpScale: 0.06
    }
  },
  {
    id: 'jumper_rex',
    name: 'Jumper Rex',
    species: 'Springtail Carnosaur',
    rarity: 'rare',
    description: 'Engineered with reinforced tendons and massive digitigrade spring calves.',
    specialAbility: '+15% Jump Apex Height & Air Clearance',
    price: 1000,
    stats: {
      speedModifier: 1.0,
      jumpForceModifier: 1.15,
      coinRadiusModifier: 1.0,
      coinEarningsModifier: 1.0,
      scoreMultiplier: 1.05,
      shieldCharges: 0
    },
    visual: {
      skinType: 'jumper_rex',
      primaryColor: 0x059669,
      bellyColor: 0xa7f3d0,
      accentColor: 0x064e3b,
      clawColor: 0x111827,
      eyeColor: 0xfacc15,
      eyeEmissive: 0xca8a04,
      roughness: 0.65,
      metalness: 0.15,
      bumpScale: 0.09
    }
  },
  {
    id: 'ironhide_triceratops',
    name: 'Ironhide Triceratops',
    species: 'Titan Ceratopsian',
    rarity: 'rare',
    description: 'Armored juggernaut sporting a bony neck shield and 3 solid horns that absorb 1 lethal hit.',
    specialAbility: 'Defensive Kinetic Shield: Absorbs 1 Crash Per Run',
    price: 1400,
    stats: {
      speedModifier: 0.95,
      jumpForceModifier: 0.92,
      coinRadiusModifier: 1.1,
      coinEarningsModifier: 1.0,
      scoreMultiplier: 1.0,
      shieldCharges: 1
    },
    visual: {
      skinType: 'ironhide_triceratops',
      primaryColor: 0x57534e,
      bellyColor: 0xa8a29e,
      accentColor: 0x292524,
      clawColor: 0x1c1917,
      eyeColor: 0xf97316,
      eyeEmissive: 0xc2410c,
      hasFrill: true,
      hasHorns: true,
      hasArmorPlates: true,
      roughness: 0.88,
      metalness: 0.22,
      bumpScale: 0.12
    }
  },
  {
    id: 'ember_rex',
    name: 'Ember Rex',
    species: 'Pyrosaurus Vulcan',
    rarity: 'epic',
    description: 'Forged in volcanic fissures. Emits fiery heat pulses that scorch score multipliers.',
    specialAbility: '+20% Score Multiplier across all distances',
    price: 1800,
    stats: {
      speedModifier: 1.03,
      jumpForceModifier: 1.02,
      coinRadiusModifier: 1.1,
      coinEarningsModifier: 1.05,
      scoreMultiplier: 1.20,
      shieldCharges: 0
    },
    visual: {
      skinType: 'ember_rex',
      primaryColor: 0xdc2626,
      bellyColor: 0xf97316,
      accentColor: 0x450a0a,
      clawColor: 0x18181b,
      eyeColor: 0xfef08a,
      eyeEmissive: 0xeab308,
      emissiveColor: 0xff3b00,
      emissiveIntensity: 0.45,
      roughness: 0.55,
      metalness: 0.35,
      bumpScale: 0.10
    }
  },
  {
    id: 'shadow_raptor',
    name: 'Shadow Raptor',
    species: 'Nightstalker Theropod',
    rarity: 'legendary',
    description: 'Mythical nocturnal hunter wrapped in obsidian scales and bioluminescent violet veins.',
    specialAbility: '+12% Speed, +10% Jump Force & +15% Score Boost',
    price: 2500,
    stats: {
      speedModifier: 1.12,
      jumpForceModifier: 1.10,
      coinRadiusModifier: 1.15,
      coinEarningsModifier: 1.10,
      scoreMultiplier: 1.15,
      shieldCharges: 0
    },
    visual: {
      skinType: 'shadow_raptor',
      primaryColor: 0x18181b,
      bellyColor: 0x3f3f46,
      accentColor: 0x8b5cf6,
      clawColor: 0x581c87,
      eyeColor: 0xa855f7,
      eyeEmissive: 0x7e22ce,
      emissiveColor: 0x8b5cf6,
      emissiveIntensity: 0.35,
      hasFeatherCrest: true,
      roughness: 0.4,
      metalness: 0.6,
      bumpScale: 0.08
    }
  },
  {
    id: 'frost_spinosaurus',
    name: 'Frost Spinosaurus',
    species: 'Glacial Spinosaurus',
    rarity: 'epic',
    description: 'Colossal arctic predator boasting a majestic crystalline dorsal sail that channels blizzards.',
    specialAbility: 'Spino Dorsal Sail, +25% Magnet Radius & +15% Extra Coins',
    price: 3200,
    stats: {
      speedModifier: 1.05,
      jumpForceModifier: 1.05,
      coinRadiusModifier: 1.25,
      coinEarningsModifier: 1.15,
      scoreMultiplier: 1.10,
      shieldCharges: 0
    },
    visual: {
      skinType: 'frost_spinosaurus',
      primaryColor: 0x0284c7,
      bellyColor: 0xe0f2fe,
      accentColor: 0x0369a1,
      clawColor: 0x075985,
      eyeColor: 0x38bdf8,
      eyeEmissive: 0x0ea5e9,
      emissiveColor: 0x38bdf8,
      emissiveIntensity: 0.25,
      hasSail: true,
      roughness: 0.35,
      metalness: 0.45,
      bumpScale: 0.08
    }
  }
];

export class DinoCatalogHelper {
  public static getVariantById(id: string): DinoVariant {
    const found = DINO_CATALOG.find(d => d.id === id);
    return found || DINO_CATALOG[0]; // Fallback to classic rex
  }

  public static getAllVariants(): DinoVariant[] {
    return DINO_CATALOG;
  }
}
