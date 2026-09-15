# Commute - Arrive By

A TRMNL plugin that shows how long a car trip between two points takes right now, and when you would arrive if you left now. It uses live traffic data from the [TomTom Routing API](https://developer.tomtom.com/routing-api/documentation/tomtom-maps/v1/calculate-route).

Need to be somewhere at a set time instead? See [Commute - Leave By](../commute-leaveby).

## What it shows

- **Travel time** for the fastest route, with current traffic
- **Arrival time** if you leave now
- **Distance**, the **usual travel time** (based on historical traffic) and the **current traffic delay**
- **Traffic level** in the title bar: Clear, Minor, Moderate, Heavy or Closed, based on the worst traffic section on the main route
- **Alternative routes**, each with travel time, distance, delay and the main roads it uses (e.g. `via A1 · IC19`)

The amount of detail depends on the layout:

| Layout | Content |
| --- | --- |
| Full | Travel time, arrival, distance, usual time, delay, roads + cards for up to 3 routes |
| Half horizontal | Travel time, arrival, distance and delay + up to 2 routes |
| Half vertical | Travel time, arrival, distance and traffic level + up to 2 routes |
| Quadrant | Travel time, arrival and traffic level + up to 2 routes (compact) |

On smaller displays some secondary details are hidden, such as road names and the third route card.

If the route can't be loaded (wrong coordinates, invalid API key, TomTom error), the plugin shows an error screen with the reason instead.

Labels are available in **English** and **Portuguese**.

## Configuration

| Field | Required | Description |
| --- | --- | --- |
| TomTom API Key | Yes | Free API key from [developer.tomtom.com](https://developer.tomtom.com/). |
| Origin | Yes | Start point as `lat,lng`, e.g. `38.707530,-9.136378`. |
| Destination | Yes | End point as `lat,lng`, e.g. `41.148836,-8.610915`. |
| Route Label | No | Title shown on screen. Default: `Commute`. |
| Language | No | `en` (English) or `pt` (Portuguese). Default: `en`. |

To get coordinates, right-click a place in Google Maps or OpenStreetMap and copy the latitude and longitude.

## How it works

The plugin uses TRMNL's **polling** strategy and refreshes every 15 minutes. The polling URL calls the TomTom `calculateRoute` endpoint directly, using your origin, destination and API key. It asks for a car trip with live traffic, the fastest route type and up to 2 alternatives.

[`src/transform.js`](src/transform.js) then post-processes the response as TRMNL serverless code (Node):

- trims each route down to what the templates need: summary, traffic sections and a de-duplicated list of road numbers
- detects API errors or empty results and passes an error message to the templates

At a 15-minute refresh interval the plugin makes about 96 TomTom requests per day.

## Local preview

```bash
cd plugins/commute-arriveby
trmnlp serve
```

Set the custom field values in [`.trmnlp.yml`](.trmnlp.yml). Use an environment variable for the API key so it doesn't get committed:

```yaml
custom_fields:
  tomtom_api_key: "{{ env.TOMTOM_API_KEY }}"
  origin: "38.707530,-9.136378"
  destination: "41.148836,-8.610915"
  route_label: Lisbon → Porto
  language: en
```

## Credits

Routing and traffic data provided by [TomTom](https://developer.tomtom.com/).
