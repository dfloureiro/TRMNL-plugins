# TomTom Commute

A TRMNL plugin that shows live car travel time between two points, using the [TomTom Routing API](https://developer.tomtom.com/routing-api/documentation/tomtom-maps/v1/calculate-route). It works either as a live "travel time from now" screen, or as a "leave by" screen that tells you when to leave to arrive at a set time.

## What it shows

- **Leave-by mode** (when `Arrive by` is set): the time you need to leave, and the arrival time you asked for
- **Live mode** (when `Arrive by` is empty): current travel time and estimated arrival time
- Distance, current traffic delay, and a traffic status (Clear / Minor / Moderate / Heavy / Closed)
- Road numbers used on the route
- Up to 3 routes (main + alternatives), each with its own time, so you can compare options

The amount of detail depends on the layout:

| Layout | Content |
| --- | --- |
| Full | Main figure (leave-by or travel time) + travel time/normal time, distance, delay, road numbers + up to 3 routes |
| Half horizontal | Main figure + up to 2 routes, side by side |
| Half vertical | Main figure + up to 2 routes, stacked |
| Quadrant | Main figure, distance, traffic status and delay + up to 2 routes (compact) |

Labels and weather-independent text are available in **English** and **Portuguese**.

## Configuration

| Field | Required | Description |
| --- | --- | --- |
| TomTom API Key | Yes | Free key from [developer.tomtom.com](https://developer.tomtom.com/). |
| Origin | Yes | `lat,lng` (e.g. `38.707530,-9.136378`). |
| Destination | Yes | `lat,lng` (e.g. `41.148836,-8.610915`). |
| Return Trip? | No | Swaps origin and destination, for the trip home. Default: off. |
| Arrive by | No | `HH:mm` (24h), later today. Leave empty to show live travel time from now. When set, the screen shows what time to leave instead, interpreted in the destination's local time. |
| Route Label | No | Title shown on screen. Default: `Commute`. |
| Language | Yes | `en` for English or `pt` for Portuguese. Default: `en`. |

## How it works

The plugin uses TRMNL's **polling** strategy and refreshes every 15 minutes, calling the TomTom Calculate Route API with traffic enabled and up to 2 alternative routes:

```
https://api.tomtom.com/routing/1/calculateRoute/{origin}:{destination}/json
  ?key={TomTom API Key}
  &traffic=true
  &maxAlternatives=2
  &routeType=fastest
  &computeTravelTimeFor=all
  &sectionType=traffic
  &travelMode=car
```

When `Return Trip?` is on, origin and destination are swapped before the request. When `Arrive by` is set, `arriveAt` is added to the request so TomTom calculates the required departure time instead of the arrival time.

A small serverless transform (`transform.js`) reshapes the TomTom response, keeping only what the layouts need, and turns API errors or missing routes into a friendly error message shown on screen (e.g. invalid coordinates or no route for the requested arrival time).

## Local preview

```bash
cd plugins/TomTom-Commute
trmnlp serve
```

To preview with your own values, set them under `custom_fields` in [`.trmnlp.yml`](.trmnlp.yml), e.g.:

```yaml
custom_fields:
  tomtom_api_key: "your-api-key"
  origin: "38.707530,-9.136378"
  destination: "41.148836,-8.610915"
  arrive_by: "09:00"
  route_label: "Work"
  language: pt
```

## Credits

Routing and traffic data provided by [TomTom Routing API](https://developer.tomtom.com/).
