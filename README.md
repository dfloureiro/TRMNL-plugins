# TRMNL-plugins

My collection of private plugins for [TRMNL](https://trmnl.com), the e-ink dashboard display.

Each plugin lives in its own folder under [`plugins/`](plugins) and follows the [`trmnlp`](https://github.com/usetrmnl/trmnlp) project layout, so it can be previewed locally and pushed to / pulled from TRMNL. Changes made in the TRMNL web editor are synced back to this repo automatically.

## Plugins

| Plugin | Description |
| --- | --- |
| [IPMA Weather](plugins/ipma-weather) | Daily weather forecast for locations in Portugal, using open data from IPMA (Instituto Português do Mar e da Atmosfera). Available in English and Portuguese. |
| [TomTom Commute](plugins/TomTom-Commute) | Live car travel time between two points, with traffic delay and up to two alternative routes, using the TomTom Routing API. Works in "leave by" mode (travel time from now) or "arrive by" mode (works out when to leave to arrive at a set time), with an optional return trip. Available in English and Portuguese. |

## Repository structure

```
plugins/
└── <plugin-name>/
    ├── .trmnlp.yml          # local preview config (custom field values, variable overrides)
    └── src/
        ├── settings.yml     # plugin settings: data strategy, polling URL, custom fields
        ├── transform.js     # optional serverless code that fetches/reshapes data
        ├── shared.liquid    # markup/variables shared by all layouts
        ├── full.liquid      # full screen layout
        ├── half_horizontal.liquid
        ├── half_vertical.liquid
        └── quadrant.liquid
```

## Local development

Install [`trmnlp`](https://github.com/usetrmnl/trmnlp), then from a plugin folder:

```bash
trmnlp serve
```

This starts a local preview server that reloads on file changes. Use `trmnlp push` / `trmnlp pull` to sync a plugin with your TRMNL account (requires `trmnlp login`).

## License

Licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). See [LICENSE.md](LICENSE.md).
