---
name: trmnl-plugin
description: Create or update a TRMNL plugin in this repository, including its polling or webhook data flow, companion web app, Liquid layouts, settings, local preview configuration, and user documentation. Use for work under plugins/; do not use for generic web or JavaScript projects.
---

# TRMNL plugin baseline

Build a complete, maintainable plugin in `plugins/<plugin-name>/` that follows this repository's `trmnlp` layout. Keep the plugin focused on the user's requested display and data source; do not invent product features, external accounts, or publish/sync changes without authorization.

## Start with the data contract

- Inspect comparable plugins in `plugins/` and the upstream API documentation or a representative response before designing the Liquid markup.
- Choose `webhook` when the data comes from the user rather than an API (see [Webhook plugins with a companion app](#webhook-plugins-with-a-companion-app)). Choose `polling` for a direct JSON response that layouts can use safely. Use `transform.js` only when the response needs reshaping, calculation, pagination, or user-friendly error handling.
- For a transform, return a small layout-oriented object. Preserve a clear success signal (`plugin_ok`) and an `error_message` suitable for display. Handle expected API and missing-data failures so every layout can render a useful error state.
- Never embed credentials or personal values in source files. Add credentials as `password` custom fields and keep `.trmnlp.yml` values empty or environment-interpolated.

## Required plugin shape

Create or maintain the following files when they apply:

```text
plugins/<plugin-name>/
├── .trmnlp.yml
├── README.md
└── src/
    ├── settings.yml
    ├── shared.liquid
    ├── full.liquid
    ├── half_horizontal.liquid
    ├── half_vertical.liquid
    ├── quadrant.liquid
    └── transform.js          # only when needed
```

A webhook plugin with a companion app also has `app/` (published by `.github/workflows/pages.yml`) and usually `preview` and `serve-app` helpers; see below.

Keep `.trmnlp.yml` as a local-preview configuration: watch `src` and the config file, with `variables.trmnl` empty and `custom_fields` holding only non-sensitive defaults the preview needs (such as `language: en`). Do not commit real API keys or other sensitive preview values.

## Settings and fields

- Keep `settings.yml` compatible with the existing plugins: explicitly state strategy, polling method/URL, framework version, refresh interval, and serverless language when a transform is used. Do not fabricate the TRMNL-assigned `id` for a new plugin; retain it when updating an existing one. The first `trmnlp push` of a new plugin creates it on TRMNL and writes the `id` into `settings.yml`; commit that.
- Expose only the configuration a user needs. Choose accurate field types, mark genuinely optional fields, supply useful placeholders/defaults, and explain formats, limits, and provider prerequisites.
- Include a concise `author_bio` field with a fitting category, project-specific GitHub URL, provider/docs link where helpful, and author contact details only when already established for this repository or supplied by the user.
- Add a language field only when the plugin is intended to support more than one language. For English/Portuguese support, resolve the setting defensively in `shared.liquid`, default to English, and keep every visible label on both paths.

## Liquid layouts

- Put shared derived values, localization, reusable templates, title bars, and error rendering in `shared.liquid`; layouts should render that shared contract instead of repeating business logic.
- Implement all four layouts in both landscape and portrait: `full`, `half_horizontal`, `half_vertical`, and `quadrant`. Adapt information density to the available space: full may show detail; half layouts should preserve the primary decision/useful value; quadrant should be immediately legible and omit secondary detail before shrinking everything.
- Make each layout responsive across supported TRMNL device classes, including TRMNL OG and TRMNL X. Treat the layout container—not the whole screen—as the available space, since mashup slots are smaller than a full view.
- Use the Framework's responsive utilities intentionally. Reflow grids and flex direction with size/orientation variants; use `portrait:` or `landscape:` when information hierarchy changes; use `lg:` to reveal useful additional detail on TRMNL X rather than simply scaling every element up.
- Prefer container-query sizing (`cqw`/`cqh`) and min/max constraints for elements that occupy a share of a layout. Use responsive `--base` modifiers to restore a default text or gap size after a compact breakpoint. Clamp or hide genuinely secondary text at constrained sizes; do not let long labels, tables, or lists overflow their container.
- Design for e-ink: high contrast, restrained visual hierarchy, stable numbers (`value--tnums` where appropriate), concise labels, and no reliance on colour as the only signal.
- Use TRMNL framework classes and the existing layout conventions. If adding inline SVG or remote imagery, provide meaningful nonvisual fallback or an empty `alt` for purely decorative images.
- Give every `<img>` the `image-dither` class, including small black-line SVG icons; TRMNL's publishing review flags any image without it.
- In a `.columns` list managed by the overflow engine (`data-overflow`, `data-overflow-max-cols`), draw the line between items on the item itself (`border--h-N`, plus a little `pb--N`), not with separate `.divider` elements. The engine plans columns from the `.item` blocks alone, then measures the real columns with the dividers included; the column comes out taller than planned and the engine hides items that fit, sometimes without an "and N more" line.
- Ensure each layout handles empty/error data without broken markup, blank primary values, or unsafe Liquid access.

For responsive layout work, consult the [TRMNL X guide](https://trmnl.com/framework/docs/3.1/trmnl_x_guide). Its container-query, responsive overflow, responsive grid-span, and clamp guidance is particularly relevant to mashups and portrait views.

## Documentation and verification

- Update the root `README.md` plugin table when adding a plugin.
- In the plugin README, cover what the screen shows by layout, configuration fields, data source and refresh behavior, error/limitation notes that affect users, and local preview with `trmnlp serve`.
- Plugins with a `preview` script render PNGs of every layout without a server: `./preview STATE [DEVICE] [LANGUAGE]` (see the script for states and devices). `DATA=payload.json ./preview …` renders a real payload, the quickest way to reproduce a reported layout bug. If trmnlp runs in a container while a `trmnlp serve` container uses the same folder, mount it with `:z`, not `:Z`: `:Z` relabels the folder for the new container only, and the running server fails with "Missing template".
- Run `trmnlp serve` from the plugin directory when it is available. Inspect every layout in landscape and portrait on an OG-sized preview and a TRMNL X-sized preview, plus at least one error or empty-data scenario when practical. Check that primary content remains visible, content does not overlap or clip, and secondary content changes deliberately at each breakpoint. If local preview cannot run, perform a static check of the Liquid variable paths and responsive class combinations, then report the unverified matrix.
- Keep changes scoped to the requested plugin. `trmnlp push` and `trmnlp pull` modify external TRMNL state, so run them only when the user explicitly asks.

## Webhook plugins with a companion app

Use this pattern when the user keeps the data themselves (a list, codes, notes): a static web app on their phone posts it to the plugin's webhook. `plugins/parcels` and `plugins/shopping-list` are the reference implementations; start from one of them.

- **Payload:** `{"merge_variables": {"v": 1, "<items>": [...], "updated": "<preformatted time>", "updated_at": <ms>}}`. `v` versions the format; keep it backwards compatible and document it in the README. `updated` is formatted on the phone, in its language and time zone. Leave out fields that hold the default value, because the whole post must fit TRMNL's webhook limit (about 2 KB, 5 KB with TRMNL+); the app should show the current size.
- **Syncing:** a GET on the webhook URL returns what TRMNL holds. The app uses `updated_at` to load TRMNL's copy when it is newer, which restores a cleared browser and keeps several devices in step (last write wins). Group quick edits into one post with a short delay, because TRMNL limits webhook updates per hour, and show sync state and errors (429, 413) with a Retry.
- **Screen states:** until anything has been posted, show a QR code (`{{ url | qr_code }}`) that opens the app. After that, an empty list gets its own message.
- **App:** one static `app/index.html` (plus manifest and icons), no build step and no server. `.github/workflows/pages.yml` publishes every `plugins/<name>/app/` at `https://<user>.github.io/<repo>/<name>/`. The data and the webhook URL live only in `localStorage`; treat the webhook URL like a password; make no third-party requests, and say so in the README's privacy section. Support English and Portuguese, following the phone's language.
- **Local testing:** `serve-app` serves `app/` on the LAN and stands in for the webhook at `/hook`, forwarding each post to `trmnlp serve`'s `/webhook` so the preview shows the result.
- **Mobile web limits:** a page cannot call the phone's text recognition, and in-browser OCR (Tesseract.js) was far worse than Live Text or Google Lens on handwriting. Show the photo whole instead, so the phone's own text selection can copy from it; iOS offers Live Text only on an image that is not inside a scrolling box. `navigator.clipboard.readText()` needs https, so give a paste-by-hand fallback for local `http` testing. On Android, a manifest `share_target` lets other apps share text into the installed app.

## Preparing a recipe for publication

Use this section when the user asks to publish a recipe or make it ready for review. A clean local plugin is not automatically ready for public distribution.

- Check that it offers distinct, identifiable value versus existing recipes. Prefer one configurable, well-rounded recipe over several near-duplicate variations. Default user-visible content must be family-friendly; flag content that cannot meet that expectation so the user can decide whether unlisted distribution is appropriate.
- Review every form field as a user: choose a relevant `author_bio` category and at least one contact path; use only meaningful `default`, `placeholder`, and `optional: true` values; use HTML links in field text; test each field and both boolean representations where Liquid depends on it. Remove personal data and use safe demo data where needed.
- For authenticated public APIs, put setup links and clear instructions in the form fields. For webhooks or plugin merges, document each extra setup step in `author_bio` and the README. Do not use a randomized public endpoint simply to force fresh demo data.
- Prioritize Framework components and Liquid logic. Add CSS or JavaScript only when they cannot express the requirement. Keep API requests in polling or serverless code: the renderer does not wait beyond five seconds for asynchronous calls. JavaScript must use `DOMContentLoaded`, and charts need a unique class identifier. The exception is a script that only sets a value the Framework reads while it runs, such as `window.I18n.andXMore` for the translated "and N more" line: it has to run before the overflow engine, so it stays a plain top-level assignment. Note it in a comment beside the script so a reviewer sees why.
- Keep OG rendering in mind: avoid inline `opacity`, rely on Framework bit-depth variants for grayscale, avoid small gray labels without a `1bit:text--black` override, and use custom fonts only when they are essential. Prefer source-appropriate title-bar imagery over the stock TRMNL logo; avoid emoji when a rendering-safe icon is needed.
- For long or variable content, use Liquid truncation, responsive line clamping, or Framework overflow/table-overflow. Let charts fill their markup-controlled container instead of imposing a fixed height. Pass every value a Liquid template uses explicitly, including native `trmnl` variables when needed.
- Before submission, verify the review-critical layouts on TRMNL OG landscape, TRMNL X landscape, and TRMNL X portrait. The views should be predominantly useful content, with no accidental horizontal truncation, vertical overflow, collisions, or excessive whitespace.

For the complete recipe-review guidance, consult [TRMNL's publishing checklist](https://trmnl.com/blog/plugin-recipe-publishing-tips).
