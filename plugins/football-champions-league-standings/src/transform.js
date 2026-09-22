// football-data.org exposes Champions League matches, but its CUP competitions
// do not have a standings resource. Calculate the league phase from results.
function run(input) {
  const fail = (message) => ({ plugin_ok: false, error_message: message, rows: [], top_rows: [], lower_rows: [] });
  const apiError = input?.detailedError?.message || input?.error?.detailedError?.message ||
    input?.error?.message || input?.message || input?.error;
  if (!Array.isArray(input?.matches)) {
    return fail(apiError ? String(apiError) : "No Champions League match data was returned. Check the API token.");
  }

  const phases = new Set(["GROUP_STAGE", "LEAGUE_STAGE", "LEAGUE_PHASE", "REGULAR_SEASON"]);
  const matches = input.matches.filter((match) =>
    phases.has(match.stage) && !match.group &&
    Number(match.matchday) >= 1 && Number(match.matchday) <= 8 &&
    match.homeTeam?.id && match.awayTeam?.id
  );
  const stageInfo = {
    PLAYOFF_ROUND_1: { order: 1, label: "Knockout play-offs" },
    PLAYOFF_ROUND_2: { order: 1, label: "Knockout play-offs" },
    PLAYOFFS: { order: 1, label: "Knockout play-offs" },
    LAST_16: { order: 2, label: "Round of 16" },
    QUARTER_FINALS: { order: 3, label: "Quarter-finals" },
    SEMI_FINALS: { order: 4, label: "Semi-finals" },
    FINAL: { order: 5, label: "Final" }
  };
  const knockoutMatches = input.matches.filter((match) => stageInfo[match.stage] &&
    match.status !== "CANCELLED" && match.status !== "POSTPONED");
  const currentStage = knockoutMatches.reduce((best, match) =>
    !best || stageInfo[match.stage].order > stageInfo[best].order ? match.stage : best, null);
  if (!matches.length && !knockoutMatches.length) {
    return fail("The current season's fixtures are not available yet.");
  }

  const teams = new Map();
  const ensure = (team) => {
    if (!teams.has(team.id)) teams.set(team.id, {
      id: team.id, name: team.shortName || team.name || team.tla || "Unknown club",
      played: 0, won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0,
      away_goals: 0, away_wins: 0, points: 0, opponents: [],
      crest: team.crest || ""
    });
    return teams.get(team.id);
  };
  for (const match of matches) {
    const home = ensure(match.homeTeam);
    const away = ensure(match.awayTeam);
    if (match.status !== "FINISHED") continue;
    const h = match.score?.fullTime?.home;
    const a = match.score?.fullTime?.away;
    if (!Number.isFinite(h) || !Number.isFinite(a)) continue;
    home.played++; away.played++;
    home.goals_for += h; home.goals_against += a;
    away.goals_for += a; away.goals_against += h;
    away.away_goals += a;
    home.opponents.push(away.id); away.opponents.push(home.id);
    if (h > a) { home.won++; home.points += 3; away.lost++; }
    else if (a > h) { away.won++; away.away_wins++; away.points += 3; home.lost++; }
    else { home.drawn++; away.drawn++; home.points++; away.points++; }
  }

  const favorite = String(input?.trmnl?.plugin_settings?.custom_fields_values?.favorite_team || "")
    .trim().toLocaleLowerCase();
  const rows = [...teams.values()].map((team) => {
    const opponents = team.opponents.map((id) => teams.get(id));
    return {
      ...team,
      goal_difference: team.goals_for - team.goals_against,
      opponents_points: opponents.reduce((sum, t) => sum + t.points, 0),
      opponents_goal_difference: opponents.reduce((sum, t) => sum + t.goals_for - t.goals_against, 0),
      opponents_goals_for: opponents.reduce((sum, t) => sum + t.goals_for, 0),
      favorite: !!favorite && (team.name.toLocaleLowerCase().includes(favorite) || String(team.id) === favorite)
    };
  });
  // UEFA uses opponents' aggregate records only after all eight matchdays.
  const complete = rows.length === 36 && rows.every((row) => row.played === 8);
  const tieFields = ["points", "goal_difference", "goals_for", "away_goals", "won", "away_wins"];
  if (complete) tieFields.push("opponents_points", "opponents_goal_difference", "opponents_goals_for");
  rows.sort((a, b) => {
    for (const field of tieFields) if (a[field] !== b[field]) return b[field] - a[field];
    return a.name.localeCompare(b.name);
  });
  rows.forEach((row, index) => {
    row.position = index + 1;
    row.zone = row.position <= 8 ? "Direct" : row.position <= 24 ? "Playoff" :
      complete ? "Eliminated" : "Outside top 24";
    row.gd_text = row.goal_difference > 0 ? `+${row.goal_difference}` : String(row.goal_difference);
    row.tie_unresolved = [rows[index - 1], rows[index + 1]].some((other) =>
      other && tieFields.every((field) => row[field] === other[field]));
  });
  const featured = rows.find((row) => row.favorite) || null;
  const quadrantFocus = featured || rows[0] || null;
  const nearby = (count) => {
    if (!quadrantFocus) return [];
    return rows.filter((row) => row.id !== quadrantFocus.id)
      .sort((a, b) => Math.abs(a.position - quadrantFocus.position) - Math.abs(b.position - quadrantFocus.position) || a.position - b.position)
      .slice(0, count).sort((a, b) => a.position - b.position);
  };
  const matchScore = (match) => {
    const home = match.score?.fullTime?.home ?? match.score?.fullTime?.homeTeam;
    const away = match.score?.fullTime?.away ?? match.score?.fullTime?.awayTeam;
    return Number.isFinite(home) && Number.isFinite(away) ? { home, away } : null;
  };
  const teamView = (team) => ({
    id: team?.id, name: team?.shortName || team?.name || team?.tla || "TBD", crest: team?.crest || ""
  });
  const roundMatches = currentStage ? knockoutMatches.filter((match) =>
    stageInfo[match.stage].order === stageInfo[currentStage].order)
    .sort((a, b) => String(a.utcDate).localeCompare(String(b.utcDate))) : [];
  const tieMap = new Map();
  for (const match of roundMatches) {
    const ids = [match.homeTeam?.id, match.awayTeam?.id].filter(Boolean).sort((a, b) => a - b);
    const key = ids.length === 2 ? ids.join(":") : String(match.id);
    if (!tieMap.has(key)) tieMap.set(key, { matches: [], first: match });
    tieMap.get(key).matches.push(match);
  }
  const roundTies = [...tieMap.values()].map(({ matches: tieMatches, first }) => {
    const home = teamView(first.homeTeam);
    const away = teamView(first.awayTeam);
    let homeAggregate = 0, awayAggregate = 0, played = 0;
    for (const match of tieMatches) {
      const score = matchScore(match);
      if (match.status !== "FINISHED" || !score) continue;
      played++;
      if (match.homeTeam?.id === home.id) { homeAggregate += score.home; awayAggregate += score.away; }
      else { homeAggregate += score.away; awayAggregate += score.home; }
    }
    const next = tieMatches.find((match) => match.status !== "FINISHED") || null;
    const last = [...tieMatches].reverse().find((match) => match.status === "FINISHED") || null;
    const completeTie = currentStage === "FINAL" ? played === 1 : played >= 2;
    let winnerId = null;
    if (completeTie && homeAggregate !== awayAggregate) winnerId = homeAggregate > awayAggregate ? home.id : away.id;
    else if (completeTie && last?.score?.winner) {
      winnerId = last.score.winner === "HOME_TEAM" ? last.homeTeam?.id :
        last.score.winner === "AWAY_TEAM" ? last.awayTeam?.id : null;
    }
    const dateText = next?.utcDate ? `${next.utcDate.slice(8, 10)}/${next.utcDate.slice(5, 7)} ${next.utcDate.slice(11, 16)} UTC` : "";
    const decidedOnPenalties = completeTie && homeAggregate === awayAggregate && !!winnerId;
    return {
      home, away, home_score: played ? homeAggregate : "–", away_score: played ? awayAggregate : "–",
      played, complete: completeTie, winner_id: winnerId, next_date: dateText,
      status_label: completeTie ? decidedOnPenalties ? "FT · penalties" : "FT" : played ? `After leg ${played}` : dateText || "Scheduled",
      favorite: !!favorite && [home, away].some((team) => team.name.toLocaleLowerCase().includes(favorite) || String(team.id) === favorite)
    };
  });
  const featuredTie = roundTies.find((tie) => tie.favorite) || roundTies[0] || null;
  const displayMode = currentStage ? "knockout" : "league";
  const season = (matches[0] || knockoutMatches[0])?.season?.startDate?.slice(0, 4) || "";
  return {
    plugin_ok: true, error_message: "", rows,
    top_rows: rows.slice(0, 18), lower_rows: rows.slice(18),
    leader: rows[0], featured,
    quadrant_focus: quadrantFocus,
    nearby_short: nearby(2), nearby_long: nearby(5),
    display_mode: displayMode,
    competition_state: currentStage === "FINAL" && roundTies[0]?.complete ? "complete" :
      currentStage ? "knockout" : rows.every((row) => row.played === 0) ? "upcoming" : "league",
    round_label: currentStage ? stageInfo[currentStage].label : "League phase",
    round_ties: roundTies, featured_tie: featuredTie,
    season_label: season ? `${season}/${String(Number(season) + 1).slice(-2)}` : "",
    games_played: matches.filter((m) => m.status === "FINISHED").length,
    has_unresolved_ties: rows.some((row) => row.tie_unresolved)
  };
}
