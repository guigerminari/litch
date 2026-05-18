import type {
  CityDefinition,
  ClanBenefitDefinition,
  CraftingRecipe,
  GameShopPackage,
  ItemDefinition,
  MonsterDefinition,
  TalentDefinition
} from "../shared/types";

export const INVENTORY_CAPACITY = 40;
export const STARTING_CITY_ID = "eldoria";

export const ITEM_CATALOG: Record<string, ItemDefinition> = {
  training_sword: {
    id: "training_sword",
    name: "Espada de treino",
    kind: "weapon",
    slot: "weapon",
    minLevel: 1,
    price: 30,
    stats: { strength: 2 },
    description: "+2 FOR"
  },
  iron_sword: {
    id: "iron_sword",
    name: "Espada de ferro",
    kind: "weapon",
    slot: "weapon",
    minLevel: 2,
    price: 90,
    stats: { strength: 6 },
    description: "+6 FOR"
  },
  leather_armor: {
    id: "leather_armor",
    name: "Armadura de couro",
    kind: "armor",
    slot: "armor",
    minLevel: 1,
    price: 45,
    stats: { defense: 2, constitution: 1 },
    description: "+2 DEF, +1 CON"
  },
  iron_armor: {
    id: "iron_armor",
    name: "Armadura de ferro",
    kind: "armor",
    slot: "armor",
    minLevel: 3,
    price: 110,
    stats: { defense: 6 },
    description: "+6 DEF"
  },
  novice_amulet: {
    id: "novice_amulet",
    name: "Amuleto do aprendiz",
    kind: "amulet",
    slot: "amulet",
    minLevel: 1,
    price: 70,
    stats: { agility: 2, constitution: 1 },
    description: "+2 AGI, +1 CON"
  },
  hunter_charm: {
    id: "hunter_charm",
    name: "Talismã do caçador",
    kind: "amulet",
    slot: "amulet",
    minLevel: 4,
    price: 160,
    stats: { agility: 5, strength: 2 },
    description: "+5 AGI, +2 FOR"
  },
  ember_blade: {
    id: "ember_blade",
    name: "Lâmina de brasa",
    kind: "weapon",
    slot: "weapon",
    minLevel: 6,
    price: 360,
    stats: { strength: 15, agility: 3 },
    description: "+15 FOR, +3 AGI"
  },
  guardian_mail: {
    id: "guardian_mail",
    name: "Cota do guardião",
    kind: "armor",
    slot: "armor",
    minLevel: 6,
    price: 330,
    stats: { defense: 14, constitution: 4 },
    description: "+14 DEF, +4 CON"
  },
  moon_amulet: {
    id: "moon_amulet",
    name: "Amuleto lunar",
    kind: "amulet",
    slot: "amulet",
    minLevel: 8,
    price: 420,
    stats: { agility: 8, constitution: 3, strength: 3 },
    description: "+8 AGI, +3 CON, +3 FOR"
  },
  health_potion: {
    id: "health_potion",
    name: "Poção de vida",
    kind: "potion",
    minLevel: 1,
    price: 18,
    stats: { healPercent: 0.3 },
    description: "Recupera 30% da vida máxima"
  },
  energy_potion: {
    id: "energy_potion",
    name: "Poção de energia",
    kind: "potion",
    minLevel: 1,
    price: 24,
    stats: { energyPercent: 0.3 },
    description: "Recupera 30% da energia máxima"
  },
  major_health_potion: {
    id: "major_health_potion",
    name: "Poção vital rara",
    kind: "potion",
    minLevel: 5,
    price: 95,
    stats: { healPercent: 0.55 },
    description: "Recupera 55% da vida máxima"
  },
  major_energy_potion: {
    id: "major_energy_potion",
    name: "Poção energética rara",
    kind: "potion",
    minLevel: 5,
    price: 110,
    stats: { energyPercent: 0.55 },
    description: "Recupera 55% da energia máxima"
  },
  oblivion_scroll: {
    id: "oblivion_scroll",
    name: "Pergaminho do esquecimento",
    kind: "scroll",
    minLevel: 1,
    price: 180,
    stats: {},
    description: "Reseta talentos sem gastar diamantes"
  },
  memory_scroll: {
    id: "memory_scroll",
    name: "Pergaminho da memória",
    kind: "scroll",
    minLevel: 1,
    price: 180,
    stats: {},
    description: "Reseta atributos sem gastar diamantes"
  },
  wolf_pelt: {
    id: "wolf_pelt",
    name: "Pele de lobo",
    kind: "material",
    minLevel: 1,
    price: 18,
    stats: {},
    description: "Material comum de caça"
  },
  ember_core: {
    id: "ember_core",
    name: "Núcleo de brasa",
    kind: "material",
    minLevel: 4,
    price: 55,
    stats: {},
    description: "Material raro e quente ao toque"
  },
  crystal_dust: {
    id: "crystal_dust",
    name: "Pó de cristal",
    kind: "material",
    minLevel: 3,
    price: 38,
    stats: {},
    description: "Catalisador usado por alquimistas"
  },
  wyvern_scale: {
    id: "wyvern_scale",
    name: "Escama de serpe",
    kind: "material",
    minLevel: 7,
    price: 82,
    stats: {},
    description: "Material resistente e raro"
  }
};

export const CRAFTING_RECIPES: Record<string, CraftingRecipe> = {
  forge_ember_blade: {
    id: "forge_ember_blade",
    station: "blacksmith",
    cityIds: ["ravenspire", "ironhold"],
    name: "Forjar Lâmina de brasa",
    resultItemId: "ember_blade",
    resultQuantity: 1,
    goldCost: 120,
    ingredients: [
      { itemId: "iron_sword", quantity: 1 },
      { itemId: "ember_core", quantity: 2 },
      { itemId: "wolf_pelt", quantity: 2 }
    ]
  },
  forge_guardian_mail: {
    id: "forge_guardian_mail",
    station: "blacksmith",
    cityIds: ["ironhold"],
    name: "Forjar Cota do guardião",
    resultItemId: "guardian_mail",
    resultQuantity: 1,
    goldCost: 150,
    ingredients: [
      { itemId: "iron_armor", quantity: 1 },
      { itemId: "wyvern_scale", quantity: 2 },
      { itemId: "ember_core", quantity: 1 }
    ]
  },
  brew_major_health: {
    id: "brew_major_health",
    station: "alchemist",
    cityIds: ["eldoria", "ravenspire", "ironhold"],
    name: "Destilar Poção vital rara",
    resultItemId: "major_health_potion",
    resultQuantity: 1,
    goldCost: 40,
    ingredients: [
      { itemId: "health_potion", quantity: 3 },
      { itemId: "crystal_dust", quantity: 1 }
    ]
  },
  brew_major_energy: {
    id: "brew_major_energy",
    station: "alchemist",
    cityIds: ["ravenspire", "ironhold"],
    name: "Destilar Poção energética rara",
    resultItemId: "major_energy_potion",
    resultQuantity: 1,
    goldCost: 45,
    ingredients: [
      { itemId: "energy_potion", quantity: 3 },
      { itemId: "crystal_dust", quantity: 1 }
    ]
  },
  bind_moon_amulet: {
    id: "bind_moon_amulet",
    station: "alchemist",
    cityIds: ["ironhold"],
    name: "Imbuir Amuleto lunar",
    resultItemId: "moon_amulet",
    resultQuantity: 1,
    goldCost: 180,
    ingredients: [
      { itemId: "hunter_charm", quantity: 1 },
      { itemId: "wyvern_scale", quantity: 1 },
      { itemId: "crystal_dust", quantity: 3 }
    ]
  }
};

export const TALENTS: TalentDefinition[] = [
  { id: "off_power_1", category: "offensive", name: "Golpe firme", description: "+4% dano", maxRank: 3, costPerRank: 1 },
  { id: "off_strength_1", category: "offensive", name: "Braço treinado", description: "+2 FOR por rank", maxRank: 3, costPerRank: 1, requires: "off_power_1" },
  { id: "off_crit_1", category: "offensive", name: "Instinto letal", description: "+2% crítico por rank", maxRank: 3, costPerRank: 1, requires: "off_strength_1" },
  { id: "off_agility_1", category: "offensive", name: "Ataque fluido", description: "+2 AGI por rank", maxRank: 3, costPerRank: 2, requires: "off_crit_1" },
  { id: "off_crit_damage_1", category: "offensive", name: "Corte profundo", description: "+15% dano crítico por rank", maxRank: 3, costPerRank: 2, requires: "off_agility_1" },
  { id: "off_power_2", category: "offensive", name: "Executor", description: "+7% dano por rank", maxRank: 3, costPerRank: 3, requires: "off_crit_damage_1" },
  { id: "def_vitality_1", category: "defensive", name: "Fôlego de aço", description: "+5% vida", maxRank: 3, costPerRank: 1 },
  { id: "def_constitution_1", category: "defensive", name: "Corpo resiliente", description: "+2 CON por rank", maxRank: 3, costPerRank: 1, requires: "def_vitality_1" },
  { id: "def_armor_1", category: "defensive", name: "Postura de guarda", description: "+2 DEF por rank", maxRank: 4, costPerRank: 1, requires: "def_constitution_1" },
  { id: "def_dodge_1", category: "defensive", name: "Passo evasivo", description: "+2% esquiva por rank", maxRank: 3, costPerRank: 2, requires: "def_armor_1" },
  { id: "def_agility_1", category: "defensive", name: "Reflexos calmos", description: "+2 AGI por rank", maxRank: 3, costPerRank: 2, requires: "def_dodge_1" },
  { id: "def_vitality_2", category: "defensive", name: "Muralha viva", description: "+8% vida por rank", maxRank: 3, costPerRank: 3, requires: "def_agility_1" },
  { id: "util_xp_1", category: "utility", name: "Aprendizado rápido", description: "+5% XP por rank", maxRank: 4, costPerRank: 1 },
  { id: "util_gold_1", category: "utility", name: "Olho mercante", description: "+5% gold por rank", maxRank: 4, costPerRank: 1, requires: "util_xp_1" },
  { id: "util_drop_1", category: "utility", name: "Mãos sortudas", description: "+4% drop por rank", maxRank: 4, costPerRank: 2, requires: "util_gold_1" },
  { id: "util_energy_1", category: "utility", name: "Ritmo de marcha", description: "+1 energia máxima por rank", maxRank: 4, costPerRank: 2, requires: "util_drop_1" },
  { id: "util_xp_2", category: "utility", name: "Memória arcana", description: "+8% XP por rank", maxRank: 3, costPerRank: 3, requires: "util_energy_1" },
  { id: "util_drop_2", category: "utility", name: "Destino generoso", description: "+8% drop por rank", maxRank: 3, costPerRank: 3, requires: "util_xp_2" },
  { id: "regen_hp_1", category: "utility", name: "Regeneração vital", description: "+3% regen de vida por rank", maxRank: 3, costPerRank: 2, requires: "util_drop_2" },
  { id: "regen_energy_1", category: "utility", name: "Regeneração de energia", description: "+3% regen de energia por rank", maxRank: 3, costPerRank: 2, requires: "regen_hp_1" }
];

export const DIAMOND_PACKAGES: GameShopPackage[] = [
  { id: "diamonds_30", name: "Bolsa pequena", diamonds: 30, priceLabel: "R$ 4,90" },
  { id: "diamonds_80", name: "Bolsa aventureira", diamonds: 80, priceLabel: "R$ 9,90", bonusLabel: "+10 bônus" },
  { id: "diamonds_180", name: "Cofre reluzente", diamonds: 180, priceLabel: "R$ 19,90", bonusLabel: "+40 bônus" },
  { id: "diamonds_420", name: "Tesouro arcano", diamonds: 420, priceLabel: "R$ 39,90", bonusLabel: "+120 bônus" }
];

export const CLAN_BENEFITS: ClanBenefitDefinition[] = [
  { id: "clan_damage_1", category: "combat", name: "Estandarte de guerra", description: "+1% dano por rank", maxRank: 5, costPerRank: { gold: 400, diamonds: 0 } },
  { id: "clan_crit_1", category: "combat", name: "Juramento preciso", description: "+0,5% crítico por rank", maxRank: 5, costPerRank: { gold: 650, diamonds: 2 }, requires: "clan_damage_1" },
  { id: "clan_damage_2", category: "combat", name: "Chamado ofensivo", description: "+1,5% dano por rank", maxRank: 4, costPerRank: { gold: 950, diamonds: 4 }, requires: "clan_crit_1" },
  { id: "clan_vitality_1", category: "defense", name: "Abrigo comum", description: "+2% vida por rank", maxRank: 5, costPerRank: { gold: 420, diamonds: 0 } },
  { id: "clan_guard_1", category: "defense", name: "Muralha do clã", description: "+1 defesa por rank", maxRank: 5, costPerRank: { gold: 640, diamonds: 2 }, requires: "clan_vitality_1" },
  { id: "clan_dodge_1", category: "defense", name: "Treino coordenado", description: "+0,5% esquiva por rank", maxRank: 4, costPerRank: { gold: 900, diamonds: 4 }, requires: "clan_guard_1" },
  { id: "clan_xp_1", category: "prosperity", name: "Biblioteca do clã", description: "+2% XP por rank", maxRank: 5, costPerRank: { gold: 500, diamonds: 0 } },
  { id: "clan_gold_1", category: "prosperity", name: "Tesouraria comum", description: "+2% gold por rank", maxRank: 5, costPerRank: { gold: 700, diamonds: 2 }, requires: "clan_xp_1" },
  { id: "clan_drop_1", category: "prosperity", name: "Partilha de espólios", description: "+1,5% drop por rank", maxRank: 4, costPerRank: { gold: 980, diamonds: 4 }, requires: "clan_gold_1" },
  { id: "clan_energy_1", category: "prosperity", name: "Rotas seguras", description: "+1 energia por rank", maxRank: 3, costPerRank: { gold: 1200, diamonds: 6 }, requires: "clan_drop_1" }
];

export const CITIES: CityDefinition[] = [
  {
    id: "eldoria",
    name: "Eldoria",
    minLevel: 1,
    travelCost: 0,
    description: "Cidade principal, cercada por bosques antigos e estradas seguras.",
    npcs: {
      armorer: "Borin Martelo-Firme",
      apothecary: "Mira Folha-Clara",
      alchemist: "Nara Alambique"
    },
    alchemistRecipeIds: ["brew_major_health"],
    huntMonsterIds: ["training_dummy", "forest_rat", "gray_wolf"],
    armorerItemIds: ["training_sword", "iron_sword", "leather_armor", "iron_armor", "novice_amulet"],
    apothecaryItemIds: ["health_potion", "energy_potion", "memory_scroll", "oblivion_scroll"]
  },
  {
    id: "ravenspire",
    name: "Ravenspire",
    minLevel: 3,
    travelCost: 45,
    description: "Torres de pedra vigiam trilhas tomadas por saqueadores.",
    npcs: {
      armorer: "Garrik Aço-Negro",
      apothecary: "Selene Vidro-Rubro",
      blacksmith: "Doran Bigorna",
      alchemist: "Selene Vidro-Rubro"
    },
    dungeonMonsterIds: ["road_bandit", "thorn_boar"],
    blacksmithRecipeIds: ["forge_ember_blade"],
    alchemistRecipeIds: ["brew_major_health", "brew_major_energy"],
    huntMonsterIds: ["road_bandit", "thorn_boar"],
    armorerItemIds: ["iron_sword", "iron_armor", "hunter_charm"],
    apothecaryItemIds: ["health_potion", "energy_potion", "major_health_potion", "major_energy_potion", "memory_scroll", "oblivion_scroll"]
  },
  {
    id: "ironhold",
    name: "Ironhold",
    minLevel: 7,
    travelCost: 130,
    description: "Uma fortaleza nas montanhas onde o ar pesa como metal.",
    npcs: {
      armorer: "Helga Forja-Alta",
      apothecary: "Orin Cinza-Viva",
      blacksmith: "Helga Forja-Alta",
      alchemist: "Orin Cinza-Viva"
    },
    dungeonMonsterIds: ["ember_golem", "cave_wyvern"],
    blacksmithRecipeIds: ["forge_ember_blade", "forge_guardian_mail"],
    alchemistRecipeIds: ["brew_major_health", "brew_major_energy", "bind_moon_amulet"],
    huntMonsterIds: ["ember_golem", "cave_wyvern"],
    armorerItemIds: ["iron_sword", "iron_armor", "hunter_charm"],
    apothecaryItemIds: ["health_potion", "energy_potion", "major_health_potion", "major_energy_potion", "memory_scroll", "oblivion_scroll"]
  },
  {
    id: "vila_de_valfria",
    name: "Vila de Valfria",
    minLevel: 15,
    travelCost: 130,
    description: "Uma vila pitoresca nas montanhas, conhecida por suas tradições antigas.",
    npcs: {
      armorer: "Helga Forja-Alta",
      apothecary: "Orin Cinza-Viva",
      blacksmith: "Helga Forja-Alta",
      alchemist: "Orin Cinza-Viva"
    },
    dungeonMonsterIds: ["ember_golem", "cave_wyvern"],
    blacksmithRecipeIds: ["forge_ember_blade", "forge_guardian_mail"],
    alchemistRecipeIds: ["brew_major_health", "brew_major_energy", "bind_moon_amulet"],
    huntMonsterIds: ["ember_golem", "cave_wyvern"],
    armorerItemIds: ["iron_sword", "iron_armor", "hunter_charm"],
    apothecaryItemIds: ["health_potion", "energy_potion", "major_health_potion", "major_energy_potion", "memory_scroll", "oblivion_scroll"]
  },
  {
    id: "rosindale",
    name: "Rosindale",
    minLevel: 25,
    travelCost: 130,
    description: "Uma fortaleza nas montanhas onde o ar pesa como metal.",
    npcs: {
      armorer: "Helga Forja-Alta",
      apothecary: "Orin Cinza-Viva",
      blacksmith: "Helga Forja-Alta",
      alchemist: "Orin Cinza-Viva"
    },
    dungeonMonsterIds: ["ember_golem", "cave_wyvern"],
    blacksmithRecipeIds: ["forge_ember_blade", "forge_guardian_mail"],
    alchemistRecipeIds: ["brew_major_health", "brew_major_energy", "bind_moon_amulet"],
    huntMonsterIds: ["ember_golem", "cave_wyvern"],
    armorerItemIds: ["iron_sword", "iron_armor", "hunter_charm"],
    apothecaryItemIds: ["health_potion", "energy_potion", "major_health_potion", "major_energy_potion", "memory_scroll", "oblivion_scroll"]
  }
];

export const MONSTERS: Record<string, MonsterDefinition> = {
  training_dummy: {
    id: "training_dummy",
    cityId: "eldoria",
    name: "Boneco encantado",
    level: 1,
    maxHp: 35,
    strength: 8,
    defense: 0,
    agility: 0,
    experience: 25,
    gold: 8,
    drops: [{ itemId: "health_potion", chance: 0.18 }]
  },
  forest_rat: {
    id: "forest_rat",
    cityId: "eldoria",
    name: "Rato da floresta",
    level: 1,
    maxHp: 45,
    strength: 10,
    defense: 1,
    agility: 2,
    experience: 35,
    gold: 12,
    drops: [{ itemId: "health_potion", chance: 0.22 }]
  },
  gray_wolf: {
    id: "gray_wolf",
    cityId: "eldoria",
    name: "Lobo cinzento",
    level: 2,
    maxHp: 75,
    strength: 18,
    defense: 3,
    agility: 5,
    experience: 70,
    gold: 22,
    drops: [
      { itemId: "wolf_pelt", chance: 0.45 },
      { itemId: "health_potion", chance: 0.15 }
    ]
  },
  road_bandit: {
    id: "road_bandit",
    cityId: "ravenspire",
    name: "Saqueador da estrada",
    level: 3,
    maxHp: 130,
    strength: 34,
    defense: 6,
    agility: 8,
    experience: 120,
    gold: 45,
    drops: [
      { itemId: "iron_sword", chance: 0.08 },
      { itemId: "crystal_dust", chance: 0.18 }
    ]
  },
  thorn_boar: {
    id: "thorn_boar",
    cityId: "ravenspire",
    name: "Javali espinhoso",
    level: 4,
    maxHp: 180,
    strength: 42,
    defense: 10,
    agility: 4,
    experience: 160,
    gold: 54,
    drops: [
      { itemId: "energy_potion", chance: 0.2 },
      { itemId: "crystal_dust", chance: 0.28 }
    ]
  },
  ember_golem: {
    id: "ember_golem",
    cityId: "ironhold",
    name: "Golem de brasa",
    level: 7,
    maxHp: 380,
    strength: 78,
    defense: 24,
    agility: 3,
    experience: 320,
    gold: 120,
    drops: [
      { itemId: "ember_core", chance: 0.55 },
      { itemId: "crystal_dust", chance: 0.2 }
    ]
  },
  cave_wyvern: {
    id: "cave_wyvern",
    cityId: "ironhold",
    name: "Serpe da caverna",
    level: 9,
    maxHp: 470,
    strength: 98,
    defense: 18,
    agility: 16,
    experience: 460,
    gold: 170,
    drops: [
      { itemId: "hunter_charm", chance: 0.12 },
      { itemId: "ember_core", chance: 0.3 },
      { itemId: "wyvern_scale", chance: 0.42 }
    ]
  }
};
