# Liga Portugal Betclic Standings for TRMNL

This plugin shows the current Liga Portugal Betclic table (the Primeira Liga), styled after a classic printed league table with the Liga Portugal emblem. It uses the direct league-table resource from the football-data.org v4 API, so the standings are supplied by the provider rather than calculated from match results.

## What it shows

| Layout | Landscape | Portrait |
| --- | --- | --- |
| Full | Whole table in top and bottom halves, with P W D L GD Pts | All 18 clubs in one table |
| Half horizontal | 10 clubs in two columns (12 with W/D/L on TRMNL X) | 10 clubs on OG; the whole table in two columns on TRMNL X |
| Half vertical | 11 clubs (12 on TRMNL X) | All 18 clubs (OG shows # Club Pts to fit the narrow slot) |
| Quadrant | 5 clubs (6 on TRMNL X) | 10 clubs on OG (# Club Pts); 9 on TRMNL X |

On the TRMNL Frame (2560×1440), the Framework currently renders at OG pixel sizes, which would leave most of the screen empty. The plugin scales the Frame up three times so it shows the OG layouts at full size; no other device is affected.

Set a favourite club to highlight it: its row is shown in white on black in every layout. The smaller layouts show a slice of the table centred on your club, so it is always visible; without a favourite they start at first place.

The title bar shows the current matchday and season.

## Setup

1. Create a free account at https://www.football-data.org/client/register and copy the API token.
2. Add it to the plugin's football-data.org API token password field.
3. Choose the screen language: English or Português (European Portuguese). In Portuguese the table uses the usual columns J V E D DG Pts and the title bar shows the jornada.
4. Optionally enter a Favourite club, such as Sporting or Benfica, to highlight its row and centre the smaller layouts on it.

The plugin polls GET https://api.football-data.org/v4/competitions/PPL/standings every 60 minutes and sends the token in the X-Auth-Token header. The provider's free plan is free forever, includes Primeira Liga tables, and allows 10 API calls per minute. Each installation uses its own token; keep it private and do not commit it.

Football-data.org may delay scores and schedules on the free plan. The screen shows the provider's error when the API or token fails, and shows an empty-data message if no table is available.

## Local preview

Install trmnlp from https://github.com/usetrmnl/trmnlp, then run trmnlp serve in this directory. The deterministic preview helper renders all four layouts to PNG:

~~~sh
./preview league og
./preview league-favorite x-portrait        # favourite near the top (Benfica)
./preview league-favorite-low x-landscape   # favourite mid-table (Nacional)
./preview league x-landscape
./preview league og-portrait
./preview league-favorite-low frame             # TRMNL Frame, 6-colour palette
./preview league frame-bw                       # TRMNL Frame, black and white
./preview league-favorite-low og pt              # any state and device, in Portuguese
./preview error og
~~~

Generated files are written below .preview/ and are ignored by Git. The preview data is synthetic and never contains an API token. The helper sets the favourite through the copied .trmnlp.yml custom fields, because trmnlp (like TRMNL) replaces any trmnl key in the data with the plugin form values.

The football data and club crests are provided by football-data.org and their respective rights holders. The Liga Portugal emblem is served by football-data.org. This plugin is not affiliated with Liga Portugal or Betclic.
