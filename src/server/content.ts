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
        goldBonusPercent: 0.5
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
    "price": 500,
    "imageUrl": "/assets/items/misc/train-ticket.png",
    "stats": {},
    "description": "Permite viajar de trem entre cidades do mesmo país."
  },
  "ticket_ship": {
    "id": "ticket_ship",
    "name": "Ticket de Navio",
    "kind": "ticket",
    "minLevel": 1,
    "imageUrl": "/assets/items/misc/ship-ticket.png",
    "price": 5000,
    "stats": {},
    "description": "Permite cruzar mares e chegar aos portos de outros países."
  },
  "armor_leather": {
    "id": "armor_leather",
    "name": "Armadura de Couro",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/00-leather.png",
    "minLevel": 1,
    "price": 165,
    "stats": {
      "defense": 11,
      "constitution": 1
    },
    "description": "Proteção leve que aumenta defesa e constituição."
  },
  "armor_steel": {
    "id": "armor_steel",
    "name": "Armadura de Aco",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/01-steel.png",
    "minLevel": 10,
    "price": 1010,
    "stats": {
      "defense": 38,
      "constitution": 1
    },
    "description": "Proteção resistente que aumenta defesa e constituição."
  },
  "armor_mystic": {
    "id": "armor_mystic",
    "name": "Armadura Mística",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/02-mystic.png",
    "minLevel": 20,
    "price": 3050,
    "stats": {
      "defense": 68,
      "constitution": 3
    },
    "description": "Proteção arcana que aumenta defesa e constituição."
  },
  "armor_kharlee": {
    "id": "armor_kharlee",
    "name": "Armadura de Kharlee",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/03-kharlee.png",
    "minLevel": 30,
    "price": 6250,
    "stats": {
      "defense": 98,
      "constitution": 4
    },
    "description": "Proteção refinada que aumenta defesa e constituição."
  },
  "armor_cursed": {
    "id": "armor_cursed",
    "name": "Armadura Amaldiçoada",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/04-cursed.png",
    "minLevel": 40,
    "price": 10610,
    "stats": {
      "defense": 128,
      "constitution": 6
    },
    "description": "Proteção maldita que aumenta defesa e constituição."
  },
  "armor_justice": {
    "id": "armor_justice",
    "name": "Armadura da Justiça",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/05-justice.png",
    "minLevel": 50,
    "price": 16130,
    "stats": {
      "defense": 158,
      "constitution": 7
    },
    "description": "Proteção justa que aumenta defesa e constituição."
  },
  "armor_obscure": {
    "id": "armor_obscure",
    "name": "Armadura Obscura",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/96-obscure.png",
    "minLevel": 60,
    "price": 22810,
    "stats": {
      "defense": 188,
      "constitution": 9
    },
    "description": "Proteção sombria que aumenta defesa e constituição."
  },
  "armor_death": {
    "id": "armor_death",
    "name": "Armadura da Morte",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/106-death.png",
    "minLevel": 70,
    "price": 30650,
    "stats": {
      "defense": 218,
      "constitution": 10
    },
    "description": "Proteção fúnebre que aumenta defesa e constituição."
  },
  "armor_dragon": {
    "id": "armor_dragon",
    "name": "Armadura de Dragão",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/114-dragon.png",
    "minLevel": 80,
    "price": 39650,
    "stats": {
      "defense": 248,
      "constitution": 11
    },
    "description": "Proteção dracônica que aumenta defesa e constituição."
  },
  "armor_dhron": {
    "id": "armor_dhron",
    "name": "Armadura de Dhron",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/124-dhron.png",
    "minLevel": 90,
    "price": 49810,
    "stats": {
      "defense": 278,
      "constitution": 13
    },
    "description": "Proteção ancestral que aumenta defesa e constituição."
  },
  "armor_erins": {
    "id": "armor_erins",
    "name": "Armadura de Erins",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/140-erins.png",
    "minLevel": 100,
    "price": 61130,
    "stats": {
      "defense": 308,
      "constitution": 14
    },
    "description": "Proteção lendária que aumenta defesa e constituição."
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
    "description": "Entrada azul para desafios e recompensas da arena."
  },
  "material_gold_coin": {
    "id": "material_gold_coin",
    "name": "Moeda da Arena",
    "kind": "material",
    "imageUrl": "/assets/items/materials/gold_coin.png",
    "minLevel": 1,
    "price": 15,
    "stats": {},
    "description": "Moeda conquistada na arena, trocada por recompensas especiais."
  },
  "material_bone": {
    "id": "material_bone",
    "name": "Osso",
    "kind": "material",
    "imageUrl": "/assets/items/materials/bone.png",
    "minLevel": 1,
    "price": 15,
    "stats": {},
    "description": "Osso resistente para receitas rústicas e aprimoramentos básicos."
  },
  "material_celena": {
    "id": "material_celena",
    "name": "Celena",
    "kind": "material",
    "imageUrl": "/assets/items/materials/celena.png",
    "minLevel": 60,
    "price": 620,
    "stats": {},
    "description": "Catalisador superior para aprimorar equipamentos de alto nível."
  },
  "material_chimera_jewell": {
    "id": "material_chimera_jewell",
    "name": "Joia de Quimera",
    "kind": "material",
    "imageUrl": "/assets/items/materials/chimera_jewell.png",
    "minLevel": 1,
    "price": 15,
    "stats": {},
    "description": "Joia híbrida usada em criações instáveis e poderosas."
  },
  "material_dark_magic_rune": {
    "id": "material_dark_magic_rune",
    "name": "Runa de Magia Sombria",
    "kind": "material",
    "imageUrl": "/assets/items/materials/dark_magic_rune.png",
    "minLevel": 80,
    "price": 460,
    "stats": {},
    "description": "Runa sombria para forjas amaldiçoadas e rituais obscuros."
  },
  "material_dark_residue": {
    "id": "material_dark_residue",
    "name": "Residuo Sombrio",
    "kind": "material",
    "imageUrl": "/assets/items/materials/dark_residue.png",
    "minLevel": 80,
    "price": 420,
    "stats": {},
    "description": "Resíduo sombrio usado em criações de Morthaly."
  },
  "material_dexerity_jewell": {
    "id": "material_dexerity_jewell",
    "name": "Joia de Destreza",
    "kind": "material",
    "imageUrl": "/assets/items/materials/dexerity_jewell.png",
    "minLevel": 2,
    "price": 22,
    "stats": {},
    "description": "Joia precisa para criações focadas em agilidade."
  },
  "material_dragon_essence": {
    "id": "material_dragon_essence",
    "name": "Essência de Dragão",
    "kind": "material",
    "imageUrl": "/assets/items/materials/dragon_essence.png",
    "minLevel": 2,
    "price": 22,
    "stats": {},
    "description": "Essência dracônica para criações raras e poderosas."
  },
  "material_dragon_jewell": {
    "id": "material_dragon_jewell",
    "name": "Joia de Dragão",
    "kind": "material",
    "imageUrl": "/assets/items/materials/dragon_jewell.png",
    "minLevel": 3,
    "price": 29,
    "stats": {},
    "description": "Joia dracônica usada em equipamentos de grande poder."
  },
  "material_dragon_nail": {
    "id": "material_dragon_nail",
    "name": "Garra de Dragão",
    "kind": "material",
    "imageUrl": "/assets/items/materials/dragon_nail.png",
    "minLevel": 3,
    "price": 29,
    "stats": {},
    "description": "Garra dracônica para armas afiadas e reforços resistentes."
  },
  "material_dragons_tooth": {
    "id": "material_dragons_tooth",
    "name": "Dente de Dragão",
    "kind": "material",
    "imageUrl": "/assets/items/materials/dragons_tooth.png",
    "minLevel": 3,
    "price": 29,
    "stats": {},
    "description": "Dente dracônico para forjas agressivas e materiais raros."
  },
  "material_energy_jewell": {
    "id": "material_energy_jewell",
    "name": "Joia de Energia",
    "kind": "material",
    "imageUrl": "/assets/items/materials/energy_jewell.png",
    "minLevel": 3,
    "price": 29,
    "stats": {},
    "description": "Joia energética usada em poções e artefatos de vigor."
  },
  "material_eran_fragment": {
    "id": "material_eran_fragment",
    "name": "Fragmento de Eran",
    "kind": "material",
    "imageUrl": "/assets/items/materials/eran_fragment.png",
    "minLevel": 25,
    "price": 80,
    "stats": {},
    "description": "Fragmento usado para refinar a Pedra de Eran."
  },
  "material_green_coin": {
    "id": "material_green_coin",
    "name": "Moeda Verde",
    "kind": "material",
    "imageUrl": "/assets/items/materials/green_coin.png",
    "minLevel": 4,
    "price": 36,
    "stats": {},
    "description": "Moeda verde usada em trocas especiais de criação."
  },
  "material_gromin_mycelium": {
    "id": "material_gromin_mycelium",
    "name": "Micelio de Gromin",
    "kind": "material",
    "imageUrl": "/assets/items/materials/gromin_mycelium.png",
    "minLevel": 4,
    "price": 36,
    "stats": {},
    "description": "Micélio raro para alquimia, poções e receitas naturais."
  },
  "material_herb": {
    "id": "material_herb",
    "name": "Erva",
    "kind": "material",
    "imageUrl": "/assets/items/materials/herb.png",
    "minLevel": 4,
    "price": 36,
    "stats": {},
    "description": "Erva simples para poções leves e receitas básicas."
  },
  "material_laede_fragment": {
    "id": "material_laede_fragment",
    "name": "Fragmento de Laede",
    "kind": "material",
    "imageUrl": "/assets/items/materials/laede_fragment.png",
    "minLevel": 5,
    "price": 43,
    "stats": {},
    "description": "Fragmento místico usado em receitas arcanas intermediárias."
  },
  "material_magic_essence": {
    "id": "material_magic_essence",
    "name": "Essência Mágica",
    "kind": "material",
    "imageUrl": "/assets/items/materials/magic_essence.png",
    "minLevel": 25,
    "price": 110,
    "stats": {},
    "description": "Essência arcana para alquimia e forjas mágicas."
  },
  "material_midran": {
    "id": "material_midran",
    "name": "Midran",
    "kind": "material",
    "imageUrl": "/assets/items/materials/midran.png",
    "minLevel": 80,
    "price": 1250,
    "stats": {},
    "description": "Material supremo para aprimorar equipamentos lendários."
  },
  "material_mycelium_fungus": {
    "id": "material_mycelium_fungus",
    "name": "Fungo Micelial",
    "kind": "material",
    "imageUrl": "/assets/items/materials/mycelium_fungus.png",
    "minLevel": 5,
    "price": 43,
    "stats": {},
    "description": "Fungo micelial para misturas alquímicas e receitas orgânicas."
  },
  "material_mysterious_jewell": {
    "id": "material_mysterious_jewell",
    "name": "Joia Misteriosa",
    "kind": "material",
    "imageUrl": "/assets/items/materials/mysterious_jewell.png",
    "minLevel": 55,
    "price": 260,
    "stats": {},
    "description": "Joia enigmática para refinamentos superiores e amuletos raros."
  },
  "material_old_stone": {
    "id": "material_old_stone",
    "name": "Pedra Antiga",
    "kind": "material",
    "imageUrl": "/assets/items/materials/old_stone.png",
    "minLevel": 20,
    "price": 140,
    "stats": {},
    "description": "Base mineral para a primeira etapa de aprimoramentos."
  },
  "material_purple_coin": {
    "id": "material_purple_coin",
    "name": "Moeda Roxa",
    "kind": "material",
    "imageUrl": "/assets/items/materials/purple_coin.png",
    "minLevel": 6,
    "price": 50,
    "stats": {},
    "description": "Moeda roxa usada em trocas raras e receitas especiais."
  },
  "material_spectre_fragment": {
    "id": "material_spectre_fragment",
    "name": "Fragmento Espectral",
    "kind": "material",
    "imageUrl": "/assets/items/materials/spectre_fragment.png",
    "minLevel": 6,
    "price": 50,
    "stats": {},
    "description": "Fragmento etéreo para criações sombrias e encantamentos leves."
  },
  "material_spectre_jewell": {
    "id": "material_spectre_jewell",
    "name": "Joia Espectral",
    "kind": "material",
    "imageUrl": "/assets/items/materials/spectre_jewell.png",
    "minLevel": 7,
    "price": 57,
    "stats": {},
    "description": "Joia espectral usada em equipamentos e amuletos sombrios."
  },
  "material_stone_fragment": {
    "id": "material_stone_fragment",
    "name": "Fragmento de Pedra",
    "kind": "material",
    "imageUrl": "/assets/items/materials/stone_fragment.png",
    "minLevel": 10,
    "price": 45,
    "stats": {},
    "description": "Fragmento mineral usado para formar Pedra Antiga."
  },
  "material_strenght_jewell": {
    "id": "material_strenght_jewell",
    "name": "Joia de Força",
    "kind": "material",
    "imageUrl": "/assets/items/materials/strenght_jewell.png",
    "minLevel": 7,
    "price": 57,
    "stats": {},
    "description": "Joia robusta para criações focadas em força."
  },
  "material_udania": {
    "id": "material_udania",
    "name": "Udania",
    "kind": "material",
    "imageUrl": "/assets/items/materials/udania.png",
    "minLevel": 7,
    "price": 57,
    "stats": {},
    "description": "Ingrediente raro para receitas exóticas e aprimoramentos arcanos."
  },
  "misc_doemia": {
    "id": "misc_doemia",
    "name": "Doemia",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/doemia.png",
    "minLevel": 1,
    "price": 20,
    "stats": {},
    "description": "Ingrediente incomum para receitas, chaves e eventos especiais."
  },
  "misc_dragon_stone": {
    "id": "misc_dragon_stone",
    "name": "Pedra de Dragão",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/dragon_stone.png",
    "minLevel": 1,
    "price": 20,
    "stats": {},
    "description": "Pedra dracônica para criações raras e forjas poderosas."
  },
  "misc_dungeon_key": {
    "id": "misc_dungeon_key",
    "name": "Chave de Masmorra",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/dungeon-key.png",
    "minLevel": 1,
    "price": 20,
    "stats": {},
    "description": "Abre masmorras simples e caminhos de aventura."
  },
  "scroll_enhanced_parchment": {
    "id": "scroll_enhanced_parchment",
    "name": "Pergaminho Aprimorado",
    "kind": "scroll",
    "imageUrl": "/assets/items/misc/enhanced-parchment.png",
    "minLevel": 1,
    "price": 20,
    "stats": {},
    "description": "Pergaminho refinado para receitas e efeitos especiais."
  },
  "misc_eran": {
    "id": "misc_eran",
    "name": "Pedra de Eran",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/eran.png",
    "minLevel": 40,
    "price": 300,
    "stats": {},
    "description": "Pedra superior usada na segunda etapa de aprimoramentos."
  },
  "misc_erins_chest_1": {
    "id": "misc_erins_chest_1",
    "name": "Bau de Erins 1",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/erins-chest-1.png",
    "minLevel": 2,
    "price": 28,
    "stats": {},
    "description": "Baú simples com recompensas ligadas a Erins."
  },
  "misc_erins_chest_2": {
    "id": "misc_erins_chest_2",
    "name": "Bau de Erins 2",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/erins-chest-2.png",
    "minLevel": 2,
    "price": 28,
    "stats": {},
    "description": "Baú reforçado com recompensas ligadas a Erins."
  },
  "misc_erins_chest_3": {
    "id": "misc_erins_chest_3",
    "name": "Bau de Erins 3",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/erins-chest-3.png",
    "minLevel": 2,
    "price": 28,
    "stats": {},
    "description": "Baú valioso com recompensas ligadas a Erins."
  },
  "misc_erins_chest": {
    "id": "misc_erins_chest",
    "name": "Bau de Erins",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/erins-chest.png",
    "minLevel": 2,
    "price": 28,
    "stats": {},
    "description": "Baú de Erins com recompensas variadas."
  },
  "scroll_fraddo_parchment": {
    "id": "scroll_fraddo_parchment",
    "name": "Pergaminho de Fraddo",
    "kind": "scroll",
    "imageUrl": "/assets/items/misc/fraddo-parchment.png",
    "minLevel": 2,
    "price": 28,
    "stats": {},
    "description": "Pergaminho antigo para receitas e efeitos especiais."
  },
  "misc_herb_bitter": {
    "id": "misc_herb_bitter",
    "name": "Erva Amarga",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/herb_bitter.png",
    "minLevel": 3,
    "price": 36,
    "stats": {},
    "description": "Erva amarga usada em poções fortes e misturas secas."
  },
  "misc_herb_moss": {
    "id": "misc_herb_moss",
    "name": "Erva de Musgo",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/herb_moss.png",
    "minLevel": 3,
    "price": 36,
    "stats": {},
    "description": "Erva musgosa usada em poções naturais e receitas úmidas."
  },
  "misc_herb_rustic": {
    "id": "misc_herb_rustic",
    "name": "Erva Rústica",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/herb_rustic.png",
    "minLevel": 3,
    "price": 36,
    "stats": {},
    "description": "Erva rústica para poções simples e receitas iniciais."
  },
  "misc_high_dungeon_key": {
    "id": "misc_high_dungeon_key",
    "name": "Chave de Masmorra Avançada",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/high-dungeon-key.png",
    "minLevel": 3,
    "price": 36,
    "stats": {},
    "description": "Abre masmorras avançadas e desafios mais perigosos."
  },
  "misc_hozir_box": {
    "id": "misc_hozir_box",
    "name": "Caixa de Hozir",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/hozir-box.png",
    "minLevel": 3,
    "price": 36,
    "stats": {},
    "description": "Caixa misteriosa com componentes raros de Hozir."
  },
  "misc_kaede_stone": {
    "id": "misc_kaede_stone",
    "name": "Pedra de Kaede",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/kaede_stone.png",
    "minLevel": 4,
    "price": 44,
    "stats": {},
    "description": "Pedra de Kaede usada em receitas místicas."
  },
  "misc_laede": {
    "id": "misc_laede",
    "name": "Laede",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/laede.png",
    "minLevel": 4,
    "price": 44,
    "stats": {},
    "description": "Reagente de Laede para criações arcanas intermediárias."
  },
  "scroll_magic_lands_parchment": {
    "id": "scroll_magic_lands_parchment",
    "name": "Pergaminho das Terras Mágicas",
    "kind": "scroll",
    "imageUrl": "/assets/items/misc/magic-lands-parchment.png",
    "minLevel": 4,
    "price": 44,
    "stats": {},
    "description": "Pergaminho das terras mágicas para receitas arcanas."
  },
  "misc_maginia": {
    "id": "misc_maginia",
    "name": "Maginia",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/maginia.png",
    "minLevel": 4,
    "price": 44,
    "stats": {},
    "description": "Reagente mágico usado em receitas e eventos especiais."
  },
  "misc_misc_phial": {
    "id": "misc_misc_phial",
    "name": "Frasco Variado",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/misc_phial.png",
    "minLevel": 4,
    "price": 44,
    "stats": {},
    "description": "Frasco neutro para preparar poções e misturas."
  },
  "misc_ressu": {
    "id": "misc_ressu",
    "name": "Ressu",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/ressu.png",
    "minLevel": 5,
    "price": 52,
    "stats": {},
    "description": "Ingrediente exótico usado em receitas raras."
  },
  "misc_seed_bitter": {
    "id": "misc_seed_bitter",
    "name": "Semente Amarga",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/seed_bitter.png",
    "minLevel": 5,
    "price": 52,
    "stats": {},
    "description": "Semente amarga para cultivar ervas de poções fortes."
  },
  "misc_seed_moss": {
    "id": "misc_seed_moss",
    "name": "Semente de Musgo",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/seed_moss.png",
    "minLevel": 5,
    "price": 52,
    "stats": {},
    "description": "Semente de musgo para receitas naturais e alquimia."
  },
  "misc_seed_mycelium_fungus": {
    "id": "misc_seed_mycelium_fungus",
    "name": "Semente de Fungo Micelial",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/seed_mycelium_fungus.png",
    "minLevel": 5,
    "price": 52,
    "stats": {},
    "description": "Semente fúngica para cultivar ingredientes miceliais."
  },
  "misc_seed_rustic": {
    "id": "misc_seed_rustic",
    "name": "Semente Rústica",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/seed_rustic.png",
    "minLevel": 5,
    "price": 52,
    "stats": {},
    "description": "Semente rústica para cultivo de ervas básicas."
  },
  "misc_serlen": {
    "id": "misc_serlen",
    "name": "Serlen",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/serlen.png",
    "minLevel": 6,
    "price": 60,
    "stats": {},
    "description": "Reagente de Serlen usado em receitas especiais."
  },
  "misc_stone_craft": {
    "id": "misc_stone_craft",
    "name": "Pedra de Criação",
    "kind": "misc",
    "imageUrl": "/assets/items/misc/stone-craft.png",
    "minLevel": 1,
    "price": 95,
    "stats": {},
    "description": "Pedra essencial consumida em todas as criações."
  },
  "energy_potion": {
    "id": "energy_potion",
    "name": "Poção de Energia",
    "kind": "potion",
    "imageUrl": "/assets/items/potions/energy-30.png",
    "minLevel": 1,
    "price": 30000,
    "stats": {
      "energyPercent": 0.3
    },
    "description": "Restaura 30% da energia máxima em jornadas longas."
  },
  "energy_potion_light": {
    "id": "energy_potion_light",
    "name": "Poção de Energia Leve",
    "kind": "potion",
    "imageUrl": "/assets/items/potions/energy-light.png",
    "minLevel": 1,
    "price": 350,
    "stats": {
      "energy": 8
    },
    "description": "Recupera 8 de energia para continuar caçando."
  },
  "energy_potion_medium": {
    "id": "energy_potion_medium",
    "name": "Poção de Energia Media",
    "kind": "potion",
    "imageUrl": "/assets/items/potions/energy-medium.png",
    "minLevel": 1,
    "price": 4500,
    "stats": {
      "energy": 60
    },
    "description": "Recupera 60 de energia para continuar caçando."
  },
  "energy_potion_high": {
    "id": "energy_potion_high",
    "name": "Poção de Energia Alta",
    "kind": "potion",
    "imageUrl": "/assets/items/potions/energy-high.png",
    "minLevel": 1,
    "price": 52000,
    "goldCoinPrice": 8,
    "stats": {
      "energy": 420
    },
    "description": "Recupera 420 de energia para continuar caçando."
  },
  "health_potion": {
    "id": "health_potion",
    "name": "Poção de Vida",
    "kind": "potion",
    "imageUrl": "/assets/items/potions/health-30.png",
    "minLevel": 1,
    "price": 30000,
    "stats": {
      "healPercent": 0.3
    },
    "description": "Restaura 30% da vida máxima em emergências."
  },
  "health_potion_light": {
    "id": "health_potion_light",
    "name": "Poção de Vida Leve",
    "kind": "potion",
    "imageUrl": "/assets/items/potions/health-light.png",
    "minLevel": 1,
    "price": 350,
    "stats": {
      "heal": 35
    },
    "description": "Recupera 35 de vida durante combates."
  },
  "health_potion_medium": {
    "id": "health_potion_medium",
    "name": "Poção de Vida Media",
    "kind": "potion",
    "imageUrl": "/assets/items/potions/health-medium.png",
    "minLevel": 1,
    "price": 4500,
    "stats": {
      "heal": 360
    },
    "description": "Recupera 360 de vida durante combates."
  },
  "health_potion_high": {
    "id": "health_potion_high",
    "name": "Poção de Vida Alta",
    "kind": "potion",
    "imageUrl": "/assets/items/potions/health-high.png",
    "minLevel": 1,
    "price": 52000,
    "goldCoinPrice": 8,
    "stats": {
      "heal": 3200
    },
    "description": "Recupera 3200 de vida durante combates."
  },
  "potion_mana": {
    "id": "potion_mana",
    "name": "Poção de Mana",
    "kind": "potion",
    "imageUrl": "/assets/items/potions/mana.png",
    "minLevel": 20,
    "price": 900,
    "stats": {
      "energyPercent": 0.2
    },
    "description": "Restaura 20% da energia máxima em jornadas longas."
  },
  "weapon_assassin_sword": {
    "id": "weapon_assassin_sword",
    "name": "Espada do Assassino",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/assassin_sword.png",
    "minLevel": 1,
    "price": 150,
    "stats": {
      "strength": 9,
      "agility": 1
    },
    "description": "Arma furtiva que aumenta força e agilidade."
  },
  "weapon_chaos_axe": {
    "id": "weapon_chaos_axe",
    "name": "Machado do Caos",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/chaos_axe.png",
    "minLevel": 5,
    "price": 410,
    "stats": {
      "strength": 22
    },
    "description": "Arma caótica que aumenta força."
  },
  "weapon_claymore_3": {
    "id": "weapon_claymore_3",
    "name": "Montante 3",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/claymore_3.png",
    "minLevel": 10,
    "price": 995,
    "stats": {
      "strength": 37
    },
    "description": "Arma pesada que aumenta força."
  },
  "weapon_claymore": {
    "id": "weapon_claymore",
    "name": "Montante",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/claymore.png",
    "minLevel": 15,
    "price": 1870,
    "stats": {
      "strength": 53
    },
    "description": "Arma pesada que aumenta força."
  },
  "weapon_double_sword_2": {
    "id": "weapon_double_sword_2",
    "name": "Espada Dupla 2",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/double_sword_2.png",
    "minLevel": 20,
    "price": 3035,
    "stats": {
      "strength": 68,
      "agility": 3
    },
    "description": "Arma ágil que aumenta força e agilidade."
  },
  "weapon_double_sword_new": {
    "id": "weapon_double_sword_new",
    "name": "Espada Dupla Nova",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/double_sword_new.png",
    "minLevel": 25,
    "price": 4490,
    "stats": {
      "strength": 84,
      "agility": 4
    },
    "description": "Arma ágil que aumenta força e agilidade."
  },
  "weapon_executioner_axe_6": {
    "id": "weapon_executioner_axe_6",
    "name": "Machado do Executor 6",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/executioner_axe_6.png",
    "minLevel": 30,
    "price": 6235,
    "stats": {
      "strength": 99
    },
    "description": "Arma implacável que aumenta força."
  },
  "weapon_executioner_axe": {
    "id": "weapon_executioner_axe",
    "name": "Machado do Executor",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/executioner_axe.png",
    "minLevel": 35,
    "price": 8270,
    "stats": {
      "strength": 115
    },
    "description": "Arma implacável que aumenta força."
  },
  "weapon_extreme_axe": {
    "id": "weapon_extreme_axe",
    "name": "Machado Extremo",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/extreme_axe.png",
    "minLevel": 40,
    "price": 10595,
    "stats": {
      "strength": 130
    },
    "description": "Arma brutal que aumenta força."
  },
  "weapon_greatsword_2": {
    "id": "weapon_greatsword_2",
    "name": "Espadão 2",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/greatsword_2.png",
    "minLevel": 45,
    "price": 13210,
    "stats": {
      "strength": 146
    },
    "description": "Arma imponente que aumenta força."
  },
  "weapon_greatsword_4": {
    "id": "weapon_greatsword_4",
    "name": "Espadão 4",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/greatsword_4.png",
    "minLevel": 50,
    "price": 16115,
    "stats": {
      "strength": 161
    },
    "description": "Arma imponente que aumenta força."
  },
  "weapon_insane_axe": {
    "id": "weapon_insane_axe",
    "name": "Machado Insano",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/insane_axe.png",
    "minLevel": 55,
    "price": 19310,
    "stats": {
      "strength": 177
    },
    "description": "Arma feroz que aumenta força."
  },
  "weapon_long_sword": {
    "id": "weapon_long_sword",
    "name": "Espada Longa",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/long_sword.png",
    "minLevel": 60,
    "price": 22795,
    "stats": {
      "strength": 192
    },
    "description": "Arma equilibrada que aumenta força."
  },
  "weapon_obs_axe": {
    "id": "weapon_obs_axe",
    "name": "Machado Obscuro",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/obs_axe.png",
    "minLevel": 65,
    "price": 26570,
    "stats": {
      "strength": 208
    },
    "description": "Arma sombria que aumenta força."
  },
  "weapon_orcish_dagger": {
    "id": "weapon_orcish_dagger",
    "name": "Adaga Orc",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/orcish_dagger.png",
    "minLevel": 70,
    "price": 30635,
    "stats": {
      "strength": 223,
      "agility": 13
    },
    "description": "Arma selvagem que aumenta força e agilidade."
  },
  "weapon_real_axe": {
    "id": "weapon_real_axe",
    "name": "Machado Real",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/real_axe.png",
    "minLevel": 80,
    "price": 39635,
    "stats": {
      "strength": 254
    },
    "description": "Arma nobre que aumenta força."
  },
  "weapon_triple_sword_2": {
    "id": "weapon_triple_sword_2",
    "name": "Espada Tripla 2",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/triple_sword_2.png",
    "minLevel": 85,
    "price": 44570,
    "stats": {
      "strength": 270,
      "agility": 15
    },
    "description": "Arma técnica que aumenta força e agilidade."
  },
  "weapon_triple_sword_3": {
    "id": "weapon_triple_sword_3",
    "name": "Espada Tripla 3",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/triple_sword_3.png",
    "minLevel": 90,
    "price": 49795,
    "stats": {
      "strength": 285,
      "agility": 16
    },
    "description": "Arma técnica que aumenta força e agilidade."
  },
  "weapon_vorgonax": {
    "id": "weapon_vorgonax",
    "name": "Vorgonax",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/vorgonax.png",
    "minLevel": 100,
    "price": 61115,
    "stats": {
      "strength": 316
    },
    "description": "Arma lendária que aumenta força."
  },
  "training_sword": {
    "id": "training_sword",
    "name": "Espada de Treino",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/long_sword.png",
    "minLevel": 1,
    "price": 45,
    "stats": {
      "strength": 3
    },
    "description": "Arma simples que aumenta força."
  },
  "iron_sword": {
    "id": "iron_sword",
    "name": "Espada de Ferro",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/claymore.png",
    "minLevel": 5,
    "price": 165,
    "stats": {
      "strength": 18
    },
    "description": "Arma confiável que aumenta força."
  },
  "leather_armor": {
    "id": "leather_armor",
    "name": "Armadura de Couro",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/00-leather.png",
    "minLevel": 1,
    "price": 55,
    "stats": {
      "defense": 5,
      "constitution": 1
    },
    "description": "Proteção leve que aumenta defesa e constituição."
  },
  "iron_armor": {
    "id": "iron_armor",
    "name": "Armadura de Ferro",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/01-steel.png",
    "minLevel": 5,
    "price": 180,
    "stats": {
      "defense": 22,
      "constitution": 1
    },
    "description": "Proteção resistente que aumenta defesa e constituição."
  },
  "novice_amulet": {
    "id": "novice_amulet",
    "name": "Amuleto do Aprendiz",
    "kind": "amulet",
    "slot": "amulet",
    "imageUrl": "/assets/items/amulet/bone_gray.png",
    "minLevel": 1,
    "price": 120,
    "stats": {
      "agility": 2,
      "constitution": 1
    },
    "description": "Amuleto inicial que aumenta agilidade e constituição."
  },
  "hunter_charm": {
    "id": "hunter_charm",
    "name": "Talisma do Caçador",
    "kind": "amulet",
    "slot": "amulet",
    "imageUrl": "/assets/items/amulet/cylinder_gray.png",
    "minLevel": 10,
    "price": 420,
    "stats": {
      "agility": 5,
      "constitution": 3,
      "strength": 3
    },
    "description": "Amuleto selvagem que aumenta força, agilidade e constituição."
  },
  "ember_blade": {
    "id": "ember_blade",
    "name": "Lamina de Brasa",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/chaos_axe.png",
    "minLevel": 20,
    "price": 0,
    "stats": {
      "strength": 82,
      "agility": 8
    },
    "description": "Arma flamejante que aumenta força e agilidade."
  },
  "guardian_mail": {
    "id": "guardian_mail",
    "name": "Cota do Guardião",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/05-justice.png",
    "minLevel": 20,
    "price": 0,
    "stats": {
      "defense": 78,
      "constitution": 10
    },
    "description": "Proteção guardiã que aumenta defesa e constituição."
  },
  "moon_amulet": {
    "id": "moon_amulet",
    "name": "Amuleto Lunar",
    "kind": "amulet",
    "slot": "amulet",
    "imageUrl": "/assets/items/amulet/stone_2_blue.png",
    "minLevel": 15,
    "price": 1250,
    "stats": {
      "agility": 12,
      "constitution": 6
    },
    "description": "Amuleto lunar que aumenta agilidade e constituição."
  },
  "acid_amulet": {
    "id": "acid_amulet",
    "name": "Amuleto Ácido",
    "kind": "amulet",
    "slot": "amulet",
    "imageUrl": "/assets/items/amulet/stone_2_green.png",
    "minLevel": 20,
    "price": 1250,
    "stats": {
      "strength": 10,
      "defense": 18
    },
    "description": "Amuleto corrosivo que aumenta força e defesa."
  },
  "crystal_white_amulet": {
    "id": "crystal_white_amulet",
    "name": "Amuleto de Cristal Branco",
    "kind": "amulet",
    "slot": "amulet",
    "imageUrl": "/assets/items/amulet/crystal_white.png",
    "minLevel": 25,
    "price": 0,
    "stats": {
      "agility": 35,
      "constitution": 10
    },
    "description": "Amuleto cristalino que aumenta agilidade e constituição."
  },
  "celtic_yellow_amulet": {
    "id": "celtic_yellow_amulet",
    "name": "Amuleto Celta",
    "kind": "amulet",
    "slot": "amulet",
    "imageUrl": "/assets/items/amulet/celtic_yellow.png",
    "minLevel": 30,
    "price": 12500,
    "stats": {
      "strength": 55,
      "constitution": 24
    },
    "description": "Amuleto celta que aumenta força e constituição."
  },
  "celtic_magenta_amulet": {
    "id": "celtic_magenta_amulet",
    "name": "Amuleto Divino",
    "kind": "amulet",
    "slot": "amulet",
    "imageUrl": "/assets/items/amulet/stone_3_magenta.png",
    "minLevel": 35,
    "price": 0,
    "stats": {
      "defense": 80,
      "constitution": 42
    },
    "description": "Amuleto sagrado que aumenta defesa e constituição."
  },
  "celtic_orange_amulet": {
    "id": "celtic_orange_amulet",
    "name": "Amuleto Pentagonal",
    "kind": "amulet",
    "slot": "amulet",
    "imageUrl": "/assets/items/amulet/penta_orange.png",
    "minLevel": 35,
    "price": 24000,
    "stats": {
      "agility": 90,
      "strength": 68
    },
    "description": "Amuleto radiante que aumenta força e agilidade."
  },
  "celtic_cyan_amulet": {
    "id": "celtic_cyan_amulet",
    "name": "Amuleto Ciano",
    "kind": "amulet",
    "slot": "amulet",
    "imageUrl": "/assets/items/amulet/ring_cyan.png",
    "minLevel": 40,
    "price": 0,
    "stats": {
      "agility": 120,
      "strength": 120,
      "defense": 120,
      "constitution": 120
    },
    "description": "Amuleto supremo que amplia todos os atributos principais."
  },
  "major_health_potion": {
    "id": "major_health_potion",
    "name": "Poção Vital Rara",
    "kind": "potion",
    "imageUrl": "/assets/items/potions/health.png",
    "minLevel": 1,
    "price": 76000,
    "goldCoinPrice": 5,
    "stats": {
      "healPercent": 0.55
    },
    "description": "Restaura 55% da vida máxima em emergências."
  },
  "major_energy_potion": {
    "id": "major_energy_potion",
    "name": "Poção Energética Rara",
    "kind": "potion",
    "imageUrl": "/assets/items/potions/energy.png",
    "minLevel": 1,
    "price": 76000,
    "goldCoinPrice": 5,
    "stats": {
      "energyPercent": 0.55
    },
    "description": "Restaura 55% da energia máxima em jornadas longas."
  },
  "oblivion_scroll": {
    "id": "oblivion_scroll",
    "name": "Pergaminho do Esquecimento",
    "kind": "scroll",
    "imageUrl": "/assets/items/misc/enhanced-parchment.png",
    "minLevel": 1,
    "price": 180000,
    "goldCoinPrice": 3,
    "stats": {},
    "description": "Reseta talentos sem gastar diamantes."
  },
  "memory_scroll": {
    "id": "memory_scroll",
    "name": "Pergaminho da Memória",
    "kind": "scroll",
    "imageUrl": "/assets/items/misc/fraddo-parchment.png",
    "minLevel": 1,
    "price": 180000,
    "goldCoinPrice": 3,
    "stats": {},
    "description": "Reseta atributos sem gastar diamantes."
  },
  "wolf_pelt": {
    "id": "wolf_pelt",
    "name": "Pele de Lobo",
    "kind": "material",
    "imageUrl": "/assets/items/materials/bone.png",
    "minLevel": 1,
    "price": 18,
    "stats": {},
    "description": "Pele resistente usada em receitas de caça."
  },
  "ember_core": {
    "id": "ember_core",
    "name": "Nucleo de Brasa",
    "kind": "material",
    "imageUrl": "/assets/items/materials/dark_residue.png",
    "minLevel": 20,
    "price": 130,
    "stats": {},
    "description": "Núcleo flamejante usado em armas forjadas."
  },
  "crystal_dust": {
    "id": "crystal_dust",
    "name": "Po de Cristal",
    "kind": "material",
    "imageUrl": "/assets/items/materials/magic_essence.png",
    "minLevel": 15,
    "price": 85,
    "stats": {},
    "description": "Catalisador cristalino para poções e amuletos."
  },
  "wyvern_scale": {
    "id": "wyvern_scale",
    "name": "Escama de Serpe",
    "kind": "material",
    "imageUrl": "/assets/items/materials/dragon_nail.png",
    "minLevel": 25,
    "price": 160,
    "stats": {},
    "description": "Escama resistente usada em armaduras forjadas."
  },
  "forged_ironhold_axe_40": {
    "id": "forged_ironhold_axe_40",
    "name": "Machado Rúnico de Ironhold",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/executioner_axe.png",
    "minLevel": 40,
    "price": 0,
    "stats": {
      "strength": 145,
      "defense": 8
    },
    "description": "Arma rúnica que aumenta força e defesa."
  },
  "forged_ironhold_plate_40": {
    "id": "forged_ironhold_plate_40",
    "name": "Couraça Rúnica de Ironhold",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/05-justice.png",
    "minLevel": 40,
    "price": 0,
    "stats": {
      "defense": 145,
      "constitution": 18
    },
    "description": "Proteção rúnica que aumenta defesa e constituição."
  },
  "forged_valfria_sabre_50": {
    "id": "forged_valfria_sabre_50",
    "name": "Sabre Solar de Valfria",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/long_sword.png",
    "minLevel": 50,
    "price": 0,
    "stats": {
      "strength": 178,
      "agility": 14
    },
    "description": "Arma solar que aumenta força e agilidade."
  },
  "forged_valfria_scale_50": {
    "id": "forged_valfria_scale_50",
    "name": "Brunea Solar de Valfria",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/114-dragon.png",
    "minLevel": 50,
    "price": 0,
    "stats": {
      "defense": 178,
      "constitution": 23
    },
    "description": "Proteção solar que aumenta defesa e constituição."
  },
  "forged_valfria_sunblade_70": {
    "id": "forged_valfria_sunblade_70",
    "name": "Lâmina do Sol Seco",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/triple_sword_2.png",
    "minLevel": 70,
    "price": 0,
    "stats": {
      "strength": 244,
      "agility": 22
    },
    "description": "Arma solar que aumenta força e agilidade."
  },
  "forged_valfria_sandmail_70": {
    "id": "forged_valfria_sandmail_70",
    "name": "Armadura das Dunas Rubras",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/124-dhron.png",
    "minLevel": 70,
    "price": 0,
    "stats": {
      "defense": 244,
      "constitution": 34
    },
    "description": "Proteção desértica que aumenta defesa e constituição."
  },
  "forged_morthaly_scythe_80": {
    "id": "forged_morthaly_scythe_80",
    "name": "Foice do Porto Sombrio",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/death_scythe.png",
    "minLevel": 80,
    "price": 0,
    "stats": {
      "strength": 282,
      "defense": 18
    },
    "description": "Arma sombria que aumenta força e defesa."
  },
  "forged_morthaly_boneplate_80": {
    "id": "forged_morthaly_boneplate_80",
    "name": "Placas Ósseas do Porto Sombrio",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/04-cursed.png",
    "minLevel": 80,
    "price": 0,
    "stats": {
      "defense": 282,
      "constitution": 44
    },
    "description": "Proteção óssea que aumenta defesa e constituição."
  },
  "forged_morthaly_voidblade_100": {
    "id": "forged_morthaly_voidblade_100",
    "name": "Vorgonax do Vazio",
    "kind": "weapon",
    "slot": "weapon",
    "imageUrl": "/assets/items/weapons/vorgonax.png",
    "minLevel": 100,
    "price": 0,
    "stats": {
      "strength": 360,
      "agility": 30,
      "defense": 30
    },
    "description": "Arma lendária que aumenta força, agilidade e defesa."
  },
  "forged_morthaly_voidarmor_100": {
    "id": "forged_morthaly_voidarmor_100",
    "name": "Armadura do Vazio de Morthaly",
    "kind": "armor",
    "slot": "armor",
    "imageUrl": "/assets/items/armor/106-death.png",
    "minLevel": 100,
    "price": 0,
    "stats": {
      "defense": 360,
      "constitution": 62,
      "strength": 20
    },
    "description": "Proteção abissal que aumenta força, defesa e constituição."
  }
};

export const CRAFTING_RECIPES: Record<string, CraftingRecipe> = {
  "refine_old_stone": {
    "id": "refine_old_stone",
    "station": "alchemist",
    "cityIds": [
      "ravenspire",
      "rosindale",
      "necropole_de_morthaly"
    ],
    "name": "Condensar Pedra Antiga",
    "resultItemId": "material_old_stone",
    "resultQuantity": 1,
    "goldCost": 180,
    "ingredients": [
      {
        "itemId": "material_stone_fragment",
        "quantity": 6
      },
      {
        "itemId": "material_magic_essence",
        "quantity": 1
      },
      {
        "itemId": "misc_stone_craft",
        "quantity": 1
      }
    ]
  },
  "refine_eran": {
    "id": "refine_eran",
    "station": "alchemist",
    "cityIds": [
      "ravenspire",
      "rosindale",
      "necropole_de_morthaly"
    ],
    "name": "Refinar Pedra de Eran",
    "resultItemId": "misc_eran",
    "resultQuantity": 1,
    "goldCost": 420,
    "ingredients": [
      {
        "itemId": "material_old_stone",
        "quantity": 3
      },
      {
        "itemId": "material_eran_fragment",
        "quantity": 2
      },
      {
        "itemId": "crystal_dust",
        "quantity": 2
      },
      {
        "itemId": "misc_stone_craft",
        "quantity": 1
      }
    ]
  },
  "refine_celena": {
    "id": "refine_celena",
    "station": "alchemist",
    "cityIds": [
      "ravenspire",
      "rosindale",
      "necropole_de_morthaly"
    ],
    "name": "Lapidar Celena",
    "resultItemId": "material_celena",
    "resultQuantity": 1,
    "goldCost": 820,
    "ingredients": [
      {
        "itemId": "misc_eran",
        "quantity": 2
      },
      {
        "itemId": "material_old_stone",
        "quantity": 2
      },
      {
        "itemId": "material_magic_essence",
        "quantity": 3
      },
      {
        "itemId": "material_mysterious_jewell",
        "quantity": 1
      },
      {
        "itemId": "misc_stone_craft",
        "quantity": 2
      }
    ]
  },
  "refine_midran": {
    "id": "refine_midran",
    "station": "alchemist",
    "cityIds": [
      "ravenspire",
      "rosindale",
      "necropole_de_morthaly"
    ],
    "name": "Forjar Núcleo de Midran",
    "resultItemId": "material_midran",
    "resultQuantity": 1,
    "goldCost": 1600,
    "ingredients": [
      {
        "itemId": "material_celena",
        "quantity": 2
      },
      {
        "itemId": "misc_eran",
        "quantity": 2
      },
      {
        "itemId": "material_old_stone",
        "quantity": 4
      },
      {
        "itemId": "material_dark_magic_rune",
        "quantity": 1
      },
      {
        "itemId": "misc_stone_craft",
        "quantity": 3
      }
    ]
  },
  "brew_high_health": {
    "id": "brew_high_health",
    "station": "alchemist",
    "cityIds": [
      "ravenspire",
      "rosindale",
      "necropole_de_morthaly"
    ],
    "name": "Destilar Poção de Vida Alta",
    "resultItemId": "health_potion_high",
    "resultQuantity": 1,
    "goldCost": 360,
    "ingredients": [
      {
        "itemId": "health_potion_medium",
        "quantity": 3
      },
      {
        "itemId": "material_herb",
        "quantity": 5
      },
      {
        "itemId": "misc_misc_phial",
        "quantity": 1
      },
      {
        "itemId": "misc_stone_craft",
        "quantity": 2
      }
    ]
  },
  "brew_high_energy": {
    "id": "brew_high_energy",
    "station": "alchemist",
    "cityIds": [
      "ravenspire",
      "rosindale",
      "necropole_de_morthaly"
    ],
    "name": "Destilar Poção de Energia Alta",
    "resultItemId": "energy_potion_high",
    "resultQuantity": 1,
    "goldCost": 360,
    "ingredients": [
      {
        "itemId": "energy_potion_medium",
        "quantity": 3
      },
      {
        "itemId": "material_energy_jewell",
        "quantity": 3
      },
      {
        "itemId": "misc_misc_phial",
        "quantity": 1
      },
      {
        "itemId": "misc_stone_craft",
        "quantity": 2
      }
    ]
  },
  "brew_major_health": {
    "id": "brew_major_health",
    "station": "alchemist",
    "cityIds": [
      "ravenspire",
      "rosindale",
      "necropole_de_morthaly"
    ],
    "name": "Destilar Poção de Vida Maior",
    "resultItemId": "major_health_potion",
    "resultQuantity": 1,
    "goldCost": 760,
    "ingredients": [
      {
        "itemId": "health_potion_high",
        "quantity": 2
      },
      {
        "itemId": "material_celena",
        "quantity": 1
      },
      {
        "itemId": "material_magic_essence",
        "quantity": 4
      },
      {
        "itemId": "misc_stone_craft",
        "quantity": 3
      }
    ]
  },
  "brew_major_energy": {
    "id": "brew_major_energy",
    "station": "alchemist",
    "cityIds": [
      "ravenspire",
      "rosindale",
      "necropole_de_morthaly"
    ],
    "name": "Destilar Poção de Energia Maior",
    "resultItemId": "major_energy_potion",
    "resultQuantity": 1,
    "goldCost": 760,
    "ingredients": [
      {
        "itemId": "energy_potion_high",
        "quantity": 2
      },
      {
        "itemId": "material_midran",
        "quantity": 1
      },
      {
        "itemId": "material_energy_jewell",
        "quantity": 4
      },
      {
        "itemId": "misc_stone_craft",
        "quantity": 3
      }
    ]
  },
  "forge_ember_blade": {
    "id": "forge_ember_blade",
    "station": "blacksmith",
    "cityIds": [
      "ironhold"
    ],
    "name": "Forjar Lâmina de Brasa",
    "resultItemId": "ember_blade",
    "resultQuantity": 1,
    "goldCost": 900,
    "ingredients": [
      {
        "itemId": "iron_sword",
        "quantity": 1
      },
      {
        "itemId": "material_old_stone",
        "quantity": 2
      },
      {
        "itemId": "ember_core",
        "quantity": 2
      },
      {
        "itemId": "wolf_pelt",
        "quantity": 4
      },
      {
        "itemId": "misc_stone_craft",
        "quantity": 1
      }
    ]
  },
  "forge_guardian_mail": {
    "id": "forge_guardian_mail",
    "station": "blacksmith",
    "cityIds": [
      "ironhold"
    ],
    "name": "Forjar Cota do Guardião",
    "resultItemId": "guardian_mail",
    "resultQuantity": 1,
    "goldCost": 920,
    "ingredients": [
      {
        "itemId": "iron_armor",
        "quantity": 1
      },
      {
        "itemId": "material_old_stone",
        "quantity": 2
      },
      {
        "itemId": "wyvern_scale",
        "quantity": 2
      },
      {
        "itemId": "crystal_dust",
        "quantity": 2
      },
      {
        "itemId": "misc_stone_craft",
        "quantity": 1
      }
    ]
  },
  "forge_ironhold_axe_40": {
    "id": "forge_ironhold_axe_40",
    "station": "blacksmith",
    "cityIds": [
      "ironhold"
    ],
    "name": "Forjar Machado Rúnico de Ironhold",
    "resultItemId": "forged_ironhold_axe_40",
    "resultQuantity": 1,
    "goldCost": 1850,
    "ingredients": [
      {
        "itemId": "weapon_claymore_3",
        "quantity": 1
      },
      {
        "itemId": "material_old_stone",
        "quantity": 4
      },
      {
        "itemId": "misc_eran",
        "quantity": 2
      },
      {
        "itemId": "ember_core",
        "quantity": 4
      },
      {
        "itemId": "misc_stone_craft",
        "quantity": 2
      }
    ]
  },
  "forge_ironhold_plate_40": {
    "id": "forge_ironhold_plate_40",
    "station": "blacksmith",
    "cityIds": [
      "ironhold"
    ],
    "name": "Forjar Couraça Rúnica de Ironhold",
    "resultItemId": "forged_ironhold_plate_40",
    "resultQuantity": 1,
    "goldCost": 1850,
    "ingredients": [
      {
        "itemId": "armor_mystic",
        "quantity": 1
      },
      {
        "itemId": "material_old_stone",
        "quantity": 4
      },
      {
        "itemId": "misc_eran",
        "quantity": 2
      },
      {
        "itemId": "wyvern_scale",
        "quantity": 4
      },
      {
        "itemId": "misc_stone_craft",
        "quantity": 2
      }
    ]
  },
  "forge_crystal_white_amulet": {
    "id": "forge_crystal_white_amulet",
    "station": "blacksmith",
    "cityIds": [
      "ironhold"
    ],
    "name": "Forjar Amuleto de Cristal Branco",
    "resultItemId": "crystal_white_amulet",
    "resultQuantity": 1,
    "goldCost": 2600,
    "ingredients": [
      {
        "itemId": "novice_amulet",
        "quantity": 1
      },
      {
        "itemId": "hunter_charm",
        "quantity": 1
      },
      {
        "itemId": "moon_amulet",
        "quantity": 1
      },
      {
        "itemId": "acid_amulet",
        "quantity": 1
      },
      {
        "itemId": "crystal_dust",
        "quantity": 6
      },
      {
        "itemId": "misc_stone_craft",
        "quantity": 3
      }
    ]
  },
  "forge_valfria_sabre_50": {
    "id": "forge_valfria_sabre_50",
    "station": "blacksmith",
    "cityIds": [
      "vila_de_valfria"
    ],
    "name": "Forjar Sabre Solar de Valfria",
    "resultItemId": "forged_valfria_sabre_50",
    "resultQuantity": 1,
    "goldCost": 2800,
    "ingredients": [
      {
        "itemId": "weapon_greatsword_2",
        "quantity": 1
      },
      {
        "itemId": "material_old_stone",
        "quantity": 4
      },
      {
        "itemId": "misc_eran",
        "quantity": 3
      },
      {
        "itemId": "material_celena",
        "quantity": 1
      },
      {
        "itemId": "material_dragon_nail",
        "quantity": 3
      },
      {
        "itemId": "misc_stone_craft",
        "quantity": 3
      }
    ]
  },
  "forge_valfria_scale_50": {
    "id": "forge_valfria_scale_50",
    "station": "blacksmith",
    "cityIds": [
      "vila_de_valfria"
    ],
    "name": "Forjar Brunea Solar de Valfria",
    "resultItemId": "forged_valfria_scale_50",
    "resultQuantity": 1,
    "goldCost": 2800,
    "ingredients": [
      {
        "itemId": "armor_cursed",
        "quantity": 1
      },
      {
        "itemId": "material_old_stone",
        "quantity": 4
      },
      {
        "itemId": "misc_eran",
        "quantity": 3
      },
      {
        "itemId": "material_celena",
        "quantity": 1
      },
      {
        "itemId": "wyvern_scale",
        "quantity": 4
      },
      {
        "itemId": "misc_stone_craft",
        "quantity": 3
      }
    ]
  },
  "forge_valfria_sunblade_70": {
    "id": "forge_valfria_sunblade_70",
    "station": "blacksmith",
    "cityIds": [
      "vila_de_valfria"
    ],
    "name": "Forjar Lâmina do Sol Seco",
    "resultItemId": "forged_valfria_sunblade_70",
    "resultQuantity": 1,
    "goldCost": 4300,
    "ingredients": [
      {
        "itemId": "weapon_long_sword",
        "quantity": 1
      },
      {
        "itemId": "material_old_stone",
        "quantity": 6
      },
      {
        "itemId": "misc_eran",
        "quantity": 4
      },
      {
        "itemId": "material_celena",
        "quantity": 2
      },
      {
        "itemId": "material_midran",
        "quantity": 1
      },
      {
        "itemId": "material_dragon_essence",
        "quantity": 3
      },
      {
        "itemId": "misc_stone_craft",
        "quantity": 4
      }
    ]
  },
  "forge_valfria_sandmail_70": {
    "id": "forge_valfria_sandmail_70",
    "station": "blacksmith",
    "cityIds": [
      "vila_de_valfria"
    ],
    "name": "Forjar Armadura das Dunas Rubras",
    "resultItemId": "forged_valfria_sandmail_70",
    "resultQuantity": 1,
    "goldCost": 4300,
    "ingredients": [
      {
        "itemId": "armor_obscure",
        "quantity": 1
      },
      {
        "itemId": "material_old_stone",
        "quantity": 6
      },
      {
        "itemId": "misc_eran",
        "quantity": 4
      },
      {
        "itemId": "material_celena",
        "quantity": 2
      },
      {
        "itemId": "material_midran",
        "quantity": 1
      },
      {
        "itemId": "wyvern_scale",
        "quantity": 6
      },
      {
        "itemId": "misc_stone_craft",
        "quantity": 4
      }
    ]
  },
  "forge_celtic_magenta_amulet": {
    "id": "forge_celtic_magenta_amulet",
    "station": "blacksmith",
    "cityIds": [
      "vila_de_valfria"
    ],
    "name": "Forjar Amuleto Divino",
    "resultItemId": "celtic_magenta_amulet",
    "resultQuantity": 1,
    "goldCost": 5200,
    "ingredients": [
      {
        "itemId": "celtic_yellow_amulet",
        "quantity": 1
      },
      {
        "itemId": "crystal_white_amulet",
        "quantity": 1
      },
      {
        "itemId": "material_celena",
        "quantity": 2
      },
      {
        "itemId": "material_midran",
        "quantity": 1
      },
      {
        "itemId": "misc_stone_craft",
        "quantity": 4
      }
    ]
  },
  "forge_morthaly_scythe_80": {
    "id": "forge_morthaly_scythe_80",
    "station": "blacksmith",
    "cityIds": [
      "porto_sombrio"
    ],
    "name": "Forjar Foice do Porto Sombrio",
    "resultItemId": "forged_morthaly_scythe_80",
    "resultQuantity": 1,
    "goldCost": 6200,
    "ingredients": [
      {
        "itemId": "weapon_obs_axe",
        "quantity": 1
      },
      {
        "itemId": "material_old_stone",
        "quantity": 8
      },
      {
        "itemId": "misc_eran",
        "quantity": 5
      },
      {
        "itemId": "material_celena",
        "quantity": 3
      },
      {
        "itemId": "material_midran",
        "quantity": 2
      },
      {
        "itemId": "material_dark_magic_rune",
        "quantity": 3
      },
      {
        "itemId": "material_dark_residue",
        "quantity": 5
      },
      {
        "itemId": "misc_stone_craft",
        "quantity": 5
      }
    ]
  },
  "forge_morthaly_boneplate_80": {
    "id": "forge_morthaly_boneplate_80",
    "station": "blacksmith",
    "cityIds": [
      "porto_sombrio"
    ],
    "name": "Forjar Placas Ósseas do Porto Sombrio",
    "resultItemId": "forged_morthaly_boneplate_80",
    "resultQuantity": 1,
    "goldCost": 6200,
    "ingredients": [
      {
        "itemId": "armor_death",
        "quantity": 1
      },
      {
        "itemId": "material_old_stone",
        "quantity": 8
      },
      {
        "itemId": "misc_eran",
        "quantity": 5
      },
      {
        "itemId": "material_celena",
        "quantity": 3
      },
      {
        "itemId": "material_midran",
        "quantity": 2
      },
      {
        "itemId": "material_bone",
        "quantity": 8
      },
      {
        "itemId": "material_dark_residue",
        "quantity": 5
      },
      {
        "itemId": "misc_stone_craft",
        "quantity": 5
      }
    ]
  },
  "forge_morthaly_voidblade_100": {
    "id": "forge_morthaly_voidblade_100",
    "station": "blacksmith",
    "cityIds": [
      "porto_sombrio"
    ],
    "name": "Forjar Vorgonax do Vazio",
    "resultItemId": "forged_morthaly_voidblade_100",
    "resultQuantity": 1,
    "goldCost": 9800,
    "ingredients": [
      {
        "itemId": "weapon_triple_sword_3",
        "quantity": 1
      },
      {
        "itemId": "forged_morthaly_scythe_80",
        "quantity": 1
      },
      {
        "itemId": "material_old_stone",
        "quantity": 10
      },
      {
        "itemId": "misc_eran",
        "quantity": 8
      },
      {
        "itemId": "material_celena",
        "quantity": 5
      },
      {
        "itemId": "material_midran",
        "quantity": 4
      },
      {
        "itemId": "material_dark_magic_rune",
        "quantity": 5
      },
      {
        "itemId": "misc_stone_craft",
        "quantity": 6
      }
    ]
  },
  "forge_morthaly_voidarmor_100": {
    "id": "forge_morthaly_voidarmor_100",
    "station": "blacksmith",
    "cityIds": [
      "porto_sombrio"
    ],
    "name": "Forjar Armadura do Vazio de Morthaly",
    "resultItemId": "forged_morthaly_voidarmor_100",
    "resultQuantity": 1,
    "goldCost": 9800,
    "ingredients": [
      {
        "itemId": "armor_dhron",
        "quantity": 1
      },
      {
        "itemId": "forged_morthaly_boneplate_80",
        "quantity": 1
      },
      {
        "itemId": "material_old_stone",
        "quantity": 10
      },
      {
        "itemId": "misc_eran",
        "quantity": 8
      },
      {
        "itemId": "material_celena",
        "quantity": 5
      },
      {
        "itemId": "material_midran",
        "quantity": 4
      },
      {
        "itemId": "material_dark_residue",
        "quantity": 8
      },
      {
        "itemId": "misc_stone_craft",
        "quantity": 6
      }
    ]
  },
  "forge_celtic_cyan_amulet": {
    "id": "forge_celtic_cyan_amulet",
    "station": "blacksmith",
    "cityIds": [
      "porto_sombrio"
    ],
    "name": "Forjar Amuleto Ciano",
    "resultItemId": "celtic_cyan_amulet",
    "resultQuantity": 1,
    "goldCost": 12000,
    "ingredients": [
      {
        "itemId": "novice_amulet",
        "quantity": 1
      },
      {
        "itemId": "hunter_charm",
        "quantity": 1
      },
      {
        "itemId": "moon_amulet",
        "quantity": 1
      },
      {
        "itemId": "acid_amulet",
        "quantity": 1
      },
      {
        "itemId": "crystal_white_amulet",
        "quantity": 1
      },
      {
        "itemId": "celtic_yellow_amulet",
        "quantity": 1
      },
      {
        "itemId": "celtic_magenta_amulet",
        "quantity": 1
      },
      {
        "itemId": "celtic_orange_amulet",
        "quantity": 1
      },
      {
        "itemId": "material_midran",
        "quantity": 4
      },
      {
        "itemId": "material_dark_magic_rune",
        "quantity": 4
      },
      {
        "itemId": "misc_stone_craft",
        "quantity": 6
      }
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
      "training_sword",
      "leather_armor",
      "iron_sword",
      "iron_armor",
      "weapon_assassin_sword",
      "weapon_chaos_axe",
      "weapon_claymore_3",
      "weapon_claymore",
      "weapon_double_sword_2",
      "weapon_double_sword_new",
      "armor_leather",
      "armor_steel",
      "armor_mystic",
      "armor_kharlee",
      "novice_amulet",
      "hunter_charm"
    ],
    "apothecaryItemIds": [
      "health_potion_light",
      "energy_potion_light",
      "health_potion_medium",
      "energy_potion_medium"
    ],
    "moneyChangerItemIds": [
      "ticket_train",
      "ticket_ship",
      "oblivion_scroll",
      "memory_scroll"
    ]
  },
  {
    "id": "ravenspire",
    "countryId": "aurevia",
    "name": "Ravenspire",
    "minLevel": 5,
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
      "refine_old_stone",
      "refine_eran",
      "refine_celena",
      "refine_midran",
      "brew_high_health",
      "brew_high_energy",
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
    "minLevel": 10,
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
      "forge_guardian_mail",
      "forge_ironhold_axe_40",
      "forge_ironhold_plate_40",
      "forge_crystal_white_amulet"
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
      "weapon_double_sword_new",
      "weapon_executioner_axe_6",
      "weapon_executioner_axe",
      "weapon_extreme_axe",
      "weapon_greatsword_2",
      "weapon_greatsword_4",
      "weapon_insane_axe",
      "weapon_long_sword",
      "weapon_obs_axe",
      "weapon_orcish_dagger",
      "armor_kharlee",
      "armor_cursed",
      "armor_justice",
      "armor_obscure",
      "armor_death",
      "moon_amulet",
      "acid_amulet",
      "celtic_yellow_amulet"
    ]
  },
  {
    "id": "vila_de_valfria",
    "countryId": "valfria",
    "name": "Vila de Valfria",
    "minLevel": 20,
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
      "forge_valfria_sabre_50",
      "forge_valfria_scale_50",
      "forge_valfria_sunblade_70",
      "forge_valfria_sandmail_70",
      "forge_celtic_magenta_amulet"
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
      "orc_warrior",
      "orc",
      "redback_new",
      "salamander_firebrand",
      "salamander",
      "sand_elemental",
      "skeleton_bat",
      "skeleton_centaur",
      "skeleton_naga",
      "skeleton_quadruped_small",
      "skeleton_snake"
    ],
    "apothecaryItemIds": [
      "health_potion_medium",
      "energy_potion_medium",
      "health_potion_high",
      "energy_potion_high",
      "misc_dungeon_key"
    ],
    "moneyChangerItemIds": [
      "ticket_train",
      "ticket_ship",
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
      "refine_old_stone",
      "refine_eran",
      "refine_celena",
      "refine_midran",
      "brew_high_health",
      "brew_high_energy",
      "brew_major_health",
      "brew_major_energy"
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
      "spectral_snake_old",
      "spectral_thing",
      "spectral_worm",
      "two_headed_ogre",
      "viper",
      "wolf_spider_new",
      "wolf_spider_old"
    ],
    "armorerItemIds": [
      "weapon_long_sword",
      "weapon_obs_axe",
      "weapon_orcish_dagger",
      "weapon_real_axe",
      "weapon_triple_sword_2",
      "weapon_triple_sword_3",
      "weapon_vorgonax",
      "armor_obscure",
      "armor_death",
      "armor_dragon",
      "armor_dhron",
      "armor_erins",
      "celtic_yellow_amulet",
    ],
    "goldCoinMerchantItemIds": [
      "material_blue_coin",
      "energy_potion_high",
      "health_potion_high",
      "oblivion_scroll",
      "memory_scroll"
    ]
  },
  {
    "id": "kheredu",
    "countryId": "valfria",
    "name": "Kheredu",
    "minLevel": 28,
    "travelCost": 160,
    "description": "Erguida sobre os alicerces colossais de uma civilização esquecida, é uma cidade que funde a magia arcana com a antiguidade mística.",
    "inhabitants": [
      "Néfera das Cinzas",
      "Rakhim de Ísis"
    ],
    "npcs": {
      "apothecary": "Néfera das Cinzas"
    },
    "huntLocationIds": [
      "kheredu_scarab_labyrinth",
      "kheredu_bronze_kings_forge",
      "kheredu_tears_of_isis_aqueduct"
    ],
    "huntMonsterIds": [
      "desert_worm",
      "pulsating_lump",
      "sand_spider",
      "skeleton_quadruped_large_new",
      "skeleton_ugly_thing",
      "mummy",
      "damnation_scorpion",
      "damnation_snake"
    ],
    "apothecaryItemIds": [
      "health_potion_high",
      "energy_potion_high",
      "misc_dungeon_key"
    ]
  },
  {
    "id": "porto_sombrio",
    "countryId": "morthaly",
    "name": "Porto Sombrio",
    "minLevel": 30,
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
      "forge_morthaly_scythe_80",
      "forge_morthaly_boneplate_80",
      "forge_morthaly_voidblade_100",
      "forge_morthaly_voidarmor_100",
      "forge_celtic_cyan_amulet"
    ],
    "huntLocationIds": [
      "morthaly_black_docks",
      "morthaly_tide_catacombs",
      "morthaly_wailing_breakwater"
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
      "oblivion_scroll",
      "memory_scroll"
    ]
  },
  {
    "id": "necropole_de_morthaly",
    "countryId": "morthaly",
    "name": "Necrópole de Morthaly",
    "minLevel": 35,
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
      "refine_old_stone",
      "refine_eran",
      "refine_celena",
      "refine_midran",
      "brew_high_health",
      "brew_high_energy",
      "brew_major_health",
      "brew_major_energy"
    ],
    "huntLocationIds": [
      "morthaly_runic_wastes",
      "morthaly_lich_spire",
      "morthaly_ossuary_labs",
      "morthaly_violet_apex"
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
      "weapon_triple_sword_2",
      "weapon_triple_sword_3",
      "weapon_vorgonax",
      "armor_dhron",
      "armor_erins",
      "celtic_orange_amulet"
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
      "skeleton_bat",
      "skeleton_snake",
      "skeleton_quadruped_small",
      "skeleton_centaur"
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
      "skeleton_naga",
      "sand_elemental"
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
      "spectral_snake_old",
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
      "wolf_spider_new",
      "wolf_spider_old"
    ]
  },
  "kheredu_scarab_labyrinth": {
    "id": "kheredu_scarab_labyrinth",
    "cityId": "kheredu",
    "name": "Labirinto dos Escaravelhos",
    "description": "Corredores de pedra dourada e passagens estreitas onde escaravelhos monstruosos e massas pulsantes se escondem entre runas antigas.",
    "monsterIds": [
      "sand_spider",
      "damnation_scorpion",
      "pulsating_lump"
    ]
  },
  "kheredu_bronze_kings_forge": {
    "id": "kheredu_bronze_kings_forge",
    "cityId": "kheredu",
    "name": "Forja dos Reis de Bronze",
    "description": "Salões metálicos soterrados onde velhos autômatos e aberrações ossificadas guardam brasas eternas dos reis esquecidos.",
    "monsterIds": [
      "skeleton_quadruped_large_new",
      "skeleton_ugly_thing",
      "mummy"
    ]
  },
  "kheredu_tears_of_isis_aqueduct": {
    "id": "kheredu_tears_of_isis_aqueduct",
    "cityId": "kheredu",
    "name": "Aqueduto das Lágrimas de Ísis",
    "description": "Aquedutos monumentais cobertos por inscrições arcanas, onde serpentes profanadas e ventos carregados de poeira cortam o caminho.",
    "monsterIds": [
      "desert_worm",
      "damnation_snake"
    ]
  },
  "morthaly_black_docks": {
    "id": "morthaly_black_docks",
    "cityId": "porto_sombrio",
    "name": "Docas do Luto",
    "description": "Porto sombrio de Morthaly, onde correntes negras arrastam caranguejos mortos, krakens partidos e horrores vindos da maré.",
    "monsterIds": [
      "zombie_crab",
      "zombie_turtle",
      "zombie_turtle_infected",
      "zombie_rat"
    ]
  },
  "morthaly_tide_catacombs": {
    "id": "morthaly_tide_catacombs",
    "cityId": "porto_sombrio",
    "name": "Catacumbas da Maré Negra",
    "description": "Corredores afogados sob o porto, onde poças de água pútrida escondem lagartos e cefalópodes reanimados.",
    "monsterIds": [
      "zombie_octopode",
      "zombie_octopode_infected",
      "zombie_lizard",
      "zombie_lizard_infected"
    ]
  },
  "morthaly_wailing_breakwater": {
    "id": "morthaly_wailing_breakwater",
    "cityId": "porto_sombrio",
    "name": "Quebra-Mar dos Lamentos",
    "description": "Paredões de pedra castigados por ondas frias, onde cabeças de kraken emergem entre névoas e cardumes espectrais.",
    "monsterIds": [
      "zombie_kraken_head",
      "zombie_kraken_infected",
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
      "zombie_hound",
      "zombie_hound_infected"
    ]
  },
  "morthaly_lich_spire": {
    "id": "morthaly_lich_spire",
    "cityId": "necropole_de_morthaly",
    "name": "Pináculo do Trono Morto",
    "description": "Torres mais altas da Necrópole de Morthaly, onde dracos, ogros e deformidades zumbis servem ao poder do castelo.",
    "monsterIds": [
      "zombie_drake",
      "zombie_drake_infected",
      "demon_bareon",
      "zombie_toad"
    ]
  },
  "morthaly_ossuary_labs": {
    "id": "morthaly_ossuary_labs",
    "cityId": "necropole_de_morthaly",
    "name": "Laboratórios Ossuários",
    "description": "Criptas de experimentos arcanos onde ogros, deformidades e corpos menores são reanimados em série.",
    "monsterIds": [
      "zombie_ogre",
      "zombie_ogre_infected",
      "zombie_small",
      "zombie_ugly_thing"
    ]
  },
  "morthaly_violet_apex": {
    "id": "morthaly_violet_apex",
    "cityId": "necropole_de_morthaly",
    "name": "Ápice Violeta",
    "description": "Terraços iluminados por chamas roxas, patrulhados por dragões espectrais e horrores instáveis da coroa litch.",
    "monsterIds": [
      "spectral_dragon_old",
      "spectral_hydra_3_old",
      "zombie_ugly_thing_infected"
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
    "experience": 35,
    "gold": 52.5,
    "drops": [
      {
        "itemId": "health_potion_light",
        "chance": 0.11
      },
      {
        "itemId": "energy_potion_light",
        "chance": 0.08
      },
      {
        "itemId": "material_bone",
        "chance": 0.022
      },
      {
        "itemId": "misc_doemia",
        "chance": 0.016
      },
      {
        "itemId": "armor_leather",
        "chance": 0.0819
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
        "itemId": "health_potion_light",
        "chance": 0.11
      },
      {
        "itemId": "energy_potion_light",
        "chance": 0.08
      },
      {
        "itemId": "material_chimera_jewell",
        "chance": 0.0221
      },
      {
        "itemId": "material_bone",
        "chance": 0.016
      },
      {
        "itemId": "novice_amulet",
        "chance": 0.0817
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
        "itemId": "health_potion_light",
        "chance": 0.11
      },
      {
        "itemId": "energy_potion_light",
        "chance": 0.08
      },
      {
        "itemId": "material_herb",
        "chance": 0.0223
      },
      {
        "itemId": "misc_dragon_stone",
        "chance": 0.0162
      },
      {
        "itemId": "weapon_chaos_axe",
        "chance": 0.0805
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
        "itemId": "health_potion_light",
        "chance": 0.11
      },
      {
        "itemId": "energy_potion_light",
        "chance": 0.08
      },
      {
        "itemId": "material_dragon_essence",
        "chance": 0.0221
      },
      {
        "itemId": "material_bone",
        "chance": 0.0161
      },
      {
        "itemId": "leather_armor",
        "chance": 0.0814
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
        "itemId": "health_potion_light",
        "chance": 0.11
      },
      {
        "itemId": "energy_potion_light",
        "chance": 0.08
      },
      {
        "itemId": "material_dexerity_jewell",
        "chance": 0.0221
      },
      {
        "itemId": "misc_herb_rustic",
        "chance": 0.0161
      },
      {
        "itemId": "weapon_assassin_sword",
        "chance": 0.0815
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
        "itemId": "health_potion_light",
        "chance": 0.11
      },
      {
        "itemId": "energy_potion_light",
        "chance": 0.08
      },
      {
        "itemId": "material_gromin_mycelium",
        "chance": 0.0223
      },
      {
        "itemId": "material_udania",
        "chance": 0.0162
      },
      {
        "itemId": "leather_armor",
        "chance": 0.0806
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
        "itemId": "health_potion_light",
        "chance": 0.11
      },
      {
        "itemId": "energy_potion_light",
        "chance": 0.08
      },
      {
        "itemId": "material_dragon_jewell",
        "chance": 0.0221
      },
      {
        "itemId": "misc_stone_craft",
        "chance": 0.0161
      },
      {
        "itemId": "training_sword",
        "chance": 0.0813
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
        "itemId": "health_potion_light",
        "chance": 0.11
      },
      {
        "itemId": "energy_potion_light",
        "chance": 0.08
      },
      {
        "itemId": "material_spectre_jewell",
        "chance": 0.0224
      },
      {
        "itemId": "material_laede_fragment",
        "chance": 0.0163
      },
      {
        "itemId": "training_sword",
        "chance": 0.0799
      },
      {
        "itemId": "leather_armor",
        "chance": 0.0509
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
    "experience": 270,
    "gold": 405,
    "drops": [
      {
        "itemId": "health_potion_light",
        "chance": 0.11
      },
      {
        "itemId": "energy_potion_light",
        "chance": 0.08
      },
      {
        "itemId": "material_dragon_nail",
        "chance": 0.0222
      },
      {
        "itemId": "material_dragon_essence",
        "chance": 0.0161
      },
      {
        "itemId": "armor_leather",
        "chance": 0.0811
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
    "experience": 694,
    "gold": 1041,
    "drops": [
      {
        "itemId": "health_potion_light",
        "chance": 0.11
      },
      {
        "itemId": "energy_potion_light",
        "chance": 0.08
      },
      {
        "itemId": "material_laede_fragment",
        "chance": 0.0223
      },
      {
        "itemId": "misc_seed_bitter",
        "chance": 0.0162
      },
      {
        "itemId": "iron_sword",
        "chance": 0.0804
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
    "experience": 1112,
    "gold": 1668,
    "drops": [
      {
        "itemId": "health_potion_medium",
        "chance": 0.105
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.075
      },
      {
        "itemId": "material_stone_fragment",
        "chance": 0.0224
      },
      {
        "itemId": "material_spectre_jewell",
        "chance": 0.0163
      },
      {
        "itemId": "weapon_claymore_3",
        "chance": 0.0798
      },
      {
        "itemId": "novice_amulet",
        "chance": 0.0508
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
        "itemId": "health_potion_light",
        "chance": 0.11
      },
      {
        "itemId": "energy_potion_light",
        "chance": 0.08
      },
      {
        "itemId": "material_energy_jewell",
        "chance": 0.0222
      },
      {
        "itemId": "material_laede_fragment",
        "chance": 0.0162
      },
      {
        "itemId": "weapon_assassin_sword",
        "chance": 0.0808
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
        "itemId": "health_potion_light",
        "chance": 0.11
      },
      {
        "itemId": "energy_potion_light",
        "chance": 0.08
      },
      {
        "itemId": "material_dragons_tooth",
        "chance": 0.0222
      },
      {
        "itemId": "material_dragon_nail",
        "chance": 0.0161
      },
      {
        "itemId": "novice_amulet",
        "chance": 0.081
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
        "itemId": "health_potion_light",
        "chance": 0.11
      },
      {
        "itemId": "energy_potion_light",
        "chance": 0.08
      },
      {
        "itemId": "material_mycelium_fungus",
        "chance": 0.0224
      },
      {
        "itemId": "material_bone",
        "chance": 0.0162
      },
      {
        "itemId": "iron_armor",
        "chance": 0.0802
      },
      {
        "itemId": "training_sword",
        "chance": 0.051
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
    "experience": 927,
    "gold": 1390.5,
    "drops": [
      {
        "itemId": "health_potion_light",
        "chance": 0.11
      },
      {
        "itemId": "energy_potion_light",
        "chance": 0.08
      },
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.0224
      },
      {
        "itemId": "material_dragon_nail",
        "chance": 0.0163
      },
      {
        "itemId": "weapon_assassin_sword",
        "chance": 0.0801
      },
      {
        "itemId": "iron_sword",
        "chance": 0.051
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
        "itemId": "health_potion_medium",
        "chance": 0.105
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.075
      },
      {
        "itemId": "wolf_pelt",
        "chance": 0.0225
      },
      {
        "itemId": "misc_seed_rustic",
        "chance": 0.0164
      },
      {
        "itemId": "hunter_charm",
        "chance": 0.0793
      },
      {
        "itemId": "novice_amulet",
        "chance": 0.0506
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
        "itemId": "health_potion_medium",
        "chance": 0.105
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.075
      },
      {
        "itemId": "crystal_dust",
        "chance": 0.0226
      },
      {
        "itemId": "material_dragon_essence",
        "chance": 0.0164
      },
      {
        "itemId": "iron_armor",
        "chance": 0.0791
      },
      {
        "itemId": "novice_amulet",
        "chance": 0.0505
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
        "itemId": "health_potion_medium",
        "chance": 0.105
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.075
      },
      {
        "itemId": "misc_seed_rustic",
        "chance": 0.023
      },
      {
        "itemId": "misc_herb_moss",
        "chance": 0.0167
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0384
      },
      {
        "itemId": "training_sword",
        "chance": 0.0771
      },
      {
        "itemId": "acid_amulet",
        "chance": 0.0494
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "misc_herb_moss",
        "chance": 0.025
      },
      {
        "itemId": "material_dragon_essence",
        "chance": 0.018
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0348
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0243
      },
      {
        "itemId": "material_celena",
        "chance": 0.0179
      },
      {
        "itemId": "material_midran",
        "chance": 0.0129
      },
      {
        "itemId": "armor_steel",
        "chance": 0.067
      },
      {
        "itemId": "armor_obscure",
        "chance": 0.044
      },
      {
        "itemId": "ember_blade",
        "chance": 0.0025
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
        "itemId": "health_potion_medium",
        "chance": 0.105
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.075
      },
      {
        "itemId": "crystal_dust",
        "chance": 0.0226
      },
      {
        "itemId": "material_dragon_nail",
        "chance": 0.0164
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.039
      },
      {
        "itemId": "leather_armor",
        "chance": 0.079
      },
      {
        "itemId": "weapon_chaos_axe",
        "chance": 0.0504
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "material_energy_jewell",
        "chance": 0.0243
      },
      {
        "itemId": "material_dragon_essence",
        "chance": 0.0176
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0361
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0253
      },
      {
        "itemId": "material_celena",
        "chance": 0.0184
      },
      {
        "itemId": "celtic_yellow_amulet",
        "chance": 0.0703
      },
      {
        "itemId": "armor_kharlee",
        "chance": 0.0458
      },
      {
        "itemId": "ember_blade",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "material_eran_fragment",
        "chance": 0.0244
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.036
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0252
      },
      {
        "itemId": "material_celena",
        "chance": 0.0184
      },
      {
        "itemId": "novice_amulet",
        "chance": 0.0702
      },
      {
        "itemId": "weapon_long_sword",
        "chance": 0.0457
      },
      {
        "itemId": "forged_ironhold_plate_40",
        "chance": 0.0025
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
    "experience": 9279,
    "gold": 13918.5,
    "drops": [
      {
        "itemId": "health_potion_medium",
        "chance": 0.105
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.075
      },
      {
        "itemId": "misc_stone_craft",
        "chance": 0.023
      },
      {
        "itemId": "misc_seed_rustic",
        "chance": 0.0167
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0383
      },
      {
        "itemId": "weapon_claymore_3",
        "chance": 0.0769
      },
      {
        "itemId": "armor_steel",
        "chance": 0.0493
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
        "itemId": "health_potion_medium",
        "chance": 0.105
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.075
      },
      {
        "itemId": "misc_doemia",
        "chance": 0.0226
      },
      {
        "itemId": "material_laede_fragment",
        "chance": 0.0164
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0389
      },
      {
        "itemId": "armor_steel",
        "chance": 0.0789
      },
      {
        "itemId": "iron_sword",
        "chance": 0.0503
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
    "experience": 2699,
    "gold": 4048.5,
    "drops": [
      {
        "itemId": "health_potion_medium",
        "chance": 0.105
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.075
      },
      {
        "itemId": "misc_dragon_stone",
        "chance": 0.0227
      },
      {
        "itemId": "material_strenght_jewell",
        "chance": 0.0164
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0389
      },
      {
        "itemId": "training_sword",
        "chance": 0.0787
      },
      {
        "itemId": "iron_armor",
        "chance": 0.0502
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
        "itemId": "health_potion_medium",
        "chance": 0.105
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.075
      },
      {
        "itemId": "material_udania",
        "chance": 0.0225
      },
      {
        "itemId": "misc_herb_moss",
        "chance": 0.0163
      },
      {
        "itemId": "novice_amulet",
        "chance": 0.0795
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
        "itemId": "health_potion_medium",
        "chance": 0.105
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.075
      },
      {
        "itemId": "misc_seed_mycelium_fungus",
        "chance": 0.023
      },
      {
        "itemId": "wyvern_scale",
        "chance": 0.0166
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0384
      },
      {
        "itemId": "weapon_double_sword_2",
        "chance": 0.0772
      },
      {
        "itemId": "training_sword",
        "chance": 0.0494
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "misc_herb_rustic",
        "chance": 0.025
      },
      {
        "itemId": "material_eran_fragment",
        "chance": 0.018
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0347
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0243
      },
      {
        "itemId": "material_celena",
        "chance": 0.0179
      },
      {
        "itemId": "material_midran",
        "chance": 0.0129
      },
      {
        "itemId": "moon_amulet",
        "chance": 0.067
      },
      {
        "itemId": "weapon_triple_sword_3",
        "chance": 0.044
      },
      {
        "itemId": "forged_ironhold_plate_40",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.085
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.055
      },
      {
        "itemId": "ember_core",
        "chance": 0.0237
      },
      {
        "itemId": "material_dragon_essence",
        "chance": 0.0171
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0372
      },
      {
        "itemId": "misc_eran",
        "chance": 0.026
      },
      {
        "itemId": "armor_kharlee",
        "chance": 0.0735
      },
      {
        "itemId": "weapon_executioner_axe_6",
        "chance": 0.0474
      },
      {
        "itemId": "forged_ironhold_plate_40",
        "chance": 0.0025
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
        "itemId": "health_potion_medium",
        "chance": 0.105
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.075
      },
      {
        "itemId": "misc_seed_moss",
        "chance": 0.0229
      },
      {
        "itemId": "material_strenght_jewell",
        "chance": 0.0166
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0384
      },
      {
        "itemId": "iron_sword",
        "chance": 0.0774
      },
      {
        "itemId": "hunter_charm",
        "chance": 0.0495
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
        "itemId": "health_potion_high",
        "chance": 0.085
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.055
      },
      {
        "itemId": "crystal_dust",
        "chance": 0.0237
      },
      {
        "itemId": "material_eran_fragment",
        "chance": 0.0172
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0371
      },
      {
        "itemId": "misc_eran",
        "chance": 0.026
      },
      {
        "itemId": "weapon_greatsword_4",
        "chance": 0.0733
      },
      {
        "itemId": "weapon_assassin_sword",
        "chance": 0.0474
      },
      {
        "itemId": "guardian_mail",
        "chance": 0.0025
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
        "itemId": "health_potion_medium",
        "chance": 0.105
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.075
      },
      {
        "itemId": "misc_misc_phial",
        "chance": 0.0227
      },
      {
        "itemId": "misc_doemia",
        "chance": 0.0165
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0389
      },
      {
        "itemId": "weapon_claymore_3",
        "chance": 0.0786
      },
      {
        "itemId": "weapon_assassin_sword",
        "chance": 0.0502
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
    "experience": 104253,
    "gold": 156379.5,
    "drops": [
      {
        "itemId": "health_potion_high",
        "chance": 0.085
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.055
      },
      {
        "itemId": "wyvern_scale",
        "chance": 0.0238
      },
      {
        "itemId": "material_mycelium_fungus",
        "chance": 0.0172
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.037
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0259
      },
      {
        "itemId": "iron_sword",
        "chance": 0.0732
      },
      {
        "itemId": "moon_amulet",
        "chance": 0.0473
      },
      {
        "itemId": "crystal_white_amulet",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.085
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.055
      },
      {
        "itemId": "misc_dragon_stone",
        "chance": 0.0238
      },
      {
        "itemId": "wyvern_scale",
        "chance": 0.0172
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.037
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0259
      },
      {
        "itemId": "material_celena",
        "chance": 0.0188
      },
      {
        "itemId": "weapon_assassin_sword",
        "chance": 0.0728
      },
      {
        "itemId": "armor_mystic",
        "chance": 0.0471
      },
      {
        "itemId": "ember_blade",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.085
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.055
      },
      {
        "itemId": "misc_doemia",
        "chance": 0.0238
      },
      {
        "itemId": "material_strenght_jewell",
        "chance": 0.0172
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.037
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0259
      },
      {
        "itemId": "material_celena",
        "chance": 0.0188
      },
      {
        "itemId": "armor_justice",
        "chance": 0.073
      },
      {
        "itemId": "leather_armor",
        "chance": 0.0472
      },
      {
        "itemId": "forged_ironhold_axe_40",
        "chance": 0.0025
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
        "itemId": "health_potion_medium",
        "chance": 0.105
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.075
      },
      {
        "itemId": "material_bone",
        "chance": 0.023
      },
      {
        "itemId": "material_dragon_essence",
        "chance": 0.0167
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0382
      },
      {
        "itemId": "weapon_claymore_3",
        "chance": 0.0767
      },
      {
        "itemId": "moon_amulet",
        "chance": 0.0492
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
        "itemId": "health_potion_medium",
        "chance": 0.105
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.075
      },
      {
        "itemId": "material_chimera_jewell",
        "chance": 0.0231
      },
      {
        "itemId": "material_eran_fragment",
        "chance": 0.0167
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0382
      },
      {
        "itemId": "armor_kharlee",
        "chance": 0.0766
      },
      {
        "itemId": "weapon_chaos_axe",
        "chance": 0.0491
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
        "itemId": "health_potion_high",
        "chance": 0.085
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.055
      },
      {
        "itemId": "wolf_pelt",
        "chance": 0.0237
      },
      {
        "itemId": "misc_seed_rustic",
        "chance": 0.0171
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0372
      },
      {
        "itemId": "misc_eran",
        "chance": 0.026
      },
      {
        "itemId": "weapon_claymore_3",
        "chance": 0.0736
      },
      {
        "itemId": "weapon_chaos_axe",
        "chance": 0.0475
      },
      {
        "itemId": "guardian_mail",
        "chance": 0.0025
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
        "itemId": "health_potion_medium",
        "chance": 0.105
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.075
      },
      {
        "itemId": "material_dexerity_jewell",
        "chance": 0.0231
      },
      {
        "itemId": "material_mycelium_fungus",
        "chance": 0.0167
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0382
      },
      {
        "itemId": "iron_armor",
        "chance": 0.0765
      },
      {
        "itemId": "weapon_executioner_axe_6",
        "chance": 0.049
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
        "itemId": "health_potion_medium",
        "chance": 0.105
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.075
      },
      {
        "itemId": "material_dragon_essence",
        "chance": 0.0231
      },
      {
        "itemId": "material_udania",
        "chance": 0.0168
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0381
      },
      {
        "itemId": "armor_mystic",
        "chance": 0.0763
      },
      {
        "itemId": "weapon_claymore_3",
        "chance": 0.049
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
        "itemId": "health_potion_medium",
        "chance": 0.105
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.075
      },
      {
        "itemId": "material_dragon_jewell",
        "chance": 0.0232
      },
      {
        "itemId": "misc_doemia",
        "chance": 0.0168
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0381
      },
      {
        "itemId": "armor_leather",
        "chance": 0.0762
      },
      {
        "itemId": "novice_amulet",
        "chance": 0.0489
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
    "experience": 16730,
    "gold": 25095,
    "drops": [
      {
        "itemId": "health_potion_medium",
        "chance": 0.105
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.075
      },
      {
        "itemId": "material_dragon_nail",
        "chance": 0.0232
      },
      {
        "itemId": "misc_herb_rustic",
        "chance": 0.0168
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.038
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0266
      },
      {
        "itemId": "weapon_double_sword_2",
        "chance": 0.076
      },
      {
        "itemId": "weapon_claymore",
        "chance": 0.0488
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
        "itemId": "health_potion_medium",
        "chance": 0.105
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.075
      },
      {
        "itemId": "misc_seed_bitter",
        "chance": 0.0229
      },
      {
        "itemId": "material_magic_essence",
        "chance": 0.0166
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0385
      },
      {
        "itemId": "weapon_double_sword_new",
        "chance": 0.0775
      },
      {
        "itemId": "moon_amulet",
        "chance": 0.0496
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
        "itemId": "health_potion_medium",
        "chance": 0.105
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.075
      },
      {
        "itemId": "material_dragons_tooth",
        "chance": 0.0232
      },
      {
        "itemId": "misc_stone_craft",
        "chance": 0.0168
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0379
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0266
      },
      {
        "itemId": "armor_leather",
        "chance": 0.0759
      },
      {
        "itemId": "novice_amulet",
        "chance": 0.0487
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
        "itemId": "health_potion_medium",
        "chance": 0.105
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.075
      },
      {
        "itemId": "misc_dragon_stone",
        "chance": 0.0227
      },
      {
        "itemId": "crystal_dust",
        "chance": 0.0165
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0387
      },
      {
        "itemId": "armor_leather",
        "chance": 0.0783
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
        "itemId": "health_potion_medium",
        "chance": 0.105
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.075
      },
      {
        "itemId": "misc_herb_rustic",
        "chance": 0.0229
      },
      {
        "itemId": "material_energy_jewell",
        "chance": 0.0166
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0386
      },
      {
        "itemId": "armor_leather",
        "chance": 0.0776
      },
      {
        "itemId": "novice_amulet",
        "chance": 0.0497
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
        "itemId": "health_potion_medium",
        "chance": 0.105
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.075
      },
      {
        "itemId": "material_energy_jewell",
        "chance": 0.0233
      },
      {
        "itemId": "material_dragon_jewell",
        "chance": 0.0168
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0379
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0265
      },
      {
        "itemId": "weapon_chaos_axe",
        "chance": 0.0757
      },
      {
        "itemId": "weapon_double_sword_2",
        "chance": 0.0486
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
        "itemId": "health_potion_medium",
        "chance": 0.105
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.075
      },
      {
        "itemId": "misc_misc_phial",
        "chance": 0.0228
      },
      {
        "itemId": "misc_herb_bitter",
        "chance": 0.0165
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0387
      },
      {
        "itemId": "weapon_chaos_axe",
        "chance": 0.0781
      },
      {
        "itemId": "weapon_claymore",
        "chance": 0.0499
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
        "itemId": "health_potion_medium",
        "chance": 0.105
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.075
      },
      {
        "itemId": "misc_herb_bitter",
        "chance": 0.0228
      },
      {
        "itemId": "misc_seed_mycelium_fungus",
        "chance": 0.0165
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0387
      },
      {
        "itemId": "armor_leather",
        "chance": 0.078
      },
      {
        "itemId": "armor_steel",
        "chance": 0.0498
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
        "itemId": "health_potion_medium",
        "chance": 0.105
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.075
      },
      {
        "itemId": "misc_herb_moss",
        "chance": 0.0228
      },
      {
        "itemId": "material_dexerity_jewell",
        "chance": 0.0166
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0386
      },
      {
        "itemId": "weapon_chaos_axe",
        "chance": 0.0778
      },
      {
        "itemId": "iron_armor",
        "chance": 0.0498
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
    "experience": 20734,
    "gold": 31101,
    "drops": [
      {
        "itemId": "health_potion_medium",
        "chance": 0.105
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.075
      },
      {
        "itemId": "material_eran_fragment",
        "chance": 0.0233
      },
      {
        "itemId": "material_gromin_mycelium",
        "chance": 0.0169
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0379
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0265
      },
      {
        "itemId": "acid_amulet",
        "chance": 0.0756
      },
      {
        "itemId": "weapon_assassin_sword",
        "chance": 0.0486
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
        "itemId": "health_potion_high",
        "chance": 0.085
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.055
      },
      {
        "itemId": "material_herb",
        "chance": 0.0233
      },
      {
        "itemId": "wolf_pelt",
        "chance": 0.0169
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0377
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0264
      },
      {
        "itemId": "armor_leather",
        "chance": 0.0753
      },
      {
        "itemId": "novice_amulet",
        "chance": 0.0484
      },
      {
        "itemId": "ember_blade",
        "chance": 0.0025
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
        "itemId": "health_potion_medium",
        "chance": 0.105
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.075
      },
      {
        "itemId": "material_gromin_mycelium",
        "chance": 0.0233
      },
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.0169
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0378
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0265
      },
      {
        "itemId": "leather_armor",
        "chance": 0.0754
      },
      {
        "itemId": "moon_amulet",
        "chance": 0.0485
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
        "itemId": "health_potion_high",
        "chance": 0.085
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.055
      },
      {
        "itemId": "material_laede_fragment",
        "chance": 0.0234
      },
      {
        "itemId": "misc_dragon_stone",
        "chance": 0.0169
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0377
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0264
      },
      {
        "itemId": "weapon_chaos_axe",
        "chance": 0.0751
      },
      {
        "itemId": "weapon_double_sword_2",
        "chance": 0.0483
      },
      {
        "itemId": "guardian_mail",
        "chance": 0.0025
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
    "experience": 1296,
    "gold": 1944,
    "drops": [
      {
        "itemId": "health_potion_medium",
        "chance": 0.105
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.075
      },
      {
        "itemId": "material_strenght_jewell",
        "chance": 0.0225
      },
      {
        "itemId": "crystal_dust",
        "chance": 0.0163
      },
      {
        "itemId": "iron_sword",
        "chance": 0.0796
      },
      {
        "itemId": "novice_amulet",
        "chance": 0.0507
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
        "itemId": "health_potion_high",
        "chance": 0.085
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.055
      },
      {
        "itemId": "material_magic_essence",
        "chance": 0.0234
      },
      {
        "itemId": "misc_seed_bitter",
        "chance": 0.0169
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0377
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0264
      },
      {
        "itemId": "acid_amulet",
        "chance": 0.075
      },
      {
        "itemId": "novice_amulet",
        "chance": 0.0482
      },
      {
        "itemId": "ember_blade",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.085
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.055
      },
      {
        "itemId": "material_mycelium_fungus",
        "chance": 0.0234
      },
      {
        "itemId": "material_bone",
        "chance": 0.017
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0376
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0263
      },
      {
        "itemId": "weapon_extreme_axe",
        "chance": 0.0748
      },
      {
        "itemId": "weapon_double_sword_2",
        "chance": 0.0482
      },
      {
        "itemId": "guardian_mail",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.085
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.055
      },
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.0235
      },
      {
        "itemId": "material_dragon_nail",
        "chance": 0.017
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0376
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0263
      },
      {
        "itemId": "iron_sword",
        "chance": 0.0747
      },
      {
        "itemId": "novice_amulet",
        "chance": 0.0481
      },
      {
        "itemId": "ember_blade",
        "chance": 0.0025
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
        "itemId": "health_potion_medium",
        "chance": 0.105
      },
      {
        "itemId": "energy_potion_medium",
        "chance": 0.075
      },
      {
        "itemId": "misc_herb_bitter",
        "chance": 0.0227
      },
      {
        "itemId": "misc_herb_rustic",
        "chance": 0.0165
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0388
      },
      {
        "itemId": "iron_armor",
        "chance": 0.0784
      },
      {
        "itemId": "training_sword",
        "chance": 0.0501
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
        "itemId": "health_potion_high",
        "chance": 0.085
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.055
      },
      {
        "itemId": "material_spectre_jewell",
        "chance": 0.0235
      },
      {
        "itemId": "material_herb",
        "chance": 0.017
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0375
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0263
      },
      {
        "itemId": "weapon_extreme_axe",
        "chance": 0.0745
      },
      {
        "itemId": "armor_mystic",
        "chance": 0.048
      },
      {
        "itemId": "guardian_mail",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.085
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.055
      },
      {
        "itemId": "material_stone_fragment",
        "chance": 0.0235
      },
      {
        "itemId": "material_spectre_jewell",
        "chance": 0.017
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0374
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0262
      },
      {
        "itemId": "iron_armor",
        "chance": 0.0743
      },
      {
        "itemId": "armor_leather",
        "chance": 0.0479
      },
      {
        "itemId": "ember_blade",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "material_dragons_tooth",
        "chance": 0.0243
      },
      {
        "itemId": "misc_seed_rustic",
        "chance": 0.0175
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0362
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0253
      },
      {
        "itemId": "material_celena",
        "chance": 0.0185
      },
      {
        "itemId": "armor_cursed",
        "chance": 0.0704
      },
      {
        "itemId": "iron_sword",
        "chance": 0.0458
      },
      {
        "itemId": "forged_valfria_sabre_50",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.085
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.055
      },
      {
        "itemId": "material_strenght_jewell",
        "chance": 0.0236
      },
      {
        "itemId": "ember_core",
        "chance": 0.017
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0374
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0262
      },
      {
        "itemId": "armor_mystic",
        "chance": 0.0742
      },
      {
        "itemId": "weapon_claymore",
        "chance": 0.0478
      },
      {
        "itemId": "guardian_mail",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.085
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.055
      },
      {
        "itemId": "material_udania",
        "chance": 0.0236
      },
      {
        "itemId": "misc_misc_phial",
        "chance": 0.0171
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0374
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0261
      },
      {
        "itemId": "weapon_executioner_axe",
        "chance": 0.0741
      },
      {
        "itemId": "weapon_greatsword_2",
        "chance": 0.0478
      },
      {
        "itemId": "ember_blade",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.085
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.055
      },
      {
        "itemId": "wolf_pelt",
        "chance": 0.0236
      },
      {
        "itemId": "misc_seed_moss",
        "chance": 0.0171
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0373
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0261
      },
      {
        "itemId": "training_sword",
        "chance": 0.0739
      },
      {
        "itemId": "weapon_claymore_3",
        "chance": 0.0477
      },
      {
        "itemId": "forged_ironhold_plate_40",
        "chance": 0.0025
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
    "experience": 128598,
    "gold": 192897,
    "drops": [
      {
        "itemId": "health_potion_high",
        "chance": 0.085
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.055
      },
      {
        "itemId": "misc_misc_phial",
        "chance": 0.0239
      },
      {
        "itemId": "misc_herb_moss",
        "chance": 0.0172
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0369
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0258
      },
      {
        "itemId": "material_celena",
        "chance": 0.0188
      },
      {
        "itemId": "weapon_claymore",
        "chance": 0.0727
      },
      {
        "itemId": "armor_justice",
        "chance": 0.047
      },
      {
        "itemId": "guardian_mail",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.085
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.055
      },
      {
        "itemId": "misc_herb_bitter",
        "chance": 0.0239
      },
      {
        "itemId": "misc_seed_rustic",
        "chance": 0.0173
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0369
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0258
      },
      {
        "itemId": "material_celena",
        "chance": 0.0187
      },
      {
        "itemId": "weapon_executioner_axe_6",
        "chance": 0.0726
      },
      {
        "itemId": "armor_steel",
        "chance": 0.047
      },
      {
        "itemId": "forged_valfria_sabre_50",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.085
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.055
      },
      {
        "itemId": "misc_herb_moss",
        "chance": 0.0239
      },
      {
        "itemId": "material_dragon_essence",
        "chance": 0.0173
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0368
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0258
      },
      {
        "itemId": "material_celena",
        "chance": 0.0187
      },
      {
        "itemId": "weapon_insane_axe",
        "chance": 0.0724
      },
      {
        "itemId": "weapon_executioner_axe",
        "chance": 0.0469
      },
      {
        "itemId": "ember_blade",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.085
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.055
      },
      {
        "itemId": "misc_herb_rustic",
        "chance": 0.0239
      },
      {
        "itemId": "material_eran_fragment",
        "chance": 0.0173
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0367
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0257
      },
      {
        "itemId": "material_celena",
        "chance": 0.0187
      },
      {
        "itemId": "weapon_double_sword_2",
        "chance": 0.0723
      },
      {
        "itemId": "weapon_claymore_3",
        "chance": 0.0468
      },
      {
        "itemId": "forged_ironhold_plate_40",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.085
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.055
      },
      {
        "itemId": "misc_seed_bitter",
        "chance": 0.024
      },
      {
        "itemId": "material_mycelium_fungus",
        "chance": 0.0173
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0367
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0257
      },
      {
        "itemId": "material_celena",
        "chance": 0.0187
      },
      {
        "itemId": "armor_cursed",
        "chance": 0.0721
      },
      {
        "itemId": "weapon_extreme_axe",
        "chance": 0.0467
      },
      {
        "itemId": "crystal_white_amulet",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.085
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.055
      },
      {
        "itemId": "material_udania",
        "chance": 0.0236
      },
      {
        "itemId": "misc_herb_moss",
        "chance": 0.0171
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0372
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0261
      },
      {
        "itemId": "training_sword",
        "chance": 0.0738
      },
      {
        "itemId": "weapon_extreme_axe",
        "chance": 0.0476
      },
      {
        "itemId": "forged_ironhold_axe_40",
        "chance": 0.0025
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
    "experience": 207322,
    "gold": 310983,
    "drops": [
      {
        "itemId": "health_potion_high",
        "chance": 0.085
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.055
      },
      {
        "itemId": "misc_seed_moss",
        "chance": 0.024
      },
      {
        "itemId": "material_strenght_jewell",
        "chance": 0.0173
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0367
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0257
      },
      {
        "itemId": "material_celena",
        "chance": 0.0187
      },
      {
        "itemId": "celtic_yellow_amulet",
        "chance": 0.072
      },
      {
        "itemId": "training_sword",
        "chance": 0.0466
      },
      {
        "itemId": "forged_ironhold_axe_40",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.085
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.055
      },
      {
        "itemId": "misc_seed_mycelium_fungus",
        "chance": 0.024
      },
      {
        "itemId": "wyvern_scale",
        "chance": 0.0174
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0366
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0256
      },
      {
        "itemId": "material_celena",
        "chance": 0.0186
      },
      {
        "itemId": "iron_armor",
        "chance": 0.0718
      },
      {
        "itemId": "acid_amulet",
        "chance": 0.0466
      },
      {
        "itemId": "forged_valfria_scale_50",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.085
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.055
      },
      {
        "itemId": "misc_seed_rustic",
        "chance": 0.0241
      },
      {
        "itemId": "misc_herb_moss",
        "chance": 0.0174
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0365
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0256
      },
      {
        "itemId": "material_celena",
        "chance": 0.0186
      },
      {
        "itemId": "armor_mystic",
        "chance": 0.0717
      },
      {
        "itemId": "weapon_insane_axe",
        "chance": 0.0465
      },
      {
        "itemId": "guardian_mail",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.085
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.055
      },
      {
        "itemId": "misc_stone_craft",
        "chance": 0.0241
      },
      {
        "itemId": "misc_seed_rustic",
        "chance": 0.0174
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0365
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0255
      },
      {
        "itemId": "material_celena",
        "chance": 0.0186
      },
      {
        "itemId": "training_sword",
        "chance": 0.0715
      },
      {
        "itemId": "weapon_claymore",
        "chance": 0.0464
      },
      {
        "itemId": "forged_valfria_sabre_50",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.085
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.055
      },
      {
        "itemId": "material_bone",
        "chance": 0.0241
      },
      {
        "itemId": "material_dragon_essence",
        "chance": 0.0174
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0365
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0255
      },
      {
        "itemId": "material_celena",
        "chance": 0.0186
      },
      {
        "itemId": "weapon_claymore_3",
        "chance": 0.0713
      },
      {
        "itemId": "weapon_greatsword_2",
        "chance": 0.0463
      },
      {
        "itemId": "ember_blade",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "misc_seed_bitter",
        "chance": 0.025
      },
      {
        "itemId": "material_mycelium_fungus",
        "chance": 0.018
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0347
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0243
      },
      {
        "itemId": "material_celena",
        "chance": 0.0179
      },
      {
        "itemId": "material_midran",
        "chance": 0.0129
      },
      {
        "itemId": "weapon_greatsword_2",
        "chance": 0.067
      },
      {
        "itemId": "armor_steel",
        "chance": 0.044
      },
      {
        "itemId": "forged_valfria_sunblade_70",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.085
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.055
      },
      {
        "itemId": "material_chimera_jewell",
        "chance": 0.0242
      },
      {
        "itemId": "material_eran_fragment",
        "chance": 0.0174
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0364
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0255
      },
      {
        "itemId": "material_celena",
        "chance": 0.0186
      },
      {
        "itemId": "armor_kharlee",
        "chance": 0.0712
      },
      {
        "itemId": "training_sword",
        "chance": 0.0462
      },
      {
        "itemId": "forged_ironhold_plate_40",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.085
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.055
      },
      {
        "itemId": "material_dexerity_jewell",
        "chance": 0.0242
      },
      {
        "itemId": "material_mycelium_fungus",
        "chance": 0.0175
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0364
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0254
      },
      {
        "itemId": "material_celena",
        "chance": 0.0185
      },
      {
        "itemId": "weapon_greatsword_4",
        "chance": 0.0711
      },
      {
        "itemId": "acid_amulet",
        "chance": 0.0462
      },
      {
        "itemId": "crystal_white_amulet",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.085
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.055
      },
      {
        "itemId": "material_dragon_essence",
        "chance": 0.0242
      },
      {
        "itemId": "material_strenght_jewell",
        "chance": 0.0175
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0363
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0254
      },
      {
        "itemId": "material_celena",
        "chance": 0.0185
      },
      {
        "itemId": "leather_armor",
        "chance": 0.0709
      },
      {
        "itemId": "weapon_insane_axe",
        "chance": 0.0461
      },
      {
        "itemId": "forged_ironhold_axe_40",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "material_dragon_jewell",
        "chance": 0.0243
      },
      {
        "itemId": "wyvern_scale",
        "chance": 0.0175
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0362
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0254
      },
      {
        "itemId": "material_celena",
        "chance": 0.0185
      },
      {
        "itemId": "iron_sword",
        "chance": 0.0708
      },
      {
        "itemId": "weapon_double_sword_new",
        "chance": 0.046
      },
      {
        "itemId": "forged_valfria_scale_50",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "material_dragon_nail",
        "chance": 0.0243
      },
      {
        "itemId": "misc_herb_moss",
        "chance": 0.0175
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0362
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0253
      },
      {
        "itemId": "material_celena",
        "chance": 0.0185
      },
      {
        "itemId": "weapon_double_sword_2",
        "chance": 0.0706
      },
      {
        "itemId": "celtic_yellow_amulet",
        "chance": 0.0459
      },
      {
        "itemId": "guardian_mail",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "material_dragon_essence",
        "chance": 0.0244
      },
      {
        "itemId": "misc_misc_phial",
        "chance": 0.0176
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.036
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0252
      },
      {
        "itemId": "material_celena",
        "chance": 0.0184
      },
      {
        "itemId": "material_midran",
        "chance": 0.0132
      },
      {
        "itemId": "hunter_charm",
        "chance": 0.07
      },
      {
        "itemId": "weapon_chaos_axe",
        "chance": 0.0456
      },
      {
        "itemId": "crystal_white_amulet",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "material_dragon_jewell",
        "chance": 0.0244
      },
      {
        "itemId": "misc_seed_moss",
        "chance": 0.0176
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.036
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0252
      },
      {
        "itemId": "material_celena",
        "chance": 0.0184
      },
      {
        "itemId": "material_midran",
        "chance": 0.0132
      },
      {
        "itemId": "weapon_double_sword_new",
        "chance": 0.0699
      },
      {
        "itemId": "weapon_executioner_axe_6",
        "chance": 0.0455
      },
      {
        "itemId": "forged_ironhold_axe_40",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "material_dragon_nail",
        "chance": 0.0245
      },
      {
        "itemId": "material_chimera_jewell",
        "chance": 0.0176
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0359
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0251
      },
      {
        "itemId": "material_celena",
        "chance": 0.0184
      },
      {
        "itemId": "material_midran",
        "chance": 0.0132
      },
      {
        "itemId": "armor_justice",
        "chance": 0.0697
      },
      {
        "itemId": "weapon_obs_axe",
        "chance": 0.0454
      },
      {
        "itemId": "forged_ironhold_plate_40",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "material_dragons_tooth",
        "chance": 0.0245
      },
      {
        "itemId": "material_dragon_jewell",
        "chance": 0.0177
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0358
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0251
      },
      {
        "itemId": "material_celena",
        "chance": 0.0183
      },
      {
        "itemId": "material_midran",
        "chance": 0.0132
      },
      {
        "itemId": "armor_death",
        "chance": 0.0696
      },
      {
        "itemId": "armor_steel",
        "chance": 0.0454
      },
      {
        "itemId": "forged_valfria_sunblade_70",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "misc_seed_moss",
        "chance": 0.025
      },
      {
        "itemId": "material_strenght_jewell",
        "chance": 0.018
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0346
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0242
      },
      {
        "itemId": "material_celena",
        "chance": 0.0178
      },
      {
        "itemId": "material_midran",
        "chance": 0.0129
      },
      {
        "itemId": "weapon_obs_axe",
        "chance": 0.067
      },
      {
        "itemId": "weapon_executioner_axe",
        "chance": 0.044
      },
      {
        "itemId": "forged_morthaly_boneplate_80",
        "chance": 0.0018
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
    "experience": 12282340,
    "gold": 18423510,
    "drops": [
      {
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "misc_seed_mycelium_fungus",
        "chance": 0.025
      },
      {
        "itemId": "wyvern_scale",
        "chance": 0.018
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0345
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0242
      },
      {
        "itemId": "material_celena",
        "chance": 0.0178
      },
      {
        "itemId": "material_midran",
        "chance": 0.0129
      },
      {
        "itemId": "armor_dhron",
        "chance": 0.067
      },
      {
        "itemId": "armor_death",
        "chance": 0.044
      },
      {
        "itemId": "ember_blade",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "misc_doemia",
        "chance": 0.025
      },
      {
        "itemId": "wolf_pelt",
        "chance": 0.018
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.035
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0245
      },
      {
        "itemId": "material_celena",
        "chance": 0.018
      },
      {
        "itemId": "material_midran",
        "chance": 0.013
      },
      {
        "itemId": "weapon_double_sword_new",
        "chance": 0.067
      },
      {
        "itemId": "armor_leather",
        "chance": 0.044
      },
      {
        "itemId": "ember_blade",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "material_energy_jewell",
        "chance": 0.0245
      },
      {
        "itemId": "material_gromin_mycelium",
        "chance": 0.0177
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0358
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0251
      },
      {
        "itemId": "material_celena",
        "chance": 0.0183
      },
      {
        "itemId": "material_midran",
        "chance": 0.0132
      },
      {
        "itemId": "iron_armor",
        "chance": 0.0694
      },
      {
        "itemId": "weapon_executioner_axe",
        "chance": 0.0453
      },
      {
        "itemId": "celtic_magenta_amulet",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "material_eran_fragment",
        "chance": 0.0245
      },
      {
        "itemId": "material_mysterious_jewell",
        "chance": 0.0177
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0358
      },
      {
        "itemId": "misc_eran",
        "chance": 0.025
      },
      {
        "itemId": "material_celena",
        "chance": 0.0183
      },
      {
        "itemId": "material_midran",
        "chance": 0.0132
      },
      {
        "itemId": "weapon_claymore_3",
        "chance": 0.0693
      },
      {
        "itemId": "armor_steel",
        "chance": 0.0452
      },
      {
        "itemId": "forged_ironhold_axe_40",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "material_spectre_jewell",
        "chance": 0.0248
      },
      {
        "itemId": "material_stone_fragment",
        "chance": 0.0179
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0353
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0247
      },
      {
        "itemId": "material_celena",
        "chance": 0.0181
      },
      {
        "itemId": "material_midran",
        "chance": 0.0131
      },
      {
        "itemId": "armor_dragon",
        "chance": 0.068
      },
      {
        "itemId": "iron_sword",
        "chance": 0.0446
      },
      {
        "itemId": "ember_blade",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "material_gromin_mycelium",
        "chance": 0.0246
      },
      {
        "itemId": "material_udania",
        "chance": 0.0177
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0357
      },
      {
        "itemId": "misc_eran",
        "chance": 0.025
      },
      {
        "itemId": "material_celena",
        "chance": 0.0183
      },
      {
        "itemId": "material_midran",
        "chance": 0.0131
      },
      {
        "itemId": "armor_kharlee",
        "chance": 0.0691
      },
      {
        "itemId": "weapon_executioner_axe",
        "chance": 0.0451
      },
      {
        "itemId": "forged_valfria_scale_50",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "material_herb",
        "chance": 0.0246
      },
      {
        "itemId": "misc_doemia",
        "chance": 0.0177
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0357
      },
      {
        "itemId": "misc_eran",
        "chance": 0.025
      },
      {
        "itemId": "material_celena",
        "chance": 0.0183
      },
      {
        "itemId": "material_midran",
        "chance": 0.0131
      },
      {
        "itemId": "weapon_greatsword_4",
        "chance": 0.069
      },
      {
        "itemId": "armor_death",
        "chance": 0.045
      },
      {
        "itemId": "crystal_white_amulet",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "material_laede_fragment",
        "chance": 0.0246
      },
      {
        "itemId": "misc_herb_rustic",
        "chance": 0.0178
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0356
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0249
      },
      {
        "itemId": "material_celena",
        "chance": 0.0182
      },
      {
        "itemId": "material_midran",
        "chance": 0.0131
      },
      {
        "itemId": "weapon_orcish_dagger",
        "chance": 0.0688
      },
      {
        "itemId": "weapon_chaos_axe",
        "chance": 0.045
      },
      {
        "itemId": "guardian_mail",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "material_magic_essence",
        "chance": 0.0247
      },
      {
        "itemId": "misc_stone_craft",
        "chance": 0.0178
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0355
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0249
      },
      {
        "itemId": "material_celena",
        "chance": 0.0182
      },
      {
        "itemId": "material_midran",
        "chance": 0.0131
      },
      {
        "itemId": "weapon_assassin_sword",
        "chance": 0.0687
      },
      {
        "itemId": "weapon_executioner_axe_6",
        "chance": 0.0449
      },
      {
        "itemId": "forged_valfria_sabre_50",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "material_mycelium_fungus",
        "chance": 0.0247
      },
      {
        "itemId": "material_dexerity_jewell",
        "chance": 0.0178
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0355
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0249
      },
      {
        "itemId": "material_celena",
        "chance": 0.0182
      },
      {
        "itemId": "material_midran",
        "chance": 0.0131
      },
      {
        "itemId": "weapon_claymore",
        "chance": 0.0685
      },
      {
        "itemId": "hunter_charm",
        "chance": 0.0448
      },
      {
        "itemId": "forged_valfria_sandmail_70",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "material_mysterious_jewell",
        "chance": 0.0247
      },
      {
        "itemId": "material_energy_jewell",
        "chance": 0.0178
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0355
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0248
      },
      {
        "itemId": "material_celena",
        "chance": 0.0182
      },
      {
        "itemId": "material_midran",
        "chance": 0.0131
      },
      {
        "itemId": "weapon_executioner_axe_6",
        "chance": 0.0684
      },
      {
        "itemId": "celtic_magenta_amulet",
        "chance": 0.044
      },
      {
        "itemId": "armor_cursed",
        "chance": 0.0447
      },
      {
        "itemId": "ember_blade",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.0248
      },
      {
        "itemId": "material_magic_essence",
        "chance": 0.0178
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0354
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0248
      },
      {
        "itemId": "material_celena",
        "chance": 0.0182
      },
      {
        "itemId": "material_midran",
        "chance": 0.0131
      },
      {
        "itemId": "celtic_magenta_amulet",
        "chance": 0.044
      },
      {
        "itemId": "weapon_insane_axe",
        "chance": 0.0682
      },
      {
        "itemId": "weapon_orcish_dagger",
        "chance": 0.0446
      },
      {
        "itemId": "forged_morthaly_boneplate_80",
        "chance": 0.0018
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "material_stone_fragment",
        "chance": 0.0248
      },
      {
        "itemId": "crystal_dust",
        "chance": 0.0179
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0353
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0247
      },
      {
        "itemId": "material_celena",
        "chance": 0.0181
      },
      {
        "itemId": "material_midran",
        "chance": 0.0131
      },
      {
        "itemId": "training_sword",
        "chance": 0.0679
      },
      {
        "itemId": "armor_kharlee",
        "chance": 0.0445
      },
      {
        "itemId": "celtic_magenta_amulet",
        "chance": 0.044
      },
      {
        "itemId": "forged_ironhold_plate_40",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "material_bone",
        "chance": 0.025
      },
      {
        "itemId": "material_dark_residue",
        "chance": 0.018
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0344
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0241
      },
      {
        "itemId": "material_celena",
        "chance": 0.0178
      },
      {
        "itemId": "material_midran",
        "chance": 0.0129
      },
      {
        "itemId": "armor_kharlee",
        "chance": 0.067
      },
      {
        "itemId": "armor_justice",
        "chance": 0.044
      },
      {
        "itemId": "celtic_magenta_amulet",
        "chance": 0.044
      },
      {
        "itemId": "forged_ironhold_plate_40",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "material_chimera_jewell",
        "chance": 0.025
      },
      {
        "itemId": "material_dragons_tooth",
        "chance": 0.018
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0343
      },
      {
        "itemId": "misc_eran",
        "chance": 0.024
      },
      {
        "itemId": "material_celena",
        "chance": 0.0177
      },
      {
        "itemId": "material_midran",
        "chance": 0.0129
      },
      {
        "itemId": "weapon_greatsword_4",
        "chance": 0.067
      },
      {
        "itemId": "celtic_magenta_amulet",
        "chance": 0.044
      },
      {
        "itemId": "forged_valfria_sunblade_70",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "misc_seed_rustic",
        "chance": 0.025
      },
      {
        "itemId": "misc_herb_moss",
        "chance": 0.018
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0345
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0242
      },
      {
        "itemId": "material_celena",
        "chance": 0.0178
      },
      {
        "itemId": "material_midran",
        "chance": 0.0129
      },
      {
        "itemId": "training_sword",
        "chance": 0.067
      },
      {
        "itemId": "leather_armor",
        "chance": 0.044
      },
      {
        "itemId": "forged_ironhold_plate_40",
        "chance": 0.0025
      },
      {
        "itemId": "forged_morthaly_voidblade_100",
        "chance": 0.001
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "misc_stone_craft",
        "chance": 0.025
      },
      {
        "itemId": "misc_seed_rustic",
        "chance": 0.018
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0345
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0241
      },
      {
        "itemId": "material_celena",
        "chance": 0.0178
      },
      {
        "itemId": "material_midran",
        "chance": 0.0129
      },
      {
        "itemId": "weapon_claymore_3",
        "chance": 0.067
      },
      {
        "itemId": "armor_mystic",
        "chance": 0.044
      },
      {
        "itemId": "forged_valfria_sunblade_70",
        "chance": 0.0025
      },
      {
        "itemId": "forged_morthaly_voidarmor_100",
        "chance": 0.001
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "material_strenght_jewell",
        "chance": 0.0248
      },
      {
        "itemId": "misc_herb_bitter",
        "chance": 0.0179
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0353
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0247
      },
      {
        "itemId": "material_celena",
        "chance": 0.0181
      },
      {
        "itemId": "material_midran",
        "chance": 0.0131
      },
      {
        "itemId": "armor_mystic",
        "chance": 0.0678
      },
      {
        "itemId": "weapon_claymore_3",
        "chance": 0.0444
      },
      {
        "itemId": "forged_valfria_sunblade_70",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "misc_dragon_stone",
        "chance": 0.025
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0349
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0244
      },
      {
        "itemId": "material_celena",
        "chance": 0.018
      },
      {
        "itemId": "material_midran",
        "chance": 0.013
      },
      {
        "itemId": "armor_justice",
        "chance": 0.067
      },
      {
        "itemId": "weapon_claymore",
        "chance": 0.044
      },
      {
        "itemId": "forged_ironhold_plate_40",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "material_udania",
        "chance": 0.0249
      },
      {
        "itemId": "misc_seed_mycelium_fungus",
        "chance": 0.0179
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0352
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0246
      },
      {
        "itemId": "material_celena",
        "chance": 0.0181
      },
      {
        "itemId": "material_midran",
        "chance": 0.013
      },
      {
        "itemId": "weapon_executioner_axe",
        "chance": 0.0676
      },
      {
        "itemId": "weapon_extreme_axe",
        "chance": 0.0443
      },
      {
        "itemId": "forged_morthaly_boneplate_80",
        "chance": 0.0018
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "misc_misc_phial",
        "chance": 0.025
      },
      {
        "itemId": "misc_seed_bitter",
        "chance": 0.018
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0348
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0244
      },
      {
        "itemId": "material_celena",
        "chance": 0.0179
      },
      {
        "itemId": "material_midran",
        "chance": 0.013
      },
      {
        "itemId": "armor_death",
        "chance": 0.067
      },
      {
        "itemId": "weapon_greatsword_2",
        "chance": 0.044
      },
      {
        "itemId": "forged_valfria_sunblade_70",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "wolf_pelt",
        "chance": 0.0249
      },
      {
        "itemId": "material_dark_magic_rune",
        "chance": 0.0179
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0352
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0246
      },
      {
        "itemId": "material_celena",
        "chance": 0.0181
      },
      {
        "itemId": "material_midran",
        "chance": 0.013
      },
      {
        "itemId": "armor_obscure",
        "chance": 0.0675
      },
      {
        "itemId": "armor_dragon",
        "chance": 0.0442
      },
      {
        "itemId": "ember_blade",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "ember_core",
        "chance": 0.0249
      },
      {
        "itemId": "material_dragon_nail",
        "chance": 0.018
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0351
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0246
      },
      {
        "itemId": "material_celena",
        "chance": 0.018
      },
      {
        "itemId": "material_midran",
        "chance": 0.013
      },
      {
        "itemId": "weapon_real_axe",
        "chance": 0.0673
      },
      {
        "itemId": "iron_armor",
        "chance": 0.0442
      },
      {
        "itemId": "forged_ironhold_plate_40",
        "chance": 0.0025
      },
      {
        "itemId": "forged_morthaly_scythe_80",
        "chance": 0.0015
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "material_dark_magic_rune",
        "chance": 0.025
      },
      {
        "itemId": "material_laede_fragment",
        "chance": 0.018
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0343
      },
      {
        "itemId": "misc_eran",
        "chance": 0.024
      },
      {
        "itemId": "material_celena",
        "chance": 0.0177
      },
      {
        "itemId": "material_midran",
        "chance": 0.0129
      },
      {
        "itemId": "weapon_orcish_dagger",
        "chance": 0.067
      },
      {
        "itemId": "iron_armor",
        "chance": 0.044
      },
      {
        "itemId": "forged_morthaly_boneplate_80",
        "chance": 0.0018
      },
      {
        "itemId": "celtic_cyan_amulet",
        "chance": 0.001
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "material_dark_residue",
        "chance": 0.025
      },
      {
        "itemId": "material_spectre_jewell",
        "chance": 0.018
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0343
      },
      {
        "itemId": "misc_eran",
        "chance": 0.024
      },
      {
        "itemId": "material_celena",
        "chance": 0.0177
      },
      {
        "itemId": "material_midran",
        "chance": 0.0129
      },
      {
        "itemId": "armor_erins",
        "chance": 0.067
      },
      {
        "itemId": "weapon_double_sword_new",
        "chance": 0.044
      },
      {
        "itemId": "crystal_white_amulet",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "misc_herb_bitter",
        "chance": 0.025
      },
      {
        "itemId": "material_bone",
        "chance": 0.018
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0348
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0244
      },
      {
        "itemId": "material_celena",
        "chance": 0.0179
      },
      {
        "itemId": "material_midran",
        "chance": 0.013
      },
      {
        "itemId": "weapon_triple_sword_3",
        "chance": 0.067
      },
      {
        "itemId": "weapon_real_axe",
        "chance": 0.044
      },
      {
        "itemId": "forged_morthaly_boneplate_80",
        "chance": 0.0018
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "material_dexerity_jewell",
        "chance": 0.025
      },
      {
        "itemId": "ember_core",
        "chance": 0.018
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0342
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0239
      },
      {
        "itemId": "material_celena",
        "chance": 0.0177
      },
      {
        "itemId": "material_midran",
        "chance": 0.0128
      },
      {
        "itemId": "iron_armor",
        "chance": 0.067
      },
      {
        "itemId": "celtic_yellow_amulet",
        "chance": 0.044
      },
      {
        "itemId": "ember_blade",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "material_dragon_essence",
        "chance": 0.025
      },
      {
        "itemId": "misc_misc_phial",
        "chance": 0.018
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0341
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0239
      },
      {
        "itemId": "material_celena",
        "chance": 0.0177
      },
      {
        "itemId": "material_midran",
        "chance": 0.0128
      },
      {
        "itemId": "armor_mystic",
        "chance": 0.067
      },
      {
        "itemId": "armor_erins",
        "chance": 0.044
      },
      {
        "itemId": "forged_ironhold_plate_40",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "crystal_dust",
        "chance": 0.025
      },
      {
        "itemId": "material_herb",
        "chance": 0.018
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.035
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0245
      },
      {
        "itemId": "material_celena",
        "chance": 0.018
      },
      {
        "itemId": "material_midran",
        "chance": 0.013
      },
      {
        "itemId": "novice_amulet",
        "chance": 0.0672
      },
      {
        "itemId": "weapon_double_sword_new",
        "chance": 0.0441
      },
      {
        "itemId": "forged_valfria_sunblade_70",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "wyvern_scale",
        "chance": 0.025
      },
      {
        "itemId": "material_spectre_fragment",
        "chance": 0.018
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.035
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0245
      },
      {
        "itemId": "material_celena",
        "chance": 0.018
      },
      {
        "itemId": "material_midran",
        "chance": 0.013
      },
      {
        "itemId": "hunter_charm",
        "chance": 0.067
      },
      {
        "itemId": "celtic_yellow_amulet",
        "chance": 0.044
      },
      {
        "itemId": "forged_morthaly_boneplate_80",
        "chance": 0.0018
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "material_dragon_jewell",
        "chance": 0.025
      },
      {
        "itemId": "misc_seed_moss",
        "chance": 0.018
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.0341
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0239
      },
      {
        "itemId": "material_celena",
        "chance": 0.0176
      },
      {
        "itemId": "material_midran",
        "chance": 0.0128
      },
      {
        "itemId": "weapon_executioner_axe",
        "chance": 0.067
      },
      {
        "itemId": "hunter_charm",
        "chance": 0.044
      },
      {
        "itemId": "forged_valfria_sunblade_70",
        "chance": 0.0025
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
        "itemId": "health_potion_high",
        "chance": 0.075
      },
      {
        "itemId": "energy_potion_high",
        "chance": 0.05
      },
      {
        "itemId": "major_health_potion",
        "chance": 0.026
      },
      {
        "itemId": "major_energy_potion",
        "chance": 0.01
      },
      {
        "itemId": "material_dragon_nail",
        "chance": 0.025
      },
      {
        "itemId": "material_chimera_jewell",
        "chance": 0.018
      },
      {
        "itemId": "material_old_stone",
        "chance": 0.034
      },
      {
        "itemId": "misc_eran",
        "chance": 0.0238
      },
      {
        "itemId": "material_celena",
        "chance": 0.0176
      },
      {
        "itemId": "material_midran",
        "chance": 0.0128
      },
      {
        "itemId": "armor_obscure",
        "chance": 0.067
      },
      {
        "itemId": "armor_cursed",
        "chance": 0.044
      },
      {
        "itemId": "forged_morthaly_boneplate_80",
        "chance": 0.0018
      }
    ]
  }
};

