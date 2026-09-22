function run(input) {
  const empty = {
    plugin_ok: false,
    error_message: "",
    rows: [],
    featured: null,
    leader: null,
    quadrant_focus: null,
    nearby_short: [],
    nearby_long: [],
    season_label: "",
    matchday: null,
    games_played: 0
  };

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
      error_message: "No Primeira Liga standings were returned. Check the API token and plan."
    };
  }

  const fields = input?.trmnl?.plugin_settings?.custom_fields_values || {};
  const favorite = String(fields.favorite_team || "").trim().toLocaleLowerCase();
  const zoneFor = (position) => {
    if (position <= 4) return { short: "CL", label: "Champions League" };
    if (position === 5) return { short: "EL", label: "Europa League" };
    if (position === 6) return { short: "ECL", label: "Conference League" };
    if (position === 16) return { short: "PO", label: "Relegation play-off" };
    if (position >= 17) return { short: "REL", label: "Relegation" };
    return { short: "", label: "" };
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
    const zone = zoneFor(position);
    return {
      id: team.id,
      position,
      name,
      crest: team.crest || "",
      played: Number(entry.playedGames) || 0,
      won: Number(entry.won) || 0,
      drawn: Number(entry.draw) || 0,
      lost: Number(entry.lost) || 0,
      goals_for: goalsFor,
      goals_against: goalsAgainst,
      goal_difference: goalDifference,
      gd_text: goalDifference > 0 ? "+" + goalDifference : String(goalDifference),
      points: Number(entry.points) || 0,
      zone: zone.short,
      zone_label: zone.label,
      favorite: !!favorite && (
        name.toLocaleLowerCase().includes(favorite) ||
        String(team.id) === favorite
      )
    };
  }).sort((a, b) => a.position - b.position);

  const leader = rows[0] || null;
  const featured = rows.find((row) => row.favorite) || null;
  const quadrantFocus = featured || leader;
  const nearby = (count) => {
    if (!quadrantFocus) return [];
    return rows
      .filter((row) => row.id !== quadrantFocus.id)
      .sort((a, b) =>
        Math.abs(a.position - quadrantFocus.position) -
        Math.abs(b.position - quadrantFocus.position) ||
        a.position - b.position
      )
      .slice(0, count)
      .sort((a, b) => a.position - b.position);
  };

  const season = input?.season || standings[0]?.season || {};
  const startYear = String(season.startDate || "").slice(0, 4);
  const seasonLabel = startYear
    ? startYear + "/" + String(Number(startYear) + 1).slice(-2)
    : "";
  const gamesPlayed = rows.reduce((sum, row) => sum + row.played, 0) / 2;

  return {
    plugin_ok: true,
    error_message: "",
    rows,
    featured,
    leader,
    quadrant_focus: quadrantFocus,
    nearby_short: nearby(2),
    nearby_long: nearby(5),
    season_label: seasonLabel,
    matchday: season.currentMatchday || null,
    games_played: Number.isInteger(gamesPlayed) ? gamesPlayed : 0
  };
}
