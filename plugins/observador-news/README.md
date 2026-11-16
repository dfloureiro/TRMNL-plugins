# Observador

A TRMNL plugin that shows the latest headlines from [Observador](https://observador.pt/), read from its public RSS feed.

## What it shows

Each headline comes with its section and how long ago it was published.

| Layout | Content |
| --- | --- |
| Full | Lead story with its standfirst, then up to two columns of headlines |
| Half horizontal | Headlines in two columns (three on larger screens) |
| Half vertical | Lead story with its standfirst, then headlines |
| Quadrant | Headlines |

Headlines that don't fit are left out automatically. In portrait, the half horizontal layout uses fewer, wider columns, and the narrow half vertical and quadrant layouts allow three-line headlines so they aren't cut off.

## Configuration

| Field | Required | Description |
| --- | --- | --- |
| Section | Yes | `Últimas` for everything, or one section: Política, País, Sociedade, Economia, Mundo, Desporto, Cultura, Ciência, Tecnologia, Lifestyle. Default: `Últimas`. |
| Hide radio and podcasts | No | Leave out Rádio Observador newscasts and programmes (`/programas/` links). Default: on. |
| Language | Yes | `pt` or `en` for labels and relative times. Headlines are always in Portuguese. Default: `pt`. |

## How it works

The plugin uses TRMNL's **polling** strategy and refreshes every 30 minutes, fetching:

```
https://observador.pt/feed/
```

Observador's per-section feed URLs (`/seccao/<section>/feed/`) all return the same latest-news list, so sections are filtered in [`transform.js`](src/transform.js) from each article's `<category>` tags instead. Quieter sections may only show a few articles, since the feed holds the latest ~50.

`transform.js` also strips HTML from titles and descriptions, picks the section label (the first tag that is a top-level section) and turns `pubDate` into a timestamp. The relative time ("há 2 h" / "2h ago") is worked out at render time.

## Local preview

```bash
cd plugins/observador-news
trmnlp serve
```

The preview helper renders all four layouts to PNG for a given device, from the live feed:

```bash
./preview og                      # TRMNL OG, landscape
./preview og-portrait
./preview x-landscape en          # TRMNL X, English labels
./preview x-portrait pt Desporto  # any device, language and section
```

It needs Ruby; with the trmnlp container, run it through the image:
`podman run --rm -v "$PWD:/plugin:Z" -w /plugin --entrypoint ruby docker.io/trmnl/trmnlp:latest /plugin/preview og`.
Output goes to `.preview/` (git-ignored).

To preview a section or English labels with `trmnlp serve`, set values under `custom_fields` in [`.trmnlp.yml`](.trmnlp.yml), e.g.:

```yaml
custom_fields:
  section: Desporto
  language: en
```

## Credits

News content © [Observador](https://observador.pt/). This plugin is not affiliated with Observador.
