function run(input) {
  const DEFAULT_EMBLEM = "https://crests.football-data.org/PPL.png";
  // Window sizes the layouts use to show part of the table around the focus club.
  const WINDOW_SIZES = [5, 6, 7, 8, 9, 10, 11, 12, 14, 16];

  const empty = {
    plugin_ok: false,
    error_message: "",
    emblem: DEFAULT_EMBLEM,
    rows: [],
    featured: null,
    leader: null,
    offsets: {},
    season_label: "",
    matchday: null
  };

  const fields = input?.trmnl?.plugin_settings?.custom_fields_values || {};
  const portuguese = /pt|portug/i.test(String(fields.language || ""));

  const apiError = input?.detailedError?.message ||
    input?.error?.detailedError?.message ||
    input?.error?.message ||
    input?.message ||
    input?.error;
  if (apiError) {
    return { ...empty, error_message: String(apiError) };
  }

  const standings = Array.isArray(input?.standings) ? input.standings : [];
  const total = standings.find((standing) =>
    standing?.type === "TOTAL" && Array.isArray(standing.table)
  ) || standings.find((standing) => Array.isArray(standing?.table));
  if (!Array.isArray(total?.table) || total.table.length === 0) {
    return {
      ...empty,
      error_message: portuguese
        ? "A football-data.org não devolveu a classificação da Liga Portugal. Verifique o token da API e o plano."
        : "No Liga Portugal standings were returned. Check the API token and plan."
    };
  }

  const favorite = String(fields.favorite_team || "").trim().toLocaleLowerCase();
  const zoneFor = (position) => {
    if (position <= 4) return "CL";
    if (position === 5) return "EL";
    if (position === 6) return "ECL";
    if (position === 16) return "PO";
    if (position >= 17) return "REL";
    return "";
  };

  const rows = total.table.map((entry, index) => {
    const team = entry.team || {};
    const position = Number(entry.position) || index + 1;
    const name = team.shortName || team.name || team.tla || "Unknown club";
    const goalsFor = Number(entry.goalsFor) || 0;
    const goalsAgainst = Number(entry.goalsAgainst) || 0;
    const goalDifference = Number.isFinite(Number(entry.goalDifference))
      ? Number(entry.goalDifference)
      : goalsFor - goalsAgainst;
    const searchable = [team.name, team.shortName, team.tla]
      .filter(Boolean)
      .map((value) => String(value).toLocaleLowerCase());
    return {
      id: team.id,
      position,
      name,
      tla: team.tla || name.slice(0, 3).toUpperCase(),
      crest: team.crest || "",
      played: Number(entry.playedGames) || 0,
      won: Number(entry.won) || 0,
      drawn: Number(entry.draw) || 0,
      lost: Number(entry.lost) || 0,
      goal_difference: goalDifference,
      gd_text: goalDifference > 0 ? "+" + goalDifference : String(goalDifference),
      points: Number(entry.points) || 0,
      zone: zoneFor(position),
      favorite: !!favorite && (
        searchable.some((value) => value.includes(favorite)) ||
        String(team.id) === favorite
      )
    };
  }).sort((a, b) => a.position - b.position);

  // Only the first match is highlighted, so a vague name cannot light up several rows.
  const featuredIndex = rows.findIndex((row) => row.favorite);
  rows.forEach((row, index) => { row.favorite = index === featuredIndex; });
  const featured = featuredIndex >= 0 ? rows[featuredIndex] : null;

  // Offset of a contiguous slice of `size` rows that keeps the favourite near the middle.
  // Without a favourite, every window starts at the top of the table.
  const offsets = {};
  WINDOW_SIZES.forEach((size) => {
    let offset = 0;
    if (featuredIndex >= 0 && rows.length > size) {
      offset = featuredIndex - Math.floor((size - 1) / 2);
      offset = Math.max(0, Math.min(offset, rows.length - size));
    }
    offsets["w" + size] = offset;
  });

  const season = input?.season || standings[0]?.season || {};
  const startYear = String(season.startDate || "").slice(0, 4);
  const seasonLabel = startYear
    ? startYear + "/" + String(Number(startYear) + 1).slice(-2)
    : "";

  return {
    plugin_ok: true,
    error_message: "",
    emblem: input?.competition?.emblem || DEFAULT_EMBLEM,
    rows,
    featured,
    leader: rows[0] || null,
    offsets,
    season_label: seasonLabel,
    matchday: season.currentMatchday || null
  };
}
