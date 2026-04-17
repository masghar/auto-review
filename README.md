# GMB Review AI

A Chrome extension (Manifest V3) that injects a side panel into your Google Business Profile reviews page, generates AI-written replies using Gemini, and posts them — all through your existing browser session. No Google Business Profile API approval needed.

---

## Features

- Scans all reviews on `business.google.com/reviews`
- Generates contextual replies via **Gemini 2.5 Flash**
- Supports **multiple business profiles** — auto-matches each review to the right business
- Bulk **Reply All** with automatic pagination
- Tone control (friendly, professional, formal, etc.)
- Per-business SEO keywords, services, and custom instructions
- Activity log for every step

---

## Installation

> No build step required — plain HTML/CSS/JS.

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked**
5. Select the project folder (the one containing `manifest.json`)
6. The **GMB Review AI** extension icon will appear in your toolbar

---

## Setup

### 1. Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **Create API key**
3. Copy the key (starts with `AIza...`)

### 2. Add your API key to the extension

1. Navigate to `https://business.google.com/reviews`
2. Click the **GMB Review AI** toolbar icon (or the floating `★` button on the page)
3. Open the **Settings** tab
4. Paste your Gemini API key into the **API Key** field
5. Click **Save Settings**

### 3. Add your business profiles

In the **Settings** tab, click **+ Add Business** for each of your locations:

| Field | Description | Example |
|---|---|---|
| **Label** | Your internal name for this profile | `Serenity Spa - F7` |
| **Business Name** | Must match how Google shows it in the reviews feed | `Serenity Spa` |
| **Business Type** | Short description for Gemini context | `luxury day spa` |
| **City** | Used in SEO keywords | `Islamabad` |
| **Services** | Comma-separated list | `massage, facials, manicure` |
| **SEO Keywords** | 1–3 phrases to weave into replies | `best spa Islamabad, F7 spa` |
| **Instructions** | Any fixed rules for Gemini | `Always mention our loyalty card.` |

> **Important:** The **Business Name** field is used to match reviews to profiles. It must be a substring of how your business appears in the Google reviews feed (e.g. if Google shows `"Serenity Spa - F7 (Ladies)"`, set Business Name to `Serenity Spa`).

Click **Save Settings** after making changes.

---

## Usage

### Scan reviews

1. Go to `https://business.google.com/reviews`
2. Open the side panel (click the `★` FAB or toolbar icon)
3. Click **Scan Page** — all pending reviews load in the panel
4. Each card shows the reviewer name, star rating, a snippet, and which profile was matched (purple badge)

### Generate a reply

- Click **Generate** on a single card to preview the AI reply
- Edit the reply text directly in the card if needed
- Click **Post** to submit it

### Reply All (bulk)

- Click **Reply All** to auto-generate and post replies for every pending review on the current page
- The extension automatically moves to the next page when done
- Click **Stop** at any time to halt

### Tones

Select a default tone in Settings. Options: `friendly`, `professional`, `formal`, `empathetic`, `concise`.

---

## Project Structure

```
├── manifest.json     # MV3 config — permissions, content scripts
├── background.js     # Service worker — Gemini API calls, storage proxy
├── content.js        # All logic — injected into business.google.com
├── content.css       # Side panel styles (scoped to #gmbAI6Panel)
├── popup.html        # Toolbar popup
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## Reloading after code changes

1. Go to `chrome://extensions`
2. Click the **refresh icon** on the GMB Review AI card
3. Reload the `business.google.com/reviews` tab

The panel header shows the current version and build date (e.g. `v6.1 · 17 Apr`) so you can confirm the latest code is loaded.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Panel doesn't appear | Refresh the page; check the extension is enabled at `chrome://extensions` |
| "No reviews found" | Make sure you're on `business.google.com/reviews`, not another GBP page |
| All reviews reply as wrong business | Check that **Business Name** in each profile matches the name shown in the reviews feed |
| Gemini API error | Verify your API key is correct and has the Generative Language API enabled |
| Reply box doesn't open | Google's DOM may have changed — open an issue with your Chrome version |
| Stars always show 0 | Enable the Activity Log and check the `Stars:` line; open an issue if extraction fails |

---

## Limitations

- Works only in Chrome (or Chromium-based browsers) with Developer Mode enabled
- Requires an active Google Business Profile session in the same browser
- Gemini free tier has rate limits — bulk reply on large review sets may be throttled
- Google may change their page structure at any time, breaking selectors

---

## License

MIT — free to use and modify.
