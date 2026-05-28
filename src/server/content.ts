import type {
  CityDefinition,
  AvatarDefinition,
  ClanBenefitDefinition,
  ClanSuperBenefitDefinition,
  CountryDefinition,
  CraftingRecipe,
  GameShopPackage,
  HuntingLocationDefinition,
  ItemDefinition,
  MonsterDefinition,
  TalentDefinition,
  TemporaryEventDefinition,
  WorkServiceDefinition
} from "../shared/types";

export const INVENTORY_CAPACITY = 40;
export const STARTING_CITY_ID = "eldoria";

export const TRAIN_TICKET_ID = "ticket_train";
export const SHIP_TICKET_ID = "ticket_ship";

export const TEMPORARY_EVENTS: TemporaryEventDefinition[] = [
  {
    id: "welcome_2026",
    name: "BOAS VINDAS!",
    subtitle: "A chama inicial dos recrutas",
    description:
      "Durante o evento, todas as caçadas recebem bônus de 50% de XP, 50% de ouro e 50% de chance de drop. Um empurrão arcano para novos e antigos recrutas acelerarem a jornada.",
    startsAt: "2026-05-01T00:00:00-03:00",
    endsAt: "2026-12-31T23:59:59-03:00",
    iconUrl: "/assets/banner/events/icons/boas_vindas.png",
    bannerImageUrl: "/assets/banner/events/boas_vindas.png",
    accentColor: "#9D6BFF",
    bonuses: [
      {
        scope: "hunt",
        xpBonusPercent: 0.5,
        goldBonusPercent: 0.5,
        dropChanceBonusPercent: 0.5
      }
    ]
  }
];

export const AVATARS: AvatarDefinition[] = [
  { id: "andarilho", name: "Andarilho", icon: "user", accent: "linear-gradient(135deg, #7C4DFF, #DCCBFF)", imageUrl: "/assets/avatar/andarilho_free.png", priceDiamonds: 0 },
  { id: "assassina", name: "Assassina", icon: "swords", accent: "linear-gradient(135deg, #211B31, #9D6BFF)", imageUrl: "/assets/avatar/assassina_free.png", priceDiamonds: 0 },
  { id: "assassino", name: "Assassino", icon: "swords", accent: "linear-gradient(135deg, #171424, #7C4DFF)", imageUrl: "/assets/avatar/assassino_free.png", priceDiamonds: 0 },
  { id: "barbaro", name: "Bárbaro", icon: "flame", accent: "linear-gradient(135deg, #3A2230, #C94E6B)", imageUrl: "/assets/avatar/barbaro_free.png", priceDiamonds: 0 },
  { id: "cacador", name: "Caçador", icon: "shield", accent: "linear-gradient(135deg, #172421, #52D89B)", imageUrl: "/assets/avatar/cacador_free.png", priceDiamonds: 0 },
  { id: "clerigo", name: "Clérigo", icon: "sparkles", accent: "linear-gradient(135deg, #211B31, #DCCBFF)", imageUrl: "/assets/avatar/clerigo_free.png", priceDiamonds: 0 },
  { id: "drow", name: "Drow", icon: "skull", accent: "linear-gradient(135deg, #100D1A, #7C4DFF)", imageUrl: "/assets/avatar/drow_free.png", priceDiamonds: 0 },
  { id: "ferreiro", name: "Ferreiro", icon: "shield", accent: "linear-gradient(135deg, #2E2635, #D8B24A)", imageUrl: "/assets/avatar/ferreiro_free.png", priceDiamonds: 0 },
  { id: "maga", name: "Maga", icon: "sparkles", accent: "linear-gradient(135deg, #171424, #52E0C4)", imageUrl: "/assets/avatar/maga_free.png", priceDiamonds: 0 },
  { id: "monge", name: "Monge", icon: "shield", accent: "linear-gradient(135deg, #211B31, #AFA3C7)", imageUrl: "/assets/avatar/monge_free.png", priceDiamonds: 0 },
  { id: "orc", name: "Orc", icon: "swords", accent: "linear-gradient(135deg, #172421, #746A86)", imageUrl: "/assets/avatar/orc_free.png", priceDiamonds: 0 },
  { id: "princesa", name: "Princesa", icon: "crown", accent: "linear-gradient(135deg, #211B31, #DCCBFF)", imageUrl: "/assets/avatar/princesa_free.png", priceDiamonds: 0 },
  { id: "recruta", name: "Recruta", icon: "user", accent: "linear-gradient(135deg, #100D1A, #AFA3C7)", imageUrl: "/assets/avatar/recruta_free.png", priceDiamonds: 0 },
  { id: "undead", name: "Undead", icon: "skull", accent: "linear-gradient(135deg, #171424, #52E0C4)", imageUrl: "/assets/avatar/undead_free.png", priceDiamonds: 0 },
  { id: "dragao", name: "Dragão", icon: "flame", accent: "linear-gradient(135deg, #3A2230, #9D6BFF)", imageUrl: "/assets/avatar/dragao_pago.png", priceDiamonds: 180 },
  { id: "druida", name: "Druida", icon: "sparkles", accent: "linear-gradient(135deg, #172421, #52D89B)", imageUrl: "/assets/avatar/druida_pago.png", priceDiamonds: 80 },
  { id: "general_undead", name: "General Undead", icon: "skull", accent: "linear-gradient(135deg, #100D1A, #9D6BFF)", imageUrl: "/assets/avatar/general_undead_pago.png", priceDiamonds: 220 },
  { id: "litch", name: "Litch", icon: "crown", accent: "linear-gradient(135deg, #0B0912, #7C4DFF)", imageUrl: "/assets/avatar/litch_pago.png", priceDiamonds: 250 },
  { id: "lobo", name: "Lobo", icon: "shield", accent: "linear-gradient(135deg, #171424, #AFA3C7)", imageUrl: "/assets/avatar/lobo_pago.png", priceDiamonds: 90 },
  { id: "necromante", name: "Necromante", icon: "skull", accent: "linear-gradient(135deg, #100D1A, #7C4DFF)", imageUrl: "/assets/avatar/necromante_pago.png", priceDiamonds: 140 },
  { id: "paladino", name: "Paladino", icon: "shield", accent: "linear-gradient(135deg, #211B31, #D8B24A)", imageUrl: "/assets/avatar/paladino_pago.png", priceDiamonds: 120 },
  { id: "campeao_arena", name: "Campeão da Arena", icon: "crown", accent: "linear-gradient(135deg, #211B31, #D8B24A)", imageUrl: "/assets/avatar/campeao_arena.png", priceDiamonds: 0, exclusive: true, unlockHint: "Conquiste o 1º lugar em uma temporada da Arena Ranqueada." },
  { id: "rei", name: "Rei", icon: "crown", accent: "linear-gradient(135deg, #0B0912, #D8B24A)", imageUrl: "/assets/avatar/rei_recompensa.png", priceDiamonds: 0, exclusive: true, unlockHint: "Avatar de recompensa especial." }
];

export const ITEM_CATALOG: Record<string, ItemDefinition> = {
  "ticket_train": {
    "id": "ticket_train",
    "name": "Ticket de Trem",
    "kind": "ticket",
    "minLevel": 1,
    "price": 80,
    "imageUrl": "/assets/items/misc/train-ticket.png",
    "stats": {},
    "description": "Usado para viajar entre cidades do mesmo país."
  },
  "ticket_ship": {
    "id": "ticket_ship",
    "name": "Ticket de Navio",
    "kind": "ticket",
    "minLevel": 1,
    "imageUrl": "/assets/items/misc/ship-ticket.png",
    "price": 250,
    "stats": {},
    "description": "Usado para viajar entre países. A chegada sempre acontece na cidade porto."
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
    }
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
    }
  },
  "armor_mystic": {
    "id": "armor_mystic",
    "name": "Armadura Mística",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/02-mystic.png",
    "minLevel": 9,
    "price": 520,
    "stats": {
      "defense": 30,
      "constitution": 2
    }
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
    }
  },
  "armor_cursed": {
    "id": "armor_cursed",
    "name": "Armadura Amaldiçoada",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/04-cursed.png",
    "minLevel": 17,
    "price": 920,
    "stats": {
      "defense": 54,
      "constitution": 4
    }
  },
  "armor_justice": {
    "id": "armor_justice",
    "name": "Armadura da Justiça",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/05-justice.png",
    "minLevel": 21,
    "price": 1120,
    "stats": {
      "defense": 66,
      "constitution": 5
    }
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
    }
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
    }
  },
  "armor_dragon": {
    "id": "armor_dragon",
    "name": "Armadura de Dragão",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/114-dragon.png",
    "minLevel": 33,
    "price": 1720,
    "stats": {
      "defense": 102,
      "constitution": 8
    }
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
    }
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
    }
  },
  "material_blue_coin": {
    "id": "material_blue_coin",
    "name": "Moeda Azul",
    "kind": "material",
    "imageUrl": "/assets/items/materials/blue_coin.png",
    "minLevel": 1,
    "price": 15,
    "goldCoinPrice": 2,
    "stats": {},
    "description": "Moeda para participar da arena."
  },
  "material_gold_coin": {
    "id": "material_gold_coin",
    "name": "Moeda da Arena",
    "kind": "material",
    "imageUrl": "/assets/items/materials/gold_coin.png",
    "minLevel": 1,
    "price": 15,
    "stats": {},
    "description": "Moeda recompensa da arena."
  },
  "material_bone": {
    "id": "material_bone",
    "name": "Osso",
    "kind": "material",
    "imageUrl": "/assets/items/materials/bone.png",
    "minLevel": 1,
    "price": 15,
    "stats": {},
    "description": "Material de criação e aprimoramento."
  },
  "material_celena": {
    "id": "material_celena",
    "name": "Celena",
    "kind": "material",
    "imageUrl": "/assets/items/materials/celena.png",
    "minLevel": 1,
    "price": 15,
    "stats": {},
    "description": "Material de criação e aprimoramento."
  },
  "material_chimera_jewell": {
    "id": "material_chimera_jewell",
    "name": "Joia de Quimera",
    "kind": "material",
    "imageUrl": "/assets/items/materials/chimera_jewell.png",
    "minLevel": 1,
    "price": 15,
    "stats": {},
    "description": "Material de criação e aprimoramento."
  },
  "material_dark_magic_rune": {
    "id": "material_dark_magic_rune",
    "name": "Runa de Magia Sombria",
    "kind": "material",
    "imageUrl": "/assets/items/materials/dark_magic_rune.png",
    "minLevel": 2,
    "price": 22,
    "stats": {},
    "description": "Material de criação e aprimoramento."
  },
  "material_dark_residue": {
    "id": "material_dark_residue",
    "name": "Residuo Sombrio",
    "kind": "material",
    "imageUrl": "/assets/items/materials/dark_residue.png",
    "minLevel": 2,
    "price": 22,
    "stats": {},
    "description": "Material de criação e aprimoramento."
  },
  "material_dexerity_jewell": {
    "id": "material_dexerity_jewell",
    "name": "Joia de Destreza",
    "kind": "material",
    "imageUrl": "/assets/items/materials/dexerity_jewell.png",
    "minLevel": 2,
    "price": 22,
    "stats": {},
    "description": "Material de criação e aprimoramento."
  },
  "material_dragon_essence": {
    "id": "material_dragon_essence",
    "name": "Essência de Dragão",
    "kind": "material",
    "imageUrl": "/assets/items/materials/dragon_essence.png",
    "minLevel": 2,
    "price": 22,
    "stats": {},
    "description": "Material de criação e aprimoramento."
  },
  "material_dragon_jewell": {
    "id": "material_dragon_jewell",
    "name": "Joia de Dragão",
    "kind": "material",
    "imageUrl": "/assets/items/materials/dragon_jewell.png",
    "minLevel": 3,
    "price": 29,
    "stats": {},
    "description": "Material de criação e aprimoramento."
  },
  "material_dragon_nail": {
    "id": "material_dragon_nail",
    "name": "Garra de Dragão",
    "kind": "material",
    "imageUrl": "/assets/items/materials/dragon_nail.png",
    "minLevel": 3,
    "price": 29,
    "stats": {},
    "description": "Material de criação e aprimoramento."
  },
  "material_dragons_tooth": {
    "id": "material_dragons_tooth",
    "name": "Dente de Dragão",
    "kind": "material",
    "imageUrl": "/assets/items/materials/dragons_tooth.png",
    "minLevel": 3,
    "price": 29,
    "stats": {},
    "description": "Material de criação e aprimoramento."
  },
  "material_energy_jewell": {
    "id": "material_energy_jewell",
    "name": "Joia de Energia",
    "kind": "material",
    "imageUrl": "/assets/items/materials/energy_jewell.png",
    "minLevel": 3,
    "price": 29,
    "stats": {},
    "description": "Material de criação e aprimoramento."
  },
  "material_eran_fragment": {
    "id": "material_eran_fragment",
    "name": "Fragmento de Eran",
    "kind": "material",
    "imageUrl": "/assets/items/materials/eran_fragment.png",
    "minLevel": 4,
    "price": 36,
    "stats": {},
    "description": "Material de criação e aprimoramento."
  },
  "material_green_coin": {
    "id": "material_green_coin",
    "name": "Moeda Verde",
    "kind": "material",
    "imageUrl": "/assets/items/materials/green_coin.png",
    "minLevel": 4,
    "price": 36,
    "stats": {},
    "description": "Material de criação e aprimoramento."
  },
  "material_gromin_mycelium": {
    "id": "material_gromin_mycelium",
    "name": "Micelio de Gromin",
    "kind": "material",
    "imageUrl": "/assets/items/materials/gromin_mycelium.png",
    "minLevel": 4,
    "price": 36,
    "stats": {},
    "description": "Material de criação e aprimoramento."
  },
  "material_herb": {
    "id": "material_herb",
    "name": "Erva",
    "kind": "material",
    "imageUrl": "/assets/items/materials/herb.png",
    "minLevel": 4,
    "price": 36,
    "stats": {},
    "description": "Material de criação e aprimoramento."
  },
  "material_laede_fragment": {
    "id": "material_laede_fragment",
    "name": "Fragmento de Laede",
    "kind": "material",
    "imageUrl": "/assets/items/materials/laede_fragment.png",
    "minLevel": 5,
    "price": 43,
    "stats": {},
    "description": "Material de criação e aprimoramento."
  },
  "material_magic_essence": {
    "id": "material_magic_essence",
    "name": "Essência Mágica",
    "kind": "material",
    "imageUrl": "/assets/items/materials/magic_essence.png",
    "minLevel": 5,
    "price": 43,
    "stats": {},
    "description": "Material de criação e aprimoramento."
  },
  "material_midran": {
    "id": "material_midran",
    "name": "Midran",
    "kind": "material",
    "imageUrl": "/assets/items/materials/midran.png",
    "minLevel": 5,
    "price": 43,
    "stats": {},
    "description": "Material de criação e aprimoramento."
  },
  "material_mycelium_fungus": {
    "id": "material_mycelium_fungus",
    "name": "Fungo Micelial",
    "kind": "material",
    "imageUrl": "/assets/items/materials/mycelium_fungus.png",
    "minLevel": 5,
    "price": 43,
    "stats": {},
    "description": "Material de criação e aprimoramento."
  },
  "material_mysterious_jewell": {
    "id": "material_mysterious_jewell",
    "name": "Joia Misteriosa",
    "kind": "material",
    "imageUrl": "/assets/items/materials/mysterious_jewell.png",
    "minLevel": 6,
    "price": 50,
    "stats": {},
    "description": "Material de criação e aprimoramento."
  },
  "material_old_stone": {
    "id": "material_old_stone",
    "name": "Pedra Antiga",
    "kind": "material",
    "imageUrl": "/assets/items/materials/old_stone.png",
    "minLevel": 6,
    "price": 50,
    "stats": {},
    "description": "Material de criação e aprimoramento."
  },
  "material_purple_coin": {
    "id": "material_purple_coin",
    "name": "Moeda Roxa",
    "kind": "material",
    "imageUrl": "/assets/items/materials/purple_coin.png",
    "minLevel": 6,
    "price": 50,
    "stats": {},
    "description": "Material de criação e aprimoramento."
  },
  "material_spectre_fragment": {
    "id": "material_spectre_fragment",
    "name": "Fragmento Espectral",
    "kind": "material",
    "imageUrl": "/assets/items/materials/spectre_fragment.png",
    "minLevel": 6,
    "price": 50,
    "stats": {},
    "description": "Material de criação e aprimoramento."
  },
  "material_spectre_jewell": {
    "id": "material_spectre_jewell",
    "name": "Joia Espectral",
    "kind": "material",
    "imageUrl": "/assets/items/materials/spectre_jewell.png",
    "minLevel": 7,
    "price": 57,
    "stats": {},
    "description": "Material de criação e aprimoramento."
  },
  "material_stone_fragment": {
    "id": "material_stone_fragment",
    "name": "Fragmento de Pedra",
    "kind": "material",
    "imageUrl": "/assets/items/materials/stone_fragment.png",
    "minLevel": 7,
    "price": 57,
    "stats": {},
    "description": "Material de criação e aprimoramento."
  },
  "material_strenght_jewell": {
    "id": "material_strenght_jewell",
    "name": "Joia de Força",
    "kind": "material",
    "imageUrl": "/assets/items/materials/strenght_jewell.png",
    "minLevel": 7,
    "price": 57,
    "stats": {},
    "description": "Material de criação e aprimoramento."
  },
  "material_udania": {
    "id": "material_udania",
    "name": "Udania",
    "kind": "material",
    "imageUrl": "/assets/items/materials/udania.png",
    "minLevel": 7,
    "price": 57,
    "stats": {},
    "description": "Material de criação e aprimoramento."
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
    "name": "Pedra de Dragão",
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
    "name": "Pedra de Eran",
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
    "name": "Erva Rústica",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/herb_rustic.png",
    "minLevel": 3,
    "price": 36,
    "stats": {},
    "description": "Item variado usado em receitas, chaves e eventos."
  },
  "misc_high_dungeon_key": {
    "id": "misc_high_dungeon_key",
    "name": "Chave de Masmorra Avançada",
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
    "name": "Pergaminho das Terras Mágicas",
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
    "name": "Semente Rústica",
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
    "name": "Pedra de Criação",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/stone-craft.png",
    "minLevel": 6,
    "price": 60,
    "stats": {},
    "description": "Item variado usado em receitas, chaves e eventos."
  },
  "energy_potion": {
    "id": "energy_potion",
    "name": "Poção de Energia",
    "kind": "potion",
    "imageUrl": "/assets/items/potions/energy-30.png",
    "minLevel": 1,
    "price": 3000,
    "stats": {
      "energyPercent": 0.3
    },
    "description": "Recupera 30% da energia máxima"
  },
  "energy_potion_light": {
    "id": "energy_potion_light",
    "name": "Poção de Energia Leve",
    "kind": "potion",
    "imageUrl": "/assets/items/potions/energy-light.png",
    "minLevel": 1,
    "price": 30,
    "stats": {
      "energy": 6
    },
    "description": "Recupera 6 de energia"
  },
  "energy_potion_medium": {
    "id": "energy_potion_medium",
    "name": "Poção de Energia Media",
    "kind": "potion",
    "imageUrl": "/assets/items/potions/energy-medium.png",
    "minLevel": 1,
    "price": 400,
    "stats": {
      "energy": 50
    },
    "description": "Recupera 50 de energia"
  },
  "energy_potion_high": {
    "id": "energy_potion_high",
    "name": "Poção de Energia Alta",
    "kind": "potion",
    "imageUrl": "/assets/items/potions/energy-high.png",
    "minLevel": 1,
    "price": 5000,
    "goldCoinPrice": 8,
    "stats": {
      "energy": 400
    },
    "description": "Recupera 400 de energia"
  },
  "health_potion": {
    "id": "health_potion",
    "name": "Poção de Vida",
    "kind": "potion",
    "imageUrl": "/assets/items/potions/health-30.png",
    "minLevel": 1,
    "price": 3000,
    "stats": {
      "healPercent": 0.3
    },
    "description": "Recupera 30% da vida máxima"
  },
  "health_potion_light": {
    "id": "health_potion_light",
    "name": "Poção de Vida Leve",
    "kind": "potion",
    "imageUrl": "/assets/items/potions/health-light.png",
    "minLevel": 1,
    "price": 30,
    "stats": {
      "heal": 30
    },
    "description": "Recupera 30 de vida"
  },
  "health_potion_medium": {
    "id": "health_potion_medium",
    "name": "Poção de Vida Media",
    "kind": "potion",
    "imageUrl": "/assets/items/potions/health-medium.png",
    "minLevel": 1,
    "price": 400,
    "stats": {
      "heal": 300
    },
    "description": "Recupera 300 de vida"
  },
  "health_potion_high": {
    "id": "health_potion_high",
    "name": "Poção de Vida Alta",
    "kind": "potion",
    "imageUrl": "/assets/items/potions/health-high.png",
    "minLevel": 1,
    "price": 5000,
    "goldCoinPrice": 8,
    "stats": {
      "heal": 3000
    },
    "description": "Recupera 3000 de vida"
  },
  "potion_mana": {
    "id": "potion_mana",
    "name": "Poção de Mana",
    "kind": "potion",
    "imageUrl": "/assets/items/potions/mana.png",
    "minLevel": 1,
    "price": 20,
    "stats": {
      "energyPercent": 0.2
    },
    "description": "Recupera 20% da energia máxima"
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
  },
  "weapon_greatsword_2": {
    "id": "weapon_greatsword_2",
    "name": "Espadão 2",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/greatsword_2.png",
    "minLevel": 19,
    "price": 915,
    "stats": {
      "strength": 61
    }
  },
  "weapon_greatsword_4": {
    "id": "weapon_greatsword_4",
    "name": "Espadão 4",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/greatsword_4.png",
    "minLevel": 21,
    "price": 1005,
    "stats": {
      "strength": 67
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
  },
  "novice_amulet": {
    "id": "novice_amulet",
    "name": "Amuleto do Aprendiz",
    "kind": "amulet", 
    "slot": "amulet",
    "imageUrl": "/assets/items/amulet/bone_gray.png",
    "minLevel": 1,
    "price": 70,
    "stats": {
      "agility": 2,
      "constitution": 1
    }
  },
  "hunter_charm": {
    "id": "hunter_charm",
    "name": "Talisma do Caçador",
    "kind": "amulet",
    "slot": "amulet",
    "imageUrl": "/assets/items/amulet/cylinder_gray.png",
    "minLevel": 10,
    "price": 160,
    "stats": {
      "agility": 3,
      "constitution": 3,
      "strength": 2
    }
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
    }
  },
  "guardian_mail": {
    "id": "guardian_mail",
    "name": "Cota do Guardião",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/05-justice.png",
    "minLevel": 6,
    "price": 330,
    "stats": {
      "defense": 14,
      "constitution": 4
    }
  },
  "moon_amulet": {
    "id": "moon_amulet",
    "name": "Amuleto Lunar",
    "kind": "amulet",
    "slot": "amulet",
    "imageUrl": "/assets/items/amulet/stone_2_blue.png",
    "minLevel": 25,
    "price": 420,
    "stats": {
      "agility": 7,
      "constitution": 4
    }
  },
  "acid_amulet": {
    "id": "acid_amulet",
    "name": "Amuleto Ácido",
    "kind": "amulet",
    "slot": "amulet",
    "imageUrl": "/assets/items/amulet/stone_2_green.png",
    "minLevel": 25,
    "price": 420,
    "stats": {
      "strength": 5,
      "defense": 10
    }
  },
  "crystal_white_amulet": {
    "id": "crystal_white_amulet",
    "name": "Amuleto de Cristal Branco",
    "kind": "amulet",
    "slot": "amulet",
    "imageUrl": "/assets/items/amulet/crystal_white.png",
    "minLevel": 45,
    "price": 4200,
    "stats": {
      "agility": 35
    }
  },
  "celtic_yellow_amulet": {
    "id": "celtic_yellow_amulet",
    "name": "Amuleto Celta",
    "kind": "amulet",
    "slot": "amulet",
    "imageUrl": "/assets/items/amulet/celtic_yellow.png",
    "minLevel": 45,
    "price": 4200,
    "stats": {
      "strength": 45,
      "constitution": 20
    }
  },
  "celtic_magenta_amulet": {
    "id": "celtic_magenta_amulet",
    "name": "Amuleto Divino",
    "kind": "amulet",
    "slot": "amulet",
    "imageUrl": "/assets/items/amulet/stone_3_magenta.png",
    "minLevel": 55,
    "price": 4200,
    "stats": {
      "defense": 65,
      "constitution": 35
    }
  },
  "celtic_orange_amulet": {
    "id": "celtic_orange_amulet",
    "name": "Amuleto Pentagonal",
    "kind": "amulet",
    "slot": "amulet",
    "imageUrl": "/assets/items/amulet/penta_orange.png",
    "minLevel": 65,
    "price": 4200,
    "stats": {
      "agility": 75,
      "strength": 55,
    }
  },
  "celtic_cyan_amulet": {
    "id": "celtic_cyan_amulet",
    "name": "Amuleto Ciano",
    "kind": "amulet",
    "slot": "amulet",
    "imageUrl": "/assets/items/amulet/ring_cyan.png",
    "minLevel": 75,
    "price": 4200,
    "stats": {
      "agility": 80,
      "strength": 80,
      "defense": 80,
      "constitution": 80
    }
  },
  "major_health_potion": {
    "id": "major_health_potion",
    "name": "Poção Vital Rara",
    "kind": "potion",
    "imageUrl": "/assets/items/potions/health.png",
    "minLevel": 5,
    "price": 6000,
    "goldCoinPrice": 5,
    "stats": {
      "healPercent": 0.55
    },
    "description": "Recupera 55% da vida máxima"
  },
  "major_energy_potion": {
    "id": "major_energy_potion",
    "name": "Poção Energética Rara",
    "kind": "potion",
    "imageUrl": "/assets/items/potions/energy.png",
    "minLevel": 5,
    "price": 6000,
    "goldCoinPrice": 5,
    "stats": {
      "energyPercent": 0.55
    },
    "description": "Recupera 55% da energia máxima"
  },
  "oblivion_scroll": {
    "id": "oblivion_scroll",
    "name": "Pergaminho do Esquecimento",
    "kind": "scroll",
    "imageUrl": "/assets/items/misc/enhanced-parchment.png",
    "minLevel": 1,
    "price": 180,
    "goldCoinPrice": 3,
    "stats": {},
    "description": "Reseta talentos sem gastar diamantes"
  },
  "memory_scroll": {
    "id": "memory_scroll",
    "name": "Pergaminho da Memória",
    "kind": "scroll",
    "imageUrl": "/assets/items/misc/fraddo-parchment.png",
    "minLevel": 1,
    "price": 180,
    "goldCoinPrice": 3,
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
    "description": "Material comum de caça"
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
  { id: "off_power_1", category: "offensive", name: "Golpe firme", description: "+4% dano", maxRank: 3, costPerRank: 1, icon: "damage" },
  { id: "off_strength_1", category: "offensive", name: "Braço treinado", description: "+2 FOR por rank", maxRank: 3, costPerRank: 1, requires: "off_power_1", icon: "strength" },
  { id: "off_crit_1", category: "offensive", name: "Instinto letal", description: "+2% crítico por rank", maxRank: 3, costPerRank: 1, requires: "off_strength_1", icon: "crit" },
  { id: "off_agility_1", category: "offensive", name: "Ataque fluido", description: "+2 AGI por rank", maxRank: 3, costPerRank: 2, requires: "off_crit_1", icon: "agility" },
  { id: "off_crit_damage_1", category: "offensive", name: "Corte profundo", description: "+15% dano crítico por rank", maxRank: 3, costPerRank: 2, requires: "off_agility_1", icon: "crit" },
  { id: "off_power_2", category: "offensive", name: "Executor", description: "+7% dano por rank", maxRank: 3, costPerRank: 3, requires: "off_crit_damage_1", icon: "damage" },
  { id: "def_vitality_1", category: "defensive", name: "Fôlego de aço", description: "+5% vida", maxRank: 3, costPerRank: 1, icon: "life" },
  { id: "def_constitution_1", category: "defensive", name: "Corpo resiliente", description: "+2 CON por rank", maxRank: 3, costPerRank: 1, requires: "def_vitality_1", icon: "life" },
  { id: "def_armor_1", category: "defensive", name: "Postura de guarda", description: "+2 DEF por rank", maxRank: 4, costPerRank: 1, requires: "def_constitution_1", icon: "defense" },
  { id: "def_dodge_1", category: "defensive", name: "Passo evasivo", description: "+2% esquiva por rank", maxRank: 3, costPerRank: 2, requires: "def_armor_1", icon: "dodge" },
  { id: "def_agility_1", category: "defensive", name: "Reflexos calmos", description: "+2 AGI por rank", maxRank: 3, costPerRank: 2, requires: "def_dodge_1", icon: "agility" },
  { id: "def_vitality_2", category: "defensive", name: "Muralha viva", description: "+8% vida por rank", maxRank: 3, costPerRank: 3, requires: "def_agility_1", icon: "life" },
  { id: "util_xp_1", category: "utility", name: "Aprendizado rápido", description: "+5% XP por rank", maxRank: 4, costPerRank: 1, icon: "xp" },
  { id: "util_gold_1", category: "utility", name: "Olho mercante", description: "+5% gold por rank", maxRank: 4, costPerRank: 1, requires: "util_xp_1", icon: "gold" },
  { id: "util_drop_1", category: "utility", name: "Mãos sortudas", description: "+4% drop por rank", maxRank: 4, costPerRank: 2, requires: "util_gold_1", icon: "drop" },
  { id: "util_energy_1", category: "utility", name: "Ritmo de marcha", description: "+1 energia máxima por rank", maxRank: 4, costPerRank: 2, requires: "util_drop_1", icon: "energy" },
  { id: "util_xp_2", category: "utility", name: "Memória arcana", description: "+8% XP por rank", maxRank: 3, costPerRank: 3, requires: "util_energy_1", icon: "xp" },
  { id: "util_drop_2", category: "utility", name: "Destino generoso", description: "+8% drop por rank", maxRank: 3, costPerRank: 3, requires: "util_xp_2", icon: "drop" },
  { id: "regen_hp_1", category: "utility", name: "Regeneração vital", description: "+3% regen de vida por rank", maxRank: 3, costPerRank: 2, requires: "util_drop_2", icon: "life" },
  { id: "regen_energy_1", category: "utility", name: "Regeneração de energia", description: "+3% regen de energia por rank", maxRank: 3, costPerRank: 2, requires: "regen_hp_1", icon: "energy" }
];

export const DIAMOND_PACKAGES: GameShopPackage[] = [
  {
    id: "friend_of_king",
    name: "Amigo do Rei",
    diamonds: 200,
    priceLabel: "R$ 49,90",
    bonusLabel: "100 tickets de trem, 30 tickets de navio, auto PvE e selo real por 30 dias",
    description: "Pacote especial com diamantes, tickets e privilégios reais temporários.",
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
  { id: "clan_members_1", category: "prosperity", name: "Alojamentos", description: "+2 membros no limite do clã por rank", maxRank: 15, costPerRank: { gold: 145000, diamonds: 70 }, requires: "clan_energy_1", icon: "members" },
  { id: "clan_inventory_1", category: "prosperity", name: "Depósito compartilhado", description: "+2 espaços de inventário para cada membro por rank", maxRank: 10, costPerRank: { gold: 170000, diamonds: 80 }, requires: "clan_members_1", icon: "inventory" },
  { id: "clan_xp_2", category: "prosperity", name: "Mapas de campanha", description: "+2% XP por rank", maxRank: 4, costPerRank: { gold: 210000, diamonds: 100 }, requires: "clan_inventory_1", icon: "xp" },
  { id: "clan_gold_2", category: "prosperity", name: "Contratos mercantes", description: "+1,5% gold por rank", maxRank: 4, costPerRank: { gold: 250000, diamonds: 120 }, requires: "clan_xp_2", icon: "gold" },
  { id: "clan_drop_2", category: "prosperity", name: "Batedores de tesouro", description: "+1% drop por rank", maxRank: 4, costPerRank: { gold: 300000, diamonds: 140 }, requires: "clan_gold_2", icon: "drop" },
  { id: "clan_members_2", category: "prosperity", name: "Casas anexas", description: "+3 membros no limite do clã por rank", maxRank: 10, costPerRank: { gold: 360000, diamonds: 160 }, requires: "clan_drop_2", icon: "members" },
  { id: "clan_inventory_2", category: "prosperity", name: "Armazém maior", description: "+3 espaços de inventário para cada membro por rank", maxRank: 5, costPerRank: { gold: 430000, diamonds: 180 }, requires: "clan_members_2", icon: "inventory" },
  { id: "clan_energy_2", category: "prosperity", name: "Logística superior", description: "+1 energia por rank", maxRank: 3, costPerRank: { gold: 520000, diamonds: 220 }, requires: "clan_inventory_2", icon: "energy" },
  { id: "clan_members_3", category: "prosperity", name: "Distrito do clã", description: "+5 membros no limite do clã por rank", maxRank: 4, costPerRank: { gold: 650000, diamonds: 280 }, requires: "clan_energy_2", icon: "members" },
  { id: "clan_inventory_3", category: "prosperity", name: "Cofres expedicionários", description: "+5 espaços de inventário para cada membro por rank", maxRank: 4, costPerRank: { gold: 780000, diamonds: 340 }, requires: "clan_members_3", icon: "inventory" },
  { id: "clan_damage_3", category: "combat", name: "Ordem de ataque", description: "+1% dano por rank", maxRank: 5, costPerRank: { gold: 190000, diamonds: 80 }, requires: "clan_damage_2", icon: "damage" },
  { id: "clan_crit_2", category: "combat", name: "Tática de flanco", description: "+0,5% crítico por rank", maxRank: 4, costPerRank: { gold: 220000, diamonds: 10 }, requires: "clan_damage_3", icon: "crit" },
  { id: "clan_damage_4", category: "combat", name: "Legião ofensiva", description: "+1,5% dano por rank", maxRank: 3, costPerRank: { gold: 320000, diamonds: 14 }, requires: "clan_crit_2", icon: "damage" },
  { id: "clan_guard_2", category: "defense", name: "Escudos jurados", description: "+1 defesa por rank", maxRank: 5, costPerRank: { gold: 155000, diamonds: 6 }, requires: "clan_dodge_1", icon: "defense" },
  { id: "clan_vitality_2", category: "defense", name: "Enfermaria do clã", description: "+1,5% vida por rank", maxRank: 5, costPerRank: { gold: 190000, diamonds: 8 }, requires: "clan_guard_2", icon: "life" },
  { id: "clan_dodge_2", category: "defense", name: "Passos de patrulha", description: "+0,5% esquiva por rank", maxRank: 4, costPerRank: { gold: 260000, diamonds: 12 }, requires: "clan_vitality_2", icon: "dodge" }
];

export const CLAN_SUPER_BENEFITS: ClanSuperBenefitDefinition[] = [
  {
    id: "super_combat",
    category: "combat",
    name: "Mandato de Guerra",
    description: "Ativo com todos os ranks de Combate: +10% dano, +3% crítico e +20% dano crítico.",
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
    description: "Ativo com todos os ranks de Prosperidade: +10% XP, +10% gold, +5% drop, +5 energia, +10 inventário e +10 membros no clã.",
    icon: "gold"
  }
];

export const COUNTRIES: CountryDefinition[] = [
  {
    "id": "aurevia",
    "name": "Aurevia",
    "description": "País florestal de matas antigas, clareiras férteis, rios verdes e portos escondidos sob copas imensas.",
    "portCityId": "eldoria",
    "imageUrl": "/assets/locals/aurevia.png"
  },
  {
    "id": "valfria",
    "name": "Valfria",
    "description": "País desértico e seco, marcado por salinas, dunas ásperas, ventos quentes e cânions profundos.",
    "portCityId": "vila_de_valfria",
    "imageUrl": "/assets/locals/valfria.png"
  },
  {
    "id": "morthaly",
    "name": "Morthaly",
    "description": "País amaldiçoado, onde a névoa negra, os portos mortos e castelos necromânticos deformam a própria paisagem.",
    "portCityId": "porto_sombrio",
    "imageUrl": "/assets/locals/morthaly.png"
  }
];

export const WORK_SERVICES: WorkServiceDefinition[] = [
  {
    id: "aurevia_furnace_wood",
    countryId: "aurevia",
    name: "Coletar lenha para a fornalha",
    specialty: "Forjas e bosques protegidos",
    description: "Recolha madeira resinosa nas matas de Aurevia para manter as fornalhas reais acesas.",
    minMinutes: 15,
    maxMinutes: 480,
    minuteOptions: [15, 30, 60, 120, 240, 480],
    shortDurationBonusPercent: 0.28,
    aptitudeRewardBonusPercent: 0.07,
    rewardsPerHour: {
      experience: 18,
      gold: 55,
      items: [{ itemId: "material_old_stone", quantity: 0.18 }]
    },
    bonus: {
      level: 5,
      description: "Fornecimento da fornalha: resgate 2 Pedras Antigas a cada 20 horas.",
      periodicHours: 20,
      periodicReward: { items: [{ itemId: "material_old_stone", quantity: 2 }] }
    }
  },
  {
    id: "aurevia_mines",
    countryId: "aurevia",
    name: "Auxiliar nas minas",
    specialty: "Mineração e metalurgia",
    description: "Carregue minério, separe veios úteis e ajude os mestres de Ironhold na extração.",
    minMinutes: 120,
    maxMinutes: 600,
    minuteOptions: [120, 240, 360, 600],
    shortDurationBonusPercent: 0.2,
    aptitudeRewardBonusPercent: 0.08,
    rewardsPerHour: {
      experience: 26,
      gold: 80,
      items: [
        { itemId: "material_old_stone", quantity: 0.24 },
        { itemId: "material_eran_fragment", quantity: 0.08 }
      ]
    },
    bonus: {
      level: 6,
      description: "Braços de minerador: +2 Força permanente.",
      attributes: { strength: 2 }
    }
  },
  {
    id: "aurevia_tower_watch",
    countryId: "aurevia",
    name: "Vigia na torre",
    specialty: "Vigilância de estradas",
    description: "Observe as estradas antigas e sinalize movimentos suspeitos antes que alcancem as vilas.",
    minMinutes: 30,
    maxMinutes: 360,
    minuteOptions: [30, 60, 120, 180, 360],
    shortDurationBonusPercent: 0.24,
    aptitudeRewardBonusPercent: 0.06,
    rewardsPerHour: {
      experience: 24,
      gold: 42
    },
    bonus: {
      level: 4,
      description: "Olhos da muralha: +1 Agilidade permanente.",
      attributes: { agility: 1 }
    }
  },
  {
    id: "aurevia_merchant_escort",
    countryId: "aurevia",
    name: "Escolta de mercadores",
    specialty: "Rotas reais",
    description: "Acompanhe carroças entre bosques e fortalezas. A paga é boa, mas exige turnos longos.",
    minMinutes: 240,
    maxMinutes: 720,
    minuteOptions: [240, 360, 480, 720],
    shortDurationBonusPercent: 0.16,
    aptitudeRewardBonusPercent: 0.08,
    rewardsPerHour: {
      experience: 30,
      gold: 130,
      items: [{ itemId: "ticket_train", quantity: 0.05 }]
    },
    bonus: {
      level: 5,
      description: "Contratos de rota: +3% gold em todas as fontes.",
      goldBonusPercent: 0.03
    }
  },
  {
    id: "valfria_tavern_waiter",
    countryId: "valfria",
    name: "Garçom na taverna",
    specialty: "Hospitalidade fria",
    description: "Sirva viajantes exaustos, negocie gorjetas e mantenha a lareira acesa.",
    minMinutes: 20,
    maxMinutes: 360,
    minuteOptions: [20, 40, 60, 120, 240, 360],
    shortDurationBonusPercent: 0.32,
    aptitudeRewardBonusPercent: 0.06,
    rewardsPerHour: {
      experience: 15,
      gold: 75,
      items: [{ itemId: "health_potion_light", quantity: 0.12 }]
    },
    bonus: {
      level: 6,
      description: "Gorjetas constantes: +5% gold em todas as fontes.",
      goldBonusPercent: 0.05
    }
  },
  {
    id: "valfria_hospital",
    countryId: "valfria",
    name: "Ajudar os feridos no hospital",
    specialty: "Cuidado e alquimia prática",
    description: "Troque faixas, carregue macas e auxilie boticários em uma rotina silenciosa.",
    minMinutes: 60,
    maxMinutes: 480,
    minuteOptions: [60, 120, 240, 360, 480],
    shortDurationBonusPercent: 0.22,
    aptitudeRewardBonusPercent: 0.07,
    rewardsPerHour: {
      experience: 34,
      gold: 45,
      items: [{ itemId: "health_potion_medium", quantity: 0.08 }]
    },
    bonus: {
      level: 4,
      description: "Kit do hospital: resgate 2 poções de vida médias a cada 24 horas.",
      periodicHours: 24,
      periodicReward: { items: [{ itemId: "health_potion_medium", quantity: 2 }] }
    }
  },
  {
    id: "valfria_noble_tutor",
    countryId: "valfria",
    name: "Treinar filho de um nobre",
    specialty: "Etiqueta marcial",
    description: "Ensine postura, disciplina e sobrevivência básica a herdeiros protegidos demais.",
    minMinutes: 240,
    maxMinutes: 720,
    minuteOptions: [240, 360, 480, 720],
    shortDurationBonusPercent: 0.14,
    aptitudeRewardBonusPercent: 0.08,
    rewardsPerHour: {
      experience: 42,
      gold: 115,
      diamonds: 0.04,
      attributePoints: 0.018
    },
    bonus: {
      level: 7,
      description: "Metodologia nobre: +4% XP em todas as fontes.",
      xpBonusPercent: 0.04
    }
  },
  {
    id: "valfria_frozen_pass",
    countryId: "valfria",
    name: "Patrulhar os passos gelados",
    specialty: "Escolta nas montanhas",
    description: "Abra caminho entre névoa e neve para caravanas que atravessam Valfria.",
    minMinutes: 180,
    maxMinutes: 600,
    minuteOptions: [180, 300, 420, 600],
    shortDurationBonusPercent: 0.18,
    aptitudeRewardBonusPercent: 0.07,
    rewardsPerHour: {
      experience: 32,
      gold: 95,
      items: [{ itemId: "energy_potion_medium", quantity: 0.07 }]
    },
    bonus: {
      level: 5,
      description: "Passo firme: +1 Constituição permanente.",
      attributes: { constitution: 1 }
    }
  },
  {
    id: "morthaly_sewers",
    countryId: "morthaly",
    name: "Limpar esgotos assombrados",
    specialty: "Serviços perigosos",
    description: "Remova lodo necrótico e lacre pequenos ninhos de mortos inquietos sob as ruas.",
    minMinutes: 45,
    maxMinutes: 480,
    minuteOptions: [45, 90, 120, 240, 360, 480],
    shortDurationBonusPercent: 0.22,
    aptitudeRewardBonusPercent: 0.08,
    rewardsPerHour: {
      experience: 48,
      gold: 90,
      items: [{ itemId: "material_celena", quantity: 0.06 }]
    },
    bonus: {
      level: 4,
      description: "Pulmões de cripta: +2 Constituição permanente.",
      attributes: { constitution: 2 }
    }
  },
  {
    id: "morthaly_necropolis_watch",
    countryId: "morthaly",
    name: "Vigia na muralha da necrópole",
    specialty: "Defesa contra mortos",
    description: "Segure a linha quando sombras se mexem fora das torres violetas.",
    minMinutes: 180,
    maxMinutes: 720,
    minuteOptions: [180, 360, 540, 720],
    shortDurationBonusPercent: 0.18,
    aptitudeRewardBonusPercent: 0.08,
    rewardsPerHour: {
      experience: 56,
      gold: 110,
      items: [{ itemId: "material_midran", quantity: 0.05 }]
    },
    bonus: {
      level: 5,
      description: "Disciplina sombria: +1 Força e +1 Constituição permanentes.",
      attributes: { strength: 1, constitution: 1 }
    }
  },
  {
    id: "morthaly_rune_catalog",
    countryId: "morthaly",
    name: "Catalogar runas mortas",
    specialty: "Pesquisa necromântica",
    description: "Copie runas instáveis antes que elas mudem de forma. Serviço raro e bem pago.",
    minMinutes: 360,
    maxMinutes: 840,
    minuteOptions: [360, 480, 600, 840],
    shortDurationBonusPercent: 0.12,
    aptitudeRewardBonusPercent: 0.09,
    rewardsPerHour: {
      experience: 72,
      gold: 75,
      diamonds: 0.05,
      items: [
        { itemId: "misc_stone_craft", quantity: 0.04 },
        { itemId: "material_midran", quantity: 0.05 }
      ]
    },
    bonus: {
      level: 7,
      description: "Memória rúnica: +6% XP em todas as fontes.",
      xpBonusPercent: 0.06
    }
  },
  {
    id: "morthaly_shadow_caravan",
    countryId: "morthaly",
    name: "Escolta de caravanas sombrias",
    specialty: "Logística entre ilhas",
    description: "Proteja cargas raras entre portos negros. Turnos longos, recompensa alta.",
    minMinutes: 480,
    maxMinutes: 960,
    minuteOptions: [480, 600, 720, 960],
    shortDurationBonusPercent: 0.1,
    aptitudeRewardBonusPercent: 0.09,
    rewardsPerHour: {
      experience: 58,
      gold: 160,
      diamonds: 0.06,
      items: [{ itemId: "ticket_ship", quantity: 0.04 }]
    },
    bonus: {
      level: 8,
      description: "Contrato sombrio: resgate 2 diamantes a cada 36 horas.",
      periodicHours: 36,
      periodicReward: { diamonds: 2 }
    }
  }
];

export const CITIES: CityDefinition[] = [
  {
    "id": "eldoria",
    "countryId": "aurevia",
    "name": "Eldoria",
    "minLevel": 1,
    "travelCost": 0,
    "description": "Cidade portuária de Aurevia, erguida entre cais arborizados, canais verdes e bosques que chegam até o mar.",
    "isPort": true,
    "inhabitants": [
      "Borin Martelo-Firme",
      "Mira Folha-Clara",
      "Tomas Mar-Alto"
    ],
    "npcs": {
      "armorer": "Borin Martelo-Firme",
      "apothecary": "Mira Folha-Clara",
      "moneyChanger": "Tomas Mar-Alto"
    },
    "huntLocationIds": [
      "eldoria_training_fields",
      "eldoria_old_woods",
      "eldoria_sunken_ruins"
    ],
    "huntMonsterIds": [
      "training_dummy",
      "forest_rat",
      "gray_wolf",
      "anaconda_new",
      "black_mamba_new",
      "brown_ooze",
      "cursed_goblin",
      "clay_golem",
      "anubis_guard",
      "aberr",
      "centaur_demon",
      "damnation_elemental",
      "damnation_cyclops"
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
      "misc_eran",
      "scroll_fraddo_parchment",
      "energy_potion_light",
      "health_potion_light"
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
    "minLevel": 14,
    "travelCost": 45,
    "description": "Cidade de torres antigas entre campos abertos e florestas densas, vigiando rotas usadas por caçadores e saqueadores.",
    "inhabitants": [
      "Selene Vidro-Rubro",
      "Doran Bigorna"
    ],
    "npcs": {
      "blacksmith": "Doran Bigorna",
      "alchemist": "Selene Vidro-Rubro"
    },
    "dungeonMonsterIds": [
      "giant_spore",
      "giant_leech",
      "giant_toad",
      "damnation_golem",
      "damnation_harpy",
      "damnation_orc",
      "damnation_spider",
      "damnation_troll"
    ],
    "blacksmithEnhancement": true,
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
      "human_bandit",
      "deathcap",
      "damnation_golem",
      "damnation_harpy",
      "damnation_orc",
      "damnation_spider",
      "damnation_troll",
      "demoniac_wolf",
      "joree_plant",
      "giant_spore",
      "grey_bear",
      "grey_wolf",
      "guardian_serpent",
      "giant_toad",
      "giant_leech",
      "demon_dragon"
    ]
  },
  {
    "id": "ironhold",
    "countryId": "aurevia",
    "name": "Ironhold",
    "minLevel": 32,
    "travelCost": 130,
    "description": "Fortaleza montanhosa de Aurevia, cravada em picos de pedra, minas profundas e vales tomados por feras de altitude.",
    "inhabitants": [
      "Helga Forja-Alta",
      "Mestre Rurik"
    ],
    "npcs": {
      "armorer": "Helga Forja-Alta",
      "blacksmith": "Mestre Rurik"
    },
    "dungeonMonsterIds": [
      "hell_lizard",
      "hell_worm",
      "hill_giant_new",
      "joree_giant",
      "joree_walker",
      "ogre_mage",
      "ogre",
      "orc_knight"
    ],
    "blacksmithRecipeIds": [
      "forge_ember_blade",
      "forge_guardian_mail"
    ],
    "huntLocationIds": [
      "ironhold_ember_mines",
      "ironhold_beast_caves",
      "ironhold_giant_valley"
    ],
    "huntMonsterIds": [
      "deep_dwarf",
      "ember_golem",
      "cave_wyvern",
      "dorrene_orc",
      "dorrene_snake",
      "emperor_scorpion",
      "eye_of_devastation_new",
      "giant_ant",
      "giant_gecko",
      "giant_scorpion",
      "grey_rat",
      "hell_lizard",
      "hell_salamander",
      "hell_worm",
      "hill_giant_new",
      "infernal_serpent",
      "jelly",
      "joree_giant",
      "joree_walker",
      "labrat_unseen",
      "ogre_mage",
      "ogre",
      "orc_knight",
      "rock_troll",
      "easter_bunny"
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
    ]
  },
  {
    "id": "vila_de_valfria",
    "countryId": "valfria",
    "name": "Vila de Valfria",
    "minLevel": 57,
    "travelCost": 130,
    "description": "Vila portuária de Valfria, onde navios chegam por canais de sal e caravanas partem rumo ao deserto seco.",
    "isPort": true,
    "inhabitants": [
      "Helga Forja-Alta",
      "Orin Cinza-Viva",
      "Caio Cartas"
    ],
    "npcs": {
      "apothecary": "Orin Cinza-Viva",
      "blacksmith": "Helga Forja-Alta",
      "moneyChanger": "Caio Cartas"
    },
    "dungeonMonsterIds": [
      "skeleton_snake",
      "skeleton_quadruped_small",
      "demon_desert_giant",
      "demoniac_elephant",
      "salamander_firebrand",
      "skeleton_centaur",
      "skeleton_naga",
      "skeleton_ugly_thing"
    ],
    "blacksmithRecipeIds": [
      "forge_ember_blade",
      "forge_guardian_mail"
    ],
    "huntLocationIds": [
      "valfria_orc_marsh",
      "valfria_bone_fields",
      "valfria_spectral_mire"
    ],
    "huntMonsterIds": [
      "demon_desert_giant",
      "demoniac_elephant",
      "desert_giant",
      "desert_walker",
      "desert_worm",
      "orc_warrior",
      "orc",
      "pulsating_lump",
      "redback_new",
      "salamander_firebrand",
      "salamander",
      "sand_elemental",
      "sand_spider",
      "skeleton_bat",
      "skeleton_centaur",
      "skeleton_naga",
      "skeleton_quadruped_large_new",
      "skeleton_quadruped_small",
      "skeleton_snake",
      "skeleton_ugly_thing",
      "mummy",
      "damnation_scorpion",
      "damnation_snake"
    ],
    "apothecaryItemIds": [
      "misc_eran",
      "misc_laede",
      "misc_stone_craft",
      "material_old_stone",
      "material_eran_fragment",
      "material_celena",
      "material_midran",
      "energy_potion_light",
      "energy_potion_medium",
      "health_potion_light",
      "health_potion_medium"
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
    "minLevel": 80,
    "travelCost": 130,
    "description": "Cidade entre cânions de Valfria, cercada por gargantas avermelhadas, pontes estreitas e ravinas cheias de ecos.",
    "inhabitants": [
      "Helga Forja-Alta",
      "Orin Cinza-Viva",
      "Sentinela Rosin",
      "Caelum, o Mercador"
    ],
    "npcs": {
      "armorer": "Helga Forja-Alta",
      "blacksmith": "Sentinela Rosin",
      "alchemist": "Orin Cinza-Viva",
      "goldCoinMerchant": "Caelum, o Mercador"
    },
    "dungeonMonsterIds": [
      "spectral_naga_old",
      "viper",
      "spectral_quadruped_small_old",
      "spectral_spider_old",
      "spectral_thing",
      "spectral_worm",
      "two_headed_ogre",
      "wolf_spider_new"
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
      "spectral_ant_old",
      "spectral_bat_old",
      "spectral_bee_old",
      "spectral_centaur_old",
      "spectral_naga_old",
      "spectral_quadruped_small_old",
      "spectral_spider_old",
      "spectral_thing",
      "spectral_worm",
      "two_headed_ogre",
      "viper",
      "wolf_spider_new",
      "wolf_spider_old",
      "spectral_snake_old"
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
      "weapon_vorgonax",
      "acid_amulet"
    ],
    "goldCoinMerchantItemIds": [
      "material_blue_coin",
      "energy_potion_high",
      "health_potion_high",
      "major_health_potion",
      "major_energy_potion",
      "oblivion_scroll",
      "memory_scroll"
    ]
  },
  {
    "id": "porto_sombrio",
    "countryId": "morthaly",
    "name": "Porto Sombrio",
    "minLevel": 94,
    "travelCost": 180,
    "description": "Porto amaldiçoado de Morthaly, com cais de pedra negra, navios silenciosos e marés que trazem restos de criaturas mortas.",
    "isPort": true,
    "inhabitants": [
      "Marechal Voss",
      "Orives Nulo",
      "Barqueiro Naren"
    ],
    "npcs": {
      "blacksmith": "Orives Nulo",
      "moneyChanger": "Barqueiro Naren"
    },
    "dungeonMonsterIds": [
      "zombie_crab",
      "zombie_kraken_head",
      "zombie_kraken_infected",
      "zombie_octopode_infected",
      "zombie_octopode",
      "zombie_turtle_infected",
      "spectral_fish_old"
    ],
    "blacksmithRecipeIds": [
      "forge_ember_blade",
      "forge_guardian_mail"
    ],
    "huntLocationIds": [
      "morthaly_black_docks"
    ],
    "huntMonsterIds": [
      "zombie_crab",
      "zombie_kraken_head",
      "zombie_kraken_infected",
      "zombie_octopode_infected",
      "zombie_octopode",
      "zombie_turtle_infected",
      "zombie_turtle",
      "spectral_fish_old",
      "zombie_lizard_infected",
      "zombie_lizard",
      "zombie_rat"
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
    "id": "necropole_de_morthaly",
    "countryId": "morthaly",
    "name": "Necrópole de Morthaly",
    "minLevel": 105,
    "travelCost": 220,
    "description": "Imenso castelo-necrópole de Morthaly, feito de muralhas, criptas, torres violetas e salões onde a morte ainda governa.",
    "inhabitants": [
      "Vigilia Nox",
      "Ferreiro Ossian",
      "Sibilante Eron"
    ],
    "npcs": {
      "armorer": "Vigilia Nox",
      "blacksmith": "Ferreiro Ossian",
      "alchemist": "Arquimago Kael"
    },
    "dungeonMonsterIds": [
      "zombie_hound",
      "zombie_drake_infected",
      "zombie_drake",
      "zombie_ogre_infected",
      "zombie_ogre",
      "zombie_small",
      "zombie_ugly_thing_infected",
      "zombie_ugly_thing"
    ],
    "blacksmithEnhancement": true,
    "alchemistRecipeIds": [
      "brew_major_health",
      "brew_major_energy",
      "bind_moon_amulet"
    ],
    "huntLocationIds": [
      "morthaly_runic_wastes",
      "morthaly_lich_spire"
    ],
    "huntMonsterIds": [
      "damnation_mummy",
      "demon_bareon",
      "skeleton_dragon",
      "spectral_dragon_old",
      "spectral_hydra_3_old",
      "zombie_hound_infected",
      "zombie_hound",
      "zombie_drake_infected",
      "zombie_drake",
      "zombie_ogre_infected",
      "zombie_ogre",
      "zombie_small",
      "zombie_toad",
      "zombie_ugly_thing_infected",
      "zombie_ugly_thing"
    ],
    "armorerItemIds": [
      "armor_death",
      "armor_dragon",
      "armor_dhron",
      "armor_erins",
      "weapon_real_axe",
      "weapon_triple_sword_2",
      "weapon_triple_sword_3",
      "weapon_vorgonax",
      "celtic_cyan_amulet"
    ]
  }
];

export const HUNTING_LOCATIONS: Record<string, HuntingLocationDefinition> = {
  "eldoria_training_fields": {
    "id": "eldoria_training_fields",
    "cityId": "eldoria",
    "name": "Cais Verde de Treino",
    "description": "Área segura entre o porto arborizado e a mata baixa, onde recrutas enfrentam pragas pequenas sob vigia dos guardas.",
    "monsterIds": [
      "training_dummy",
      "forest_rat",
      "gray_wolf",
      "anaconda_new"
    ]
  },
  "eldoria_old_woods": {
    "id": "eldoria_old_woods",
    "cityId": "eldoria",
    "name": "Bosque Antigo de Eldoria",
    "description": "Trilhas úmidas sob árvores centenárias, tomadas por serpentes, lodos de mangue e criaturas que protegem raízes antigas.",
    "monsterIds": [
      "black_mamba_new",
      "brown_ooze",
      "cursed_goblin",
      "clay_golem"
    ]
  },
  "eldoria_sunken_ruins": {
    "id": "eldoria_sunken_ruins",
    "cityId": "eldoria",
    "name": "Ruínas do Estuário",
    "description": "Pedras afundadas entre raízes e água salobra, onde a floresta encontra o mar e a magia antiga apodrece em silêncio.",
    "monsterIds": [
      "aberr",
      "centaur_demon",
      "damnation_elemental",
      "damnation_cyclops"
    ]
  },
  "ravenspire_bandit_road": {
    "id": "ravenspire_bandit_road",
    "cityId": "ravenspire",
    "name": "Campos dos Corvos",
    "description": "Campos altos e trilhas abertas onde saqueadores se escondem entre moitas, javalis e lobos que rondam as caravanas.",
    "monsterIds": [
      "road_bandit",
      "human_bandit",
      "thorn_boar",
      "grey_wolf",
      "grey_bear"
    ]
  },
  "ravenspire_damned_lands": {
    "id": "ravenspire_damned_lands",
    "cityId": "ravenspire",
    "name": "Mata dos Espinhos Negros",
    "description": "Trecho fechado da floresta de Ravenspire, tomado por fungos, plantas agressivas e feras que caçam sob a sombra das torres.",
    "monsterIds": [
      "deathcap",
      "joree_plant",
      "giant_spore",
      "giant_leech",
      "giant_toad"
    ]
  },
  "ravenspire_desert_pass": {
    "id": "ravenspire_desert_pass",
    "cityId": "ravenspire",
    "name": "Bosque da Torre Sombria",
    "description": "Bosque corrompido próximo às antigas torres, onde a mata ainda é viva, mas responde à presença de criaturas danadas.",
    "monsterIds": [
      "damnation_golem",
      "damnation_harpy",
      "damnation_orc",
      "damnation_spider",
      "damnation_troll"
    ]
  },
  "ironhold_ember_mines": {
    "id": "ironhold_ember_mines",
    "cityId": "ironhold",
    "name": "Minas de Brasa",
    "description": "Túneis quentes sob Ironhold, onde veios incandescentes atraem anões hostis, orcs das rochas e criaturas de fogo.",
    "monsterIds": [
      "deep_dwarf",
      "ember_golem",
      "cave_wyvern",
      "dorrene_orc",
      "eye_of_devastation_new",
      "hell_salamander"
    ]
  },
  "ironhold_beast_caves": {
    "id": "ironhold_beast_caves",
    "cityId": "ironhold",
    "name": "Grutas Serranas",
    "description": "Cavernas frias e irregulares das montanhas, infestadas por insetos gigantes, répteis de pedra e vermes infernais.",
    "monsterIds": [
      "giant_ant",
      "giant_gecko",
      "giant_scorpion",
      "grey_rat",
      "hell_lizard",
      "hell_worm"
    ]
  },
  "ironhold_giant_valley": {
    "id": "ironhold_giant_valley",
    "cityId": "ironhold",
    "name": "Vale dos Gigantes",
    "description": "Desfiladeiros de altitude onde gigantes, ogros e cavaleiros orcs disputam pontes naturais e antigas rotas de minério.",
    "monsterIds": [
      "hill_giant_new",
      "joree_giant",
      "joree_walker",
      "ogre_mage",
      "ogre",
      "orc_knight"
    ]
  },
  "valfria_orc_marsh": {
    "id": "valfria_orc_marsh",
    "cityId": "vila_de_valfria",
    "name": "Cais do Sal Morto",
    "description": "Porto seco de Valfria, cercado por salinas rachadas, armazéns queimados pelo sol e patrulhas orcs entre as docas.",
    "monsterIds": [
      "orc_warrior",
      "orc",
      "redback_new",
      "salamander",
      "sand_spider",
      "desert_walker"
    ]
  },
  "valfria_bone_fields": {
    "id": "valfria_bone_fields",
    "cityId": "vila_de_valfria",
    "name": "Dunas dos Ossos",
    "description": "Mar de dunas pálidas onde esqueletos emergem da areia e criaturas colossais seguem rastros deixados pelo vento quente.",
    "monsterIds": [
      "desert_giant",
      "desert_worm",
      "sand_elemental",
      "skeleton_bat",
      "skeleton_snake",
      "skeleton_quadruped_small"
    ]
  },
  "valfria_spectral_mire": {
    "id": "valfria_spectral_mire",
    "cityId": "vila_de_valfria",
    "name": "Salinas da Miragem",
    "description": "Planícies de sal que distorcem a visão, escondendo monstros ressecados, salamandras flamejantes e ossadas ambulantes.",
    "monsterIds": [
      "demon_desert_giant",
      "demoniac_elephant",
      "salamander_firebrand",
      "skeleton_centaur",
      "skeleton_naga",
      "skeleton_ugly_thing"
    ]
  },
  "rosindale_infected_coast": {
    "id": "rosindale_infected_coast",
    "cityId": "rosindale",
    "name": "Gargantas de Rosindale",
    "description": "Cânions largos e avermelhados onde enxames, morcegos e serpentes cruzam pontes naturais acima de abismos secos.",
    "monsterIds": [
      "spectral_ant_old",
      "spectral_bat_old",
      "spectral_bee_old",
      "spectral_centaur_old",
      "spectral_naga_old",
      "viper"
    ]
  },
  "rosindale_zombie_quarter": {
    "id": "rosindale_zombie_quarter",
    "cityId": "rosindale",
    "name": "Fendas Rubras",
    "description": "Ravinas estreitas e paredes quebradiças onde aranhas, ogros e miragens hostis atacam viajantes encurralados.",
    "monsterIds": [
      "spectral_quadruped_small_old",
      "spectral_spider_old",
      "spectral_thing",
      "spectral_worm",
      "two_headed_ogre",
      "wolf_spider_new"
    ]
  },
  "morthaly_black_docks": {
    "id": "morthaly_black_docks",
    "cityId": "porto_sombrio",
    "name": "Docas do Luto",
    "description": "Porto sombrio de Morthaly, onde correntes negras arrastam caranguejos mortos, krakens partidos e horrores vindos da maré.",
    "monsterIds": [
      "zombie_crab",
      "zombie_kraken_head",
      "zombie_kraken_infected",
      "zombie_octopode_infected",
      "zombie_octopode",
      "zombie_turtle_infected",
      "spectral_fish_old"
    ]
  },
  "morthaly_runic_wastes": {
    "id": "morthaly_runic_wastes",
    "cityId": "necropole_de_morthaly",
    "name": "Muralhas da Necrópole",
    "description": "Anéis externos do imenso castelo-necrópole, cobertos por runas mortas, ossadas de dragões e cães zumbis de patrulha.",
    "monsterIds": [
      "damnation_mummy",
      "skeleton_dragon",
      "spectral_dragon_old",
      "spectral_hydra_3_old",
      "zombie_hound_infected",
      "zombie_hound"
    ]
  },
  "morthaly_lich_spire": {
    "id": "morthaly_lich_spire",
    "cityId": "necropole_de_morthaly",
    "name": "Pináculo do Trono Morto",
    "description": "Torres mais altas da Necrópole de Morthaly, onde dracos, ogros e deformidades zumbis servem ao poder do castelo.",
    "monsterIds": [
      "zombie_drake_infected",
      "zombie_drake",
      "zombie_ogre_infected",
      "zombie_ogre",
      "zombie_small",
      "zombie_ugly_thing_infected",
      "zombie_ugly_thing"
    ]
  }
};

export const MONSTERS: Record<string, MonsterDefinition> = {
  "training_dummy": {
    "id": "training_dummy",
    "cityId": "eldoria",
    "name": "Boneco Encantado",
    "imageUrl": "/assets/monsters/clay_golem.png",
    "level": 1,
    "maxHp": 30,
    "strength": 10,
    "defense": 1,
    "agility": 1,
    "experience": 35.0,
    "gold": 52.5,
    "drops": [
      {
        "itemId": "material_celena",
        "chance": 0.299
      },
      {
        "itemId": "material_herb",
        "chance": 0.2
      },
      {
        "itemId": "misc_seed_moss",
        "chance": 0.13
      }
    ]
  },
  "forest_rat": {
    "id": "forest_rat",
    "cityId": "eldoria",
    "name": "Rato da Floresta",
    "imageUrl": "/assets/monsters/grey_rat.png",
    "level": 2,
    "maxHp": 58,
    "strength": 21,
    "defense": 2,
    "agility": 3,
    "experience": 75.7,
    "gold": 113.55,
    "drops": [
      {
        "itemId": "wolf_pelt",
        "chance": 0.299
      },
      {
        "itemId": "material_celena",
        "chance": 0.199
      },
      {
        "itemId": "misc_seed_moss",
        "chance": 0.129
      }
    ]
  },
  "aberr": {
    "id": "aberr",
    "cityId": "eldoria",
    "name": "Aberração do Mangue",
    "imageUrl": "/assets/monsters/aberr.png",
    "level": 10,
    "maxHp": 309,
    "strength": 109,
    "defense": 12,
    "agility": 10,
    "experience": 557.8,
    "gold": 836.7,
    "drops": [
      {
        "itemId": "material_herb",
        "chance": 0.293
      },
      {
        "itemId": "misc_herb_moss",
        "chance": 0.196
      },
      {
        "itemId": "misc_seed_moss",
        "chance": 0.126
      }
    ]
  },
  "anaconda_new": {
    "id": "anaconda_new",
    "cityId": "eldoria",
    "name": "Anaconda",
    "imageUrl": "/assets/monsters/anaconda_new.png",
    "level": 4,
    "maxHp": 123,
    "strength": 43,
    "defense": 5,
    "agility": 4,
    "experience": 162.4,
    "gold": 243.6,
    "drops": [
      {
        "itemId": "misc_herb_moss",
        "chance": 0.297
      },
      {
        "itemId": "health_potion_light",
        "chance": 0.128
      }
    ]
  },
  "gray_wolf": {
    "id": "gray_wolf",
    "cityId": "eldoria",
    "name": "Lobo Cinzento",
    "imageUrl": "/assets/monsters/grey-wolf.png",
    "level": 3,
    "maxHp": 87,
    "strength": 33,
    "defense": 4,
    "agility": 4,
    "experience": 119.3,
    "gold": 178.95,
    "drops": [
      {
        "itemId": "misc_herb_moss",
        "chance": 0.298
      },
      {
        "itemId": "wolf_pelt",
        "chance": 0.199
      },
      {
        "itemId": "material_magic_essence",
        "chance": 0.129
      }
    ]
  },
  "anubis_guard": {
    "id": "anubis_guard",
    "cityId": "eldoria",
    "name": "Guardião do Farol Verde",
    "imageUrl": "/assets/monsters/anubis_guard.png",
    "level": 9,
    "maxHp": 278,
    "strength": 98,
    "defense": 11,
    "agility": 9,
    "experience": 475.3,
    "gold": 712.95,
    "drops": [
      {
        "itemId": "material_herb",
        "chance": 0.294
      },
      {
        "itemId": "wolf_pelt",
        "chance": 0.196
      },
      {
        "itemId": "health_potion_light",
        "chance": 0.126
      }
    ]
  },
  "black_mamba_new": {
    "id": "black_mamba_new",
    "cityId": "eldoria",
    "name": "Mamba Negra",
    "imageUrl": "/assets/monsters/black_mamba_new.png",
    "level": 5,
    "maxHp": 154,
    "strength": 54,
    "defense": 6,
    "agility": 5,
    "experience": 213.7,
    "gold": 320.55,
    "drops": [
      {
        "itemId": "material_celena",
        "chance": 0.296
      },
      {
        "itemId": "material_herb",
        "chance": 0.198
      },
      {
        "itemId": "health_potion_light",
        "chance": 0.128
      }
    ]
  },
  "road_bandit": {
    "id": "road_bandit",
    "cityId": "ravenspire",
    "name": "Bandido da Estrada Verde",
    "imageUrl": "/assets/monsters/human-bandit.png",
    "level": 14,
    "maxHp": 411,
    "strength": 156,
    "defense": 15,
    "agility": 18,
    "experience": 1008.5,
    "gold": 1512.75,
    "drops": [
      {
        "itemId": "misc_seed_rustic",
        "chance": 0.29
      },
      {
        "itemId": "material_mycelium_fungus",
        "chance": 0.194
      },
      {
        "itemId": "health_potion",
        "chance": 0.124
      }
    ]
  },
  "brown_ooze": {
    "id": "brown_ooze",
    "cityId": "eldoria",
    "name": "Lodo de Mangue",
    "imageUrl": "/assets/monsters/brown_ooze.png",
    "level": 6,
    "maxHp": 185,
    "strength": 65,
    "defense": 7,
    "agility": 6,
    "experience": 270.0,
    "gold": 405.0,
    "drops": [
      {
        "itemId": "material_herb",
        "chance": 0.296
      },
      {
        "itemId": "misc_herb_moss",
        "chance": 0.198
      },
      {
        "itemId": "misc_seed_moss",
        "chance": 0.127
      }
    ]
  },
  "centaur_demon": {
    "id": "centaur_demon",
    "cityId": "eldoria",
    "name": "Centauro Corrompido",
    "imageUrl": "/assets/monsters/centaur_demon.png",
    "level": 11,
    "maxHp": 347,
    "strength": 134,
    "defense": 12,
    "agility": 12,
    "experience": 694.0,
    "gold": 1041.0,
    "drops": [
      {
        "itemId": "material_herb",
        "chance": 0.292
      },
      {
        "itemId": "material_celena",
        "chance": 0.196
      },
      {
        "itemId": "health_potion_light",
        "chance": 0.125
      }
    ]
  },
  "thorn_boar": {
    "id": "thorn_boar",
    "cityId": "ravenspire",
    "name": "Javali Espinhoso",
    "imageUrl": "/assets/monsters/grey-bear.png",
    "level": 15,
    "maxHp": 464,
    "strength": 164,
    "defense": 18,
    "agility": 15,
    "experience": 1112.0,
    "gold": 1668.0,
    "drops": [
      {
        "itemId": "material_gromin_mycelium",
        "chance": 0.289
      },
      {
        "itemId": "material_mycelium_fungus",
        "chance": 0.194
      },
      {
        "itemId": "health_potion",
        "chance": 0.123
      }
    ]
  },
  "clay_golem": {
    "id": "clay_golem",
    "cityId": "eldoria",
    "name": "Golem de Argila Viva",
    "imageUrl": "/assets/monsters/clay_golem.png",
    "level": 8,
    "maxHp": 291,
    "strength": 90,
    "defense": 13,
    "agility": 6,
    "experience": 432.3,
    "gold": 648.45,
    "drops": [
      {
        "itemId": "material_herb",
        "chance": 0.294
      },
      {
        "itemId": "material_magic_essence",
        "chance": 0.126
      }
    ]
  },
  "cursed_goblin": {
    "id": "cursed_goblin",
    "cityId": "eldoria",
    "name": "Goblin da Raiz Negra",
    "imageUrl": "/assets/monsters/cursed-goblin.png",
    "level": 7,
    "maxHp": 216,
    "strength": 76,
    "defense": 9,
    "agility": 7,
    "experience": 332.1,
    "gold": 498.15,
    "drops": [
      {
        "itemId": "material_herb",
        "chance": 0.295
      },
      {
        "itemId": "material_celena",
        "chance": 0.197
      },
      {
        "itemId": "misc_seed_moss",
        "chance": 0.127
      }
    ]
  },
  "damnation_elemental": {
    "id": "damnation_elemental",
    "cityId": "eldoria",
    "name": "Elemental do Estuário",
    "imageUrl": "/assets/monsters/damnation_elemental.png",
    "level": 12,
    "maxHp": 438,
    "strength": 136,
    "defense": 19,
    "agility": 9,
    "experience": 808.3,
    "gold": 1212.45,
    "drops": [
      {
        "itemId": "wolf_pelt",
        "chance": 0.292
      },
      {
        "itemId": "misc_seed_moss",
        "chance": 0.125
      }
    ]
  },
  "damnation_cyclops": {
    "id": "damnation_cyclops",
    "cityId": "eldoria",
    "name": "Ciclope do Mangue Profundo",
    "imageUrl": "/assets/monsters/damnation_cyclops.png",
    "level": 13,
    "maxHp": 474,
    "strength": 148,
    "defense": 20,
    "agility": 9,
    "experience": 927.0,
    "gold": 1390.5,
    "drops": [
      {
        "itemId": "material_celena",
        "chance": 0.291
      },
      {
        "itemId": "material_herb",
        "chance": 0.195
      },
      {
        "itemId": "material_magic_essence",
        "chance": 0.124
      }
    ]
  },
  "damnation_golem": {
    "id": "damnation_golem",
    "cityId": "ravenspire",
    "name": "Golem da Mata Danada",
    "imageUrl": "/assets/monsters/damnation_golem.png",
    "level": 18,
    "maxHp": 657,
    "strength": 205,
    "defense": 28,
    "agility": 13,
    "experience": 1723.6,
    "gold": 2585.4,
    "drops": [
      {
        "itemId": "material_gromin_mycelium",
        "chance": 0.287
      },
      {
        "itemId": "wolf_pelt",
        "chance": 0.193
      },
      {
        "itemId": "material_green_coin",
        "chance": 0.122
      }
    ]
  },
  "damnation_harpy": {
    "id": "damnation_harpy",
    "cityId": "ravenspire",
    "name": "Harpia dos Campos",
    "imageUrl": "/assets/monsters/damnation_harpy.png",
    "level": 19,
    "maxHp": 559,
    "strength": 212,
    "defense": 20,
    "agility": 25,
    "experience": 1844.3,
    "gold": 2766.45,
    "drops": [
      {
        "itemId": "material_gromin_mycelium",
        "chance": 0.287
      },
      {
        "itemId": "material_mycelium_fungus",
        "chance": 0.192
      },
      {
        "itemId": "crystal_dust",
        "chance": 0.121
      }
    ]
  },
  "ember_golem": {
    "id": "ember_golem",
    "cityId": "ironhold",
    "name": "Golem de Brasa",
    "imageUrl": "/assets/monsters/damnation_golem.png",
    "level": 33,
    "maxHp": 1206,
    "strength": 376,
    "defense": 51,
    "agility": 24,
    "experience": 8401.1,
    "gold": 12601.65,
    "drops": [
      {
        "itemId": "misc_stone_craft",
        "chance": 0.277
      },
      {
        "itemId": "ember_core",
        "chance": 0.187
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.115
      }
    ]
  },
  "damnation_mummy": {
    "id": "damnation_mummy",
    "cityId": "necropole_de_morthaly",
    "name": "Múmia da Cripta Negra",
    "imageUrl": "/assets/monsters/damnation_mummy.png",
    "level": 105,
    "maxHp": 3514,
    "strength": 1131,
    "defense": 138,
    "agility": 88,
    "experience": 8078184.3,
    "gold": 12117276.45,
    "drops": [
      {
        "itemId": "misc_high_dungeon_key",
        "chance": 0.226
      },
      {
        "itemId": "material_dark_magic_rune",
        "chance": 0.158
      },
      {
        "itemId": "material_spectre_jewell",
        "chance": 0.083
      }
    ]
  },
  "damnation_orc": {
    "id": "damnation_orc",
    "cityId": "ravenspire",
    "name": "Orc da Mata Danada",
    "imageUrl": "/assets/monsters/damnation_orc.png",
    "level": 20,
    "maxHp": 631,
    "strength": 245,
    "defense": 23,
    "agility": 21,
    "experience": 2144.9,
    "gold": 3217.35,
    "drops": [
      {
        "itemId": "material_gromin_mycelium",
        "chance": 0.286
      },
      {
        "itemId": "health_potion",
        "chance": 0.121
      }
    ]
  },
  "damnation_scorpion": {
    "id": "damnation_scorpion",
    "cityId": "vila_de_valfria",
    "name": "Escorpião da Areia Rubra",
    "imageUrl": "/assets/monsters/damnation_scorpion.png",
    "level": 78,
    "maxHp": 2465,
    "strength": 960,
    "defense": 91,
    "agility": 82,
    "experience": 633613.8,
    "gold": 950420.7,
    "drops": [
      {
        "itemId": "misc_herb_bitter",
        "chance": 0.245
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.169
      },
      {
        "itemId": "misc_seed_bitter",
        "chance": 0.095
      }
    ]
  },
  "damnation_snake": {
    "id": "damnation_snake",
    "cityId": "vila_de_valfria",
    "name": "Serpente da Areia Rubra",
    "imageUrl": "/assets/monsters/damnation_snake.png",
    "level": 79,
    "maxHp": 2326,
    "strength": 885,
    "defense": 84,
    "agility": 104,
    "experience": 670956.1,
    "gold": 1006434.15,
    "drops": [
      {
        "itemId": "material_bone",
        "chance": 0.245
      },
      {
        "itemId": "misc_herb_bitter",
        "chance": 0.168
      },
      {
        "itemId": "material_energy_jewell",
        "chance": 0.094
      }
    ]
  },
  "cave_wyvern": {
    "id": "cave_wyvern",
    "cityId": "ironhold",
    "name": "Serpe da Caverna",
    "imageUrl": "/assets/monsters/demon_dragon.png",
    "level": 34,
    "maxHp": 1243,
    "strength": 388,
    "defense": 52,
    "agility": 24,
    "experience": 9279.0,
    "gold": 13918.5,
    "drops": [
      {
        "itemId": "material_old_stone",
        "chance": 0.276
      },
      {
        "itemId": "ember_core",
        "chance": 0.186
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.115
      }
    ]
  },
  "damnation_spider": {
    "id": "damnation_spider",
    "cityId": "ravenspire",
    "name": "Aranha da Mata Danada",
    "imageUrl": "/assets/monsters/damnation_spider.png",
    "level": 21,
    "maxHp": 618,
    "strength": 235,
    "defense": 23,
    "agility": 28,
    "experience": 2307.3,
    "gold": 3460.95,
    "drops": [
      {
        "itemId": "material_mycelium_fungus",
        "chance": 0.285
      },
      {
        "itemId": "material_gromin_mycelium",
        "chance": 0.192
      },
      {
        "itemId": "health_potion",
        "chance": 0.121
      }
    ]
  },
  "damnation_troll": {
    "id": "damnation_troll",
    "cityId": "ravenspire",
    "name": "Troll da Mata Danada",
    "imageUrl": "/assets/monsters/damnation_troll.png",
    "level": 22,
    "maxHp": 804,
    "strength": 251,
    "defense": 35,
    "agility": 16,
    "experience": 2699.0,
    "gold": 4048.5,
    "drops": [
      {
        "itemId": "misc_seed_rustic",
        "chance": 0.285
      },
      {
        "itemId": "material_mycelium_fungus",
        "chance": 0.191
      },
      {
        "itemId": "crystal_dust",
        "chance": 0.12
      }
    ]
  },
  "deathcap": {
    "id": "deathcap",
    "cityId": "ravenspire",
    "name": "Chapéu-da-morte",
    "imageUrl": "/assets/monsters/deathcap.png",
    "level": 17,
    "maxHp": 526,
    "strength": 186,
    "defense": 21,
    "agility": 17,
    "experience": 1419.1,
    "gold": 2128.65,
    "drops": [
      {
        "itemId": "material_gromin_mycelium",
        "chance": 0.288
      },
      {
        "itemId": "misc_seed_rustic",
        "chance": 0.193
      },
      {
        "itemId": "crystal_dust",
        "chance": 0.122
      }
    ]
  },
  "deep_dwarf": {
    "id": "deep_dwarf",
    "cityId": "ironhold",
    "name": "Anão das Profundezas",
    "imageUrl": "/assets/monsters/deep-dwarf.png",
    "level": 32,
    "maxHp": 991,
    "strength": 351,
    "defense": 39,
    "agility": 32,
    "experience": 7039.8,
    "gold": 10559.7,
    "drops": [
      {
        "itemId": "material_old_stone",
        "chance": 0.278
      },
      {
        "itemId": "misc_dragon_stone",
        "chance": 0.116
      }
    ]
  },
  "demon_bareon": {
    "id": "demon_bareon",
    "cityId": "necropole_de_morthaly",
    "name": "Bareon Amaldiçoado",
    "imageUrl": "/assets/monsters/demon_bareon.png",
    "level": 106,
    "maxHp": 3351,
    "strength": 1305,
    "defense": 124,
    "agility": 111,
    "experience": 9142367.2,
    "gold": 13713550.8,
    "drops": [
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.226
      },
      {
        "itemId": "misc_high_dungeon_key",
        "chance": 0.158
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.082
      }
    ]
  },
  "demon_desert_giant": {
    "id": "demon_desert_giant",
    "cityId": "vila_de_valfria",
    "name": "Gigante Demoníaco do Deserto",
    "imageUrl": "/assets/monsters/demon_desert_giant.png",
    "level": 57,
    "maxHp": 2084,
    "strength": 651,
    "defense": 90,
    "agility": 41,
    "experience": 86093.9,
    "gold": 129140.85,
    "drops": [
      {
        "itemId": "misc_herb_bitter",
        "chance": 0.26
      },
      {
        "itemId": "material_bone",
        "chance": 0.177
      },
      {
        "itemId": "material_energy_jewell",
        "chance": 0.104
      }
    ]
  },
  "demon_dragon": {
    "id": "demon_dragon",
    "cityId": "ravenspire",
    "name": "Serpe Sombria dos Bosques",
    "imageUrl": "/assets/monsters/demon_dragon.png",
    "level": 31,
    "maxHp": 1133,
    "strength": 354,
    "defense": 49,
    "agility": 22,
    "experience": 6877.5,
    "gold": 10316.25,
    "drops": [
      {
        "itemId": "material_mycelium_fungus",
        "chance": 0.278
      },
      {
        "itemId": "wolf_pelt",
        "chance": 0.188
      },
      {
        "itemId": "health_potion",
        "chance": 0.116
      }
    ]
  },
  "demoniac_elephant": {
    "id": "demoniac_elephant",
    "cityId": "vila_de_valfria",
    "name": "Elefante Demoníaco",
    "imageUrl": "/assets/monsters/demoniac_elephant.png",
    "level": 58,
    "maxHp": 1707,
    "strength": 650,
    "defense": 62,
    "agility": 77,
    "experience": 90354.9,
    "gold": 135532.35,
    "drops": [
      {
        "itemId": "material_bone",
        "chance": 0.259
      },
      {
        "itemId": "material_stone_fragment",
        "chance": 0.177
      },
      {
        "itemId": "misc_seed_bitter",
        "chance": 0.104
      }
    ]
  },
  "demoniac_wolf": {
    "id": "demoniac_wolf",
    "cityId": "ravenspire",
    "name": "Lobo Danado",
    "imageUrl": "/assets/monsters/demoniac_wolf.png",
    "level": 23,
    "maxHp": 676,
    "strength": 257,
    "defense": 25,
    "agility": 30,
    "experience": 2867.5,
    "gold": 4301.25,
    "drops": [
      {
        "itemId": "misc_seed_rustic",
        "chance": 0.284
      },
      {
        "itemId": "material_gromin_mycelium",
        "chance": 0.191
      },
      {
        "itemId": "material_green_coin",
        "chance": 0.12
      }
    ]
  },
  "desert_giant": {
    "id": "desert_giant",
    "cityId": "vila_de_valfria",
    "name": "Gigante das Dunas",
    "imageUrl": "/assets/monsters/desert_giant.png",
    "level": 59,
    "maxHp": 2157,
    "strength": 674,
    "defense": 92,
    "agility": 42,
    "experience": 104253.0,
    "gold": 156379.5,
    "drops": [
      {
        "itemId": "material_old_stone",
        "chance": 0.259
      },
      {
        "itemId": "material_bone",
        "chance": 0.176
      },
      {
        "itemId": "material_energy_jewell",
        "chance": 0.103
      }
    ]
  },
  "desert_worm": {
    "id": "desert_worm",
    "cityId": "vila_de_valfria",
    "name": "Verme das Dunas",
    "imageUrl": "/assets/monsters/desert_worm.png",
    "level": 61,
    "maxHp": 1890,
    "strength": 670,
    "defense": 74,
    "agility": 61,
    "experience": 116875.4,
    "gold": 175313.1,
    "drops": [
      {
        "itemId": "misc_herb_bitter",
        "chance": 0.257
      },
      {
        "itemId": "material_bone",
        "chance": 0.176
      },
      {
        "itemId": "health_potion_medium",
        "chance": 0.103
      }
    ]
  },
  "desert_walker": {
    "id": "desert_walker",
    "cityId": "vila_de_valfria",
    "name": "Andarilho das Salinas",
    "imageUrl": "/assets/monsters/desert_walker.png",
    "level": 60,
    "maxHp": 1859,
    "strength": 659,
    "defense": 73,
    "agility": 60,
    "experience": 106218.6,
    "gold": 159327.9,
    "drops": [
      {
        "itemId": "material_bone",
        "chance": 0.258
      },
      {
        "itemId": "health_potion_medium",
        "chance": 0.103
      }
    ]
  },
  "dorrene_orc": {
    "id": "dorrene_orc",
    "cityId": "ironhold",
    "name": "Orc das Encostas de Dorrene",
    "imageUrl": "/assets/monsters/dorrene_orc.png",
    "level": 35,
    "maxHp": 1084,
    "strength": 384,
    "defense": 43,
    "agility": 35,
    "experience": 9485.9,
    "gold": 14228.85,
    "drops": [
      {
        "itemId": "misc_stone_craft",
        "chance": 0.275
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.186
      },
      {
        "itemId": "misc_dragon_stone",
        "chance": 0.114
      }
    ]
  },
  "dorrene_snake": {
    "id": "dorrene_snake",
    "cityId": "ironhold",
    "name": "Serpente das Rochas de Dorrene",
    "imageUrl": "/assets/monsters/dorrene_snake.png",
    "level": 36,
    "maxHp": 1059,
    "strength": 403,
    "defense": 39,
    "agility": 48,
    "experience": 10783.5,
    "gold": 16175.25,
    "drops": [
      {
        "itemId": "material_stone_fragment",
        "chance": 0.275
      },
      {
        "itemId": "wyvern_scale",
        "chance": 0.114
      }
    ]
  },
  "easter_bunny": {
    "id": "easter_bunny",
    "cityId": "ironhold",
    "name": "Lebre Alpina Encantada",
    "imageUrl": "/assets/monsters/easter_bunny.png",
    "level": 56,
    "maxHp": 1735,
    "strength": 615,
    "defense": 68,
    "agility": 56,
    "experience": 72437.8,
    "gold": 108656.7,
    "drops": [
      {
        "itemId": "ember_core",
        "chance": 0.261
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.105
      }
    ]
  },
  "emperor_scorpion": {
    "id": "emperor_scorpion",
    "cityId": "ironhold",
    "name": "Escorpião Imperador",
    "imageUrl": "/assets/monsters/emperor_scorpion.png",
    "level": 37,
    "maxHp": 1146,
    "strength": 406,
    "defense": 45,
    "agility": 37,
    "experience": 11551.4,
    "gold": 17327.1,
    "drops": [
      {
        "itemId": "misc_stone_craft",
        "chance": 0.274
      },
      {
        "itemId": "ember_core",
        "chance": 0.185
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.113
      }
    ]
  },
  "eye_of_devastation_new": {
    "id": "eye_of_devastation_new",
    "cityId": "ironhold",
    "name": "Olho da Devastação",
    "imageUrl": "/assets/monsters/eye_of_devastation_new.png",
    "level": 38,
    "maxHp": 1201,
    "strength": 467,
    "defense": 44,
    "agility": 40,
    "experience": 13633.4,
    "gold": 20450.1,
    "drops": [
      {
        "itemId": "material_old_stone",
        "chance": 0.273
      },
      {
        "itemId": "ember_core",
        "chance": 0.185
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.113
      }
    ]
  },
  "giant_ant": {
    "id": "giant_ant",
    "cityId": "ironhold",
    "name": "Formiga Gigante",
    "imageUrl": "/assets/monsters/giant_ant.png",
    "level": 39,
    "maxHp": 1425,
    "strength": 445,
    "defense": 61,
    "agility": 28,
    "experience": 15174.7,
    "gold": 22762.05,
    "drops": [
      {
        "itemId": "material_old_stone",
        "chance": 0.273
      },
      {
        "itemId": "material_stone_fragment",
        "chance": 0.184
      },
      {
        "itemId": "wyvern_scale",
        "chance": 0.112
      }
    ]
  },
  "giant_gecko": {
    "id": "giant_gecko",
    "cityId": "ironhold",
    "name": "Lagartixa Gigante",
    "imageUrl": "/assets/monsters/giant_gecko.png",
    "level": 40,
    "maxHp": 1462,
    "strength": 457,
    "defense": 63,
    "agility": 29,
    "experience": 16730.0,
    "gold": 25095.0,
    "drops": [
      {
        "itemId": "ember_core",
        "chance": 0.272
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.112
      }
    ]
  },
  "giant_leech": {
    "id": "giant_leech",
    "cityId": "ravenspire",
    "name": "Sanguessuga Gigante",
    "imageUrl": "/assets/monsters/giant_leech.png",
    "level": 30,
    "maxHp": 1096,
    "strength": 342,
    "defense": 47,
    "agility": 22,
    "experience": 6217.9,
    "gold": 9326.85,
    "drops": [
      {
        "itemId": "misc_seed_rustic",
        "chance": 0.279
      },
      {
        "itemId": "material_mycelium_fungus",
        "chance": 0.188
      },
      {
        "itemId": "health_potion",
        "chance": 0.117
      }
    ]
  },
  "giant_scorpion": {
    "id": "giant_scorpion",
    "cityId": "ironhold",
    "name": "Escorpião Gigante",
    "imageUrl": "/assets/monsters/giant_scorpion.png",
    "level": 41,
    "maxHp": 1499,
    "strength": 468,
    "defense": 64,
    "agility": 30,
    "experience": 18440.8,
    "gold": 27661.2,
    "drops": [
      {
        "itemId": "ember_core",
        "chance": 0.271
      },
      {
        "itemId": "material_stone_fragment",
        "chance": 0.184
      },
      {
        "itemId": "wyvern_scale",
        "chance": 0.112
      }
    ]
  },
  "giant_spore": {
    "id": "giant_spore",
    "cityId": "ravenspire",
    "name": "Esporo Gigante",
    "imageUrl": "/assets/monsters/giant_spore.png",
    "level": 25,
    "maxHp": 913,
    "strength": 285,
    "defense": 38,
    "agility": 18,
    "experience": 3717.5,
    "gold": 5576.25,
    "drops": [
      {
        "itemId": "misc_seed_rustic",
        "chance": 0.282
      },
      {
        "itemId": "wolf_pelt",
        "chance": 0.19
      },
      {
        "itemId": "material_green_coin",
        "chance": 0.119
      }
    ]
  },
  "giant_toad": {
    "id": "giant_toad",
    "cityId": "ravenspire",
    "name": "Sapo Gigante",
    "imageUrl": "/assets/monsters/giant_toad.png",
    "level": 29,
    "maxHp": 1060,
    "strength": 331,
    "defense": 45,
    "agility": 21,
    "experience": 5618.2,
    "gold": 8427.3,
    "drops": [
      {
        "itemId": "material_gromin_mycelium",
        "chance": 0.28
      },
      {
        "itemId": "misc_seed_rustic",
        "chance": 0.188
      },
      {
        "itemId": "health_potion",
        "chance": 0.117
      }
    ]
  },
  "grey_rat": {
    "id": "grey_rat",
    "cityId": "ironhold",
    "name": "Rato Cinzento",
    "imageUrl": "/assets/monsters/grey_rat.png",
    "level": 42,
    "maxHp": 1236,
    "strength": 470,
    "defense": 45,
    "agility": 55,
    "experience": 19381.8,
    "gold": 29072.7,
    "drops": [
      {
        "itemId": "material_old_stone",
        "chance": 0.271
      },
      {
        "itemId": "ember_core",
        "chance": 0.183
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.111
      }
    ]
  },
  "grey_bear": {
    "id": "grey_bear",
    "cityId": "ravenspire",
    "name": "Urso Cinzento",
    "imageUrl": "/assets/monsters/grey-bear.png",
    "level": 26,
    "maxHp": 805,
    "strength": 285,
    "defense": 32,
    "agility": 26,
    "experience": 3821.4,
    "gold": 5732.1,
    "drops": [
      {
        "itemId": "wolf_pelt",
        "chance": 0.282
      },
      {
        "itemId": "material_gromin_mycelium",
        "chance": 0.19
      },
      {
        "itemId": "material_green_coin",
        "chance": 0.118
      }
    ]
  },
  "grey_wolf": {
    "id": "grey_wolf",
    "cityId": "ravenspire",
    "name": "Lobo Cinzento",
    "imageUrl": "/assets/monsters/grey-wolf.png",
    "level": 27,
    "maxHp": 794,
    "strength": 302,
    "defense": 29,
    "agility": 36,
    "experience": 4365.7,
    "gold": 6548.55,
    "drops": [
      {
        "itemId": "material_gromin_mycelium",
        "chance": 0.281
      },
      {
        "itemId": "material_mycelium_fungus",
        "chance": 0.189
      },
      {
        "itemId": "health_potion",
        "chance": 0.118
      }
    ]
  },
  "guardian_serpent": {
    "id": "guardian_serpent",
    "cityId": "ravenspire",
    "name": "Serpente Guardiã",
    "imageUrl": "/assets/monsters/guardian_serpent.png",
    "level": 28,
    "maxHp": 824,
    "strength": 313,
    "defense": 30,
    "agility": 37,
    "experience": 4838.3,
    "gold": 7257.45,
    "drops": [
      {
        "itemId": "misc_seed_rustic",
        "chance": 0.28
      },
      {
        "itemId": "material_green_coin",
        "chance": 0.117
      }
    ]
  },
  "hell_lizard": {
    "id": "hell_lizard",
    "cityId": "ironhold",
    "name": "Lagarto Infernal",
    "imageUrl": "/assets/monsters/hell_lizard.png",
    "level": 43,
    "maxHp": 1332,
    "strength": 472,
    "defense": 52,
    "agility": 43,
    "experience": 20734.0,
    "gold": 31101.0,
    "drops": [
      {
        "itemId": "misc_stone_craft",
        "chance": 0.27
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.183
      },
      {
        "itemId": "misc_dragon_stone",
        "chance": 0.111
      }
    ]
  },
  "hell_worm": {
    "id": "hell_worm",
    "cityId": "ironhold",
    "name": "Verme Infernal",
    "imageUrl": "/assets/monsters/hell_worm.png",
    "level": 45,
    "maxHp": 1394,
    "strength": 494,
    "defense": 55,
    "agility": 45,
    "experience": 25161.7,
    "gold": 37742.55,
    "drops": [
      {
        "itemId": "material_old_stone",
        "chance": 0.268
      },
      {
        "itemId": "misc_stone_craft",
        "chance": 0.182
      },
      {
        "itemId": "material_dragons_tooth",
        "chance": 0.11
      }
    ]
  },
  "hell_salamander": {
    "id": "hell_salamander",
    "cityId": "ironhold",
    "name": "Salamandra Infernal",
    "imageUrl": "/assets/monsters/hell_salamander.png",
    "level": 44,
    "maxHp": 1363,
    "strength": 483,
    "defense": 54,
    "agility": 44,
    "experience": 22842.4,
    "gold": 34263.6,
    "drops": [
      {
        "itemId": "material_stone_fragment",
        "chance": 0.269
      },
      {
        "itemId": "wyvern_scale",
        "chance": 0.11
      }
    ]
  },
  "hill_giant_new": {
    "id": "hill_giant_new",
    "cityId": "ironhold",
    "name": "Gigante da Colina",
    "imageUrl": "/assets/monsters/hill_giant_new.png",
    "level": 46,
    "maxHp": 1682,
    "strength": 525,
    "defense": 72,
    "agility": 33,
    "experience": 29929.9,
    "gold": 44894.85,
    "drops": [
      {
        "itemId": "material_stone_fragment",
        "chance": 0.268
      },
      {
        "itemId": "misc_stone_craft",
        "chance": 0.182
      },
      {
        "itemId": "material_dragons_tooth",
        "chance": 0.109
      }
    ]
  },
  "human_bandit": {
    "id": "human_bandit",
    "cityId": "ravenspire",
    "name": "Saqueador dos Campos",
    "imageUrl": "/assets/monsters/human-bandit.png",
    "level": 16,
    "maxHp": 470,
    "strength": 178,
    "defense": 18,
    "agility": 21,
    "experience": 1296.0,
    "gold": 1944.0,
    "drops": [
      {
        "itemId": "material_gromin_mycelium",
        "chance": 0.289
      },
      {
        "itemId": "health_potion",
        "chance": 0.123
      }
    ]
  },
  "infernal_serpent": {
    "id": "infernal_serpent",
    "cityId": "ironhold",
    "name": "Serpente Infernal",
    "imageUrl": "/assets/monsters/infernal_serpent.png",
    "level": 47,
    "maxHp": 1383,
    "strength": 526,
    "defense": 50,
    "agility": 62,
    "experience": 31434.7,
    "gold": 47152.05,
    "drops": [
      {
        "itemId": "ember_core",
        "chance": 0.267
      },
      {
        "itemId": "misc_stone_craft",
        "chance": 0.181
      },
      {
        "itemId": "material_dragons_tooth",
        "chance": 0.109
      }
    ]
  },
  "jelly": {
    "id": "jelly",
    "cityId": "ironhold",
    "name": "Geleia",
    "imageUrl": "/assets/monsters/jelly.png",
    "level": 48,
    "maxHp": 1517,
    "strength": 590,
    "defense": 57,
    "agility": 50,
    "experience": 35958.5,
    "gold": 53937.75,
    "drops": [
      {
        "itemId": "material_stone_fragment",
        "chance": 0.266
      },
      {
        "itemId": "wyvern_scale",
        "chance": 0.108
      }
    ]
  },
  "joree_giant": {
    "id": "joree_giant",
    "cityId": "ironhold",
    "name": "Gigante de Joree",
    "imageUrl": "/assets/monsters/joree_giant.png",
    "level": 49,
    "maxHp": 1791,
    "strength": 560,
    "defense": 77,
    "agility": 35,
    "experience": 39961.8,
    "gold": 59942.7,
    "drops": [
      {
        "itemId": "ember_core",
        "chance": 0.266
      },
      {
        "itemId": "material_stone_fragment",
        "chance": 0.18
      },
      {
        "itemId": "wyvern_scale",
        "chance": 0.108
      }
    ]
  },
  "joree_plant": {
    "id": "joree_plant",
    "cityId": "ravenspire",
    "name": "Planta de Joree",
    "imageUrl": "/assets/monsters/joree_plant.png",
    "level": 24,
    "maxHp": 706,
    "strength": 268,
    "defense": 26,
    "agility": 32,
    "experience": 3190.3,
    "gold": 4785.45,
    "drops": [
      {
        "itemId": "misc_seed_rustic",
        "chance": 0.283
      },
      {
        "itemId": "material_green_coin",
        "chance": 0.119
      }
    ]
  },
  "joree_walker": {
    "id": "joree_walker",
    "cityId": "ironhold",
    "name": "Andarilho de Joree",
    "imageUrl": "/assets/monsters/joree_walker.png",
    "level": 50,
    "maxHp": 1549,
    "strength": 549,
    "defense": 61,
    "agility": 50,
    "experience": 40736.8,
    "gold": 61105.2,
    "drops": [
      {
        "itemId": "misc_stone_craft",
        "chance": 0.265
      },
      {
        "itemId": "material_stone_fragment",
        "chance": 0.18
      },
      {
        "itemId": "wyvern_scale",
        "chance": 0.108
      }
    ]
  },
  "labrat_unseen": {
    "id": "labrat_unseen",
    "cityId": "ironhold",
    "name": "Rato Oculto das Minas",
    "imageUrl": "/assets/monsters/labrat_unseen.png",
    "level": 51,
    "maxHp": 1501,
    "strength": 571,
    "defense": 55,
    "agility": 67,
    "experience": 46190.8,
    "gold": 69286.2,
    "drops": [
      {
        "itemId": "ember_core",
        "chance": 0.264
      },
      {
        "itemId": "misc_stone_craft",
        "chance": 0.18
      },
      {
        "itemId": "material_dragons_tooth",
        "chance": 0.107
      }
    ]
  },
  "mummy": {
    "id": "mummy",
    "cityId": "vila_de_valfria",
    "name": "Múmia das Dunas",
    "imageUrl": "/assets/monsters/mummy.png",
    "level": 77,
    "maxHp": 2577,
    "strength": 829,
    "defense": 102,
    "agility": 65,
    "experience": 559829.6,
    "gold": 839744.4,
    "drops": [
      {
        "itemId": "material_old_stone",
        "chance": 0.246
      },
      {
        "itemId": "material_stone_fragment",
        "chance": 0.169
      },
      {
        "itemId": "material_energy_jewell",
        "chance": 0.095
      }
    ]
  },
  "ogre_mage": {
    "id": "ogre_mage",
    "cityId": "ironhold",
    "name": "Ogro Mago",
    "imageUrl": "/assets/monsters/ogre_mage.png",
    "level": 52,
    "maxHp": 1901,
    "strength": 594,
    "defense": 81,
    "agility": 37,
    "experience": 53314.2,
    "gold": 79971.3,
    "drops": [
      {
        "itemId": "misc_stone_craft",
        "chance": 0.264
      },
      {
        "itemId": "material_dragons_tooth",
        "chance": 0.107
      }
    ]
  },
  "ogre": {
    "id": "ogre",
    "cityId": "ironhold",
    "name": "Ogro",
    "imageUrl": "/assets/monsters/ogre.png",
    "level": 53,
    "maxHp": 1938,
    "strength": 605,
    "defense": 83,
    "agility": 38,
    "experience": 58683.5,
    "gold": 88025.25,
    "drops": [
      {
        "itemId": "material_old_stone",
        "chance": 0.263
      },
      {
        "itemId": "misc_stone_craft",
        "chance": 0.179
      },
      {
        "itemId": "material_dragons_tooth",
        "chance": 0.106
      }
    ]
  },
  "orc_knight": {
    "id": "orc_knight",
    "cityId": "ironhold",
    "name": "Cavaleiro Orc",
    "imageUrl": "/assets/monsters/orc_knight.png",
    "level": 54,
    "maxHp": 1673,
    "strength": 593,
    "defense": 66,
    "agility": 54,
    "experience": 59805.2,
    "gold": 89707.8,
    "drops": [
      {
        "itemId": "material_stone_fragment",
        "chance": 0.262
      },
      {
        "itemId": "misc_stone_craft",
        "chance": 0.178
      },
      {
        "itemId": "material_dragons_tooth",
        "chance": 0.106
      }
    ]
  },
  "orc_warrior": {
    "id": "orc_warrior",
    "cityId": "vila_de_valfria",
    "name": "Guerreiro Orc",
    "imageUrl": "/assets/monsters/orc_warrior.png",
    "level": 62,
    "maxHp": 1921,
    "strength": 681,
    "defense": 76,
    "agility": 62,
    "experience": 128598.0,
    "gold": 192897.0,
    "drops": [
      {
        "itemId": "material_old_stone",
        "chance": 0.257
      },
      {
        "itemId": "misc_herb_bitter",
        "chance": 0.175
      },
      {
        "itemId": "misc_seed_bitter",
        "chance": 0.102
      }
    ]
  },
  "orc": {
    "id": "orc",
    "cityId": "vila_de_valfria",
    "name": "Orc",
    "imageUrl": "/assets/monsters/orc.png",
    "level": 63,
    "maxHp": 1952,
    "strength": 692,
    "defense": 77,
    "agility": 63,
    "experience": 141492.8,
    "gold": 212239.2,
    "drops": [
      {
        "itemId": "material_bone",
        "chance": 0.256
      },
      {
        "itemId": "misc_herb_bitter",
        "chance": 0.175
      },
      {
        "itemId": "material_energy_jewell",
        "chance": 0.102
      }
    ]
  },
  "pulsating_lump": {
    "id": "pulsating_lump",
    "cityId": "vila_de_valfria",
    "name": "Massa de Sal Pulsante",
    "imageUrl": "/assets/monsters/pulsating_lump.png",
    "level": 64,
    "maxHp": 2023,
    "strength": 787,
    "defense": 75,
    "agility": 67,
    "experience": 166574.4,
    "gold": 249861.6,
    "drops": [
      {
        "itemId": "material_bone",
        "chance": 0.255
      },
      {
        "itemId": "misc_seed_bitter",
        "chance": 0.101
      }
    ]
  },
  "redback_new": {
    "id": "redback_new",
    "cityId": "vila_de_valfria",
    "name": "Aranha Rubra do Deserto",
    "imageUrl": "/assets/monsters/redback_new.png",
    "level": 65,
    "maxHp": 2014,
    "strength": 714,
    "defense": 79,
    "agility": 65,
    "experience": 171279.8,
    "gold": 256919.7,
    "drops": [
      {
        "itemId": "material_old_stone",
        "chance": 0.255
      },
      {
        "itemId": "material_stone_fragment",
        "chance": 0.174
      },
      {
        "itemId": "material_energy_jewell",
        "chance": 0.101
      }
    ]
  },
  "salamander_firebrand": {
    "id": "salamander_firebrand",
    "cityId": "vila_de_valfria",
    "name": "Salamandra Flamejante",
    "imageUrl": "/assets/monsters/salamander_firebrand.png",
    "level": 66,
    "maxHp": 2045,
    "strength": 725,
    "defense": 81,
    "agility": 66,
    "experience": 188442.7,
    "gold": 282664.05,
    "drops": [
      {
        "itemId": "material_bone",
        "chance": 0.254
      },
      {
        "itemId": "material_stone_fragment",
        "chance": 0.174
      },
      {
        "itemId": "health_potion_medium",
        "chance": 0.1
      }
    ]
  },
  "rock_troll": {
    "id": "rock_troll",
    "cityId": "ironhold",
    "name": "Troll de Pedra",
    "imageUrl": "/assets/monsters/rock_troll.png",
    "level": 55,
    "maxHp": 2011,
    "strength": 628,
    "defense": 86,
    "agility": 40,
    "experience": 71086.4,
    "gold": 106629.6,
    "drops": [
      {
        "itemId": "ember_core",
        "chance": 0.262
      },
      {
        "itemId": "misc_stone_craft",
        "chance": 0.178
      },
      {
        "itemId": "material_dragons_tooth",
        "chance": 0.105
      }
    ]
  },
  "salamander": {
    "id": "salamander",
    "cityId": "vila_de_valfria",
    "name": "Salamandra",
    "imageUrl": "/assets/monsters/salamander.png",
    "level": 67,
    "maxHp": 2076,
    "strength": 736,
    "defense": 82,
    "agility": 67,
    "experience": 207322.0,
    "gold": 310983.0,
    "drops": [
      {
        "itemId": "material_bone",
        "chance": 0.253
      },
      {
        "itemId": "misc_herb_bitter",
        "chance": 0.173
      },
      {
        "itemId": "health_potion_medium",
        "chance": 0.1
      }
    ]
  },
  "sand_elemental": {
    "id": "sand_elemental",
    "cityId": "vila_de_valfria",
    "name": "Elemental de Areia",
    "imageUrl": "/assets/monsters/sand_elemental.png",
    "level": 68,
    "maxHp": 2486,
    "strength": 777,
    "defense": 106,
    "agility": 49,
    "experience": 246336.3,
    "gold": 369504.45,
    "drops": [
      {
        "itemId": "material_bone",
        "chance": 0.252
      },
      {
        "itemId": "material_energy_jewell",
        "chance": 0.099
      }
    ]
  },
  "sand_spider": {
    "id": "sand_spider",
    "cityId": "vila_de_valfria",
    "name": "Aranha de Areia",
    "imageUrl": "/assets/monsters/sand_spider.png",
    "level": 69,
    "maxHp": 2031,
    "strength": 773,
    "defense": 74,
    "agility": 91,
    "experience": 258461.1,
    "gold": 387691.65,
    "drops": [
      {
        "itemId": "material_bone",
        "chance": 0.252
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.172
      },
      {
        "itemId": "material_energy_jewell",
        "chance": 0.099
      }
    ]
  },
  "skeleton_bat": {
    "id": "skeleton_bat",
    "cityId": "vila_de_valfria",
    "name": "Morcego Esqueleto",
    "imageUrl": "/assets/monsters/skeleton_bat.png",
    "level": 70,
    "maxHp": 2061,
    "strength": 784,
    "defense": 75,
    "agility": 92,
    "experience": 284343.3,
    "gold": 426514.95,
    "drops": [
      {
        "itemId": "misc_herb_bitter",
        "chance": 0.251
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.172
      },
      {
        "itemId": "misc_seed_bitter",
        "chance": 0.099
      }
    ]
  },
  "skeleton_centaur": {
    "id": "skeleton_centaur",
    "cityId": "vila_de_valfria",
    "name": "Centauro Esqueleto",
    "imageUrl": "/assets/monsters/skeleton_centaur.png",
    "level": 71,
    "maxHp": 2376,
    "strength": 764,
    "defense": 94,
    "agility": 60,
    "experience": 315850.7,
    "gold": 473776.05,
    "drops": [
      {
        "itemId": "material_stone_fragment",
        "chance": 0.25
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.172
      },
      {
        "itemId": "misc_seed_bitter",
        "chance": 0.098
      }
    ]
  },
  "skeleton_dragon": {
    "id": "skeleton_dragon",
    "cityId": "necropole_de_morthaly",
    "name": "Dragão Esqueleto",
    "imageUrl": "/assets/monsters/skeleton_dragon.png",
    "level": 107,
    "maxHp": 3913,
    "strength": 1223,
    "defense": 168,
    "agility": 77,
    "experience": 10150628.6,
    "gold": 15225942.9,
    "drops": [
      {
        "itemId": "misc_high_dungeon_key",
        "chance": 0.225
      },
      {
        "itemId": "material_dark_residue",
        "chance": 0.157
      },
      {
        "itemId": "misc_dragon_stone",
        "chance": 0.082
      }
    ]
  },
  "skeleton_naga": {
    "id": "skeleton_naga",
    "cityId": "vila_de_valfria",
    "name": "Naga Esqueleto",
    "imageUrl": "/assets/monsters/skeleton_naga.png",
    "level": 72,
    "maxHp": 2409,
    "strength": 775,
    "defense": 95,
    "agility": 60,
    "experience": 347472.1,
    "gold": 521208.15,
    "drops": [
      {
        "itemId": "misc_herb_bitter",
        "chance": 0.25
      },
      {
        "itemId": "material_energy_jewell",
        "chance": 0.098
      }
    ]
  },
  "skeleton_quadruped_large_new": {
    "id": "skeleton_quadruped_large_new",
    "cityId": "vila_de_valfria",
    "name": "Quadrupede Esqueleto Grande",
    "imageUrl": "/assets/monsters/skeleton_quadruped_large_new.png",
    "level": 73,
    "maxHp": 2669,
    "strength": 834,
    "defense": 114,
    "agility": 53,
    "experience": 396957.9,
    "gold": 595436.85,
    "drops": [
      {
        "itemId": "material_stone_fragment",
        "chance": 0.249
      },
      {
        "itemId": "misc_herb_bitter",
        "chance": 0.171
      },
      {
        "itemId": "material_energy_jewell",
        "chance": 0.097
      }
    ]
  },
  "skeleton_quadruped_small": {
    "id": "skeleton_quadruped_small",
    "cityId": "vila_de_valfria",
    "name": "Quadrupede Esqueleto Pequeno",
    "imageUrl": "/assets/monsters/skeleton_quadruped_small.png",
    "level": 74,
    "maxHp": 2476,
    "strength": 797,
    "defense": 97,
    "agility": 62,
    "experience": 420517.7,
    "gold": 630776.55,
    "drops": [
      {
        "itemId": "misc_herb_bitter",
        "chance": 0.248
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.17
      },
      {
        "itemId": "misc_seed_bitter",
        "chance": 0.097
      }
    ]
  },
  "skeleton_snake": {
    "id": "skeleton_snake",
    "cityId": "vila_de_valfria",
    "name": "Serpente Esqueleto",
    "imageUrl": "/assets/monsters/skeleton_snake.png",
    "level": 75,
    "maxHp": 2208,
    "strength": 840,
    "defense": 81,
    "agility": 99,
    "experience": 458157.8,
    "gold": 687236.7,
    "drops": [
      {
        "itemId": "material_stone_fragment",
        "chance": 0.247
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.17
      },
      {
        "itemId": "material_energy_jewell",
        "chance": 0.096
      }
    ]
  },
  "skeleton_ugly_thing": {
    "id": "skeleton_ugly_thing",
    "cityId": "vila_de_valfria",
    "name": "Coisa Feia Esqueleto",
    "imageUrl": "/assets/monsters/skeleton_ugly_thing.png",
    "level": 76,
    "maxHp": 2543,
    "strength": 818,
    "defense": 100,
    "agility": 64,
    "experience": 508902.9,
    "gold": 763354.35,
    "drops": [
      {
        "itemId": "material_stone_fragment",
        "chance": 0.247
      },
      {
        "itemId": "misc_seed_bitter",
        "chance": 0.096
      }
    ]
  },
  "spectral_ant_old": {
    "id": "spectral_ant_old",
    "cityId": "rosindale",
    "name": "Formiga das Fendas",
    "imageUrl": "/assets/monsters/spectral_ant_old.png",
    "level": 80,
    "maxHp": 2355,
    "strength": 897,
    "defense": 86,
    "agility": 106,
    "experience": 738087.8,
    "gold": 1107131.7,
    "drops": [
      {
        "itemId": "material_strenght_jewell",
        "chance": 0.244
      },
      {
        "itemId": "misc_serlen",
        "chance": 0.094
      }
    ]
  },
  "spectral_bat_old": {
    "id": "spectral_bat_old",
    "cityId": "rosindale",
    "name": "Morcego do Cânion",
    "imageUrl": "/assets/monsters/spectral_bat_old.png",
    "level": 81,
    "maxHp": 2384,
    "strength": 908,
    "defense": 87,
    "agility": 107,
    "experience": 811932.6,
    "gold": 1217898.9,
    "drops": [
      {
        "itemId": "material_strenght_jewell",
        "chance": 0.243
      },
      {
        "itemId": "crystal_dust",
        "chance": 0.168
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.094
      }
    ]
  },
  "spectral_bee_old": {
    "id": "spectral_bee_old",
    "cityId": "rosindale",
    "name": "Abelha de Salitre",
    "imageUrl": "/assets/monsters/spectral_bee_old.png",
    "level": 82,
    "maxHp": 2414,
    "strength": 919,
    "defense": 88,
    "agility": 108,
    "experience": 893161.9,
    "gold": 1339742.85,
    "drops": [
      {
        "itemId": "crystal_dust",
        "chance": 0.243
      },
      {
        "itemId": "material_dexerity_jewell",
        "chance": 0.167
      },
      {
        "itemId": "misc_serlen",
        "chance": 0.093
      }
    ]
  },
  "spectral_centaur_old": {
    "id": "spectral_centaur_old",
    "cityId": "rosindale",
    "name": "Centauro das Gargantas",
    "imageUrl": "/assets/monsters/spectral_centaur_old.png",
    "level": 83,
    "maxHp": 2778,
    "strength": 894,
    "defense": 109,
    "agility": 70,
    "experience": 992053.1,
    "gold": 1488079.65,
    "drops": [
      {
        "itemId": "material_dexerity_jewell",
        "chance": 0.242
      },
      {
        "itemId": "material_stone_fragment",
        "chance": 0.167
      },
      {
        "itemId": "material_mysterious_jewell",
        "chance": 0.093
      }
    ]
  },
  "spectral_dragon_old": {
    "id": "spectral_dragon_old",
    "cityId": "necropole_de_morthaly",
    "name": "Dragão Espectral Antigo",
    "imageUrl": "/assets/monsters/spectral_dragon_old.png",
    "level": 108,
    "maxHp": 3949,
    "strength": 1234,
    "defense": 169,
    "agility": 78,
    "experience": 11165729.3,
    "gold": 16748593.95,
    "drops": [
      {
        "itemId": "material_dark_residue",
        "chance": 0.224
      },
      {
        "itemId": "misc_dragon_stone",
        "chance": 0.081
      }
    ]
  },
  "spectral_hydra_3_old": {
    "id": "spectral_hydra_3_old",
    "cityId": "necropole_de_morthaly",
    "name": "Hidra Espectral Antiga",
    "imageUrl": "/assets/monsters/spectral_hydra_3_old.png",
    "level": 109,
    "maxHp": 3986,
    "strength": 1246,
    "defense": 170,
    "agility": 78,
    "experience": 12282340.0,
    "gold": 18423510.0,
    "drops": [
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.224
      },
      {
        "itemId": "material_dark_residue",
        "chance": 0.156
      },
      {
        "itemId": "misc_dragon_stone",
        "chance": 0.081
      }
    ]
  },
  "spectral_fish_old": {
    "id": "spectral_fish_old",
    "cityId": "porto_sombrio",
    "name": "Peixe Espectral do Porto",
    "imageUrl": "/assets/monsters/spectral_fish_old.png",
    "level": 101,
    "maxHp": 3380,
    "strength": 1088,
    "defense": 133,
    "agility": 85,
    "experience": 5517393.2,
    "gold": 8276089.8,
    "drops": [
      {
        "itemId": "material_bone",
        "chance": 0.229
      },
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.16
      },
      {
        "itemId": "health_potion_medium",
        "chance": 0.085
      }
    ]
  },
  "spectral_naga_old": {
    "id": "spectral_naga_old",
    "cityId": "rosindale",
    "name": "Naga do Desfiladeiro",
    "imageUrl": "/assets/monsters/spectral_naga_old.png",
    "level": 84,
    "maxHp": 2811,
    "strength": 905,
    "defense": 110,
    "agility": 71,
    "experience": 1091294.8,
    "gold": 1636942.2,
    "drops": [
      {
        "itemId": "material_strenght_jewell",
        "chance": 0.241
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.092
      }
    ]
  },
  "spectral_quadruped_small_old": {
    "id": "spectral_quadruped_small_old",
    "cityId": "rosindale",
    "name": "Quadrúpede das Fendas",
    "imageUrl": "/assets/monsters/spectral_quadruped_small_old.png",
    "level": 85,
    "maxHp": 2845,
    "strength": 915,
    "defense": 112,
    "agility": 71,
    "experience": 1200460.7,
    "gold": 1800691.05,
    "drops": [
      {
        "itemId": "material_strenght_jewell",
        "chance": 0.24
      },
      {
        "itemId": "crystal_dust",
        "chance": 0.166
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.092
      }
    ]
  },
  "spectral_snake_old": {
    "id": "spectral_snake_old",
    "cityId": "rosindale",
    "name": "Serpente da Miragem",
    "imageUrl": "/assets/monsters/spectral_snake_old.png",
    "level": 93,
    "maxHp": 2738,
    "strength": 1042,
    "defense": 99,
    "agility": 123,
    "experience": 2548963.2,
    "gold": 3823444.8,
    "drops": [
      {
        "itemId": "material_dexerity_jewell",
        "chance": 0.235
      },
      {
        "itemId": "material_strenght_jewell",
        "chance": 0.163
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.088
      }
    ]
  },
  "spectral_spider_old": {
    "id": "spectral_spider_old",
    "cityId": "rosindale",
    "name": "Aranha Rubra das Ravinas",
    "imageUrl": "/assets/monsters/spectral_spider_old.png",
    "level": 86,
    "maxHp": 2532,
    "strength": 964,
    "defense": 92,
    "agility": 114,
    "experience": 1307845.7,
    "gold": 1961768.55,
    "drops": [
      {
        "itemId": "material_strenght_jewell",
        "chance": 0.24
      },
      {
        "itemId": "material_stone_fragment",
        "chance": 0.166
      },
      {
        "itemId": "misc_serlen",
        "chance": 0.091
      }
    ]
  },
  "spectral_thing": {
    "id": "spectral_thing",
    "cityId": "rosindale",
    "name": "Miragem Hostil",
    "imageUrl": "/assets/monsters/spectral_thing.png",
    "level": 87,
    "maxHp": 2912,
    "strength": 937,
    "defense": 114,
    "agility": 73,
    "experience": 1452633.9,
    "gold": 2178950.85,
    "drops": [
      {
        "itemId": "crystal_dust",
        "chance": 0.239
      },
      {
        "itemId": "material_strenght_jewell",
        "chance": 0.165
      },
      {
        "itemId": "misc_serlen",
        "chance": 0.091
      }
    ]
  },
  "spectral_worm": {
    "id": "spectral_worm",
    "cityId": "rosindale",
    "name": "Verme da Ravina",
    "imageUrl": "/assets/monsters/spectral_worm.png",
    "level": 88,
    "maxHp": 2945,
    "strength": 948,
    "defense": 116,
    "agility": 74,
    "experience": 1597933.7,
    "gold": 2396900.55,
    "drops": [
      {
        "itemId": "material_strenght_jewell",
        "chance": 0.238
      },
      {
        "itemId": "misc_serlen",
        "chance": 0.09
      }
    ]
  },
  "two_headed_ogre": {
    "id": "two_headed_ogre",
    "cityId": "rosindale",
    "name": "Ogro de Duas Cabeças",
    "imageUrl": "/assets/monsters/two_headed_ogre.png",
    "level": 89,
    "maxHp": 3254,
    "strength": 1017,
    "defense": 140,
    "agility": 64,
    "experience": 1825369.8,
    "gold": 2738054.7,
    "drops": [
      {
        "itemId": "material_stone_fragment",
        "chance": 0.238
      },
      {
        "itemId": "material_dexerity_jewell",
        "chance": 0.164
      },
      {
        "itemId": "misc_serlen",
        "chance": 0.09
      }
    ]
  },
  "viper": {
    "id": "viper",
    "cityId": "rosindale",
    "name": "Vibora",
    "imageUrl": "/assets/monsters/viper.png",
    "level": 90,
    "maxHp": 2650,
    "strength": 1009,
    "defense": 97,
    "agility": 119,
    "experience": 1914984.2,
    "gold": 2872476.3,
    "drops": [
      {
        "itemId": "material_strenght_jewell",
        "chance": 0.237
      },
      {
        "itemId": "material_stone_fragment",
        "chance": 0.164
      },
      {
        "itemId": "misc_serlen",
        "chance": 0.089
      }
    ]
  },
  "wolf_spider_new": {
    "id": "wolf_spider_new",
    "cityId": "rosindale",
    "name": "Aranha-Lobo das Fendas",
    "imageUrl": "/assets/monsters/wolf_spider_new.png",
    "level": 91,
    "maxHp": 2679,
    "strength": 1020,
    "defense": 98,
    "agility": 120,
    "experience": 2106518.6,
    "gold": 3159777.9,
    "drops": [
      {
        "itemId": "crystal_dust",
        "chance": 0.236
      },
      {
        "itemId": "material_strenght_jewell",
        "chance": 0.164
      },
      {
        "itemId": "material_mysterious_jewell",
        "chance": 0.089
      }
    ]
  },
  "wolf_spider_old": {
    "id": "wolf_spider_old",
    "cityId": "rosindale",
    "name": "Aranha-Lobo Antiga",
    "imageUrl": "/assets/monsters/wolf_spider_old.png",
    "level": 92,
    "maxHp": 2708,
    "strength": 1031,
    "defense": 99,
    "agility": 121,
    "experience": 2317206.5,
    "gold": 3475809.75,
    "drops": [
      {
        "itemId": "material_stone_fragment",
        "chance": 0.236
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.089
      }
    ]
  },
  "zombie_crab": {
    "id": "zombie_crab",
    "cityId": "porto_sombrio",
    "name": "Caranguejo Zumbi",
    "imageUrl": "/assets/monsters/zombie_crab.png",
    "level": 94,
    "maxHp": 3146,
    "strength": 1012,
    "defense": 124,
    "agility": 79,
    "experience": 2831117.9,
    "gold": 4246676.85,
    "drops": [
      {
        "itemId": "material_bone",
        "chance": 0.234
      },
      {
        "itemId": "misc_dungeon_key",
        "chance": 0.162
      },
      {
        "itemId": "material_spectre_jewell",
        "chance": 0.088
      }
    ]
  },
  "zombie_drake_infected": {
    "id": "zombie_drake_infected",
    "cityId": "necropole_de_morthaly",
    "name": "Draco Zumbi Infectado",
    "imageUrl": "/assets/monsters/zombie_drake_infected.png",
    "level": 112,
    "maxHp": 3749,
    "strength": 1206,
    "defense": 148,
    "agility": 94,
    "experience": 15742441.2,
    "gold": 23613661.8,
    "drops": [
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.222
      },
      {
        "itemId": "material_dragon_essence",
        "chance": 0.08
      }
    ]
  },
  "zombie_drake": {
    "id": "zombie_drake",
    "cityId": "necropole_de_morthaly",
    "name": "Draco Zumbi",
    "imageUrl": "/assets/monsters/zombie_drake.png",
    "level": 113,
    "maxHp": 3782,
    "strength": 1217,
    "defense": 149,
    "agility": 95,
    "experience": 17316721.7,
    "gold": 25975082.55,
    "drops": [
      {
        "itemId": "material_dark_magic_rune",
        "chance": 0.221
      },
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.155
      },
      {
        "itemId": "material_dragon_essence",
        "chance": 0.079
      }
    ]
  },
  "zombie_hound_infected": {
    "id": "zombie_hound_infected",
    "cityId": "necropole_de_morthaly",
    "name": "Cão Zumbi Infectado",
    "imageUrl": "/assets/monsters/zombie_hound_infected.png",
    "level": 110,
    "maxHp": 3682,
    "strength": 1185,
    "defense": 145,
    "agility": 92,
    "experience": 13010218.8,
    "gold": 19515328.2,
    "drops": [
      {
        "itemId": "material_dark_magic_rune",
        "chance": 0.223
      },
      {
        "itemId": "material_dark_residue",
        "chance": 0.156
      },
      {
        "itemId": "misc_dragon_stone",
        "chance": 0.081
      }
    ]
  },
  "zombie_hound": {
    "id": "zombie_hound",
    "cityId": "necropole_de_morthaly",
    "name": "Cão Zumbi",
    "imageUrl": "/assets/monsters/zombie_hound.png",
    "level": 111,
    "maxHp": 3715,
    "strength": 1196,
    "defense": 146,
    "agility": 93,
    "experience": 14311277.1,
    "gold": 21466915.65,
    "drops": [
      {
        "itemId": "misc_high_dungeon_key",
        "chance": 0.222
      },
      {
        "itemId": "material_dark_residue",
        "chance": 0.156
      },
      {
        "itemId": "misc_dragon_stone",
        "chance": 0.08
      }
    ]
  },
  "zombie_kraken_head": {
    "id": "zombie_kraken_head",
    "cityId": "porto_sombrio",
    "name": "Cabeça de Kraken Zumbi",
    "imageUrl": "/assets/monsters/zombie_kraken_head.png",
    "level": 95,
    "maxHp": 3180,
    "strength": 1023,
    "defense": 125,
    "agility": 80,
    "experience": 3114266.1,
    "gold": 4671399.15,
    "drops": [
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.233
      },
      {
        "itemId": "material_bone",
        "chance": 0.162
      },
      {
        "itemId": "material_spectre_jewell",
        "chance": 0.087
      }
    ]
  },
  "zombie_lizard_infected": {
    "id": "zombie_lizard_infected",
    "cityId": "porto_sombrio",
    "name": "Lagarto Zumbi Infectado",
    "imageUrl": "/assets/monsters/zombie_lizard_infected.png",
    "level": 102,
    "maxHp": 3414,
    "strength": 1099,
    "defense": 134,
    "agility": 86,
    "experience": 6069168.9,
    "gold": 9103753.35,
    "drops": [
      {
        "itemId": "material_dark_residue",
        "chance": 0.229
      },
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.159
      },
      {
        "itemId": "ticket_ship",
        "chance": 0.084
      }
    ]
  },
  "zombie_kraken_infected": {
    "id": "zombie_kraken_infected",
    "cityId": "porto_sombrio",
    "name": "Kraken Zumbi Infectado",
    "imageUrl": "/assets/monsters/zombie_kraken_infected.png",
    "level": 96,
    "maxHp": 3213,
    "strength": 1034,
    "defense": 126,
    "agility": 81,
    "experience": 3425729.1,
    "gold": 5138593.65,
    "drops": [
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.233
      },
      {
        "itemId": "health_potion_medium",
        "chance": 0.087
      }
    ]
  },
  "zombie_lizard": {
    "id": "zombie_lizard",
    "cityId": "porto_sombrio",
    "name": "Lagarto Zumbi",
    "imageUrl": "/assets/monsters/zombie_lizard.png",
    "level": 103,
    "maxHp": 3447,
    "strength": 1109,
    "defense": 136,
    "agility": 87,
    "experience": 6676122.2,
    "gold": 10014183.3,
    "drops": [
      {
        "itemId": "misc_dungeon_key",
        "chance": 0.228
      },
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.159
      },
      {
        "itemId": "health_potion_medium",
        "chance": 0.084
      }
    ]
  },
  "zombie_octopode_infected": {
    "id": "zombie_octopode_infected",
    "cityId": "porto_sombrio",
    "name": "Octopode Zumbi Infectado",
    "imageUrl": "/assets/monsters/zombie_octopode_infected.png",
    "level": 97,
    "maxHp": 3246,
    "strength": 1045,
    "defense": 127,
    "agility": 81,
    "experience": 3768338.4,
    "gold": 5652507.6,
    "drops": [
      {
        "itemId": "misc_dungeon_key",
        "chance": 0.232
      },
      {
        "itemId": "material_dark_residue",
        "chance": 0.161
      },
      {
        "itemId": "ticket_ship",
        "chance": 0.086
      }
    ]
  },
  "zombie_octopode": {
    "id": "zombie_octopode",
    "cityId": "porto_sombrio",
    "name": "Octopode Zumbi",
    "imageUrl": "/assets/monsters/zombie_octopode.png",
    "level": 98,
    "maxHp": 3280,
    "strength": 1055,
    "defense": 130,
    "agility": 82,
    "experience": 4145208.6,
    "gold": 6217812.9,
    "drops": [
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.231
      },
      {
        "itemId": "material_dark_residue",
        "chance": 0.161
      },
      {
        "itemId": "health_potion_medium",
        "chance": 0.086
      }
    ]
  },
  "zombie_ogre_infected": {
    "id": "zombie_ogre_infected",
    "cityId": "necropole_de_morthaly",
    "name": "Ogro Zumbi Infectado",
    "imageUrl": "/assets/monsters/zombie_ogre_infected.png",
    "level": 114,
    "maxHp": 4169,
    "strength": 1303,
    "defense": 178,
    "agility": 82,
    "experience": 19781062.2,
    "gold": 29671593.3,
    "drops": [
      {
        "itemId": "misc_high_dungeon_key",
        "chance": 0.22
      },
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.154
      },
      {
        "itemId": "material_dragon_essence",
        "chance": 0.079
      }
    ]
  },
  "zombie_ogre": {
    "id": "zombie_ogre",
    "cityId": "necropole_de_morthaly",
    "name": "Ogro Zumbi",
    "imageUrl": "/assets/monsters/zombie_ogre.png",
    "level": 115,
    "maxHp": 4206,
    "strength": 1315,
    "defense": 179,
    "agility": 83,
    "experience": 21759206.2,
    "gold": 32638809.3,
    "drops": [
      {
        "itemId": "material_dark_residue",
        "chance": 0.219
      },
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.154
      },
      {
        "itemId": "material_dragon_essence",
        "chance": 0.078
      }
    ]
  },
  "zombie_rat": {
    "id": "zombie_rat",
    "cityId": "porto_sombrio",
    "name": "Rato Zumbi",
    "imageUrl": "/assets/monsters/zombie_rat.png",
    "level": 104,
    "maxHp": 3062,
    "strength": 1166,
    "defense": 112,
    "agility": 137,
    "experience": 7273157.6,
    "gold": 10909736.4,
    "drops": [
      {
        "itemId": "material_dark_residue",
        "chance": 0.227
      },
      {
        "itemId": "health_potion_medium",
        "chance": 0.083
      }
    ]
  },
  "zombie_small": {
    "id": "zombie_small",
    "cityId": "necropole_de_morthaly",
    "name": "Zumbi Pequeno",
    "imageUrl": "/assets/monsters/zombie_small.png",
    "level": 116,
    "maxHp": 3883,
    "strength": 1250,
    "defense": 153,
    "agility": 97,
    "experience": 23048677.1,
    "gold": 34573015.65,
    "drops": [
      {
        "itemId": "material_dark_residue",
        "chance": 0.219
      },
      {
        "itemId": "misc_dragon_stone",
        "chance": 0.078
      }
    ]
  },
  "zombie_toad": {
    "id": "zombie_toad",
    "cityId": "necropole_de_morthaly",
    "name": "Sapo Zumbi",
    "imageUrl": "/assets/monsters/zombie_toad.png",
    "level": 117,
    "maxHp": 3916,
    "strength": 1260,
    "defense": 154,
    "agility": 98,
    "experience": 25353581.2,
    "gold": 38030371.8,
    "drops": [
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.218
      },
      {
        "itemId": "material_dark_residue",
        "chance": 0.153
      },
      {
        "itemId": "misc_dragon_stone",
        "chance": 0.077
      }
    ]
  },
  "zombie_turtle_infected": {
    "id": "zombie_turtle_infected",
    "cityId": "porto_sombrio",
    "name": "Tartaruga Zumbi Infectada",
    "imageUrl": "/assets/monsters/zombie_turtle_infected.png",
    "level": 99,
    "maxHp": 3620,
    "strength": 1132,
    "defense": 155,
    "agility": 71,
    "experience": 4735141.5,
    "gold": 7102712.25,
    "drops": [
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.231
      },
      {
        "itemId": "material_bone",
        "chance": 0.16
      },
      {
        "itemId": "health_potion_medium",
        "chance": 0.085
      }
    ]
  },
  "zombie_turtle": {
    "id": "zombie_turtle",
    "cityId": "porto_sombrio",
    "name": "Tartaruga Zumbi",
    "imageUrl": "/assets/monsters/zombie_turtle.png",
    "level": 100,
    "maxHp": 3657,
    "strength": 1143,
    "defense": 156,
    "agility": 72,
    "experience": 5208693.5,
    "gold": 7813040.25,
    "drops": [
      {
        "itemId": "material_bone",
        "chance": 0.23
      },
      {
        "itemId": "material_spectre_jewell",
        "chance": 0.085
      }
    ]
  },
  "zombie_ugly_thing_infected": {
    "id": "zombie_ugly_thing_infected",
    "cityId": "necropole_de_morthaly",
    "name": "Coisa Feia Zumbi Infectada",
    "imageUrl": "/assets/monsters/zombie_ugly_thing_infected.png",
    "level": 118,
    "maxHp": 3950,
    "strength": 1271,
    "defense": 156,
    "agility": 99,
    "experience": 27888975.7,
    "gold": 41833463.55,
    "drops": [
      {
        "itemId": "material_dark_magic_rune",
        "chance": 0.217
      },
      {
        "itemId": "material_dark_residue",
        "chance": 0.153
      },
      {
        "itemId": "misc_dragon_stone",
        "chance": 0.077
      }
    ]
  },
  "zombie_ugly_thing": {
    "id": "zombie_ugly_thing",
    "cityId": "necropole_de_morthaly",
    "name": "Coisa Feia Zumbi",
    "imageUrl": "/assets/monsters/zombie_ugly_thing.png",
    "level": 119,
    "maxHp": 3983,
    "strength": 1282,
    "defense": 157,
    "agility": 100,
    "experience": 30677909.7,
    "gold": 46016864.55,
    "drops": [
      {
        "itemId": "misc_high_dungeon_key",
        "chance": 0.217
      },
      {
        "itemId": "material_dark_residue",
        "chance": 0.152
      },
      {
        "itemId": "misc_dragon_stone",
        "chance": 0.076
      }
    ]
  }
};
