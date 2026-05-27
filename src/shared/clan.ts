export const CLAN_CRESTS = [
  { id: "arvore", label: "Árvore", imageUrl: "/assets/cla/arvore.png" },
  { id: "capacete", label: "Capacete", imageUrl: "/assets/cla/capacete.png" },
  { id: "chifres", label: "Chifres", imageUrl: "/assets/cla/chifres.png" },
  { id: "cobra", label: "Cobra", imageUrl: "/assets/cla/cobra.png" },
  { id: "coroa", label: "Coroa", imageUrl: "/assets/cla/coroa.png" },
  { id: "corvo", label: "Corvo", imageUrl: "/assets/cla/corvo.png" },
  { id: "cranio", label: "Crânio", imageUrl: "/assets/cla/cranio.png" },
  { id: "dragao", label: "Dragão", imageUrl: "/assets/cla/dragao.png" },
  { id: "espada", label: "Espada", imageUrl: "/assets/cla/espada.png" },
  { id: "fenix", label: "Fênix", imageUrl: "/assets/cla/fenix.png" },
  { id: "gema", label: "Gema", imageUrl: "/assets/cla/gema.png" },
  { id: "leao", label: "Leão", imageUrl: "/assets/cla/leao.png" },
  { id: "lobo", label: "Lobo", imageUrl: "/assets/cla/lobo.png" },
  { id: "lua", label: "Lua", imageUrl: "/assets/cla/lua.png" },
  { id: "luvas", label: "Luvas", imageUrl: "/assets/cla/luvas.png" },
  { id: "machado", label: "Machado", imageUrl: "/assets/cla/machado.png" },
  { id: "marreta", label: "Marreta", imageUrl: "/assets/cla/marreta.png" },
  { id: "montanha", label: "Montanha", imageUrl: "/assets/cla/montanha.png" },
  { id: "navio", label: "Navio", imageUrl: "/assets/cla/navio.png" },
  { id: "olho", label: "Olho", imageUrl: "/assets/cla/olho.png" },
  { id: "raio", label: "Raio", imageUrl: "/assets/cla/raio.png" },
  { id: "sol", label: "Sol", imageUrl: "/assets/cla/sol.png" },
  { id: "torre", label: "Torre", imageUrl: "/assets/cla/torre.png" },
  { id: "touro", label: "Touro", imageUrl: "/assets/cla/touro.png" }
] as const;

export type ClanCrestId = (typeof CLAN_CRESTS)[number]["id"];

export const DEFAULT_CLAN_CREST_ID: ClanCrestId = "coroa";

const LEGACY_CLAN_CREST_MAP: Record<string, ClanCrestId> = {
  shield: "capacete",
  swords: "espada",
  star: "sol",
  gem: "gema",
  castle: "torre",
  trophy: "coroa",
  crown: "coroa",
  flame: "fenix",
  flag: "navio",
  skull: "cranio"
};

export function normalizeClanCrestId(icon?: string): ClanCrestId {
  if (!icon) {
    return DEFAULT_CLAN_CREST_ID;
  }
  const mapped = LEGACY_CLAN_CREST_MAP[icon] ?? icon;
  return CLAN_CRESTS.some((crest) => crest.id === mapped) ? (mapped as ClanCrestId) : DEFAULT_CLAN_CREST_ID;
}

export function getClanCrestDefinition(icon?: string) {
  const id = normalizeClanCrestId(icon);
  return CLAN_CRESTS.find((crest) => crest.id === id) ?? CLAN_CRESTS[0];
}
