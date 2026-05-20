import type {
  CityDefinition,
  ClanBenefitDefinition,
  ClanSuperBenefitDefinition,
  CountryDefinition,
  CraftingRecipe,
  GameShopPackage,
  HuntingLocationDefinition,
  ItemDefinition,
  MonsterDefinition,
  TalentDefinition
} from "../shared/types";

export const INVENTORY_CAPACITY = 40;
export const STARTING_CITY_ID = "eldoria";

export const TRAIN_TICKET_ID = "ticket_train";
export const SHIP_TICKET_ID = "ticket_ship";

export const ITEM_CATALOG: Record<string, ItemDefinition> = {
  "ticket_train": {
    "id": "ticket_train",
    "name": "Ticket de Trem",
    "kind": "ticket",
    "minLevel": 1,
    "price": 80,
    "stats": {},
    "description": "Usado para viajar entre cidades do mesmo pais."
  },
  "ticket_ship": {
    "id": "ticket_ship",
    "name": "Ticket de Navio",
    "kind": "ticket",
    "minLevel": 1,
    "price": 250,
    "stats": {},
    "description": "Usado para viajar entre paises. A chegada sempre acontece na cidade porto."
  },
  "armor_leather": {
    "id": "armor_leather",
    "name": "Armadura de Couro",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/00-leather.png",
    "minLevel": 1,
    "price": 120,
    "stats": {
      "defense": 6,
      "constitution": 1
    },
    "description": "+6 DEF, +1 CON",
    "rarity": "common"
  },
  "armor_steel": {
    "id": "armor_steel",
    "name": "Armadura de Aco",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/01-steel.png",
    "minLevel": 5,
    "price": 320,
    "stats": {
      "defense": 18,
      "constitution": 1
    },
    "description": "+18 DEF, +1 CON",
    "rarity": "common"
  },
  "armor_mystic": {
    "id": "armor_mystic",
    "name": "Armadura Mistica",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/02-mystic.png",
    "minLevel": 9,
    "price": 520,
    "stats": {
      "defense": 30,
      "constitution": 2
    },
    "description": "+30 DEF, +2 CON",
    "rarity": "uncommon"
  },
  "armor_kharlee": {
    "id": "armor_kharlee",
    "name": "Armadura de Kharlee",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/03-kharlee.png",
    "minLevel": 13,
    "price": 720,
    "stats": {
      "defense": 42,
      "constitution": 3
    },
    "description": "+42 DEF, +3 CON",
    "rarity": "uncommon"
  },
  "armor_cursed": {
    "id": "armor_cursed",
    "name": "Armadura Amaldicoada",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/04-cursed.png",
    "minLevel": 17,
    "price": 920,
    "stats": {
      "defense": 54,
      "constitution": 4
    },
    "description": "+54 DEF, +4 CON",
    "rarity": "rare"
  },
  "armor_justice": {
    "id": "armor_justice",
    "name": "Armadura da Justica",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/05-justice.png",
    "minLevel": 21,
    "price": 1120,
    "stats": {
      "defense": 66,
      "constitution": 5
    },
    "description": "+66 DEF, +5 CON",
    "rarity": "rare"
  },
  "armor_obscure": {
    "id": "armor_obscure",
    "name": "Armadura Obscura",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/96-obscure.png",
    "minLevel": 25,
    "price": 1320,
    "stats": {
      "defense": 78,
      "constitution": 6
    },
    "description": "+78 DEF, +6 CON",
    "rarity": "rare"
  },
  "armor_death": {
    "id": "armor_death",
    "name": "Armadura da Morte",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/106-death.png",
    "minLevel": 29,
    "price": 1520,
    "stats": {
      "defense": 90,
      "constitution": 7
    },
    "description": "+90 DEF, +7 CON",
    "rarity": "epic"
  },
  "armor_dragon": {
    "id": "armor_dragon",
    "name": "Armadura de Dragao",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/114-dragon.png",
    "minLevel": 33,
    "price": 1720,
    "stats": {
      "defense": 102,
      "constitution": 8
    },
    "description": "+102 DEF, +8 CON",
    "rarity": "epic"
  },
  "armor_dhron": {
    "id": "armor_dhron",
    "name": "Armadura de Dhron",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/124-dhron.png",
    "minLevel": 37,
    "price": 1920,
    "stats": {
      "defense": 114,
      "constitution": 9
    },
    "description": "+114 DEF, +9 CON",
    "rarity": "epic"
  },
  "armor_erins": {
    "id": "armor_erins",
    "name": "Armadura de Erins",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/140-erins.png",
    "minLevel": 41,
    "price": 2120,
    "stats": {
      "defense": 126,
      "constitution": 10
    },
    "description": "+126 DEF, +10 CON",
    "rarity": "legendary"
  },
  "material_blue_coin": {
    "id": "material_blue_coin",
    "name": "Moeda Azul",
    "kind": "material",
    "imageUrl": "/assets/items/materials/blue_coin.png",
    "minLevel": 1,
    "price": 15,
    "stats": {},
    "description": "Material de criacao e aprimoramento."
  },
  "material_bone": {
    "id": "material_bone",
    "name": "Osso",
    "kind": "material",
    "imageUrl": "/assets/items/materials/bone.png",
    "minLevel": 1,
    "price": 15,
    "stats": {},
    "description": "Material de criacao e aprimoramento."
  },
  "material_celena": {
    "id": "material_celena",
    "name": "Celena",
    "kind": "material",
    "imageUrl": "/assets/items/materials/celena.png",
    "minLevel": 1,
    "price": 15,
    "stats": {},
    "description": "Material de criacao e aprimoramento."
  },
  "material_chimera_jewell": {
    "id": "material_chimera_jewell",
    "name": "Joia de Quimera",
    "kind": "material",
    "imageUrl": "/assets/items/materials/chimera_jewell.png",
    "minLevel": 1,
    "price": 15,
    "stats": {},
    "description": "Material de criacao e aprimoramento."
  },
  "material_dark_magic_rune": {
    "id": "material_dark_magic_rune",
    "name": "Runa de Magia Sombria",
    "kind": "material",
    "imageUrl": "/assets/items/materials/dark_magic_rune.png",
    "minLevel": 2,
    "price": 22,
    "stats": {},
    "description": "Material de criacao e aprimoramento."
  },
  "material_dark_residue": {
    "id": "material_dark_residue",
    "name": "Residuo Sombrio",
    "kind": "material",
    "imageUrl": "/assets/items/materials/dark_residue.png",
    "minLevel": 2,
    "price": 22,
    "stats": {},
    "description": "Material de criacao e aprimoramento."
  },
  "material_dexerity_jewell": {
    "id": "material_dexerity_jewell",
    "name": "Joia de Destreza",
    "kind": "material",
    "imageUrl": "/assets/items/materials/dexerity_jewell.png",
    "minLevel": 2,
    "price": 22,
    "stats": {},
    "description": "Material de criacao e aprimoramento."
  },
  "material_dragon_essence": {
    "id": "material_dragon_essence",
    "name": "Essencia de Dragao",
    "kind": "material",
    "imageUrl": "/assets/items/materials/dragon_essence.png",
    "minLevel": 2,
    "price": 22,
    "stats": {},
    "description": "Material de criacao e aprimoramento."
  },
  "material_dragon_jewell": {
    "id": "material_dragon_jewell",
    "name": "Joia de Dragao",
    "kind": "material",
    "imageUrl": "/assets/items/materials/dragon_jewell.png",
    "minLevel": 3,
    "price": 29,
    "stats": {},
    "description": "Material de criacao e aprimoramento."
  },
  "material_dragon_nail": {
    "id": "material_dragon_nail",
    "name": "Garra de Dragao",
    "kind": "material",
    "imageUrl": "/assets/items/materials/dragon_nail.png",
    "minLevel": 3,
    "price": 29,
    "stats": {},
    "description": "Material de criacao e aprimoramento."
  },
  "material_dragons_tooth": {
    "id": "material_dragons_tooth",
    "name": "Dente de Dragao",
    "kind": "material",
    "imageUrl": "/assets/items/materials/dragons_tooth.png",
    "minLevel": 3,
    "price": 29,
    "stats": {},
    "description": "Material de criacao e aprimoramento."
  },
  "material_energy_jewell": {
    "id": "material_energy_jewell",
    "name": "Joia de Energia",
    "kind": "material",
    "imageUrl": "/assets/items/materials/energy_jewell.png",
    "minLevel": 3,
    "price": 29,
    "stats": {},
    "description": "Material de criacao e aprimoramento."
  },
  "material_eran_fragment": {
    "id": "material_eran_fragment",
    "name": "Pedra de Eran",
    "kind": "material",
    "imageUrl": "/assets/items/materials/eran_fragment.png",
    "minLevel": 4,
    "price": 36,
    "stats": {},
    "description": "Material de criacao e aprimoramento."
  },
  "material_green_coin": {
    "id": "material_green_coin",
    "name": "Moeda Verde",
    "kind": "material",
    "imageUrl": "/assets/items/materials/green_coin.png",
    "minLevel": 4,
    "price": 36,
    "stats": {},
    "description": "Material de criacao e aprimoramento."
  },
  "material_gromin_mycelium": {
    "id": "material_gromin_mycelium",
    "name": "Micelio de Gromin",
    "kind": "material",
    "imageUrl": "/assets/items/materials/gromin_mycelium.png",
    "minLevel": 4,
    "price": 36,
    "stats": {},
    "description": "Material de criacao e aprimoramento."
  },
  "material_herb": {
    "id": "material_herb",
    "name": "Erva",
    "kind": "material",
    "imageUrl": "/assets/items/materials/herb.png",
    "minLevel": 4,
    "price": 36,
    "stats": {},
    "description": "Material de criacao e aprimoramento."
  },
  "material_laede_fragment": {
    "id": "material_laede_fragment",
    "name": "Fragmento de Laede",
    "kind": "material",
    "imageUrl": "/assets/items/materials/laede_fragment.png",
    "minLevel": 5,
    "price": 43,
    "stats": {},
    "description": "Material de criacao e aprimoramento."
  },
  "material_magic_essence": {
    "id": "material_magic_essence",
    "name": "Essencia Magica",
    "kind": "material",
    "imageUrl": "/assets/items/materials/magic_essence.png",
    "minLevel": 5,
    "price": 43,
    "stats": {},
    "description": "Material de criacao e aprimoramento."
  },
  "material_midran": {
    "id": "material_midran",
    "name": "Midran",
    "kind": "material",
    "imageUrl": "/assets/items/materials/midran.png",
    "minLevel": 5,
    "price": 43,
    "stats": {},
    "description": "Material de criacao e aprimoramento."
  },
  "material_mycelium_fungus": {
    "id": "material_mycelium_fungus",
    "name": "Fungo Micelial",
    "kind": "material",
    "imageUrl": "/assets/items/materials/mycelium_fungus.png",
    "minLevel": 5,
    "price": 43,
    "stats": {},
    "description": "Material de criacao e aprimoramento."
  },
  "material_mysterious_jewell": {
    "id": "material_mysterious_jewell",
    "name": "Joia Misteriosa",
    "kind": "material",
    "imageUrl": "/assets/items/materials/mysterious_jewell.png",
    "minLevel": 6,
    "price": 50,
    "stats": {},
    "description": "Material de criacao e aprimoramento."
  },
  "material_old_stone": {
    "id": "material_old_stone",
    "name": "Pedra Antiga",
    "kind": "material",
    "imageUrl": "/assets/items/materials/old_stone.png",
    "minLevel": 6,
    "price": 50,
    "stats": {},
    "description": "Material de criacao e aprimoramento."
  },
  "material_purple_coin": {
    "id": "material_purple_coin",
    "name": "Moeda Roxa",
    "kind": "material",
    "imageUrl": "/assets/items/materials/purple_coin.png",
    "minLevel": 6,
    "price": 50,
    "stats": {},
    "description": "Material de criacao e aprimoramento."
  },
  "material_spectre_fragment": {
    "id": "material_spectre_fragment",
    "name": "Fragmento Espectral",
    "kind": "material",
    "imageUrl": "/assets/items/materials/spectre_fragment.png",
    "minLevel": 6,
    "price": 50,
    "stats": {},
    "description": "Material de criacao e aprimoramento."
  },
  "material_spectre_jewell": {
    "id": "material_spectre_jewell",
    "name": "Joia Espectral",
    "kind": "material",
    "imageUrl": "/assets/items/materials/spectre_jewell.png",
    "minLevel": 7,
    "price": 57,
    "stats": {},
    "description": "Material de criacao e aprimoramento."
  },
  "material_stone_fragment": {
    "id": "material_stone_fragment",
    "name": "Fragmento de Pedra",
    "kind": "material",
    "imageUrl": "/assets/items/materials/stone_fragment.png",
    "minLevel": 7,
    "price": 57,
    "stats": {},
    "description": "Material de criacao e aprimoramento."
  },
  "material_strenght_jewell": {
    "id": "material_strenght_jewell",
    "name": "Joia de Forca",
    "kind": "material",
    "imageUrl": "/assets/items/materials/strenght_jewell.png",
    "minLevel": 7,
    "price": 57,
    "stats": {},
    "description": "Material de criacao e aprimoramento."
  },
  "material_udania": {
    "id": "material_udania",
    "name": "Udania",
    "kind": "material",
    "imageUrl": "/assets/items/materials/udania.png",
    "minLevel": 7,
    "price": 57,
    "stats": {},
    "description": "Material de criacao e aprimoramento."
  },
  "misc_doemia": {
    "id": "misc_doemia",
    "name": "Doemia",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/doemia.png",
    "minLevel": 1,
    "price": 20,
    "stats": {},
    "description": "Item variado usado em receitas, chaves e eventos."
  },
  "misc_dragon_stone": {
    "id": "misc_dragon_stone",
    "name": "Pedra de Dragao",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/dragon_stone.png",
    "minLevel": 1,
    "price": 20,
    "stats": {},
    "description": "Item variado usado em receitas, chaves e eventos."
  },
  "misc_dungeon_key": {
    "id": "misc_dungeon_key",
    "name": "Chave de Masmorra",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/dungeon-key.png",
    "minLevel": 1,
    "price": 20,
    "stats": {},
    "description": "Item variado usado em receitas, chaves e eventos."
  },
  "scroll_enhanced_parchment": {
    "id": "scroll_enhanced_parchment",
    "name": "Pergaminho Aprimorado",
    "kind": "scroll",
    "imageUrl": "/assets/items/misc/enhanced-parchment.png",
    "minLevel": 1,
    "price": 20,
    "stats": {},
    "description": "Pergaminho usado em receitas e efeitos especiais."
  },
  "misc_eran": {
    "id": "misc_eran",
    "name": "Eran",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/eran.png",
    "minLevel": 1,
    "price": 20,
    "stats": {},
    "description": "Item variado usado em receitas, chaves e eventos."
  },
  "misc_erins_chest_1": {
    "id": "misc_erins_chest_1",
    "name": "Bau de Erins 1",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/erins-chest-1.png",
    "minLevel": 2,
    "price": 28,
    "stats": {},
    "description": "Item variado usado em receitas, chaves e eventos."
  },
  "misc_erins_chest_2": {
    "id": "misc_erins_chest_2",
    "name": "Bau de Erins 2",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/erins-chest-2.png",
    "minLevel": 2,
    "price": 28,
    "stats": {},
    "description": "Item variado usado em receitas, chaves e eventos."
  },
  "misc_erins_chest_3": {
    "id": "misc_erins_chest_3",
    "name": "Bau de Erins 3",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/erins-chest-3.png",
    "minLevel": 2,
    "price": 28,
    "stats": {},
    "description": "Item variado usado em receitas, chaves e eventos."
  },
  "misc_erins_chest": {
    "id": "misc_erins_chest",
    "name": "Bau de Erins",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/erins-chest.png",
    "minLevel": 2,
    "price": 28,
    "stats": {},
    "description": "Item variado usado em receitas, chaves e eventos."
  },
  "scroll_fraddo_parchment": {
    "id": "scroll_fraddo_parchment",
    "name": "Pergaminho de Fraddo",
    "kind": "scroll",
    "imageUrl": "/assets/items/misc/fraddo-parchment.png",
    "minLevel": 2,
    "price": 28,
    "stats": {},
    "description": "Pergaminho usado em receitas e efeitos especiais."
  },
  "misc_herb_bitter": {
    "id": "misc_herb_bitter",
    "name": "Erva Amarga",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/herb_bitter.png",
    "minLevel": 3,
    "price": 36,
    "stats": {},
    "description": "Item variado usado em receitas, chaves e eventos."
  },
  "misc_herb_moss": {
    "id": "misc_herb_moss",
    "name": "Erva de Musgo",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/herb_moss.png",
    "minLevel": 3,
    "price": 36,
    "stats": {},
    "description": "Item variado usado em receitas, chaves e eventos."
  },
  "misc_herb_rustic": {
    "id": "misc_herb_rustic",
    "name": "Erva Rustica",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/herb_rustic.png",
    "minLevel": 3,
    "price": 36,
    "stats": {},
    "description": "Item variado usado em receitas, chaves e eventos."
  },
  "misc_high_dungeon_key": {
    "id": "misc_high_dungeon_key",
    "name": "Chave de Masmorra Avancada",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/high-dungeon-key.png",
    "minLevel": 3,
    "price": 36,
    "stats": {},
    "description": "Item variado usado em receitas, chaves e eventos."
  },
  "misc_hozir_box": {
    "id": "misc_hozir_box",
    "name": "Caixa de Hozir",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/hozir-box.png",
    "minLevel": 3,
    "price": 36,
    "stats": {},
    "description": "Item variado usado em receitas, chaves e eventos."
  },
  "misc_kaede_stone": {
    "id": "misc_kaede_stone",
    "name": "Pedra de Kaede",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/kaede_stone.png",
    "minLevel": 4,
    "price": 44,
    "stats": {},
    "description": "Item variado usado em receitas, chaves e eventos."
  },
  "misc_laede": {
    "id": "misc_laede",
    "name": "Laede",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/laede.png",
    "minLevel": 4,
    "price": 44,
    "stats": {},
    "description": "Item variado usado em receitas, chaves e eventos."
  },
  "scroll_magic_lands_parchment": {
    "id": "scroll_magic_lands_parchment",
    "name": "Pergaminho das Terras Magicas",
    "kind": "scroll",
    "imageUrl": "/assets/items/misc/magic-lands-parchment.png",
    "minLevel": 4,
    "price": 44,
    "stats": {},
    "description": "Pergaminho usado em receitas e efeitos especiais."
  },
  "misc_maginia": {
    "id": "misc_maginia",
    "name": "Maginia",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/maginia.png",
    "minLevel": 4,
    "price": 44,
    "stats": {},
    "description": "Item variado usado em receitas, chaves e eventos."
  },
  "misc_misc_phial": {
    "id": "misc_misc_phial",
    "name": "Frasco Variado",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/misc_phial.png",
    "minLevel": 4,
    "price": 44,
    "stats": {},
    "description": "Item variado usado em receitas, chaves e eventos."
  },
  "misc_ressu": {
    "id": "misc_ressu",
    "name": "Ressu",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/ressu.png",
    "minLevel": 5,
    "price": 52,
    "stats": {},
    "description": "Item variado usado em receitas, chaves e eventos."
  },
  "misc_seed_bitter": {
    "id": "misc_seed_bitter",
    "name": "Semente Amarga",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/seed_bitter.png",
    "minLevel": 5,
    "price": 52,
    "stats": {},
    "description": "Item variado usado em receitas, chaves e eventos."
  },
  "misc_seed_moss": {
    "id": "misc_seed_moss",
    "name": "Semente de Musgo",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/seed_moss.png",
    "minLevel": 5,
    "price": 52,
    "stats": {},
    "description": "Item variado usado em receitas, chaves e eventos."
  },
  "misc_seed_mycelium_fungus": {
    "id": "misc_seed_mycelium_fungus",
    "name": "Semente de Fungo Micelial",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/seed_mycelium_fungus.png",
    "minLevel": 5,
    "price": 52,
    "stats": {},
    "description": "Item variado usado em receitas, chaves e eventos."
  },
  "misc_seed_rustic": {
    "id": "misc_seed_rustic",
    "name": "Semente Rustica",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/seed_rustic.png",
    "minLevel": 5,
    "price": 52,
    "stats": {},
    "description": "Item variado usado em receitas, chaves e eventos."
  },
  "misc_serlen": {
    "id": "misc_serlen",
    "name": "Serlen",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/serlen.png",
    "minLevel": 6,
    "price": 60,
    "stats": {},
    "description": "Item variado usado em receitas, chaves e eventos."
  },
  "misc_stone_craft": {
    "id": "misc_stone_craft",
    "name": "Pedra de Criacao",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/stone-craft.png",
    "minLevel": 6,
    "price": 60,
    "stats": {},
    "description": "Item variado usado em receitas, chaves e eventos."
  },
  "potion_energy": {
    "id": "potion_energy",
    "name": "Pocao de Energia",
    "kind": "potion",
    "imageUrl": "/assets/items/potions/energy.png",
    "minLevel": 1,
    "price": 24,
    "stats": {
      "energyPercent": 0.3
    },
    "description": "Recupera 30% da energia maxima"
  },
  "potion_health": {
    "id": "potion_health",
    "name": "Pocao de Vida",
    "kind": "potion",
    "imageUrl": "/assets/items/potions/health.png",
    "minLevel": 1,
    "price": 18,
    "stats": {
      "healPercent": 0.3
    },
    "description": "Recupera 30% da vida maxima"
  },
  "potion_mana": {
    "id": "potion_mana",
    "name": "Pocao de Mana",
    "kind": "potion",
    "imageUrl": "/assets/items/potions/mana.png",
    "minLevel": 1,
    "price": 20,
    "stats": {
      "energyPercent": 0.2
    },
    "description": "Recupera 20% da energia maxima"
  },
  "weapon_assassin_sword": {
    "id": "weapon_assassin_sword",
    "name": "Espada do Assassino",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/assassin_sword.png",
    "minLevel": 1,
    "price": 105,
    "stats": {
      "strength": 7,
      "agility": 1
    },
    "description": "+7 FOR, +1 AGI",
    "rarity": "common"
  },
  "weapon_chaos_axe": {
    "id": "weapon_chaos_axe",
    "name": "Machado do Caos",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/chaos_axe.png",
    "minLevel": 3,
    "price": 195,
    "stats": {
      "strength": 13
    },
    "description": "+13 FOR",
    "rarity": "common"
  },
  "weapon_claymore_3": {
    "id": "weapon_claymore_3",
    "name": "Montante 3",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/claymore_3.png",
    "minLevel": 5,
    "price": 285,
    "stats": {
      "strength": 19
    },
    "description": "+19 FOR",
    "rarity": "common"
  },
  "weapon_claymore": {
    "id": "weapon_claymore",
    "name": "Montante",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/claymore.png",
    "minLevel": 7,
    "price": 375,
    "stats": {
      "strength": 25
    },
    "description": "+25 FOR",
    "rarity": "uncommon"
  },
  "weapon_double_sword_2": {
    "id": "weapon_double_sword_2",
    "name": "Espada Dupla 2",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/double_sword_2.png",
    "minLevel": 9,
    "price": 465,
    "stats": {
      "strength": 31,
      "agility": 3
    },
    "description": "+31 FOR, +3 AGI",
    "rarity": "uncommon"
  },
  "weapon_double_sword_new": {
    "id": "weapon_double_sword_new",
    "name": "Espada Dupla Nova",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/double_sword_new.png",
    "minLevel": 11,
    "price": 555,
    "stats": {
      "strength": 37,
      "agility": 3
    },
    "description": "+37 FOR, +3 AGI",
    "rarity": "uncommon"
  },
  "weapon_executioner_axe_6": {
    "id": "weapon_executioner_axe_6",
    "name": "Machado do Executor 6",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/executioner_axe_6.png",
    "minLevel": 13,
    "price": 645,
    "stats": {
      "strength": 43
    },
    "description": "+43 FOR",
    "rarity": "uncommon"
  },
  "weapon_executioner_axe": {
    "id": "weapon_executioner_axe",
    "name": "Machado do Executor",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/executioner_axe.png",
    "minLevel": 15,
    "price": 735,
    "stats": {
      "strength": 49
    },
    "description": "+49 FOR",
    "rarity": "rare"
  },
  "weapon_extreme_axe": {
    "id": "weapon_extreme_axe",
    "name": "Machado Extremo",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/extreme_axe.png",
    "minLevel": 17,
    "price": 825,
    "stats": {
      "strength": 55
    },
    "description": "+55 FOR",
    "rarity": "rare"
  },
  "weapon_greatsword_2": {
    "id": "weapon_greatsword_2",
    "name": "Espadao 2",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/greatsword_2.png",
    "minLevel": 19,
    "price": 915,
    "stats": {
      "strength": 61
    },
    "description": "+61 FOR",
    "rarity": "rare"
  },
  "weapon_greatsword_4": {
    "id": "weapon_greatsword_4",
    "name": "Espadao 4",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/greatsword_4.png",
    "minLevel": 21,
    "price": 1005,
    "stats": {
      "strength": 67
    },
    "description": "+67 FOR",
    "rarity": "rare"
  },
  "weapon_insane_axe": {
    "id": "weapon_insane_axe",
    "name": "Machado Insano",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/insane_axe.png",
    "minLevel": 23,
    "price": 1095,
    "stats": {
      "strength": 73
    },
    "description": "+73 FOR",
    "rarity": "rare"
  },
  "weapon_long_sword": {
    "id": "weapon_long_sword",
    "name": "Espada Longa",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/long_sword.png",
    "minLevel": 25,
    "price": 1185,
    "stats": {
      "strength": 79
    },
    "description": "+79 FOR",
    "rarity": "rare"
  },
  "weapon_obs_axe": {
    "id": "weapon_obs_axe",
    "name": "Machado Obscuro",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/obs_axe.png",
    "minLevel": 27,
    "price": 1275,
    "stats": {
      "strength": 85
    },
    "description": "+85 FOR",
    "rarity": "epic"
  },
  "weapon_orcish_dagger": {
    "id": "weapon_orcish_dagger",
    "name": "Adaga Orc",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/orcish_dagger.png",
    "minLevel": 29,
    "price": 1365,
    "stats": {
      "strength": 91,
      "agility": 9
    },
    "description": "+91 FOR, +9 AGI",
    "rarity": "epic"
  },
  "weapon_real_axe": {
    "id": "weapon_real_axe",
    "name": "Machado Real",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/real_axe.png",
    "minLevel": 31,
    "price": 1455,
    "stats": {
      "strength": 97
    },
    "description": "+97 FOR",
    "rarity": "epic"
  },
  "weapon_triple_sword_2": {
    "id": "weapon_triple_sword_2",
    "name": "Espada Tripla 2",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/triple_sword_2.png",
    "minLevel": 33,
    "price": 1545,
    "stats": {
      "strength": 103,
      "agility": 11
    },
    "description": "+103 FOR, +11 AGI",
    "rarity": "epic"
  },
  "weapon_triple_sword_3": {
    "id": "weapon_triple_sword_3",
    "name": "Espada Tripla 3",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/triple_sword_3.png",
    "minLevel": 35,
    "price": 1635,
    "stats": {
      "strength": 109,
      "agility": 11
    },
    "description": "+109 FOR, +11 AGI",
    "rarity": "epic"
  },
  "weapon_vorgonax": {
    "id": "weapon_vorgonax",
    "name": "Vorgonax",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/vorgonax.png",
    "minLevel": 37,
    "price": 1725,
    "stats": {
      "strength": 115
    },
    "description": "+115 FOR",
    "rarity": "epic"
  },
  "training_sword": {
    "id": "training_sword",
    "name": "Espada de Treino",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/long_sword.png",
    "minLevel": 1,
    "price": 30,
    "stats": {
      "strength": 2
    },
    "description": "+2 FOR"
  },
  "iron_sword": {
    "id": "iron_sword",
    "name": "Espada de Ferro",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/claymore.png",
    "minLevel": 2,
    "price": 90,
    "stats": {
      "strength": 6
    },
    "description": "+6 FOR"
  },
  "leather_armor": {
    "id": "leather_armor",
    "name": "Armadura de Couro",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/00-leather.png",
    "minLevel": 1,
    "price": 45,
    "stats": {
      "defense": 2,
      "constitution": 1
    },
    "description": "+2 DEF, +1 CON"
  },
  "iron_armor": {
    "id": "iron_armor",
    "name": "Armadura de Ferro",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/01-steel.png",
    "minLevel": 3,
    "price": 110,
    "stats": {
      "defense": 6
    },
    "description": "+6 DEF"
  },
  "novice_amulet": {
    "id": "novice_amulet",
    "name": "Amuleto do Aprendiz",
    "kind": "amulet",
    "slot": "amulet",
    "imageUrl": "/assets/items/misc/dragon_stone.png",
    "minLevel": 1,
    "price": 70,
    "stats": {
      "agility": 2,
      "constitution": 1
    },
    "description": "+2 AGI, +1 CON"
  },
  "hunter_charm": {
    "id": "hunter_charm",
    "name": "Talisma do Cacador",
    "kind": "amulet",
    "slot": "amulet",
    "imageUrl": "/assets/items/misc/kaede_stone.png",
    "minLevel": 4,
    "price": 160,
    "stats": {
      "agility": 5,
      "strength": 2
    },
    "description": "+5 AGI, +2 FOR"
  },
  "ember_blade": {
    "id": "ember_blade",
    "name": "Lamina de Brasa",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/chaos_axe.png",
    "minLevel": 6,
    "price": 360,
    "stats": {
      "strength": 15,
      "agility": 3
    },
    "description": "+15 FOR, +3 AGI"
  },
  "guardian_mail": {
    "id": "guardian_mail",
    "name": "Cota do Guardiao",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/05-justice.png",
    "minLevel": 6,
    "price": 330,
    "stats": {
      "defense": 14,
      "constitution": 4
    },
    "description": "+14 DEF, +4 CON"
  },
  "moon_amulet": {
    "id": "moon_amulet",
    "name": "Amuleto Lunar",
    "kind": "amulet",
    "slot": "amulet",
    "imageUrl": "/assets/items/misc/dragon_stone.png",
    "minLevel": 8,
    "price": 420,
    "stats": {
      "agility": 8,
      "constitution": 3,
      "strength": 3
    },
    "description": "+8 AGI, +3 CON, +3 FOR"
  },
  "health_potion": {
    "id": "health_potion",
    "name": "Pocao de Vida",
    "kind": "potion",
    "imageUrl": "/assets/items/potions/health.png",
    "minLevel": 1,
    "price": 18,
    "stats": {
      "healPercent": 0.3
    },
    "description": "Recupera 30% da vida maxima"
  },
  "energy_potion": {
    "id": "energy_potion",
    "name": "Pocao de Energia",
    "kind": "potion",
    "imageUrl": "/assets/items/potions/energy.png",
    "minLevel": 1,
    "price": 24,
    "stats": {
      "energyPercent": 0.3
    },
    "description": "Recupera 30% da energia maxima"
  },
  "major_health_potion": {
    "id": "major_health_potion",
    "name": "Pocao Vital Rara",
    "kind": "potion",
    "imageUrl": "/assets/items/potions/health.png",
    "minLevel": 5,
    "price": 95,
    "stats": {
      "healPercent": 0.55
    },
    "description": "Recupera 55% da vida maxima"
  },
  "major_energy_potion": {
    "id": "major_energy_potion",
    "name": "Pocao Energetica Rara",
    "kind": "potion",
    "imageUrl": "/assets/items/potions/energy.png",
    "minLevel": 5,
    "price": 110,
    "stats": {
      "energyPercent": 0.55
    },
    "description": "Recupera 55% da energia maxima"
  },
  "oblivion_scroll": {
    "id": "oblivion_scroll",
    "name": "Pergaminho do Esquecimento",
    "kind": "scroll",
    "imageUrl": "/assets/items/misc/enhanced-parchment.png",
    "minLevel": 1,
    "price": 180,
    "stats": {},
    "description": "Reseta talentos sem gastar diamantes"
  },
  "memory_scroll": {
    "id": "memory_scroll",
    "name": "Pergaminho da Memoria",
    "kind": "scroll",
    "imageUrl": "/assets/items/misc/fraddo-parchment.png",
    "minLevel": 1,
    "price": 180,
    "stats": {},
    "description": "Reseta atributos sem gastar diamantes"
  },
  "wolf_pelt": {
    "id": "wolf_pelt",
    "name": "Pele de Lobo",
    "kind": "material",
    "imageUrl": "/assets/items/materials/bone.png",
    "minLevel": 1,
    "price": 18,
    "stats": {},
    "description": "Material comum de caca"
  },
  "ember_core": {
    "id": "ember_core",
    "name": "Nucleo de Brasa",
    "kind": "material",
    "imageUrl": "/assets/items/materials/dark_residue.png",
    "minLevel": 4,
    "price": 55,
    "stats": {},
    "description": "Material raro e quente ao toque"
  },
  "crystal_dust": {
    "id": "crystal_dust",
    "name": "Po de Cristal",
    "kind": "material",
    "imageUrl": "/assets/items/materials/magic_essence.png",
    "minLevel": 3,
    "price": 38,
    "stats": {},
    "description": "Catalisador usado por alquimistas"
  },
  "wyvern_scale": {
    "id": "wyvern_scale",
    "name": "Escama de Serpe",
    "kind": "material",
    "imageUrl": "/assets/items/materials/dragon_nail.png",
    "minLevel": 7,
    "price": 82,
    "stats": {},
    "description": "Material resistente e raro"
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
  {
    id: "friend_of_king",
    name: "Amigo do Rei",
    diamonds: 200,
    priceLabel: "R$ 49,90",
    bonusLabel: "100 tickets de trem, 30 tickets de navio, auto PvE e selo real por 30 dias",
    description: "Pacote especial com diamantes, tickets e privilegios reais temporarios.",
    featured: true
  },
  { id: "diamonds_30", name: "Bolsa pequena", diamonds: 30, priceLabel: "R$ 4,90" },
  { id: "diamonds_80", name: "Bolsa aventureira", diamonds: 80, priceLabel: "R$ 9,90", bonusLabel: "+10 bônus" },
  { id: "diamonds_180", name: "Cofre reluzente", diamonds: 180, priceLabel: "R$ 19,90", bonusLabel: "+40 bônus" },
  { id: "diamonds_420", name: "Tesouro arcano", diamonds: 420, priceLabel: "R$ 39,90", bonusLabel: "+120 bônus" }
];

export const CLAN_BENEFITS: ClanBenefitDefinition[] = [
  { id: "clan_damage_1", category: "combat", name: "Estandarte de guerra", description: "+1% dano por rank", maxRank: 5, costPerRank: { gold: 40000, diamonds: 10 } },
  { id: "clan_crit_1", category: "combat", name: "Juramento preciso", description: "+0,5% crítico por rank", maxRank: 5, costPerRank: { gold: 65000, diamonds: 20 }, requires: "clan_damage_1" },
  { id: "clan_damage_2", category: "combat", name: "Chamado ofensivo", description: "+1,5% dano por rank", maxRank: 4, costPerRank: { gold: 95000, diamonds: 40 }, requires: "clan_crit_1" },
  { id: "clan_vitality_1", category: "defense", name: "Abrigo comum", description: "+2% vida por rank", maxRank: 5, costPerRank: { gold: 42000, diamonds: 10 } },
  { id: "clan_guard_1", category: "defense", name: "Muralha do clã", description: "+1 defesa por rank", maxRank: 5, costPerRank: { gold: 64000, diamonds: 20 }, requires: "clan_vitality_1" },
  { id: "clan_dodge_1", category: "defense", name: "Treino coordenado", description: "+0,5% esquiva por rank", maxRank: 4, costPerRank: { gold: 90000, diamonds: 40 }, requires: "clan_guard_1" },
  { id: "clan_xp_1", category: "prosperity", name: "Biblioteca do clã", description: "+2% XP por rank", maxRank: 5, costPerRank: { gold: 50000, diamonds: 10 } },
  { id: "clan_gold_1", category: "prosperity", name: "Tesouraria comum", description: "+2% gold por rank", maxRank: 5, costPerRank: { gold: 70000, diamonds: 20 }, requires: "clan_xp_1" },
  { id: "clan_drop_1", category: "prosperity", name: "Partilha de espólios", description: "+1,5% drop por rank", maxRank: 4, costPerRank: { gold: 98000, diamonds: 40 }, requires: "clan_gold_1" },
  { id: "clan_energy_1", category: "prosperity", name: "Rotas seguras", description: "+1 energia por rank", maxRank: 3, costPerRank: { gold: 120000, diamonds: 60 }, requires: "clan_drop_1", icon: "energy" },
  { id: "clan_members_1", category: "prosperity", name: "Alojamentos", description: "+2 membros no limite do cla por rank", maxRank: 15, costPerRank: { gold: 145000, diamonds: 70 }, requires: "clan_energy_1", icon: "members" },
  { id: "clan_inventory_1", category: "prosperity", name: "Deposito compartilhado", description: "+2 espacos de inventario para cada membro por rank", maxRank: 10, costPerRank: { gold: 170000, diamonds: 80 }, requires: "clan_members_1", icon: "inventory" },
  { id: "clan_xp_2", category: "prosperity", name: "Mapas de campanha", description: "+2% XP por rank", maxRank: 4, costPerRank: { gold: 210000, diamonds: 100 }, requires: "clan_inventory_1", icon: "xp" },
  { id: "clan_gold_2", category: "prosperity", name: "Contratos mercantes", description: "+1,5% gold por rank", maxRank: 4, costPerRank: { gold: 250000, diamonds: 120 }, requires: "clan_xp_2", icon: "gold" },
  { id: "clan_drop_2", category: "prosperity", name: "Batedores de tesouro", description: "+1% drop por rank", maxRank: 4, costPerRank: { gold: 300000, diamonds: 140 }, requires: "clan_gold_2", icon: "drop" },
  { id: "clan_members_2", category: "prosperity", name: "Casas anexas", description: "+3 membros no limite do cla por rank", maxRank: 10, costPerRank: { gold: 360000, diamonds: 160 }, requires: "clan_drop_2", icon: "members" },
  { id: "clan_inventory_2", category: "prosperity", name: "Armazem maior", description: "+3 espacos de inventario para cada membro por rank", maxRank: 5, costPerRank: { gold: 430000, diamonds: 180 }, requires: "clan_members_2", icon: "inventory" },
  { id: "clan_energy_2", category: "prosperity", name: "Logistica superior", description: "+1 energia por rank", maxRank: 3, costPerRank: { gold: 520000, diamonds: 220 }, requires: "clan_inventory_2", icon: "energy" },
  { id: "clan_members_3", category: "prosperity", name: "Distrito do cla", description: "+5 membros no limite do cla por rank", maxRank: 4, costPerRank: { gold: 650000, diamonds: 280 }, requires: "clan_energy_2", icon: "members" },
  { id: "clan_inventory_3", category: "prosperity", name: "Cofres expedicionarios", description: "+5 espacos de inventario para cada membro por rank", maxRank: 4, costPerRank: { gold: 780000, diamonds: 340 }, requires: "clan_members_3", icon: "inventory" },
  { id: "clan_damage_3", category: "combat", name: "Ordem de ataque", description: "+1% dano por rank", maxRank: 5, costPerRank: { gold: 190000, diamonds: 80 }, requires: "clan_damage_2", icon: "damage" },
  { id: "clan_crit_2", category: "combat", name: "Tatica de flanco", description: "+0,5% critico por rank", maxRank: 4, costPerRank: { gold: 220000, diamonds: 10 }, requires: "clan_damage_3", icon: "crit" },
  { id: "clan_damage_4", category: "combat", name: "Legiao ofensiva", description: "+1,5% dano por rank", maxRank: 3, costPerRank: { gold: 320000, diamonds: 14 }, requires: "clan_crit_2", icon: "damage" },
  { id: "clan_guard_2", category: "defense", name: "Escudos jurados", description: "+1 defesa por rank", maxRank: 5, costPerRank: { gold: 155000, diamonds: 6 }, requires: "clan_dodge_1", icon: "defense" },
  { id: "clan_vitality_2", category: "defense", name: "Enfermaria do cla", description: "+1,5% vida por rank", maxRank: 5, costPerRank: { gold: 190000, diamonds: 8 }, requires: "clan_guard_2", icon: "life" },
  { id: "clan_dodge_2", category: "defense", name: "Passos de patrulha", description: "+0,5% esquiva por rank", maxRank: 4, costPerRank: { gold: 260000, diamonds: 12 }, requires: "clan_vitality_2", icon: "dodge" }
];

export const CLAN_SUPER_BENEFITS: ClanSuperBenefitDefinition[] = [
  {
    id: "super_combat",
    category: "combat",
    name: "Mandato de Guerra",
    description: "Ativo com todos os ranks de Combate: +10% dano, +3% critico e +20% dano critico.",
    icon: "damage"
  },
  {
    id: "super_defense",
    category: "defense",
    name: "Baluarte do Reino",
    description: "Ativo com todos os ranks de Defesa: +10% vida, +5 defesa e +3% esquiva.",
    icon: "defense"
  },
  {
    id: "super_prosperity",
    category: "prosperity",
    name: "Guilda Real",
    description: "Ativo com todos os ranks de Prosperidade: +10% XP, +10% gold, +5% drop, +5 energia, +10 inventario e +10 membros no cla.",
    icon: "gold"
  }
];

export const COUNTRIES: CountryDefinition[] = [
  {
    id: "aurevia",
    name: "Aurevia",
    description: "Reino de estradas antigas, fortalezas de pedra e bosques seguros.",
    portCityId: "eldoria"
  },
  {
    id: "valfria",
    name: "Valfria",
    description: "Pais frio de montanhas, ruinas espectrais e vilas isoladas.",
    portCityId: "vila_de_valfria"
  }
];

export const CITIES: CityDefinition[] = [
  {
    "id": "eldoria",
    "countryId": "aurevia",
    "name": "Eldoria",
    "minLevel": 1,
    "travelCost": 0,
    "description": "Cidade principal, cercada por bosques antigos e estradas seguras.",
    "isPort": true,
    "inhabitants": [
      "Borin Martelo-Firme",
      "Mira Folha-Clara",
      "Nara Alambique",
      "Tomas Mar-Alto"
    ],
    "npcs": {
      "armorer": "Borin Martelo-Firme",
      "apothecary": "Mira Folha-Clara",
      "alchemist": "Nara Alambique",
      "moneyChanger": "Tomas Mar-Alto"
    },
    "alchemistRecipeIds": [
      "brew_major_health"
    ],
    "huntLocationIds": [
      "eldoria_training_fields",
      "eldoria_old_woods",
      "eldoria_sunken_ruins"
    ],
    "huntMonsterIds": [
      "training_dummy",
      "forest_rat",
      "gray_wolf",
      "aberr",
      "anaconda_new",
      "anubis_guard",
      "black_mamba_new",
      "brown_ooze",
      "centaur_demon",
      "clay_golem",
      "cursed_goblin",
      "damnation_cyclops",
      "damnation_elemental"
    ],
    "armorerItemIds": [
      "armor_leather",
      "armor_steel",
      "weapon_assassin_sword",
      "weapon_chaos_axe",
      "weapon_claymore_3",
      "training_sword",
      "iron_sword",
      "leather_armor",
      "iron_armor",
      "novice_amulet",
      "hunter_charm",
      "ember_blade",
      "guardian_mail"
    ],
    "apothecaryItemIds": [
      "misc_doemia",
      "misc_dragon_stone",
      "misc_dungeon_key",
      "scroll_enhanced_parchment",
      "misc_eran",
      "misc_erins_chest_1",
      "misc_erins_chest_2",
      "misc_erins_chest_3",
      "misc_erins_chest",
      "scroll_fraddo_parchment",
      "potion_energy",
      "potion_health",
      "potion_mana",
      "health_potion",
      "energy_potion",
      "oblivion_scroll",
      "memory_scroll"
    ],
    "moneyChangerItemIds": [
      "ticket_train",
      "ticket_ship",
      "scroll_enhanced_parchment",
      "scroll_fraddo_parchment",
      "oblivion_scroll",
      "memory_scroll"
    ]
  },
  {
    "id": "ravenspire",
    "countryId": "aurevia",
    "name": "Ravenspire",
    "minLevel": 3,
    "travelCost": 45,
    "description": "Torres de pedra vigiam trilhas tomadas por saqueadores.",
    "inhabitants": [
      "Garrik Aco-Negro",
      "Selene Vidro-Rubro",
      "Doran Bigorna",
      "Capita Havel"
    ],
    "npcs": {
      "armorer": "Garrik Aco-Negro",
      "apothecary": "Selene Vidro-Rubro",
      "blacksmith": "Doran Bigorna",
      "alchemist": "Selene Vidro-Rubro"
    },
    "dungeonMonsterIds": [
      "road_bandit",
      "thorn_boar",
      "damnation_golem",
      "damnation_orc",
      "damnation_spider",
      "deep_dwarf",
      "demon_dragon",
      "desert_giant"
    ],
    "blacksmithRecipeIds": [
      "forge_ember_blade"
    ],
    "alchemistRecipeIds": [
      "brew_major_health",
      "brew_major_energy"
    ],
    "huntLocationIds": [
      "ravenspire_bandit_road",
      "ravenspire_damned_lands",
      "ravenspire_desert_pass"
    ],
    "huntMonsterIds": [
      "road_bandit",
      "thorn_boar",
      "damnation_golem",
      "damnation_harpy",
      "damnation_mummy",
      "damnation_orc",
      "damnation_scorpion",
      "damnation_snake",
      "damnation_spider",
      "damnation_troll",
      "deathcap",
      "deep_dwarf",
      "demon_bareon",
      "demon_desert_giant",
      "demon_dragon",
      "demoniac_elephant",
      "demoniac_wolf",
      "desert_giant",
      "desert_walker",
      "desert_worm"
    ],
    "armorerItemIds": [
      "armor_steel",
      "armor_mystic",
      "armor_kharlee",
      "weapon_chaos_axe",
      "weapon_claymore_3",
      "weapon_claymore",
      "weapon_double_sword_2",
      "weapon_double_sword_new",
      "weapon_executioner_axe_6",
      "iron_armor",
      "hunter_charm",
      "ember_blade",
      "guardian_mail",
      "moon_amulet"
    ],
    "apothecaryItemIds": [
      "misc_doemia",
      "misc_dragon_stone",
      "misc_dungeon_key",
      "scroll_enhanced_parchment",
      "misc_eran",
      "misc_erins_chest_1",
      "misc_erins_chest_2",
      "misc_erins_chest_3",
      "misc_erins_chest",
      "scroll_fraddo_parchment",
      "misc_herb_bitter",
      "misc_herb_moss",
      "misc_herb_rustic",
      "misc_high_dungeon_key",
      "misc_hozir_box",
      "misc_kaede_stone",
      "misc_laede",
      "scroll_magic_lands_parchment",
      "misc_maginia",
      "misc_misc_phial",
      "potion_energy",
      "potion_health",
      "potion_mana",
      "health_potion",
      "energy_potion",
      "oblivion_scroll",
      "memory_scroll"
    ]
  },
  {
    "id": "ironhold",
    "countryId": "aurevia",
    "name": "Ironhold",
    "minLevel": 7,
    "travelCost": 130,
    "description": "Uma fortaleza nas montanhas onde o ar pesa como metal.",
    "inhabitants": [
      "Helga Forja-Alta",
      "Orin Cinza-Viva",
      "Mestre Rurik",
      "Vigia Mael"
    ],
    "npcs": {
      "armorer": "Helga Forja-Alta",
      "apothecary": "Orin Cinza-Viva",
      "blacksmith": "Helga Forja-Alta",
      "alchemist": "Orin Cinza-Viva"
    },
    "dungeonMonsterIds": [
      "ember_golem",
      "cave_wyvern",
      "dorrene_orc",
      "emperor_scorpion",
      "giant_gecko",
      "giant_spore",
      "grey_bear",
      "hell_lizard",
      "hill_giant_new",
      "jelly",
      "joree_walker",
      "ogre_mage"
    ],
    "blacksmithRecipeIds": [
      "forge_ember_blade",
      "forge_guardian_mail"
    ],
    "blacksmithEnhancement": true,
    "alchemistRecipeIds": [
      "brew_major_health",
      "brew_major_energy",
      "bind_moon_amulet"
    ],
    "huntLocationIds": [
      "ironhold_ember_mines",
      "ironhold_beast_caves",
      "ironhold_giant_valley"
    ],
    "huntMonsterIds": [
      "ember_golem",
      "cave_wyvern",
      "dorrene_orc",
      "dorrene_snake",
      "easter_bunny",
      "emperor_scorpion",
      "eye_of_devastation_new",
      "giant_ant",
      "giant_gecko",
      "giant_leech",
      "giant_scorpion",
      "giant_spore",
      "giant_toad",
      "grey_rat",
      "grey_bear",
      "grey_wolf",
      "guardian_serpent",
      "hell_lizard",
      "hell_salamander",
      "hell_worm",
      "hill_giant_new",
      "human_bandit",
      "infernal_serpent",
      "jelly",
      "joree_giant",
      "joree_plant",
      "joree_walker",
      "labrat_unseen",
      "mummy",
      "ogre_mage",
      "ogre",
      "orc_knight"
    ],
    "armorerItemIds": [
      "armor_mystic",
      "armor_kharlee",
      "armor_cursed",
      "armor_justice",
      "armor_obscure",
      "weapon_claymore",
      "weapon_double_sword_2",
      "weapon_double_sword_new",
      "weapon_executioner_axe_6",
      "weapon_executioner_axe",
      "weapon_extreme_axe",
      "weapon_greatsword_2",
      "weapon_greatsword_4",
      "weapon_insane_axe",
      "weapon_long_sword",
      "weapon_obs_axe",
      "moon_amulet"
    ],
    "apothecaryItemIds": [
      "misc_doemia",
      "misc_dragon_stone",
      "misc_dungeon_key",
      "scroll_enhanced_parchment",
      "misc_eran",
      "misc_erins_chest_1",
      "misc_erins_chest_2",
      "misc_erins_chest_3",
      "misc_erins_chest",
      "scroll_fraddo_parchment",
      "misc_herb_bitter",
      "misc_herb_moss",
      "misc_herb_rustic",
      "misc_high_dungeon_key",
      "misc_hozir_box",
      "misc_kaede_stone",
      "misc_laede",
      "scroll_magic_lands_parchment",
      "misc_maginia",
      "misc_misc_phial",
      "misc_ressu",
      "misc_seed_bitter",
      "misc_seed_moss",
      "misc_seed_mycelium_fungus",
      "misc_seed_rustic",
      "misc_serlen",
      "misc_stone_craft",
      "material_old_stone",
      "material_eran_fragment",
      "material_celena",
      "material_midran",
      "potion_energy",
      "potion_health",
      "potion_mana",
      "health_potion",
      "energy_potion",
      "major_health_potion",
      "major_energy_potion",
      "oblivion_scroll",
      "memory_scroll"
    ]
  },
  {
    "id": "vila_de_valfria",
    "countryId": "valfria",
    "name": "Vila de Valfria",
    "minLevel": 15,
    "travelCost": 130,
    "description": "Uma vila pitoresca nas montanhas, conhecida por suas tradicoes antigas.",
    "isPort": true,
    "inhabitants": [
      "Helga Forja-Alta",
      "Orin Cinza-Viva",
      "Lia Trilho-Norte",
      "Caio Cartas"
    ],
    "npcs": {
      "armorer": "Helga Forja-Alta",
      "apothecary": "Orin Cinza-Viva",
      "blacksmith": "Helga Forja-Alta",
      "alchemist": "Orin Cinza-Viva",
      "moneyChanger": "Caio Cartas"
    },
    "dungeonMonsterIds": [
      "orc_warrior",
      "redback_new",
      "salamander",
      "skeleton_bat",
      "skeleton_naga",
      "skeleton_snake",
      "spectral_bat_old",
      "spectral_dragon_old",
      "spectral_naga_old",
      "spectral_spider_old",
      "two_headed_ogre",
      "wolf_spider_old",
      "zombie_drake",
      "zombie_kraken_head"
    ],
    "blacksmithRecipeIds": [
      "forge_ember_blade",
      "forge_guardian_mail"
    ],
    "blacksmithEnhancement": true,
    "alchemistRecipeIds": [
      "brew_major_health",
      "brew_major_energy",
      "bind_moon_amulet"
    ],
    "huntLocationIds": [
      "valfria_orc_marsh",
      "valfria_bone_fields",
      "valfria_spectral_mire"
    ],
    "huntMonsterIds": [
      "orc_warrior",
      "orc",
      "pulsating_lump",
      "redback_new",
      "rock_troll",
      "salamander_firebrand",
      "salamander",
      "sand_elemental",
      "sand_spider",
      "skeleton_bat",
      "skeleton_centaur",
      "skeleton_dragon",
      "skeleton_naga",
      "skeleton_quadruped_large_new",
      "skeleton_quadruped_small",
      "skeleton_snake",
      "skeleton_ugly_thing",
      "spectral_ant_old",
      "spectral_bat_old",
      "spectral_bee_old",
      "spectral_centaur_old",
      "spectral_dragon_old",
      "spectral_fish_old",
      "spectral_hydra_3_old",
      "spectral_naga_old",
      "spectral_quadruped_small_old",
      "spectral_snake_old",
      "spectral_spider_old",
      "spectral_thing",
      "spectral_worm",
      "two_headed_ogre",
      "viper",
      "wolf_spider_new",
      "wolf_spider_old",
      "zombie_crab",
      "zombie_drake_infected",
      "zombie_drake",
      "zombie_hound_infected",
      "zombie_hound",
      "zombie_kraken_head"
    ],
    "armorerItemIds": [
      "armor_cursed",
      "armor_justice",
      "armor_obscure",
      "armor_death",
      "armor_dragon",
      "armor_dhron",
      "weapon_executioner_axe",
      "weapon_extreme_axe",
      "weapon_greatsword_2",
      "weapon_greatsword_4",
      "weapon_insane_axe",
      "weapon_long_sword",
      "weapon_obs_axe",
      "weapon_orcish_dagger",
      "weapon_real_axe",
      "weapon_triple_sword_2",
      "weapon_triple_sword_3",
      "weapon_vorgonax"
    ],
    "apothecaryItemIds": [
      "misc_doemia",
      "misc_dragon_stone",
      "misc_dungeon_key",
      "scroll_enhanced_parchment",
      "misc_eran",
      "misc_erins_chest_1",
      "misc_erins_chest_2",
      "misc_erins_chest_3",
      "misc_erins_chest",
      "scroll_fraddo_parchment",
      "misc_herb_bitter",
      "misc_herb_moss",
      "misc_herb_rustic",
      "misc_high_dungeon_key",
      "misc_hozir_box",
      "misc_kaede_stone",
      "misc_laede",
      "scroll_magic_lands_parchment",
      "misc_maginia",
      "misc_misc_phial",
      "misc_ressu",
      "misc_seed_bitter",
      "misc_seed_moss",
      "misc_seed_mycelium_fungus",
      "misc_seed_rustic",
      "misc_serlen",
      "misc_stone_craft",
      "material_old_stone",
      "material_eran_fragment",
      "material_celena",
      "material_midran",
      "potion_energy",
      "potion_health",
      "potion_mana",
      "health_potion",
      "energy_potion",
      "major_health_potion",
      "major_energy_potion",
      "oblivion_scroll",
      "memory_scroll"
    ],
    "moneyChangerItemIds": [
      "ticket_train",
      "ticket_ship",
      "scroll_enhanced_parchment",
      "scroll_fraddo_parchment",
      "scroll_magic_lands_parchment",
      "oblivion_scroll",
      "memory_scroll"
    ]
  },
  {
    "id": "rosindale",
    "countryId": "valfria",
    "name": "Rosindale",
    "minLevel": 25,
    "travelCost": 130,
    "description": "Uma fortaleza nas montanhas onde o ar pesa como metal.",
    "inhabitants": [
      "Helga Forja-Alta",
      "Orin Cinza-Viva",
      "Sentinela Rosin",
      "Archivista Dalen"
    ],
    "npcs": {
      "armorer": "Helga Forja-Alta",
      "apothecary": "Orin Cinza-Viva",
      "blacksmith": "Helga Forja-Alta",
      "alchemist": "Orin Cinza-Viva"
    },
    "dungeonMonsterIds": [
      "zombie_kraken_infected",
      "zombie_lizard",
      "zombie_octopode",
      "zombie_ogre",
      "zombie_small",
      "zombie_turtle_infected",
      "zombie_ugly_thing_infected"
    ],
    "blacksmithRecipeIds": [
      "forge_ember_blade",
      "forge_guardian_mail"
    ],
    "blacksmithEnhancement": true,
    "alchemistRecipeIds": [
      "brew_major_health",
      "brew_major_energy",
      "bind_moon_amulet"
    ],
    "huntLocationIds": [
      "rosindale_infected_coast",
      "rosindale_zombie_quarter"
    ],
    "huntMonsterIds": [
      "zombie_kraken_infected",
      "zombie_lizard_infected",
      "zombie_lizard",
      "zombie_octopode_infected",
      "zombie_octopode",
      "zombie_ogre_infected",
      "zombie_ogre",
      "zombie_rat",
      "zombie_small",
      "zombie_toad",
      "zombie_turtle_infected",
      "zombie_turtle",
      "zombie_ugly_thing_infected",
      "zombie_ugly_thing"
    ],
    "armorerItemIds": [
      "armor_obscure",
      "armor_death",
      "armor_dragon",
      "armor_dhron",
      "armor_erins",
      "weapon_long_sword",
      "weapon_obs_axe",
      "weapon_orcish_dagger",
      "weapon_real_axe",
      "weapon_triple_sword_2",
      "weapon_triple_sword_3",
      "weapon_vorgonax"
    ],
    "apothecaryItemIds": [
      "misc_doemia",
      "misc_dragon_stone",
      "misc_dungeon_key",
      "scroll_enhanced_parchment",
      "misc_eran",
      "misc_erins_chest_1",
      "misc_erins_chest_2",
      "misc_erins_chest_3",
      "misc_erins_chest",
      "scroll_fraddo_parchment",
      "misc_herb_bitter",
      "misc_herb_moss",
      "misc_herb_rustic",
      "misc_high_dungeon_key",
      "misc_hozir_box",
      "misc_kaede_stone",
      "misc_laede",
      "scroll_magic_lands_parchment",
      "misc_maginia",
      "misc_misc_phial",
      "misc_ressu",
      "misc_seed_bitter",
      "misc_seed_moss",
      "misc_seed_mycelium_fungus",
      "misc_seed_rustic",
      "misc_serlen",
      "misc_stone_craft",
      "material_old_stone",
      "material_eran_fragment",
      "material_celena",
      "material_midran",
      "potion_energy",
      "potion_health",
      "potion_mana",
      "health_potion",
      "energy_potion",
      "major_health_potion",
      "major_energy_potion",
      "oblivion_scroll",
      "memory_scroll"
    ]
  }
];

export const HUNTING_LOCATIONS: Record<string, HuntingLocationDefinition> = {
  "eldoria_training_fields": {
    "id": "eldoria_training_fields",
    "cityId": "eldoria",
    "name": "Campos de Treino",
    "description": "Campos vigiados onde iniciantes enfrentam ameacas pequenas.",
    "monsterIds": [
      "training_dummy",
      "forest_rat",
      "gray_wolf"
    ]
  },
  "eldoria_old_woods": {
    "id": "eldoria_old_woods",
    "cityId": "eldoria",
    "name": "Bosque Antigo",
    "description": "Trilhas fechadas tomadas por criaturas venenosas e guardioes antigos.",
    "monsterIds": [
      "aberr",
      "anaconda_new",
      "anubis_guard",
      "black_mamba_new",
      "cursed_goblin"
    ]
  },
  "eldoria_sunken_ruins": {
    "id": "eldoria_sunken_ruins",
    "cityId": "eldoria",
    "name": "Ruinas Alagadas",
    "description": "Pedras afundadas e lama escura onde monstros mais perigosos se escondem.",
    "monsterIds": [
      "brown_ooze",
      "centaur_demon",
      "clay_golem",
      "damnation_cyclops",
      "damnation_elemental"
    ]
  },
  "ravenspire_bandit_road": {
    "id": "ravenspire_bandit_road",
    "cityId": "ravenspire",
    "name": "Estrada dos Saqueadores",
    "description": "Rotas estreitas patrulhadas por bandidos e bestas agressivas.",
    "monsterIds": [
      "road_bandit",
      "thorn_boar",
      "damnation_golem",
      "deathcap"
    ]
  },
  "ravenspire_damned_lands": {
    "id": "ravenspire_damned_lands",
    "cityId": "ravenspire",
    "name": "Terras Danadas",
    "description": "Planicies retorcidas por magia hostil.",
    "monsterIds": [
      "damnation_harpy",
      "damnation_mummy",
      "damnation_orc",
      "damnation_scorpion",
      "damnation_snake",
      "damnation_spider",
      "damnation_troll"
    ]
  },
  "ravenspire_desert_pass": {
    "id": "ravenspire_desert_pass",
    "cityId": "ravenspire",
    "name": "Passagem do Deserto",
    "description": "Um caminho seco onde gigantes e demonios rondam caravanas.",
    "monsterIds": [
      "deep_dwarf",
      "demon_bareon",
      "demon_desert_giant",
      "demon_dragon",
      "demoniac_elephant",
      "demoniac_wolf",
      "desert_giant",
      "desert_walker",
      "desert_worm"
    ]
  },
  "ironhold_ember_mines": {
    "id": "ironhold_ember_mines",
    "cityId": "ironhold",
    "name": "Minas de Brasa",
    "description": "Tuneis quentes guardados por criaturas de pedra e fogo.",
    "monsterIds": [
      "ember_golem",
      "cave_wyvern",
      "dorrene_orc",
      "dorrene_snake",
      "emperor_scorpion",
      "eye_of_devastation_new"
    ]
  },
  "ironhold_beast_caves": {
    "id": "ironhold_beast_caves",
    "cityId": "ironhold",
    "name": "Cavernas das Feras",
    "description": "Galerias profundas infestadas de insetos, lagartos e lobos.",
    "monsterIds": [
      "giant_ant",
      "giant_gecko",
      "giant_leech",
      "giant_scorpion",
      "giant_spore",
      "giant_toad",
      "grey_rat",
      "grey_bear",
      "grey_wolf",
      "guardian_serpent",
      "hell_lizard",
      "hell_salamander",
      "hell_worm"
    ]
  },
  "ironhold_giant_valley": {
    "id": "ironhold_giant_valley",
    "cityId": "ironhold",
    "name": "Vale dos Gigantes",
    "description": "Desfiladeiros onde ogros, gigantes e bandidos disputam territorio.",
    "monsterIds": [
      "hill_giant_new",
      "human_bandit",
      "infernal_serpent",
      "jelly",
      "joree_giant",
      "joree_plant",
      "joree_walker",
      "labrat_unseen",
      "mummy",
      "ogre_mage",
      "ogre",
      "orc_knight",
      "easter_bunny"
    ]
  },
  "valfria_orc_marsh": {
    "id": "valfria_orc_marsh",
    "cityId": "vila_de_valfria",
    "name": "Brejo dos Orcs",
    "description": "Charcos frios usados por orcs e aranhas como rota de emboscada.",
    "monsterIds": [
      "orc_warrior",
      "orc",
      "pulsating_lump",
      "redback_new",
      "rock_troll",
      "salamander_firebrand",
      "salamander",
      "sand_elemental",
      "sand_spider"
    ]
  },
  "valfria_bone_fields": {
    "id": "valfria_bone_fields",
    "cityId": "vila_de_valfria",
    "name": "Campos de Ossos",
    "description": "Um cemiterio aberto onde esqueletos patrulham a neve.",
    "monsterIds": [
      "skeleton_bat",
      "skeleton_centaur",
      "skeleton_dragon",
      "skeleton_naga",
      "skeleton_quadruped_large_new",
      "skeleton_quadruped_small",
      "skeleton_snake",
      "skeleton_ugly_thing"
    ]
  },
  "valfria_spectral_mire": {
    "id": "valfria_spectral_mire",
    "cityId": "vila_de_valfria",
    "name": "Pantano Espectral",
    "description": "Neblina luminosa cobre espectros, aranhas e mortos inquietos.",
    "monsterIds": [
      "spectral_ant_old",
      "spectral_bat_old",
      "spectral_bee_old",
      "spectral_centaur_old",
      "spectral_dragon_old",
      "spectral_fish_old",
      "spectral_hydra_3_old",
      "spectral_naga_old",
      "spectral_quadruped_small_old",
      "spectral_snake_old",
      "spectral_spider_old",
      "spectral_thing",
      "spectral_worm",
      "two_headed_ogre",
      "viper",
      "wolf_spider_new",
      "wolf_spider_old",
      "zombie_crab",
      "zombie_drake_infected",
      "zombie_drake",
      "zombie_hound_infected",
      "zombie_hound",
      "zombie_kraken_head"
    ]
  },
  "rosindale_infected_coast": {
    "id": "rosindale_infected_coast",
    "cityId": "rosindale",
    "name": "Costa Infectada",
    "description": "Rochedos umidos onde mortos do mar chegaram primeiro.",
    "monsterIds": [
      "zombie_kraken_infected",
      "zombie_lizard_infected",
      "zombie_lizard",
      "zombie_octopode_infected",
      "zombie_octopode",
      "zombie_turtle_infected",
      "zombie_turtle"
    ]
  },
  "rosindale_zombie_quarter": {
    "id": "rosindale_zombie_quarter",
    "cityId": "rosindale",
    "name": "Bairro dos Mortos",
    "description": "Ruas vazias ocupadas por mortos-vivos de varias formas.",
    "monsterIds": [
      "zombie_ogre_infected",
      "zombie_ogre",
      "zombie_rat",
      "zombie_small",
      "zombie_toad",
      "zombie_ugly_thing_infected",
      "zombie_ugly_thing"
    ]
  }
};

export const MONSTERS: Record<string, MonsterDefinition> = {
  "aberr": {
    "id": "aberr",
    "cityId": "eldoria",
    "name": "Aberracao",
    "imageUrl": "/assets/monsters/aberr.png",
    "level": 1,
    "maxHp": 78,
    "strength": 19,
    "defense": 2,
    "agility": 2,
    "experience": 70,
    "gold": 26,
    "drops": [
      {
        "itemId": "potion_health",
        "chance": 0.26
      }
    ]
  },
  "anaconda_new": {
    "id": "anaconda_new",
    "cityId": "eldoria",
    "name": "Anaconda",
    "imageUrl": "/assets/monsters/anaconda_new.png",
    "level": 1,
    "maxHp": 78,
    "strength": 19,
    "defense": 2,
    "agility": 3,
    "experience": 70,
    "gold": 26,
    "drops": [
      {
        "itemId": "material_bone",
        "chance": 0.26
      }
    ]
  },
  "anubis_guard": {
    "id": "anubis_guard",
    "cityId": "eldoria",
    "name": "Guarda de Anubis",
    "imageUrl": "/assets/monsters/anubis_guard.png",
    "level": 2,
    "maxHp": 126,
    "strength": 30,
    "defense": 5,
    "agility": 4,
    "experience": 115,
    "gold": 44,
    "drops": [
      {
        "itemId": "potion_health",
        "chance": 0.26
      }
    ]
  },
  "black_mamba_new": {
    "id": "black_mamba_new",
    "cityId": "eldoria",
    "name": "Mamba Negra",
    "imageUrl": "/assets/monsters/black_mamba_new.png",
    "level": 2,
    "maxHp": 126,
    "strength": 30,
    "defense": 5,
    "agility": 5,
    "experience": 115,
    "gold": 44,
    "drops": [
      {
        "itemId": "material_bone",
        "chance": 0.26
      }
    ]
  },
  "brown_ooze": {
    "id": "brown_ooze",
    "cityId": "eldoria",
    "name": "Lodo Marrom",
    "imageUrl": "/assets/monsters/brown_ooze.png",
    "level": 3,
    "maxHp": 177,
    "strength": 41,
    "defense": 7,
    "agility": 6,
    "experience": 160,
    "gold": 62,
    "drops": [
      {
        "itemId": "potion_health",
        "chance": 0.26
      }
    ]
  },
  "centaur_demon": {
    "id": "centaur_demon",
    "cityId": "eldoria",
    "name": "Demonio Centauro",
    "imageUrl": "/assets/monsters/centaur_demon.png",
    "level": 3,
    "maxHp": 177,
    "strength": 41,
    "defense": 7,
    "agility": 7,
    "experience": 160,
    "gold": 62,
    "drops": [
      {
        "itemId": "material_bone",
        "chance": 0.26
      }
    ]
  },
  "clay_golem": {
    "id": "clay_golem",
    "cityId": "eldoria",
    "name": "Golem de Argila",
    "imageUrl": "/assets/monsters/clay_golem.png",
    "level": 4,
    "maxHp": 231,
    "strength": 52,
    "defense": 10,
    "agility": 8,
    "experience": 205,
    "gold": 80,
    "drops": [
      {
        "itemId": "potion_health",
        "chance": 0.26
      }
    ]
  },
  "cursed_goblin": {
    "id": "cursed_goblin",
    "cityId": "eldoria",
    "name": "Goblin Amaldicoado",
    "imageUrl": "/assets/monsters/cursed-goblin.png",
    "level": 4,
    "maxHp": 231,
    "strength": 52,
    "defense": 10,
    "agility": 9,
    "experience": 205,
    "gold": 80,
    "drops": [
      {
        "itemId": "material_bone",
        "chance": 0.26
      }
    ]
  },
  "damnation_cyclops": {
    "id": "damnation_cyclops",
    "cityId": "eldoria",
    "name": "Ciclope da Danacao",
    "imageUrl": "/assets/monsters/damnation_cyclops.png",
    "level": 5,
    "maxHp": 290,
    "strength": 63,
    "defense": 13,
    "agility": 11,
    "experience": 250,
    "gold": 98,
    "drops": [
      {
        "itemId": "potion_health",
        "chance": 0.26
      }
    ]
  },
  "damnation_elemental": {
    "id": "damnation_elemental",
    "cityId": "eldoria",
    "name": "Elemental da Danacao",
    "imageUrl": "/assets/monsters/damnation_elemental.png",
    "level": 5,
    "maxHp": 290,
    "strength": 63,
    "defense": 13,
    "agility": 3,
    "experience": 250,
    "gold": 98,
    "drops": [
      {
        "itemId": "material_bone",
        "chance": 0.26
      }
    ]
  },
  "damnation_golem": {
    "id": "damnation_golem",
    "cityId": "ravenspire",
    "name": "Golem da Danacao",
    "imageUrl": "/assets/monsters/damnation_golem.png",
    "level": 6,
    "maxHp": 351,
    "strength": 74,
    "defense": 15,
    "agility": 4,
    "experience": 295,
    "gold": 116,
    "drops": [
      {
        "itemId": "material_stone_fragment",
        "chance": 0.26
      }
    ]
  },
  "damnation_harpy": {
    "id": "damnation_harpy",
    "cityId": "ravenspire",
    "name": "Harpia da Danacao",
    "imageUrl": "/assets/monsters/damnation_harpy.png",
    "level": 6,
    "maxHp": 351,
    "strength": 74,
    "defense": 15,
    "agility": 5,
    "experience": 295,
    "gold": 116,
    "drops": [
      {
        "itemId": "material_stone_fragment",
        "chance": 0.26
      }
    ]
  },
  "damnation_mummy": {
    "id": "damnation_mummy",
    "cityId": "ravenspire",
    "name": "Mumia da Danacao",
    "imageUrl": "/assets/monsters/damnation_mummy.png",
    "level": 7,
    "maxHp": 417,
    "strength": 85,
    "defense": 18,
    "agility": 6,
    "experience": 340,
    "gold": 134,
    "drops": [
      {
        "itemId": "material_dark_residue",
        "chance": 0.26
      }
    ]
  },
  "damnation_orc": {
    "id": "damnation_orc",
    "cityId": "ravenspire",
    "name": "Orc da Danacao",
    "imageUrl": "/assets/monsters/damnation_orc.png",
    "level": 7,
    "maxHp": 417,
    "strength": 85,
    "defense": 18,
    "agility": 7,
    "experience": 340,
    "gold": 134,
    "drops": [
      {
        "itemId": "material_stone_fragment",
        "chance": 0.26
      }
    ]
  },
  "damnation_scorpion": {
    "id": "damnation_scorpion",
    "cityId": "ravenspire",
    "name": "Escorpiao da Danacao",
    "imageUrl": "/assets/monsters/damnation_scorpion.png",
    "level": 8,
    "maxHp": 486,
    "strength": 96,
    "defense": 20,
    "agility": 8,
    "experience": 385,
    "gold": 152,
    "drops": [
      {
        "itemId": "material_stone_fragment",
        "chance": 0.26
      }
    ]
  },
  "damnation_snake": {
    "id": "damnation_snake",
    "cityId": "ravenspire",
    "name": "Serpente da Danacao",
    "imageUrl": "/assets/monsters/damnation_snake.png",
    "level": 8,
    "maxHp": 486,
    "strength": 96,
    "defense": 20,
    "agility": 9,
    "experience": 385,
    "gold": 152,
    "drops": [
      {
        "itemId": "material_dark_residue",
        "chance": 0.26
      }
    ]
  },
  "damnation_spider": {
    "id": "damnation_spider",
    "cityId": "ravenspire",
    "name": "Aranha da Danacao",
    "imageUrl": "/assets/monsters/damnation_spider.png",
    "level": 9,
    "maxHp": 558,
    "strength": 107,
    "defense": 23,
    "agility": 10,
    "experience": 430,
    "gold": 170,
    "drops": [
      {
        "itemId": "material_stone_fragment",
        "chance": 0.26
      }
    ]
  },
  "damnation_troll": {
    "id": "damnation_troll",
    "cityId": "ravenspire",
    "name": "Troll da Danacao",
    "imageUrl": "/assets/monsters/damnation_troll.png",
    "level": 9,
    "maxHp": 558,
    "strength": 107,
    "defense": 23,
    "agility": 11,
    "experience": 430,
    "gold": 170,
    "drops": [
      {
        "itemId": "material_stone_fragment",
        "chance": 0.26
      }
    ]
  },
  "deathcap": {
    "id": "deathcap",
    "cityId": "ravenspire",
    "name": "Chapeu-da-morte",
    "imageUrl": "/assets/monsters/deathcap.png",
    "level": 10,
    "maxHp": 635,
    "strength": 118,
    "defense": 26,
    "agility": 4,
    "experience": 475,
    "gold": 188,
    "drops": [
      {
        "itemId": "material_dark_residue",
        "chance": 0.26
      }
    ]
  },
  "deep_dwarf": {
    "id": "deep_dwarf",
    "cityId": "ravenspire",
    "name": "Anao das Profundezas",
    "imageUrl": "/assets/monsters/deep-dwarf.png",
    "level": 10,
    "maxHp": 635,
    "strength": 118,
    "defense": 26,
    "agility": 5,
    "experience": 475,
    "gold": 188,
    "drops": [
      {
        "itemId": "material_stone_fragment",
        "chance": 0.26
      }
    ]
  },
  "demon_bareon": {
    "id": "demon_bareon",
    "cityId": "ravenspire",
    "name": "Demonio Bareon",
    "imageUrl": "/assets/monsters/demon_bareon.png",
    "level": 11,
    "maxHp": 714,
    "strength": 129,
    "defense": 28,
    "agility": 6,
    "experience": 520,
    "gold": 206,
    "drops": [
      {
        "itemId": "material_stone_fragment",
        "chance": 0.26
      }
    ]
  },
  "demon_desert_giant": {
    "id": "demon_desert_giant",
    "cityId": "ravenspire",
    "name": "Gigante Demoniaco do Deserto",
    "imageUrl": "/assets/monsters/demon_desert_giant.png",
    "level": 11,
    "maxHp": 714,
    "strength": 129,
    "defense": 28,
    "agility": 7,
    "experience": 520,
    "gold": 206,
    "drops": [
      {
        "itemId": "material_dark_residue",
        "chance": 0.26
      }
    ]
  },
  "demon_dragon": {
    "id": "demon_dragon",
    "cityId": "ravenspire",
    "name": "Dragao Demoniaco",
    "imageUrl": "/assets/monsters/demon_dragon.png",
    "level": 12,
    "maxHp": 798,
    "strength": 140,
    "defense": 31,
    "agility": 8,
    "experience": 565,
    "gold": 224,
    "drops": [
      {
        "itemId": "material_stone_fragment",
        "chance": 0.26
      }
    ]
  },
  "demoniac_elephant": {
    "id": "demoniac_elephant",
    "cityId": "ravenspire",
    "name": "Elefante Demoniaco",
    "imageUrl": "/assets/monsters/demoniac_elephant.png",
    "level": 12,
    "maxHp": 798,
    "strength": 140,
    "defense": 31,
    "agility": 9,
    "experience": 565,
    "gold": 224,
    "drops": [
      {
        "itemId": "material_stone_fragment",
        "chance": 0.26
      }
    ]
  },
  "demoniac_wolf": {
    "id": "demoniac_wolf",
    "cityId": "ravenspire",
    "name": "Lobo Demoniaco",
    "imageUrl": "/assets/monsters/demoniac_wolf.png",
    "level": 13,
    "maxHp": 885,
    "strength": 151,
    "defense": 33,
    "agility": 10,
    "experience": 610,
    "gold": 242,
    "drops": [
      {
        "itemId": "material_dark_residue",
        "chance": 0.26
      }
    ]
  },
  "desert_giant": {
    "id": "desert_giant",
    "cityId": "ravenspire",
    "name": "Gigante do Deserto",
    "imageUrl": "/assets/monsters/desert_giant.png",
    "level": 13,
    "maxHp": 885,
    "strength": 151,
    "defense": 33,
    "agility": 11,
    "experience": 610,
    "gold": 242,
    "drops": [
      {
        "itemId": "material_stone_fragment",
        "chance": 0.26
      }
    ]
  },
  "desert_walker": {
    "id": "desert_walker",
    "cityId": "ravenspire",
    "name": "Andarilho do Deserto",
    "imageUrl": "/assets/monsters/desert_walker.png",
    "level": 14,
    "maxHp": 975,
    "strength": 162,
    "defense": 36,
    "agility": 12,
    "experience": 655,
    "gold": 260,
    "drops": [
      {
        "itemId": "material_stone_fragment",
        "chance": 0.26
      }
    ]
  },
  "desert_worm": {
    "id": "desert_worm",
    "cityId": "ravenspire",
    "name": "Verme do Deserto",
    "imageUrl": "/assets/monsters/desert_worm.png",
    "level": 14,
    "maxHp": 975,
    "strength": 162,
    "defense": 36,
    "agility": 4,
    "experience": 655,
    "gold": 260,
    "drops": [
      {
        "itemId": "material_dark_residue",
        "chance": 0.26
      }
    ]
  },
  "dorrene_orc": {
    "id": "dorrene_orc",
    "cityId": "ironhold",
    "name": "Orc de Dorrene",
    "imageUrl": "/assets/monsters/dorrene_orc.png",
    "level": 15,
    "maxHp": 1070,
    "strength": 173,
    "defense": 39,
    "agility": 6,
    "experience": 700,
    "gold": 278,
    "drops": [
      {
        "itemId": "material_magic_essence",
        "chance": 0.26
      }
    ]
  },
  "dorrene_snake": {
    "id": "dorrene_snake",
    "cityId": "ironhold",
    "name": "Serpente de Dorrene",
    "imageUrl": "/assets/monsters/dorrene_snake.png",
    "level": 15,
    "maxHp": 1070,
    "strength": 173,
    "defense": 39,
    "agility": 7,
    "experience": 700,
    "gold": 278,
    "drops": [
      {
        "itemId": "material_magic_essence",
        "chance": 0.26
      }
    ]
  },
  "easter_bunny": {
    "id": "easter_bunny",
    "cityId": "ironhold",
    "name": "Coelho de Pascoa",
    "imageUrl": "/assets/monsters/easter_bunny.png",
    "level": 16,
    "maxHp": 1167,
    "strength": 184,
    "defense": 41,
    "agility": 8,
    "experience": 745,
    "gold": 296,
    "drops": [
      {
        "itemId": "material_dragon_nail",
        "chance": 0.26
      }
    ]
  },
  "emperor_scorpion": {
    "id": "emperor_scorpion",
    "cityId": "ironhold",
    "name": "Escorpiao Imperador",
    "imageUrl": "/assets/monsters/emperor_scorpion.png",
    "level": 16,
    "maxHp": 1167,
    "strength": 184,
    "defense": 41,
    "agility": 9,
    "experience": 745,
    "gold": 296,
    "drops": [
      {
        "itemId": "material_magic_essence",
        "chance": 0.26
      }
    ]
  },
  "eye_of_devastation_new": {
    "id": "eye_of_devastation_new",
    "cityId": "ironhold",
    "name": "Olho da Devastacao",
    "imageUrl": "/assets/monsters/eye_of_devastation_new.png",
    "level": 17,
    "maxHp": 1269,
    "strength": 195,
    "defense": 44,
    "agility": 10,
    "experience": 790,
    "gold": 314,
    "drops": [
      {
        "itemId": "material_magic_essence",
        "chance": 0.26
      }
    ]
  },
  "giant_ant": {
    "id": "giant_ant",
    "cityId": "ironhold",
    "name": "Formiga Gigante",
    "imageUrl": "/assets/monsters/giant_ant.png",
    "level": 17,
    "maxHp": 1269,
    "strength": 195,
    "defense": 44,
    "agility": 11,
    "experience": 790,
    "gold": 314,
    "drops": [
      {
        "itemId": "material_dragon_nail",
        "chance": 0.26
      }
    ]
  },
  "giant_gecko": {
    "id": "giant_gecko",
    "cityId": "ironhold",
    "name": "Lagartixa Gigante",
    "imageUrl": "/assets/monsters/giant_gecko.png",
    "level": 18,
    "maxHp": 1374,
    "strength": 206,
    "defense": 46,
    "agility": 12,
    "experience": 835,
    "gold": 332,
    "drops": [
      {
        "itemId": "material_magic_essence",
        "chance": 0.26
      }
    ]
  },
  "giant_leech": {
    "id": "giant_leech",
    "cityId": "ironhold",
    "name": "Sanguessuga Gigante",
    "imageUrl": "/assets/monsters/giant_leech.png",
    "level": 18,
    "maxHp": 1374,
    "strength": 206,
    "defense": 46,
    "agility": 13,
    "experience": 835,
    "gold": 332,
    "drops": [
      {
        "itemId": "material_magic_essence",
        "chance": 0.26
      }
    ]
  },
  "giant_scorpion": {
    "id": "giant_scorpion",
    "cityId": "ironhold",
    "name": "Escorpiao Gigante",
    "imageUrl": "/assets/monsters/giant_scorpion.png",
    "level": 19,
    "maxHp": 1482,
    "strength": 217,
    "defense": 49,
    "agility": 5,
    "experience": 880,
    "gold": 350,
    "drops": [
      {
        "itemId": "material_dragon_nail",
        "chance": 0.26
      }
    ]
  },
  "giant_spore": {
    "id": "giant_spore",
    "cityId": "ironhold",
    "name": "Esporo Gigante",
    "imageUrl": "/assets/monsters/giant_spore.png",
    "level": 19,
    "maxHp": 1482,
    "strength": 217,
    "defense": 49,
    "agility": 6,
    "experience": 880,
    "gold": 350,
    "drops": [
      {
        "itemId": "material_magic_essence",
        "chance": 0.26
      }
    ]
  },
  "giant_toad": {
    "id": "giant_toad",
    "cityId": "ironhold",
    "name": "Sapo Gigante",
    "imageUrl": "/assets/monsters/giant_toad.png",
    "level": 20,
    "maxHp": 1595,
    "strength": 228,
    "defense": 52,
    "agility": 8,
    "experience": 925,
    "gold": 368,
    "drops": [
      {
        "itemId": "material_magic_essence",
        "chance": 0.26
      }
    ]
  },
  "grey_rat": {
    "id": "grey_rat",
    "cityId": "ironhold",
    "name": "Rato Cinzento",
    "imageUrl": "/assets/monsters/grey_rat.png",
    "level": 20,
    "maxHp": 1595,
    "strength": 228,
    "defense": 52,
    "agility": 9,
    "experience": 925,
    "gold": 368,
    "drops": [
      {
        "itemId": "material_dragon_nail",
        "chance": 0.26
      }
    ]
  },
  "grey_bear": {
    "id": "grey_bear",
    "cityId": "ironhold",
    "name": "Urso Cinzento",
    "imageUrl": "/assets/monsters/grey-bear.png",
    "level": 21,
    "maxHp": 1710,
    "strength": 239,
    "defense": 54,
    "agility": 10,
    "experience": 970,
    "gold": 386,
    "drops": [
      {
        "itemId": "material_magic_essence",
        "chance": 0.34
      }
    ]
  },
  "grey_wolf": {
    "id": "grey_wolf",
    "cityId": "ironhold",
    "name": "Lobo Cinzento",
    "imageUrl": "/assets/monsters/grey-wolf.png",
    "level": 21,
    "maxHp": 1710,
    "strength": 239,
    "defense": 54,
    "agility": 11,
    "experience": 970,
    "gold": 386,
    "drops": [
      {
        "itemId": "material_magic_essence",
        "chance": 0.34
      }
    ]
  },
  "guardian_serpent": {
    "id": "guardian_serpent",
    "cityId": "ironhold",
    "name": "Serpente Guardiã",
    "imageUrl": "/assets/monsters/guardian_serpent.png",
    "level": 22,
    "maxHp": 1830,
    "strength": 250,
    "defense": 57,
    "agility": 12,
    "experience": 1015,
    "gold": 404,
    "drops": [
      {
        "itemId": "material_dragon_nail",
        "chance": 0.34
      }
    ]
  },
  "hell_lizard": {
    "id": "hell_lizard",
    "cityId": "ironhold",
    "name": "Lagarto Infernal",
    "imageUrl": "/assets/monsters/hell_lizard.png",
    "level": 22,
    "maxHp": 1830,
    "strength": 250,
    "defense": 57,
    "agility": 13,
    "experience": 1015,
    "gold": 404,
    "drops": [
      {
        "itemId": "material_magic_essence",
        "chance": 0.34
      }
    ]
  },
  "hell_salamander": {
    "id": "hell_salamander",
    "cityId": "ironhold",
    "name": "Salamandra Infernal",
    "imageUrl": "/assets/monsters/hell_salamander.png",
    "level": 23,
    "maxHp": 1953,
    "strength": 261,
    "defense": 59,
    "agility": 14,
    "experience": 1060,
    "gold": 422,
    "drops": [
      {
        "itemId": "material_magic_essence",
        "chance": 0.34
      }
    ]
  },
  "hell_worm": {
    "id": "hell_worm",
    "cityId": "ironhold",
    "name": "Verme Infernal",
    "imageUrl": "/assets/monsters/hell_worm.png",
    "level": 23,
    "maxHp": 1953,
    "strength": 261,
    "defense": 59,
    "agility": 6,
    "experience": 1060,
    "gold": 422,
    "drops": [
      {
        "itemId": "material_dragon_nail",
        "chance": 0.34
      }
    ]
  },
  "hill_giant_new": {
    "id": "hill_giant_new",
    "cityId": "ironhold",
    "name": "Gigante da Colina",
    "imageUrl": "/assets/monsters/hill_giant_new.png",
    "level": 24,
    "maxHp": 2079,
    "strength": 272,
    "defense": 62,
    "agility": 7,
    "experience": 1105,
    "gold": 440,
    "drops": [
      {
        "itemId": "material_magic_essence",
        "chance": 0.34
      }
    ]
  },
  "human_bandit": {
    "id": "human_bandit",
    "cityId": "ironhold",
    "name": "Bandido Humano",
    "imageUrl": "/assets/monsters/human-bandit.png",
    "level": 24,
    "maxHp": 2079,
    "strength": 272,
    "defense": 62,
    "agility": 8,
    "experience": 1105,
    "gold": 440,
    "drops": [
      {
        "itemId": "material_magic_essence",
        "chance": 0.34
      }
    ]
  },
  "infernal_serpent": {
    "id": "infernal_serpent",
    "cityId": "ironhold",
    "name": "Serpente Infernal",
    "imageUrl": "/assets/monsters/infernal_serpent.png",
    "level": 25,
    "maxHp": 2210,
    "strength": 283,
    "defense": 65,
    "agility": 10,
    "experience": 1150,
    "gold": 458,
    "drops": [
      {
        "itemId": "material_dragon_nail",
        "chance": 0.34
      }
    ]
  },
  "jelly": {
    "id": "jelly",
    "cityId": "ironhold",
    "name": "Geleia",
    "imageUrl": "/assets/monsters/jelly.png",
    "level": 25,
    "maxHp": 2210,
    "strength": 283,
    "defense": 65,
    "agility": 11,
    "experience": 1150,
    "gold": 458,
    "drops": [
      {
        "itemId": "material_magic_essence",
        "chance": 0.34
      }
    ]
  },
  "joree_giant": {
    "id": "joree_giant",
    "cityId": "ironhold",
    "name": "Gigante de Joree",
    "imageUrl": "/assets/monsters/joree_giant.png",
    "level": 26,
    "maxHp": 2343,
    "strength": 294,
    "defense": 67,
    "agility": 12,
    "experience": 1195,
    "gold": 476,
    "drops": [
      {
        "itemId": "material_magic_essence",
        "chance": 0.34
      }
    ]
  },
  "joree_plant": {
    "id": "joree_plant",
    "cityId": "ironhold",
    "name": "Planta de Joree",
    "imageUrl": "/assets/monsters/joree_plant.png",
    "level": 26,
    "maxHp": 2343,
    "strength": 294,
    "defense": 67,
    "agility": 13,
    "experience": 1195,
    "gold": 476,
    "drops": [
      {
        "itemId": "material_dragon_nail",
        "chance": 0.34
      }
    ]
  },
  "joree_walker": {
    "id": "joree_walker",
    "cityId": "ironhold",
    "name": "Andarilho de Joree",
    "imageUrl": "/assets/monsters/joree_walker.png",
    "level": 27,
    "maxHp": 2481,
    "strength": 305,
    "defense": 70,
    "agility": 14,
    "experience": 1240,
    "gold": 494,
    "drops": [
      {
        "itemId": "material_magic_essence",
        "chance": 0.34
      }
    ]
  },
  "labrat_unseen": {
    "id": "labrat_unseen",
    "cityId": "ironhold",
    "name": "Rato de Laboratorio Oculto",
    "imageUrl": "/assets/monsters/labrat_unseen.png",
    "level": 27,
    "maxHp": 2481,
    "strength": 305,
    "defense": 70,
    "agility": 15,
    "experience": 1240,
    "gold": 494,
    "drops": [
      {
        "itemId": "material_magic_essence",
        "chance": 0.34
      }
    ]
  },
  "mummy": {
    "id": "mummy",
    "cityId": "ironhold",
    "name": "Mumia",
    "imageUrl": "/assets/monsters/mummy.png",
    "level": 28,
    "maxHp": 2622,
    "strength": 316,
    "defense": 72,
    "agility": 7,
    "experience": 1285,
    "gold": 512,
    "drops": [
      {
        "itemId": "material_dragon_nail",
        "chance": 0.34
      }
    ]
  },
  "ogre_mage": {
    "id": "ogre_mage",
    "cityId": "ironhold",
    "name": "Ogro Mago",
    "imageUrl": "/assets/monsters/ogre_mage.png",
    "level": 28,
    "maxHp": 2622,
    "strength": 316,
    "defense": 72,
    "agility": 8,
    "experience": 1285,
    "gold": 512,
    "drops": [
      {
        "itemId": "material_magic_essence",
        "chance": 0.34
      }
    ]
  },
  "ogre": {
    "id": "ogre",
    "cityId": "ironhold",
    "name": "Ogro",
    "imageUrl": "/assets/monsters/ogre.png",
    "level": 29,
    "maxHp": 2766,
    "strength": 327,
    "defense": 75,
    "agility": 9,
    "experience": 1330,
    "gold": 530,
    "drops": [
      {
        "itemId": "material_magic_essence",
        "chance": 0.34
      }
    ]
  },
  "orc_knight": {
    "id": "orc_knight",
    "cityId": "ironhold",
    "name": "Cavaleiro Orc",
    "imageUrl": "/assets/monsters/orc_knight.png",
    "level": 29,
    "maxHp": 2766,
    "strength": 327,
    "defense": 75,
    "agility": 10,
    "experience": 1330,
    "gold": 530,
    "drops": [
      {
        "itemId": "material_dragon_nail",
        "chance": 0.34
      }
    ]
  },
  "orc_warrior": {
    "id": "orc_warrior",
    "cityId": "vila_de_valfria",
    "name": "Guerreiro Orc",
    "imageUrl": "/assets/monsters/orc_warrior.png",
    "level": 30,
    "maxHp": 2915,
    "strength": 338,
    "defense": 78,
    "agility": 12,
    "experience": 1375,
    "gold": 548,
    "drops": [
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.34
      }
    ]
  },
  "orc": {
    "id": "orc",
    "cityId": "vila_de_valfria",
    "name": "Orc",
    "imageUrl": "/assets/monsters/orc.png",
    "level": 30,
    "maxHp": 2915,
    "strength": 338,
    "defense": 78,
    "agility": 13,
    "experience": 1375,
    "gold": 548,
    "drops": [
      {
        "itemId": "material_dark_magic_rune",
        "chance": 0.34
      }
    ]
  },
  "pulsating_lump": {
    "id": "pulsating_lump",
    "cityId": "vila_de_valfria",
    "name": "Massa Pulsante",
    "imageUrl": "/assets/monsters/pulsating_lump.png",
    "level": 31,
    "maxHp": 3066,
    "strength": 349,
    "defense": 80,
    "agility": 14,
    "experience": 1420,
    "gold": 566,
    "drops": [
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.34
      }
    ]
  },
  "redback_new": {
    "id": "redback_new",
    "cityId": "vila_de_valfria",
    "name": "Aranha de Costas Vermelhas",
    "imageUrl": "/assets/monsters/redback_new.png",
    "level": 31,
    "maxHp": 3066,
    "strength": 349,
    "defense": 80,
    "agility": 15,
    "experience": 1420,
    "gold": 566,
    "drops": [
      {
        "itemId": "material_dark_magic_rune",
        "chance": 0.34
      }
    ]
  },
  "rock_troll": {
    "id": "rock_troll",
    "cityId": "vila_de_valfria",
    "name": "Troll de Pedra",
    "imageUrl": "/assets/monsters/rock_troll.png",
    "level": 32,
    "maxHp": 3222,
    "strength": 360,
    "defense": 83,
    "agility": 16,
    "experience": 1465,
    "gold": 584,
    "drops": [
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.34
      }
    ]
  },
  "salamander_firebrand": {
    "id": "salamander_firebrand",
    "cityId": "vila_de_valfria",
    "name": "Salamandra Flamejante",
    "imageUrl": "/assets/monsters/salamander_firebrand.png",
    "level": 32,
    "maxHp": 3222,
    "strength": 360,
    "defense": 83,
    "agility": 8,
    "experience": 1465,
    "gold": 584,
    "drops": [
      {
        "itemId": "material_dark_magic_rune",
        "chance": 0.34
      }
    ]
  },
  "salamander": {
    "id": "salamander",
    "cityId": "vila_de_valfria",
    "name": "Salamandra",
    "imageUrl": "/assets/monsters/salamander.png",
    "level": 33,
    "maxHp": 3381,
    "strength": 371,
    "defense": 85,
    "agility": 9,
    "experience": 1510,
    "gold": 602,
    "drops": [
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.34
      }
    ]
  },
  "sand_elemental": {
    "id": "sand_elemental",
    "cityId": "vila_de_valfria",
    "name": "Elemental de Areia",
    "imageUrl": "/assets/monsters/sand_elemental.png",
    "level": 33,
    "maxHp": 3381,
    "strength": 371,
    "defense": 85,
    "agility": 10,
    "experience": 1510,
    "gold": 602,
    "drops": [
      {
        "itemId": "material_dark_magic_rune",
        "chance": 0.34
      }
    ]
  },
  "sand_spider": {
    "id": "sand_spider",
    "cityId": "vila_de_valfria",
    "name": "Aranha de Areia",
    "imageUrl": "/assets/monsters/sand_spider.png",
    "level": 34,
    "maxHp": 3543,
    "strength": 382,
    "defense": 88,
    "agility": 11,
    "experience": 1555,
    "gold": 620,
    "drops": [
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.34
      }
    ]
  },
  "skeleton_bat": {
    "id": "skeleton_bat",
    "cityId": "vila_de_valfria",
    "name": "Morcego Esqueleto",
    "imageUrl": "/assets/monsters/skeleton_bat.png",
    "level": 34,
    "maxHp": 3543,
    "strength": 382,
    "defense": 88,
    "agility": 12,
    "experience": 1555,
    "gold": 620,
    "drops": [
      {
        "itemId": "material_dark_magic_rune",
        "chance": 0.34
      }
    ]
  },
  "skeleton_centaur": {
    "id": "skeleton_centaur",
    "cityId": "vila_de_valfria",
    "name": "Centauro Esqueleto",
    "imageUrl": "/assets/monsters/skeleton_centaur.png",
    "level": 35,
    "maxHp": 3710,
    "strength": 393,
    "defense": 91,
    "agility": 14,
    "experience": 1600,
    "gold": 638,
    "drops": [
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.34
      }
    ]
  },
  "skeleton_dragon": {
    "id": "skeleton_dragon",
    "cityId": "vila_de_valfria",
    "name": "Dragao Esqueleto",
    "imageUrl": "/assets/monsters/skeleton_dragon.png",
    "level": 35,
    "maxHp": 3710,
    "strength": 393,
    "defense": 91,
    "agility": 15,
    "experience": 1600,
    "gold": 638,
    "drops": [
      {
        "itemId": "material_dark_magic_rune",
        "chance": 0.34
      }
    ]
  },
  "skeleton_naga": {
    "id": "skeleton_naga",
    "cityId": "vila_de_valfria",
    "name": "Naga Esqueleto",
    "imageUrl": "/assets/monsters/skeleton_naga.png",
    "level": 36,
    "maxHp": 3879,
    "strength": 404,
    "defense": 93,
    "agility": 16,
    "experience": 1645,
    "gold": 656,
    "drops": [
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.34
      }
    ]
  },
  "skeleton_quadruped_large_new": {
    "id": "skeleton_quadruped_large_new",
    "cityId": "vila_de_valfria",
    "name": "Quadrupede Esqueleto Grande",
    "imageUrl": "/assets/monsters/skeleton_quadruped_large_new.png",
    "level": 36,
    "maxHp": 3879,
    "strength": 404,
    "defense": 93,
    "agility": 17,
    "experience": 1645,
    "gold": 656,
    "drops": [
      {
        "itemId": "material_dark_magic_rune",
        "chance": 0.34
      }
    ]
  },
  "skeleton_quadruped_small": {
    "id": "skeleton_quadruped_small",
    "cityId": "vila_de_valfria",
    "name": "Quadrupede Esqueleto Pequeno",
    "imageUrl": "/assets/monsters/skeleton_quadruped_small.png",
    "level": 37,
    "maxHp": 4053,
    "strength": 415,
    "defense": 96,
    "agility": 9,
    "experience": 1690,
    "gold": 674,
    "drops": [
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.34
      }
    ]
  },
  "skeleton_snake": {
    "id": "skeleton_snake",
    "cityId": "vila_de_valfria",
    "name": "Serpente Esqueleto",
    "imageUrl": "/assets/monsters/skeleton_snake.png",
    "level": 37,
    "maxHp": 4053,
    "strength": 415,
    "defense": 96,
    "agility": 10,
    "experience": 1690,
    "gold": 674,
    "drops": [
      {
        "itemId": "material_dark_magic_rune",
        "chance": 0.34
      }
    ]
  },
  "skeleton_ugly_thing": {
    "id": "skeleton_ugly_thing",
    "cityId": "vila_de_valfria",
    "name": "Coisa Feia Esqueleto",
    "imageUrl": "/assets/monsters/skeleton_ugly_thing.png",
    "level": 38,
    "maxHp": 4230,
    "strength": 426,
    "defense": 98,
    "agility": 11,
    "experience": 1735,
    "gold": 692,
    "drops": [
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.34
      }
    ]
  },
  "spectral_ant_old": {
    "id": "spectral_ant_old",
    "cityId": "vila_de_valfria",
    "name": "Formiga Espectral Antiga",
    "imageUrl": "/assets/monsters/spectral_ant_old.png",
    "level": 38,
    "maxHp": 4230,
    "strength": 426,
    "defense": 98,
    "agility": 12,
    "experience": 1735,
    "gold": 692,
    "drops": [
      {
        "itemId": "material_dark_magic_rune",
        "chance": 0.34
      }
    ]
  },
  "spectral_bat_old": {
    "id": "spectral_bat_old",
    "cityId": "vila_de_valfria",
    "name": "Morcego Espectral Antigo",
    "imageUrl": "/assets/monsters/spectral_bat_old.png",
    "level": 39,
    "maxHp": 4410,
    "strength": 437,
    "defense": 101,
    "agility": 13,
    "experience": 1780,
    "gold": 710,
    "drops": [
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.34
      }
    ]
  },
  "spectral_bee_old": {
    "id": "spectral_bee_old",
    "cityId": "vila_de_valfria",
    "name": "Abelha Espectral Antiga",
    "imageUrl": "/assets/monsters/spectral_bee_old.png",
    "level": 39,
    "maxHp": 4410,
    "strength": 437,
    "defense": 101,
    "agility": 14,
    "experience": 1780,
    "gold": 710,
    "drops": [
      {
        "itemId": "material_dark_magic_rune",
        "chance": 0.34
      }
    ]
  },
  "spectral_centaur_old": {
    "id": "spectral_centaur_old",
    "cityId": "vila_de_valfria",
    "name": "Centauro Espectral Antigo",
    "imageUrl": "/assets/monsters/spectral_centaur_old.png",
    "level": 40,
    "maxHp": 4595,
    "strength": 448,
    "defense": 104,
    "agility": 16,
    "experience": 1825,
    "gold": 728,
    "drops": [
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.34
      }
    ]
  },
  "spectral_dragon_old": {
    "id": "spectral_dragon_old",
    "cityId": "vila_de_valfria",
    "name": "Dragao Espectral Antigo",
    "imageUrl": "/assets/monsters/spectral_dragon_old.png",
    "level": 40,
    "maxHp": 4595,
    "strength": 448,
    "defense": 104,
    "agility": 17,
    "experience": 1825,
    "gold": 728,
    "drops": [
      {
        "itemId": "material_dark_magic_rune",
        "chance": 0.34
      }
    ]
  },
  "spectral_fish_old": {
    "id": "spectral_fish_old",
    "cityId": "vila_de_valfria",
    "name": "Peixe Espectral Antigo",
    "imageUrl": "/assets/monsters/spectral_fish_old.png",
    "level": 41,
    "maxHp": 4782,
    "strength": 459,
    "defense": 106,
    "agility": 18,
    "experience": 1870,
    "gold": 746,
    "drops": [
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.42
      }
    ]
  },
  "spectral_hydra_3_old": {
    "id": "spectral_hydra_3_old",
    "cityId": "vila_de_valfria",
    "name": "Hidra Espectral Antiga",
    "imageUrl": "/assets/monsters/spectral_hydra_3_old.png",
    "level": 41,
    "maxHp": 4782,
    "strength": 459,
    "defense": 106,
    "agility": 10,
    "experience": 1870,
    "gold": 746,
    "drops": [
      {
        "itemId": "material_dark_magic_rune",
        "chance": 0.42
      }
    ]
  },
  "spectral_naga_old": {
    "id": "spectral_naga_old",
    "cityId": "vila_de_valfria",
    "name": "Naga Espectral Antiga",
    "imageUrl": "/assets/monsters/spectral_naga_old.png",
    "level": 42,
    "maxHp": 4974,
    "strength": 470,
    "defense": 109,
    "agility": 11,
    "experience": 1915,
    "gold": 764,
    "drops": [
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.42
      }
    ]
  },
  "spectral_quadruped_small_old": {
    "id": "spectral_quadruped_small_old",
    "cityId": "vila_de_valfria",
    "name": "Quadrupede Espectral Pequeno Antigo",
    "imageUrl": "/assets/monsters/spectral_quadruped_small_old.png",
    "level": 42,
    "maxHp": 4974,
    "strength": 470,
    "defense": 109,
    "agility": 12,
    "experience": 1915,
    "gold": 764,
    "drops": [
      {
        "itemId": "material_dark_magic_rune",
        "chance": 0.42
      }
    ]
  },
  "spectral_snake_old": {
    "id": "spectral_snake_old",
    "cityId": "vila_de_valfria",
    "name": "Serpente Espectral Antiga",
    "imageUrl": "/assets/monsters/spectral_snake_old.png",
    "level": 43,
    "maxHp": 5169,
    "strength": 481,
    "defense": 111,
    "agility": 13,
    "experience": 1960,
    "gold": 782,
    "drops": [
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.42
      }
    ]
  },
  "spectral_spider_old": {
    "id": "spectral_spider_old",
    "cityId": "vila_de_valfria",
    "name": "Aranha Espectral Antiga",
    "imageUrl": "/assets/monsters/spectral_spider_old.png",
    "level": 43,
    "maxHp": 5169,
    "strength": 481,
    "defense": 111,
    "agility": 14,
    "experience": 1960,
    "gold": 782,
    "drops": [
      {
        "itemId": "material_dark_magic_rune",
        "chance": 0.42
      }
    ]
  },
  "spectral_thing": {
    "id": "spectral_thing",
    "cityId": "vila_de_valfria",
    "name": "Coisa Espectral",
    "imageUrl": "/assets/monsters/spectral_thing.png",
    "level": 44,
    "maxHp": 5367,
    "strength": 492,
    "defense": 114,
    "agility": 15,
    "experience": 2005,
    "gold": 800,
    "drops": [
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.42
      }
    ]
  },
  "spectral_worm": {
    "id": "spectral_worm",
    "cityId": "vila_de_valfria",
    "name": "Verme Espectral",
    "imageUrl": "/assets/monsters/spectral_worm.png",
    "level": 44,
    "maxHp": 5367,
    "strength": 492,
    "defense": 114,
    "agility": 16,
    "experience": 2005,
    "gold": 800,
    "drops": [
      {
        "itemId": "material_dark_magic_rune",
        "chance": 0.42
      }
    ]
  },
  "two_headed_ogre": {
    "id": "two_headed_ogre",
    "cityId": "vila_de_valfria",
    "name": "Ogro de Duas Cabecas",
    "imageUrl": "/assets/monsters/two_headed_ogre.png",
    "level": 45,
    "maxHp": 5570,
    "strength": 503,
    "defense": 117,
    "agility": 18,
    "experience": 2050,
    "gold": 818,
    "drops": [
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.42
      }
    ]
  },
  "viper": {
    "id": "viper",
    "cityId": "vila_de_valfria",
    "name": "Vibora",
    "imageUrl": "/assets/monsters/viper.png",
    "level": 45,
    "maxHp": 5570,
    "strength": 503,
    "defense": 117,
    "agility": 19,
    "experience": 2050,
    "gold": 818,
    "drops": [
      {
        "itemId": "material_dark_magic_rune",
        "chance": 0.42
      }
    ]
  },
  "wolf_spider_new": {
    "id": "wolf_spider_new",
    "cityId": "vila_de_valfria",
    "name": "Aranha-Lobo",
    "imageUrl": "/assets/monsters/wolf_spider_new.png",
    "level": 46,
    "maxHp": 5775,
    "strength": 514,
    "defense": 119,
    "agility": 11,
    "experience": 2095,
    "gold": 836,
    "drops": [
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.42
      }
    ]
  },
  "wolf_spider_old": {
    "id": "wolf_spider_old",
    "cityId": "vila_de_valfria",
    "name": "Aranha-Lobo Antiga",
    "imageUrl": "/assets/monsters/wolf_spider_old.png",
    "level": 46,
    "maxHp": 5775,
    "strength": 514,
    "defense": 119,
    "agility": 12,
    "experience": 2095,
    "gold": 836,
    "drops": [
      {
        "itemId": "material_dark_magic_rune",
        "chance": 0.42
      }
    ]
  },
  "zombie_crab": {
    "id": "zombie_crab",
    "cityId": "vila_de_valfria",
    "name": "Caranguejo Zumbi",
    "imageUrl": "/assets/monsters/zombie_crab.png",
    "level": 47,
    "maxHp": 5985,
    "strength": 525,
    "defense": 122,
    "agility": 13,
    "experience": 2140,
    "gold": 854,
    "drops": [
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.42
      }
    ]
  },
  "zombie_drake_infected": {
    "id": "zombie_drake_infected",
    "cityId": "vila_de_valfria",
    "name": "Draco Zumbi Infectado",
    "imageUrl": "/assets/monsters/zombie_drake_infected.png",
    "level": 47,
    "maxHp": 5985,
    "strength": 525,
    "defense": 122,
    "agility": 14,
    "experience": 2140,
    "gold": 854,
    "drops": [
      {
        "itemId": "material_dark_magic_rune",
        "chance": 0.42
      }
    ]
  },
  "zombie_drake": {
    "id": "zombie_drake",
    "cityId": "vila_de_valfria",
    "name": "Draco Zumbi",
    "imageUrl": "/assets/monsters/zombie_drake.png",
    "level": 48,
    "maxHp": 6198,
    "strength": 536,
    "defense": 124,
    "agility": 15,
    "experience": 2185,
    "gold": 872,
    "drops": [
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.42
      }
    ]
  },
  "zombie_hound_infected": {
    "id": "zombie_hound_infected",
    "cityId": "vila_de_valfria",
    "name": "Cao Zumbi Infectado",
    "imageUrl": "/assets/monsters/zombie_hound_infected.png",
    "level": 48,
    "maxHp": 6198,
    "strength": 536,
    "defense": 124,
    "agility": 16,
    "experience": 2185,
    "gold": 872,
    "drops": [
      {
        "itemId": "material_dark_magic_rune",
        "chance": 0.42
      }
    ]
  },
  "zombie_hound": {
    "id": "zombie_hound",
    "cityId": "vila_de_valfria",
    "name": "Cao Zumbi",
    "imageUrl": "/assets/monsters/zombie_hound.png",
    "level": 49,
    "maxHp": 6414,
    "strength": 547,
    "defense": 127,
    "agility": 17,
    "experience": 2230,
    "gold": 890,
    "drops": [
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.42
      }
    ]
  },
  "zombie_kraken_head": {
    "id": "zombie_kraken_head",
    "cityId": "vila_de_valfria",
    "name": "Cabeca de Kraken Zumbi",
    "imageUrl": "/assets/monsters/zombie_kraken_head.png",
    "level": 49,
    "maxHp": 6414,
    "strength": 547,
    "defense": 127,
    "agility": 18,
    "experience": 2230,
    "gold": 890,
    "drops": [
      {
        "itemId": "material_dark_magic_rune",
        "chance": 0.42
      }
    ]
  },
  "zombie_kraken_infected": {
    "id": "zombie_kraken_infected",
    "cityId": "rosindale",
    "name": "Kraken Zumbi Infectado",
    "imageUrl": "/assets/monsters/zombie_kraken_infected.png",
    "level": 50,
    "maxHp": 6635,
    "strength": 558,
    "defense": 130,
    "agility": 20,
    "experience": 2275,
    "gold": 908,
    "drops": [
      {
        "itemId": "material_dragon_essence",
        "chance": 0.42
      }
    ]
  },
  "zombie_lizard_infected": {
    "id": "zombie_lizard_infected",
    "cityId": "rosindale",
    "name": "Lagarto Zumbi Infectado",
    "imageUrl": "/assets/monsters/zombie_lizard_infected.png",
    "level": 50,
    "maxHp": 6635,
    "strength": 558,
    "defense": 130,
    "agility": 12,
    "experience": 2275,
    "gold": 908,
    "drops": [
      {
        "itemId": "material_mysterious_jewell",
        "chance": 0.42
      }
    ]
  },
  "zombie_lizard": {
    "id": "zombie_lizard",
    "cityId": "rosindale",
    "name": "Lagarto Zumbi",
    "imageUrl": "/assets/monsters/zombie_lizard.png",
    "level": 51,
    "maxHp": 6858,
    "strength": 569,
    "defense": 132,
    "agility": 13,
    "experience": 2320,
    "gold": 926,
    "drops": [
      {
        "itemId": "material_dragon_essence",
        "chance": 0.42
      }
    ]
  },
  "zombie_octopode_infected": {
    "id": "zombie_octopode_infected",
    "cityId": "rosindale",
    "name": "Octopode Zumbi Infectado",
    "imageUrl": "/assets/monsters/zombie_octopode_infected.png",
    "level": 51,
    "maxHp": 6858,
    "strength": 569,
    "defense": 132,
    "agility": 14,
    "experience": 2320,
    "gold": 926,
    "drops": [
      {
        "itemId": "material_mysterious_jewell",
        "chance": 0.42
      }
    ]
  },
  "zombie_octopode": {
    "id": "zombie_octopode",
    "cityId": "rosindale",
    "name": "Octopode Zumbi",
    "imageUrl": "/assets/monsters/zombie_octopode.png",
    "level": 52,
    "maxHp": 7086,
    "strength": 580,
    "defense": 135,
    "agility": 15,
    "experience": 2365,
    "gold": 944,
    "drops": [
      {
        "itemId": "material_dragon_essence",
        "chance": 0.42
      }
    ]
  },
  "zombie_ogre_infected": {
    "id": "zombie_ogre_infected",
    "cityId": "rosindale",
    "name": "Ogro Zumbi Infectado",
    "imageUrl": "/assets/monsters/zombie_ogre_infected.png",
    "level": 52,
    "maxHp": 7086,
    "strength": 580,
    "defense": 135,
    "agility": 16,
    "experience": 2365,
    "gold": 944,
    "drops": [
      {
        "itemId": "material_mysterious_jewell",
        "chance": 0.42
      }
    ]
  },
  "zombie_ogre": {
    "id": "zombie_ogre",
    "cityId": "rosindale",
    "name": "Ogro Zumbi",
    "imageUrl": "/assets/monsters/zombie_ogre.png",
    "level": 53,
    "maxHp": 7317,
    "strength": 591,
    "defense": 137,
    "agility": 17,
    "experience": 2410,
    "gold": 962,
    "drops": [
      {
        "itemId": "material_dragon_essence",
        "chance": 0.42
      }
    ]
  },
  "zombie_rat": {
    "id": "zombie_rat",
    "cityId": "rosindale",
    "name": "Rato Zumbi",
    "imageUrl": "/assets/monsters/zombie_rat.png",
    "level": 53,
    "maxHp": 7317,
    "strength": 591,
    "defense": 137,
    "agility": 18,
    "experience": 2410,
    "gold": 962,
    "drops": [
      {
        "itemId": "material_mysterious_jewell",
        "chance": 0.42
      }
    ]
  },
  "zombie_small": {
    "id": "zombie_small",
    "cityId": "rosindale",
    "name": "Zumbi Pequeno",
    "imageUrl": "/assets/monsters/zombie_small.png",
    "level": 54,
    "maxHp": 7551,
    "strength": 602,
    "defense": 140,
    "agility": 19,
    "experience": 2455,
    "gold": 980,
    "drops": [
      {
        "itemId": "material_dragon_essence",
        "chance": 0.42
      }
    ]
  },
  "zombie_toad": {
    "id": "zombie_toad",
    "cityId": "rosindale",
    "name": "Sapo Zumbi",
    "imageUrl": "/assets/monsters/zombie_toad.png",
    "level": 54,
    "maxHp": 7551,
    "strength": 602,
    "defense": 140,
    "agility": 20,
    "experience": 2455,
    "gold": 980,
    "drops": [
      {
        "itemId": "material_mysterious_jewell",
        "chance": 0.42
      }
    ]
  },
  "zombie_turtle_infected": {
    "id": "zombie_turtle_infected",
    "cityId": "rosindale",
    "name": "Tartaruga Zumbi Infectada",
    "imageUrl": "/assets/monsters/zombie_turtle_infected.png",
    "level": 55,
    "maxHp": 7790,
    "strength": 613,
    "defense": 143,
    "agility": 13,
    "experience": 2500,
    "gold": 998,
    "drops": [
      {
        "itemId": "material_dragon_essence",
        "chance": 0.42
      }
    ]
  },
  "zombie_turtle": {
    "id": "zombie_turtle",
    "cityId": "rosindale",
    "name": "Tartaruga Zumbi",
    "imageUrl": "/assets/monsters/zombie_turtle.png",
    "level": 55,
    "maxHp": 7790,
    "strength": 613,
    "defense": 143,
    "agility": 14,
    "experience": 2500,
    "gold": 998,
    "drops": [
      {
        "itemId": "material_mysterious_jewell",
        "chance": 0.42
      }
    ]
  },
  "zombie_ugly_thing_infected": {
    "id": "zombie_ugly_thing_infected",
    "cityId": "rosindale",
    "name": "Coisa Feia Zumbi Infectada",
    "imageUrl": "/assets/monsters/zombie_ugly_thing_infected.png",
    "level": 56,
    "maxHp": 8031,
    "strength": 624,
    "defense": 145,
    "agility": 15,
    "experience": 2545,
    "gold": 1016,
    "drops": [
      {
        "itemId": "material_dragon_essence",
        "chance": 0.42
      }
    ]
  },
  "zombie_ugly_thing": {
    "id": "zombie_ugly_thing",
    "cityId": "rosindale",
    "name": "Coisa Feia Zumbi",
    "imageUrl": "/assets/monsters/zombie_ugly_thing.png",
    "level": 56,
    "maxHp": 8031,
    "strength": 624,
    "defense": 145,
    "agility": 16,
    "experience": 2545,
    "gold": 1016,
    "drops": [
      {
        "itemId": "material_mysterious_jewell",
        "chance": 0.42
      }
    ]
  },
  "training_dummy": {
    "id": "training_dummy",
    "cityId": "eldoria",
    "name": "Boneco Encantado",
    "imageUrl": "/assets/monsters/clay_golem.png",
    "level": 1,
    "maxHp": 35,
    "strength": 8,
    "defense": 0,
    "agility": 0,
    "experience": 25,
    "gold": 8,
    "drops": [
      {
        "itemId": "health_potion",
        "chance": 0.18
      }
    ]
  },
  "forest_rat": {
    "id": "forest_rat",
    "cityId": "eldoria",
    "name": "Rato da Floresta",
    "imageUrl": "/assets/monsters/grey_rat.png",
    "level": 1,
    "maxHp": 45,
    "strength": 10,
    "defense": 1,
    "agility": 2,
    "experience": 35,
    "gold": 12,
    "drops": [
      {
        "itemId": "health_potion",
        "chance": 0.22
      }
    ]
  },
  "gray_wolf": {
    "id": "gray_wolf",
    "cityId": "eldoria",
    "name": "Lobo Cinzento",
    "imageUrl": "/assets/monsters/grey-wolf.png",
    "level": 2,
    "maxHp": 75,
    "strength": 18,
    "defense": 3,
    "agility": 5,
    "experience": 70,
    "gold": 22,
    "drops": [
      {
        "itemId": "wolf_pelt",
        "chance": 0.45
      },
      {
        "itemId": "health_potion",
        "chance": 0.15
      }
    ]
  },
  "road_bandit": {
    "id": "road_bandit",
    "cityId": "ravenspire",
    "name": "Bandido da Estrada",
    "imageUrl": "/assets/monsters/human-bandit.png",
    "level": 3,
    "maxHp": 130,
    "strength": 34,
    "defense": 6,
    "agility": 8,
    "experience": 120,
    "gold": 45,
    "drops": [
      {
        "itemId": "iron_sword",
        "chance": 0.08
      },
      {
        "itemId": "crystal_dust",
        "chance": 0.18
      }
    ]
  },
  "thorn_boar": {
    "id": "thorn_boar",
    "cityId": "ravenspire",
    "name": "Javali Espinhoso",
    "imageUrl": "/assets/monsters/grey-bear.png",
    "level": 4,
    "maxHp": 180,
    "strength": 42,
    "defense": 10,
    "agility": 4,
    "experience": 160,
    "gold": 54,
    "drops": [
      {
        "itemId": "energy_potion",
        "chance": 0.2
      },
      {
        "itemId": "crystal_dust",
        "chance": 0.28
      }
    ]
  },
  "ember_golem": {
    "id": "ember_golem",
    "cityId": "ironhold",
    "name": "Golem de Brasa",
    "imageUrl": "/assets/monsters/damnation_golem.png",
    "level": 7,
    "maxHp": 380,
    "strength": 78,
    "defense": 24,
    "agility": 3,
    "experience": 320,
    "gold": 120,
    "drops": [
      {
        "itemId": "ember_core",
        "chance": 0.55
      },
      {
        "itemId": "crystal_dust",
        "chance": 0.2
      }
    ]
  },
  "cave_wyvern": {
    "id": "cave_wyvern",
    "cityId": "ironhold",
    "name": "Serpe da Caverna",
    "imageUrl": "/assets/monsters/demon_dragon.png",
    "level": 9,
    "maxHp": 470,
    "strength": 98,
    "defense": 18,
    "agility": 16,
    "experience": 460,
    "gold": 170,
    "drops": [
      {
        "itemId": "hunter_charm",
        "chance": 0.12
      },
      {
        "itemId": "ember_core",
        "chance": 0.3
      },
      {
        "itemId": "wyvern_scale",
        "chance": 0.42
      }
    ]
  }
};
