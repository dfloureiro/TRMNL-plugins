# Champions League Standings for TRMNL

A stage-aware TRMNL plugin for the UEFA Champions League. During the league phase it calculates the 36-club table from finished matches returned by [football-data.org](https://www.football-data.org/). The provider [classifies Champions League as a cup](https://www.football-data.org/coverage), and its [standings documentation](https://docs.football-data.org/general/v4/competition.html) says that resource is unavailable for cup competitions.

When knockout fixtures become available, the layouts automatically switch to the current round: knockout play-offs, round of 16, quarter-finals, semi-finals or final. Two-legged rounds show aggregate scores and the next-leg date. A completed final remains visible as the completed-season state.

## What it shows

- **Full landscape:** the complete table in two columns, with rules after positions 8 and 24.
- **Full portrait:** all 36 clubs.
- **Half horizontal:** the leading eight clubs on OG landscape (six when a separate favourite row is needed), 14 on OG portrait and TRMNL X landscape, or 22 on TRMNL X portrait, plus a favourite outside the visible table.
- **Half vertical:** the leading 20 clubs in landscape (16 when a separate favourite row is needed), or 30 in portrait, plus a favourite outside the visible table.
- **Quadrant:** your favourite club's position, points, goal difference and record, with the two closest clubs on OG landscape or five on larger/portrait views. Without a favourite it shows the leader and closest challengers.

Columns are position, club, played, goal difference and points. Positions 1–8 advance directly to the round of 16; positions 9–24 go to the knockout playoffs. The selected club is marked with a strong left border.

Knockout cards use club crests embedded in the match response when available. Football-data.org notes that club graphics remain copyrighted by their respective owners; publishers are responsible for the necessary permission.

## Setup

1. Create a free [football-data.org account](https://www.football-data.org/client/register) and obtain an API token.
2. Add the token to the plugin's **football-data.org API token** password field. Each installation uses its own token.
3. Optionally enter a **Favourite club** name, such as `Sporting` or `Benfica`. This is matched against the provider's club name; a provider team ID also works.

Keep the token private. [Football-data.org's terms](https://www.football-data.org/about) require developer credentials to remain confidential and prohibit storing them in an open-source repository.

TRMNL polls `GET https://api.football-data.org/v4/competitions/CL/matches` with the token in the `X-Auth-Token` header every 60 minutes. The token is not stored in this repository.

Only fixtures from matchdays 1–8 in the league phase are used for the table. Scheduled fixtures establish the 36-club roster; only finished matches with full-time scores count toward standings. Knockout stages are grouped into ties using the two participating team IDs. Before league fixtures are published, the screen shows a useful empty state. If the token or API fails, it shows the provider's error where available.

The ranking follows [UEFA's tie-break order](https://www.uefa.com/uefachampionsleague/news/0291-1bd88ae04870-e1e038c319e3-1000--champions-league-league-phase-standings-how-teams-level-on-/): points, goal difference, goals scored, away goals, wins and away wins. Once all 36 clubs have played eight games, it also uses opponents' collective points, goal difference and goals scored. Before then, clubs still level on these criteria are listed alphabetically. UEFA has further end-of-phase tie-breakers that the match feed does not provide, so a tied order can differ from UEFA's official table. Treat cutoff positions as provisional when clubs remain tied.

## Local preview

Install [`trmnlp`](https://github.com/usetrmnl/trmnlp), then run `trmnlp serve` in this directory. To preview with live data without committing a token, temporarily set `custom_fields.football_data_token` in `.trmnlp.yml` to `"{{ env.FOOTBALL_DATA_TOKEN }}"` and export that environment variable before starting the server. Remove the local override before committing.

The plugin is linked to TRMNL plugin ID `483237`.
