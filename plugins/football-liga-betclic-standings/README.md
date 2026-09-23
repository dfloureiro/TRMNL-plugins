# Liga Betclic Portugal Standings for TRMNL

This plugin shows the current Liga Betclic Portugal table, also known as the Primeira Liga. It uses the direct league-table resource from the football-data.org v4 API, so the standings are supplied by the provider rather than calculated from match results.

## What it shows

- Full landscape and portrait: a large favourite club or league leader feature above all 18 clubs.
- Half horizontal: the featured club fills the available space above the top four clubs on compact screens or five on X.
- Half vertical: the featured club fills the available space above the top nine clubs on compact screens or 15 on X.
- Quadrant: the featured club above the top three clubs on compact screens or four on X.

The table always starts at first place; a favourite in the visible top positions appears both in the feature and in the table.

Tables include position, club, played, goal difference, and points. The full and half-vertical layouts also include a zone legend for positions 1–4 as Champions League, 5 as Europa League, 6 as Conference League, 16 as relegation play-off, and 17–18 as relegation. These are indicative: actual European places can change with cup results and UEFA allocation rules.

## Setup

1. Create a free account at https://www.football-data.org/client/register and copy the API token.
2. Add it to the plugin's football-data.org API token password field.
3. Optionally enter a Favourite club, such as Sporting or Benfica, to highlight it and use it in the quadrant.

The plugin polls GET https://api.football-data.org/v4/competitions/PPL/standings every 60 minutes and sends the token in the X-Auth-Token header. The provider's free plan is free forever, includes Primeira Liga tables, and allows 10 API calls per minute. Each installation uses its own token; keep it private and do not commit it.

Football-data.org may delay scores and schedules on the free plan. The screen shows the provider's error when the API or token fails, and shows an empty-data message if no table is available.

## Local preview

Install trmnlp from https://github.com/usetrmnl/trmnlp, then run trmnlp serve in this directory. The deterministic preview helper renders all four layouts:

~~~sh
./preview league og
./preview league-favorite x-landscape
./preview league x-landscape
./preview league x-portrait
./preview error og
~~~

Generated files are written below .preview/ and are ignored by Git. The preview data is synthetic and never contains an API token.

The football data and club crests are provided by football-data.org and their respective rights holders. This plugin is not affiliated with Liga Portugal or Betclic.
