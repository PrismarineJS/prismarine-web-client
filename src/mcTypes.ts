// todo move from here

//@ts-format-ignore-region
// 1.8.8
export interface LevelDat {
  WorldGenSettings?: WorldGenSettings;
  RandomSeed:           number[];
  generatorName?:        string;
  BorderCenterX:        number;
  BorderCenterZ:        number;
  Difficulty:           number;
  DifficultyLocked:     number;
  BorderSizeLerpTime:   number[];
  Version?: {
    Name: string
    // id, snapshot
  }
  /** 0,1 */
  raining:              number;
  Time:                 number[];
  GameType:             number;
  MapFeatures:          number;
  BorderDamagePerBlock: number;
  BorderWarningBlocks:  number;
  BorderSizeLerpTarget: number;
  DayTime:              number[];
  initialized:          number;
  allowCommands:        number;
  SizeOnDisk:           number[];
  GameRules:            GameRules;
  Player:               Player;
  SpawnY:               number;
  rainTime:             number;
  thunderTime:          number;
  SpawnZ:               number;
  hardcore:             number;
  SpawnX:               number;
  clearWeatherTime:     number;
  thundering:           number;
  generatorVersion?:     number;
  version:              number;
  BorderSafeZone:       number;
  generatorOptions?:     string;
  LastPlayed:           number[];
  BorderWarningTime:    number;
  LevelName:            string;
  BorderSize:           number;
}

export interface GameRules {
  doTileDrops:         string;
  doFireTick:          string;
  reducedDebugInfo:    string;
  naturalRegeneration: string;
  doMobLoot:           string;
  keepInventory:       string;
  doEntityDrops:       string;
  mobGriefing:         string;
  randomTickSpeed:     string;
  commandBlockOutput:  string;
  doMobSpawning:       string;
  logAdminCommands:    string;
  sendCommandFeedback: string;
  doDaylightCycle:     string;
  showDeathMessages:   string;
}

export interface Player {
  HurtByTimestamp:     number;
  SleepTimer:          number;
  Attributes:          Attribute[];
  Invulnerable:        number;
  PortalCooldown:      number;
  AbsorptionAmount:    number;
  abilities:           Abilities;
  FallDistance:        number;
  DeathTime:           number;
  XpSeed:              number;
  HealF:               number;
  XpTotal:             number;
  playerGameType:      number;
  SelectedItem:        SelectedItem;
  Motion:              number[];
  UUIDLeast:           number[];
  Health:              number;
  foodSaturationLevel: number;
  Air:                 number;
  OnGround:            number;
  Dimension:           number;
  Rotation:            number[];
  XpLevel:             number;
  Score:               number;
  UUIDMost:            number[];
  Sleeping:            number;
  Pos:                 number[];
  Fire:                number;
  XpP:                 number;
  EnderItems:          any[];
  foodLevel:           number;
  foodExhaustionLevel: number;
  HurtTime:            number;
  SelectedItemSlot:    number;
  Inventory:           SelectedItem[];
  foodTickTimer:       number;
}

export interface Attribute {
  Base: number;
  Name: string;
}

export interface SelectedItem {
  Slot?:  number;
  id:     string;
  Count:  number;
  Damage: number;
}

export interface Abilities {
  invulnerable: number;
  mayfly:       number;
  instabuild:   number;
  walkSpeed:    number;
  mayBuild:     number;
  flying:       number;
  flySpeed:     number;
}

// 1.16+

export interface WorldGenSettings {
  /** 0,1 */
  bonus_chest:       number;
  seed:              number[];
  /** 0,1 */
  generate_features: number;
  dimensions:        Dimensions;
}

export interface Dimensions {
  // :overworld, :the_nether, :the_end
  [key: string]:  WorldGen;
}

export interface WorldGen {
  generator: WorldGenGenerator;
  // same as key
  type:      string;
}

export interface WorldGenGenerator {
  settings:     string;
  seed:         number[];
  biome_source: PurpleBiomeSource;
  type:         string;
}

export interface PurpleBiomeSource {
  seed:         number[];
  /** only for overworld 0,1 */
  large_biomes?: number;
  // :noise, :flat, ?
  type:         string;
}
