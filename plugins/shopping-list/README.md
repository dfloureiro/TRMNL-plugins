# Shopping list

Shows your shopping list on your TRMNL as a checklist, with quantities. You keep the list in a small free web app on your phone. Tick items off as you shop and they leave the list. To add a paper list, take a photo of it and copy the text from the photo. The app sends the list straight to your TRMNL, so you never need to open TRMNL to change it.

**App:** <https://dfloureiro.github.io/TRMNL-plugins/shopping-list/> · English and Portuguese (it follows your phone's language; the screen language is set in the plugin's settings).

## Get started

1. In TRMNL, add the **Shopping list** plugin and put it in your device's playlist. Until you send it a list, the screen shows a QR code that opens the app.
2. Open the plugin's settings and copy its **Webhook URL**.
3. Open the app on your phone, paste the URL into "Connect your TRMNL" and tap **Connect**.
4. Tap **Add item**, type a name and tap **Add**. It appears on the screen at its next refresh.

On iPhone, use Share → **Add to Home Screen**. Safari can clear the saved data of websites you haven't opened for a while, but apps added to the Home Screen are exempt. If it does get cleared, paste the webhook URL again and the list comes back from TRMNL.

## On the screen

Each item has an empty checkbox and its name. A quantity above 1 shows as a black badge on the right. The title bar shows how many items there are and when the list last changed. Items keep the order they have in the app.

| Layout | Shows |
| --- | --- |
| Full | Up to 3 columns. In portrait, 1 column (2 on TRMNL X). |
| Half horizontal | Up to 3 columns, in a smaller size (1 column in portrait). |
| Half vertical | 1 column. |
| Quadrant | Up to 2 columns, in the smallest size (1 column in portrait). |

When the list doesn't fit, the last items are left out and an "and N more" line shows how many. An empty list shows "The list is empty". Before the app has sent anything, the screen shows a QR code that opens the app.

## Settings

| Field | What it does |
| --- | --- |
| Webhook URL | The address the app sends the list to. Copy it into the app on your phone. Treat it like a password. |
| Language | The language of the screen: English or Portuguese. The app follows your phone's language instead. |

## Using the app

The three buttons at the bottom add items:

- **Photo:** take a photo of a paper list, or pick one you already have. The app shows it large, with the steps for your phone. On iPhone: touch and hold any word in the photo, tap **Select All**, tap **Copy**, then tap **Paste**. The phone's own text recognition (Live Text) reads the text, handwriting included. The photo stays on your phone and is discarded when you close it.
- **Paste:** turns text you copied (from a photo, a message, a note or a website) into a list to check. It puts one item per line, leaves out bullets, numbering and headings such as "Shopping list", splits items separated by commas, and merges repeated items into one quantity. Fix anything that looks wrong, then tap **Add**.
- **Add item:** type a name and choose a quantity. Items you've added before are suggested as you type.

Quantities can be written as `2 milk`, `2x milk`, `milk x2`, `milk (2)`, `milk - 2` or `eggs 12`. Weights and volumes such as `500 g flour` or `potatoes 2 kg` stay part of the name. Adding an item that is already on the list raises its quantity instead of adding it twice.

On the list:

- **Tap the circle** to tick an item off. It is removed from the list. Undo puts back everything you ticked in a row.
- **− / +** change the quantity. Tap an item's name to rename it, set the quantity or delete it.
- Drag an item by its ⠿ handle to reorder the list (for example, by aisle). The screen shows items in the same order.

Syncing:

- Changes are sent to TRMNL about 4 s after your last edit, so ticking off several items counts as one update. They are sent at once if you leave the app. The line under the title shows whether TRMNL has the latest list. If TRMNL rejects an update (for example after its hourly webhook limit), the line shows why and a Retry button appears.
- **More than one device:** paste the same webhook URL on each. When the app opens, it loads the list from TRMNL if TRMNL's copy is newer. If you edit on two devices at once, the last one sent wins.
- **Settings → Backup** copies the list as text, and **Restore…** loads it back.
- On Android, once the app is installed (Chrome menu → **Install app** or **Add to Home screen**), other apps can share text into it: in Google Lens, select the text, tap **Share** and pick **Shopping list**. It opens ready to check, as with Paste.

## Privacy

The app is a static page with no server and no account. Your list and your webhook URL are stored only in your browser (`localStorage`) and sent only to your own TRMNL webhook URL. The author never sees them, and nothing else is contacted. Photos are only shown on your phone, never uploaded.

Treat the webhook URL like a password: anyone who has it can replace what your plugin shows. If it leaks, regenerate it in TRMNL.

## Webhook payload (format version 1)

This format is stable. Changes will stay backwards compatible, or come with a new `v`, so existing screens keep working.

```json
{ "merge_variables": {
    "v": 1,
    "items": [{ "name": "Milk", "qty": 2 }, { "name": "Bread" }],
    "updated": "18 Nov, 10:21",
    "updated_at": 1794997317711 } }
```

| Field | Meaning |
| --- | --- |
| `v` | Payload format version (1). |
| `items` | In display order. Each has a `name` and, when more than 1, a `qty`. |
| `updated` | When the list last changed, already formatted in the phone's language and time zone. |
| `updated_at` | The same moment in milliseconds since 1970. The app uses it to tell which copy is newer. |

The whole post must fit TRMNL's webhook size limit, about 2 KB (5 KB with TRMNL+), which is around 80 short items. The app shows the current size in Settings. You can also post this format yourself (from a script or Shortcut, for example) and the plugin will show it.

## Development

The plugin lives in `src/` (webhook strategy, [trmnlp](https://github.com/usetrmnl/trmnlp) layout) and the app in `app/` (one HTML file). `.github/workflows/pages.yml` publishes `app/` to GitHub Pages at `/shopping-list/` on every push that changes it.

Push plugin changes with `trmnlp push` from this folder. The API key used for `trmnlp login` needs the profile capability. The first push creates the plugin in TRMNL. Commit the `id` it adds to `src/settings.yml`.

### Preview

```bash
./preview STATE [DEVICE] [LANGUAGE]   # STATE: few, many, empty, fresh (never received data)
DATA=list.json ./preview few og     # renders a real payload instead of the sample list
```

The host has no Ruby, so run it inside the trmnlp image:

```bash
podman run --rm -v "$PWD:/plugin:z" -w /plugin --entrypoint sh docker.io/trmnl/trmnlp:latest \
  -c 'TRMNLP=$(command -v trmnlp) ruby preview many og'
```

### Testing from a phone (local)

```bash
trmnlp serve        # terminal 1: local preview at http://127.0.0.1:4567
./serve-app         # terminal 2: prints the app address and the webhook URL to paste
```

Open the printed address on a phone on the same Wi-Fi and paste the printed `…/hook` URL. `serve-app` forwards each update to `trmnlp serve`'s `/webhook`, so the preview shows what the screen would show. Over plain `http` the browser doesn't let the **Paste** buttons read the clipboard, so they open the check screen and tell you to touch and hold the box and paste instead.
