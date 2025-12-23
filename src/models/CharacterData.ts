/**
 * JobType Enum
 * Defines the available character classes.
 */
export enum JobType {
  Warrior = 'Warrior',
  Mage = 'Mage',
  Rogue = 'Rogue'
}

/**
 * CharacterData Class
 * Represents the core stats and data for a character.
 * Asgard MMORPG Rules implemented.
 */
export class CharacterData {
  public characterName: string;
  public job: JobType;
  public level: number;
  
  // Primary Stats (Attributes)
  public str: number; // Strength
  public int: number; // Intelligence
  public dex: number; // Dexterity
  
  public statPoints: number; // Points to distribute
  public skillPoints: number; // Points for skills
  
  // Derived Stats (Calculated)
  public maxHP: number;
  public currentHP: number;
  
  public maxMP: number;
  public currentMP: number;
  
  public attackPower: number; // Physical Attack (DAM)
  public magicPower: number;  // Magical Attack (MDAM)
  public defense: number;     // Physical Defense (AC) - Base
  
  // New derived stats
  public hit: number;    // Accuracy (HIT)
  public crit: number;   // Critical Rate (CRI)
  public weight: number; // Weight Limit (WEIGHT)
  
  public mHit: number;   // Magic Accuracy (MHIT)
  public mDef: number;   // Magic Defense (MAC)

  /**
   * Constructor to initialize stats based on Job
   * @param characterName Name of the character
   * @param job Selected JobType (Warrior, Mage, Rogue)
   */
  constructor(characterName: string, job: JobType) {
    this.characterName = characterName;
    this.job = job;
    this.level = 1;
    this.statPoints = 0;
    this.skillPoints = 0;

    // Initialize Primary Stats based on Job
    switch (job) {
      case JobType.Warrior:
        // Warrior: High STR, Moderate DEX, Low INT
        this.str = 20;
        this.int = 5;
        this.dex = 10;
        break;

      case JobType.Mage:
        // Mage: High INT, Low STR, Moderate DEX
        this.str = 5;
        this.int = 20;
        this.dex = 10;
        break;
        
      case JobType.Rogue:
        // Rogue: High DEX, Moderate STR, Low INT
        this.str = 15;
        this.int = 5;
        this.dex = 20;
        break;

      default:
        this.str = 10;
        this.int = 10;
        this.dex = 10;
        break;
    }

    // Initialize Base Defense
    this.defense = 0; // Will be added from equipment later
    // Initialize Base Magic Defense
    this.mDef = 0; 

    // Calculate Derived Stats (Asgard Rules)
    this.maxHP = this.calculateMaxHP();
    this.maxMP = this.calculateMaxMP();
    this.attackPower = this.calculateDamage();
    this.magicPower = this.calculateMagicDamage();
    this.hit = this.calculateHit();
    this.crit = this.calculateCrit();
    this.weight = this.calculateWeight();
    
    // New stats
    this.mHit = this.calculateMagicHit();
    this.mDef = this.calculateMagicDefense();

    // Set current stats to max on initialization
    this.currentHP = this.maxHP;
    this.currentMP = this.maxMP;
  }

  // Calculation Methods based on Asgard Rules

  public calculateMaxHP(): number {
    // HP (Max): Base + (STR * 15) + (Level * 20)
    const base = 100; // Base HP
    return base + (this.str * 15) + (this.level * 20);
  }

  public calculateMaxMP(): number {
    // MP (Max): Base + (INT * 10) + (Level * 10)
    const base = 50; // Base MP
    return base + (this.int * 10) + (this.level * 10);
  }

  public calculateDamage(): number {
    // DAM (Physical) Scaling:
    // Warrior: STR significantly increases Physical Damage (STR * 4) + (Level * 1.5)
    // Rogue: DEX increases DAM (DEX * 2) + (STR * 1) + (Level * 1.5)
    // Mage: STR * 1 + Level * 1
    
    if (this.job === JobType.Warrior) {
      return (this.str * 4) + (this.level * 1.5);
    } else if (this.job === JobType.Rogue) {
      return (this.dex * 2) + (this.str * 1) + (this.level * 1.5);
    } else {
      // Mage / Default
      return (this.str * 1) + (this.level * 1);
    }
  }

  public calculateMagicDamage(): number {
    // MDAM (Magic) Scaling:
    // Warrior: STR slightly increases Magic Damage (INT * 1) + (STR * 0.5)
    // Rogue: DEX increases MDAM (INT * 1) + (DEX * 1)
    // Mage: INT significantly increases MDAM (INT * 4)
    
    if (this.job === JobType.Warrior) {
        return (this.int * 1) + (this.str * 0.5);
    } else if (this.job === JobType.Rogue) {
        return (this.int * 1) + (this.dex * 1);
    } else if (this.job === JobType.Mage) {
        return (this.int * 4);
    } else {
        return (this.int * 1);
    }
  }

  public calculateHit(): number {
    // HIT (Accuracy) Scaling:
    // Rogue: DEX gives a higher bonus to Physical Hit (DEX * 3)
    // Others: DEX * 1.5
    
    const base = 80;
    if (this.job === JobType.Rogue) {
        return base + (this.dex * 3.0);
    }
    return base + (this.dex * 1.5);
  }

  public calculateCrit(): number {
    // CRI (Critical) Scaling:
    // Rogue: STR increases Critical probability (STR * 0.2 + DEX * 0.1)
    // Others: DEX * 0.1
    
    if (this.job === JobType.Rogue) {
        return parseFloat(((this.str * 0.2) + (this.dex * 0.1)).toFixed(1));
    }
    return parseFloat((this.dex * 0.1).toFixed(1));
  }

  public calculateWeight(): number {
    // WEIGHT: (STR * 5) + (Level * 2)
    return (this.str * 5) + (this.level * 2);
  }
  
  public calculateDefense(): number {
    // AC (Defense): Base + (STR * 0.5) + (Level * 1)
    const base = 0;
    return base + (this.str * 0.5) + (this.level * 1);
  }

  public calculateMagicHit(): number {
    // MHIT (Magic Accuracy):
    // Mage: INT increases Magic Hit (INT * 3)
    // Others: INT * 1.5
    
    const base = 80;
    if (this.job === JobType.Mage) {
        return base + (this.int * 3);
    }
    return base + (this.int * 1.5);
  }

  public calculateMagicDefense(): number {
    // MAC (Magic Defense): Base + (INT * 0.5) + (Level * 1)
    const base = 0;
    return base + (this.int * 0.5) + (this.level * 1);
  }
}
