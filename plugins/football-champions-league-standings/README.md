# Champions League Standings for TRMNL

A TRMNL plugin for the UEFA Champions League **league phase**. It calculates the 36-club table from finished matches returned by [football-data.org](https://www.football-data.org/). The provider [classifies Champions League as a cup](https://www.football-data.org/coverage), and its [standings documentation](https://docs.football-data.org/general/v4/competition.html) says that resource is unavailable for cup competitions.

## What it shows

- **Full landscape:** the complete table in two columns, with rules after positions 8 and 24.
- **Full portrait:** the top eight, your favourite club when outside the top eight, and the 24/25 cutoff.
- **Half horizontal:** leading six clubs and your favourite club when outside that group.
- **Half vertical:** your favourite club (or the leader) and the leading six clubs.
- **Quadrant:** one large card for your favourite club (or the leader).

Columns are position, club, played, goal difference and points. Positions 1–8 advance directly to the round of 16; positions 9–24 go to the knockout playoffs. The selected club is shown with an inverted row.

## Setup

1. Create a free [football-data.org account](https://www.football-data.org/client/register) and obtain an API token.
2. Add the token to the plugin's **football-data.org API token** password field. Each installation uses its own token.
3. Optionally enter a **Favourite club** name, such as `Sporting` or `Benfica`. This is matched against the provider's club name; a provider team ID also works.

TRMNL polls `GET https://api.football-data.org/v4/competitions/CL/matches` with the token in the `X-Auth-Token` header every 60 minutes. The token is not stored in this repository.

Only fixtures from matchdays 1–8 in the league phase are used. Scheduled fixtures establish the 36-club roster; only finished matches with full-time scores count toward the table. Before those fixtures are published, the screen shows a useful empty state. If the token or API fails, it shows the provider's error where available.

The ranking follows [UEFA's tie-break order](https://www.uefa.com/uefachampionsleague/news/0291-1bd88ae04870-e1e038c319e3-1000--champions-league-league-phase-standings-how-teams-level-on-/): points, goal difference, goals scored, away goals, wins and away wins. Once all 36 clubs have played eight games, it also uses opponents' collective points, goal difference and goals scored. Before then, clubs still level on these criteria are listed alphabetically. UEFA has further end-of-phase tie-breakers that the match feed does not provide, so a tied order can differ from UEFA's official table. Treat cutoff positions as provisional when clubs remain tied.

## Local preview

Install [`trmnlp`](https://github.com/usetrmnl/trmnlp), then run `trmnlp serve` in this directory. To preview with live data without committing a token, temporarily set `custom_fields.football_data_token` in `.trmnlp.yml` to `"{{ env.FOOTBALL_DATA_TOKEN }}"` and export that environment variable before starting the server. Remove the local override before committing.

The plugin is linked to TRMNL plugin ID `483237`.
