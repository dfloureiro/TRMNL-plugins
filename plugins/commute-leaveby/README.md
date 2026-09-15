# Commute - Leave By

A TRMNL plugin that tells you **when to leave** to arrive at a destination by a set time, based on the expected traffic for that trip. It uses the [TomTom Routing API](https://developer.tomtom.com/routing-api/documentation/tomtom-maps/v1/calculate-route).

Just want to know how long the trip takes right now? See [Commute - Arrive By](../commute-arriveby).

## What it shows

- **Leave by:** the time you need to leave on the fastest route
- **Arrive by:** your target arrival time
- **Travel time**, **distance** and **traffic delay** for the trip
- **Traffic level** in the title bar: Clear, Minor, Moderate, Heavy or Closed, based on the worst traffic section on the main route
- **Alternative routes**, each with its own departure time, travel time, distance, delay and the main roads it uses (e.g. `via A1 · IC19`)

The amount of detail depends on the layout:

| Layout | Content |
| --- | --- |
| Full | Leave by, arrive by, travel time, distance, delay, roads + cards for up to 3 routes |
| Half horizontal | Leave by, arrive by, travel time, distance and delay/traffic + up to 2 routes |
| Half vertical | Leave by, arrive by, travel time, distance and traffic level + up to 2 routes |
| Quadrant | Leave by, arrive by + up to 2 routes with their departure times (compact) |

On smaller displays some secondary details are hidden, such as road names, per-route travel times in the quadrant and the third route card.

If no route can be loaded, the plugin shows an error screen with the reason instead. For example, if the origin or destination isn't a valid `lat,lng`, it says so.

Labels are available in **English** and **Portuguese**.

## Configuration

| Field | Required | Description |
| --- | --- | --- |
| TomTom API Key | Yes | Free API key from [developer.tomtom.com](https://developer.tomtom.com/). |
| Origin | Yes | Start point as `lat,lng`, e.g. `38.707530,-9.136378`. |
| Destination | Yes | End point as `lat,lng`, e.g. `41.148836,-8.610915`. |
| Arrive by | Yes | Arrival time as `HH:mm` (24h), e.g. `09:00`. Default: `09:00`. |
| Route Label | No | Title shown on screen. Default: `Leave by`. |
| Language | No | `en` (English) or `pt` (Portuguese). Default: `en`. |

To get coordinates, right-click a place in Google Maps or OpenStreetMap and copy the latitude and longitude.

### About the arrival time

- It's always for **today** and in the **destination's local time**.
- It must still be **in the future**. Once the arrival time has passed, TomTom returns no route and the plugin shows an error until the next day.

## How it works

The plugin uses TRMNL's **polling** strategy and refreshes every 15 minutes. The polling URL calls the TomTom `calculateRoute` endpoint directly with an `arriveAt` parameter (today's date plus your arrival time). It asks for a car trip with traffic, the fastest route type and up to 2 alternatives. TomTom then works backwards to calculate the departure time for each route.

[`src/transform.js`](src/transform.js) then post-processes the response as TRMNL serverless code (Node):

- trims each route down to what the templates need: summary (including departure time), traffic sections and a de-duplicated list of road numbers
- detects API errors or empty results and builds a helpful error message, e.g. when the coordinates aren't in `lat,lng` format

At a 15-minute refresh interval the plugin makes about 96 TomTom requests per day.

## Local preview

```bash
cd plugins/commute-leaveby
trmnlp serve
```

Set the custom field values in [`.trmnlp.yml`](.trmnlp.yml). Use an environment variable for the API key so it doesn't get committed:

```yaml
custom_fields:
  tomtom_api_key: "{{ env.TOMTOM_API_KEY }}"
  origin: "38.707530,-9.136378"
  destination: "41.148836,-8.610915"
  arrive_by: "18:30"
  route_label: Lisbon → Porto
  language: en
```

## Credits

Routing and traffic data provided by [TomTom](https://developer.tomtom.com/).
