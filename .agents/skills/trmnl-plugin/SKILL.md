---
name: trmnl-plugin
description: Create or update a TRMNL plugin in this repository, including its polling data flow, Liquid layouts, settings, local preview configuration, and user documentation. Use for work under plugins/; do not use for generic web or JavaScript projects.
---

# TRMNL plugin baseline

Build a complete, maintainable plugin in `plugins/<plugin-name>/` that follows this repository's `trmnlp` layout. Keep the plugin focused on the user's requested display and data source; do not invent product features, external accounts, or publish/sync changes without authorization.

## Start with the data contract

- Inspect comparable plugins in `plugins/` and the upstream API documentation or a representative response before designing the Liquid markup.
- Choose `polling` for a direct JSON response that layouts can use safely. Use `transform.js` only when the response needs reshaping, calculation, pagination, or user-friendly error handling.
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

Keep `.trmnlp.yml` as a local-preview configuration: watch `src` and the config file, with empty `custom_fields` and `variables.trmnl` by default. Do not commit real API keys or other sensitive preview values.

## Settings and fields

- Keep `settings.yml` compatible with the existing plugins: explicitly state strategy, polling method/URL, framework version, refresh interval, and serverless language when a transform is used. Do not fabricate the TRMNL-assigned `id` for a new plugin; retain it when updating an existing one.
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
- Ensure each layout handles empty/error data without broken markup, blank primary values, or unsafe Liquid access.

For responsive layout work, consult the [TRMNL X guide](https://trmnl.com/framework/docs/3.1/trmnl_x_guide). Its container-query, responsive overflow, responsive grid-span, and clamp guidance is particularly relevant to mashups and portrait views.

## Documentation and verification

- Update the root `README.md` plugin table when adding a plugin.
- In the plugin README, cover what the screen shows by layout, configuration fields, data source and refresh behavior, error/limitation notes that affect users, and local preview with `trmnlp serve`.
- Run `trmnlp serve` from the plugin directory when it is available. Inspect every layout in landscape and portrait on an OG-sized preview and a TRMNL X-sized preview, plus at least one error or empty-data scenario when practical. Check that primary content remains visible, content does not overlap or clip, and secondary content changes deliberately at each breakpoint. If local preview cannot run, perform a static check of the Liquid variable paths and responsive class combinations, then report the unverified matrix.
- Keep changes scoped to the requested plugin. `trmnlp push` and `trmnlp pull` modify external TRMNL state, so run them only when the user explicitly asks.

## Preparing a recipe for publication

Use this section when the user asks to publish a recipe or make it ready for review. A clean local plugin is not automatically ready for public distribution.

- Check that it offers distinct, identifiable value versus existing recipes. Prefer one configurable, well-rounded recipe over several near-duplicate variations. Default user-visible content must be family-friendly; flag content that cannot meet that expectation so the user can decide whether unlisted distribution is appropriate.
- Review every form field as a user: choose a relevant `author_bio` category and at least one contact path; use only meaningful `default`, `placeholder`, and `optional: true` values; use HTML links in field text; test each field and both boolean representations where Liquid depends on it. Remove personal data and use safe demo data where needed.
- For authenticated public APIs, put setup links and clear instructions in the form fields. For webhooks or plugin merges, document each extra setup step in `author_bio` and the README. Do not use a randomized public endpoint simply to force fresh demo data.
- Prioritize Framework components and Liquid logic. Add CSS or JavaScript only when they cannot express the requirement. Keep API requests in polling or serverless code: the renderer does not wait beyond five seconds for asynchronous calls. JavaScript must use `DOMContentLoaded`, and charts need a unique class identifier.
- Keep OG rendering in mind: avoid inline `opacity`, rely on Framework bit-depth variants for grayscale, avoid small gray labels without a `1bit:text--black` override, and use custom fonts only when they are essential. Prefer source-appropriate title-bar imagery over the stock TRMNL logo; avoid emoji when a rendering-safe icon is needed.
- For long or variable content, use Liquid truncation, responsive line clamping, or Framework overflow/table-overflow. Let charts fill their markup-controlled container instead of imposing a fixed height. Pass every value a Liquid template uses explicitly, including native `trmnl` variables when needed.
- Before submission, verify the review-critical layouts on TRMNL OG landscape, TRMNL X landscape, and TRMNL X portrait. The views should be predominantly useful content, with no accidental horizontal truncation, vertical overflow, collisions, or excessive whitespace.

For the complete recipe-review guidance, consult [TRMNL's publishing checklist](https://trmnl.com/blog/plugin-recipe-publishing-tips).
