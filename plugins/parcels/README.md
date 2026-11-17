# Parcels

Parcels you're waiting for, with their pickup codes, on your TRMNL. You manage the list from a small web app on your phone, and the app sends it straight to the plugin. You don't need to open TRMNL to change it.

- **Plugin** (`src/`): webhook strategy. Shows each parcel's name, tracking ID and pickup code (inverted, so it stands out). Rows that don't fit are summarised as "+N more". English or Portuguese.
- **App** (`app/`): one static page, published to GitHub Pages by `.github/workflows/parcels-app.yml` at <https://dfloureiro.github.io/TRMNL-plugins/>.

## Privacy

The published page is only code. Your parcels and the webhook URL are kept in your phone's browser storage (`localStorage`) and are sent only to your TRMNL webhook URL. Anyone opening the page gets their own empty app.

The webhook URL works like a password: anyone who has it can replace what the plugin shows. Don't share it. If it leaks, regenerate it in TRMNL.

## Setup

1. Push the plugin to TRMNL (`trmnlp push` from this folder), or create a private plugin with the **Webhook** strategy and paste in the `src/*.liquid` files.
2. In the plugin's settings, copy the **Webhook URL**.
3. One time only: in the GitHub repo, open Settings → Pages and set Source to **GitHub Actions**. The workflow publishes the app on the next push that touches `app/`, or you can run it by hand from the Actions tab.
4. Open the app on your phone, tap ⚙︎, paste the webhook URL and save. You can bookmark it or use "Add to Home Screen".

## Using it

- **+** adds a parcel. Each one needs a name or a tracking ID; the pickup code is optional.
- Tap a code or tracking ID to copy it. **Track ↗** opens 17TRACK.
- **Received ✓** removes a parcel (with Undo).
- Drag a parcel by its ⠿ handle to reorder the list. The screen shows parcels in the same order, and the page scrolls when you hold near the top or bottom edge. New parcels are added at the top.
- Changes are sent to TRMNL about 2.5 s after the last edit, so a quick run of edits counts as one update. The line under the title shows whether TRMNL has the latest list. If TRMNL rejects an update (for example after reaching its hourly webhook limit), the line shows the reason and a Retry button.
- When the app opens, it asks TRMNL for the list it holds (a GET on the webhook URL) and uses it if it's newer than the phone's copy. So a second device, or a browser that cleared its storage, gets the list back as soon as the webhook URL is pasted in. **Settings → Backup** is an extra copy.

### Webhook payload

```json
{ "merge_variables": {
    "parcels": [{ "label": "Headphones", "id": "LX123456789PT", "code": "4821" }],
    "updated": "17 Nov, 10:21",
    "updated_at": 1794911217711 } }
```

Empty fields are left out. TRMNL accepts about 2 KB per update (5 KB with TRMNL+), enough for a few dozen parcels. The app shows the current size in Settings.

## Testing locally (phone → local preview)

```bash
trmnlp serve        # terminal 1: local preview at http://127.0.0.1:4567
./serve-app         # terminal 2: prints the app address and the webhook URL to paste in Settings
```

Open the printed address on a phone on the same Wi-Fi and paste the printed `…/hook` URL in Settings. `serve-app` forwards each update to `trmnlp serve`'s `/webhook`, so the preview shows what the screen would. Over plain `http` on your LAN the app accepts an `http` webhook URL, but iOS won't allow tap-to-copy (it needs https).

## Preview

```bash
./preview STATE [DEVICE] [LANGUAGE]   # STATE: few, many, empty
```

The host has no Ruby; run it inside the trmnlp image:

```bash
podman run --rm -v "$PWD:/plugin:Z" -w /plugin --entrypoint sh docker.io/trmnl/trmnlp:latest \
  -c 'TRMNLP=$(command -v trmnlp) ruby preview many og'
```
