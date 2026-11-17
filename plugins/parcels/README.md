# Parcels

Shows the parcels you're waiting for on your TRMNL, with their pickup codes in large type. You keep the list in a small free web app on your phone, and the app sends it straight to your TRMNL. You don't need to open TRMNL to change it.

**App:** <https://dfloureiro.github.io/TRMNL-plugins/> · English and Portuguese (it follows your phone's language; the screen language is set in the plugin's settings).

## Get started

1. In TRMNL, add the **Parcels** plugin and put it in your device's playlist. Until you send it a list, the screen shows a QR code that opens the app.
2. Open the plugin's settings and copy its **Webhook URL**.
3. Open the app on your phone, paste the URL into "Connect your TRMNL" and tap **Connect**.
4. Tap **+** to add your first parcel. It appears on the screen at its next refresh.

On iPhone, use Share → **Add to Home Screen**. Safari can clear the saved data of websites you haven't opened for a while, but apps added to the Home Screen are exempt. If it does get cleared, paste the webhook URL again and the list comes back from TRMNL.

## Using the app

- **+** adds a parcel. Each one needs a name or a tracking ID; the pickup code is optional.
- Tap a code or tracking ID to copy it. **Track ↗** opens the parcel on 17TRACK.
- **Received ✓** removes a parcel (with Undo).
- Drag a parcel by its ⠿ handle to reorder the list. The screen shows parcels in the same order. New parcels go to the top.
- Changes are sent to TRMNL about 2.5 s after your last edit, so a quick run of edits counts as one update. The line under the title shows whether TRMNL has the latest list. If TRMNL rejects an update (for example after its hourly webhook limit), the line shows why and a Retry button appears.
- **More than one device:** paste the same webhook URL on each. When the app opens, it loads the list from TRMNL if TRMNL's copy is newer. If you edit on two devices at once, the last one sent wins.
- **Settings → Backup** copies the list as text, and **Restore…** loads it back.

## Privacy

The app is a static page with no server and no account. Your parcels and your webhook URL are stored only in your browser (`localStorage`) and sent only to your own TRMNL webhook URL. The author never sees them, and nothing else is contacted, except 17TRACK when you tap **Track ↗**.

Treat the webhook URL like a password: anyone who has it can replace what your plugin shows. If it leaks, regenerate it in TRMNL.

## Webhook payload (format version 1)

This format is stable. Changes will stay backwards compatible, or come with a new `v`, so existing screens keep working.

```json
{ "merge_variables": {
    "v": 1,
    "parcels": [{ "label": "Headphones", "id": "LX123456789PT", "code": "4821" }],
    "updated": "17/11, 10:21",
    "updated_at": 1794911217711 } }
```

| Field | Meaning |
| --- | --- |
| `v` | Payload format version (1). |
| `parcels` | In display order. Each has `label` and/or `id`, and an optional `code`; empty fields are left out. |
| `updated` | When the list last changed, already formatted in the phone's language and time zone. |
| `updated_at` | The same moment in milliseconds since 1970. The app uses it to tell which copy is newer. |

The whole post must fit TRMNL's webhook size limit, about 2 KB (5 KB with TRMNL+), which is a few dozen parcels. The app shows the current size in Settings. You can also post this format yourself (from a script or Shortcut, for example) and the plugin will show it.

## Development

The plugin lives in `src/` (webhook strategy, [trmnlp](https://github.com/usetrmnl/trmnlp) layout) and the app in `app/` (one HTML file). `.github/workflows/parcels-app.yml` publishes `app/` to GitHub Pages on every push that changes it. In the repo's Settings → Pages, Source must be set to **GitHub Actions**.

Push plugin changes with `trmnlp push` from this folder. The API key used for `trmnlp login` needs the profile capability.

### Preview

```bash
./preview STATE [DEVICE] [LANGUAGE]   # STATE: few, many, empty, fresh (never received data)
```

The host has no Ruby, so run it inside the trmnlp image:

```bash
podman run --rm -v "$PWD:/plugin:Z" -w /plugin --entrypoint sh docker.io/trmnl/trmnlp:latest \
  -c 'TRMNLP=$(command -v trmnlp) ruby preview many og'
```

### Testing from a phone (local)

```bash
trmnlp serve        # terminal 1: local preview at http://127.0.0.1:4567
./serve-app         # terminal 2: prints the app address and the webhook URL to paste
```

Open the printed address on a phone on the same Wi-Fi and paste the printed `…/hook` URL. `serve-app` forwards each update to `trmnlp serve`'s `/webhook`, so the preview shows what the screen would show. Over plain `http` the app accepts an `http` webhook URL, but iOS won't allow tap-to-copy (that needs https).
