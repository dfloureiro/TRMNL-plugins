# IPMA Weather

A TRMNL plugin that shows the daily weather forecast for a location in Portugal, using the free open data API from [IPMA](https://api.ipma.pt/) (Instituto Português do Mar e da Atmosfera — the Portuguese national weather service).

## What it shows

- **Today:** weather icon and description, max/min temperature, probability of rain, and wind direction and strength
- **Next days:** a short forecast with icon, max/min temperature and rain probability

The amount of detail depends on the layout:

| Layout | Content |
| --- | --- |
| Full | Today in detail + next 4 days |
| Half horizontal | Today + next 3 days, side by side |
| Half vertical | Today + next 3 days, stacked |
| Quadrant | Today + tomorrow |

On smaller displays some secondary details are hidden, such as wind in the half horizontal layout and rain/wind in the quadrant.

Labels, weekday names and weather descriptions are available in **English** and **Portuguese**.

## Configuration

| Field | Required | Description |
| --- | --- | --- |
| IPMA Location ID | Yes | Numeric ID (`globalIdLocal`) of the IPMA forecast location. Default: `1110600` (Lisbon). |
| Display name | No | Custom name shown on screen. Defaults to `IPMA`. |
| Language | Yes | `en` for English or `pt` for Portuguese. Default: `en`. |

Some common location IDs:

| Location | ID |
| --- | --- |
| Lisbon | `1110600` |
| Porto | `1131200` |
| Faro | `1080500` |
| Coimbra | `1060300` |
| Braga | `1030300` |
| Aveiro | `1010500` |
| Setúbal | `1151200` |
| Funchal | `2310300` |

The full list of locations is available at [api.ipma.pt/open-data/distrits-islands.json](https://api.ipma.pt/open-data/distrits-islands.json).

## How it works

The plugin uses TRMNL's **polling** strategy and refreshes every 15 minutes, fetching:

```
https://api.ipma.pt/open-data/forecast/meteorology/cities/daily/{IPMA Location ID}.json
```

IPMA weather type codes (`idWeatherType`) are mapped to TRMNL's built-in weather icons, and wind speed classes (`classWindSpeed`) to text labels.

## Local preview

```bash
cd plugins/ipma-weather
trmnlp serve
```

To preview with a different location or language, set values under `custom_fields` in [`.trmnlp.yml`](.trmnlp.yml), e.g.:

```yaml
custom_fields:
  global_id_local: "1131200"
  location_name: Porto
  language: pt
```

## Credits

Weather data provided by [IPMA open data](https://api.ipma.pt/).
