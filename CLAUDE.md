# GMB Review AI — Chrome Extension

## Project Overview

A Chrome extension (Manifest V3) that injects a side panel into `business.google.com/reviews`. It scans Google Business Profile reviews, generates AI replies using Gemini 2.5 Flash, and auto-posts them. No Google Business Profile API approval is required — it works entirely through the user's existing browser session.

---

## Architecture

```
gmb-clean/
├── manifest.json       # MV3 config — host permissions, content scripts
├── background.js       # Service worker — Gemini API calls, chrome.storage proxy
├── content.js          # All logic — injected into business.google.com
├── content.css         # Injected styles — light UI (white/indigo #4F46E5 theme)
├── popup.html          # Extension toolbar popup — simple launcher
└── icons/              # icon16.png, icon48.png, icon128.png
```

### How it works
1. `content.js` is injected into every `business.google.com/*` page
2. It injects a **370px fixed side panel** (pushes Google's content left via `marginRight`)
3. The panel has two tabs: **Reviews** and **Settings**
4. On the Reviews tab: Scan → Generate → Fill & Post (or Reply All for bulk)
5. Gemini API calls are proxied through `background.js` (needed for CORS)
6. Settings (including profiles) are persisted via `chrome.storage.local` under key `gmb6`

---

## Key Files

### background.js
- Listens for three messages: `GEMINI`, `SAVE`, `LOAD`
- `GEMINI`: calls `gemini-2.5-flash` with `thinkingBudget: 0` and `maxOutputTokens: 1024`
- `SAVE` / `LOAD`: reads/writes `chrome.storage.local` under key `gmb6`

### content.js
All logic lives in one IIFE. Key sections:

| Function | Purpose |
|---|---|
| `injectPanel()` | Creates the side panel DOM, pushes page left |
| `scanPage()` | Finds all review cards via Reply/Edit Reply buttons |
| `extractReview()` | Extracts name, stars, text, date, business label from a card |
| `checkLazyReply()` | Detects trivial "thanks / thanks sir / shukriya" existing replies |
| `buildPrompt()` | Builds Gemini prompt from matched profile + review data |
| `doGenerate()` | Sends prompt to background → Gemini |
| `doPost()` | Scrolls to card, clicks Reply, fills textarea, clicks Post |
| `doAutoAll()` | Loops through all pending reviews; calls `autoNextPage()` when done |
| `autoNextPage()` | Clicks Next page, rescans, continues auto-reply |
| `getProfileForReview()` | Matches a review to a saved profile by business name |
| `renderProfileList()` | Renders the expandable profile cards in Settings tab |

### content.css
- All selectors scoped with `#gmbAI6Panel` or class prefix `g6` to avoid conflicts with Google's CSS
- Every rule uses `!important` — required because Google's styles would otherwise override
- Key colour: `#4F46E5` (indigo) as primary accent

---

## State

```javascript
var cfg      = {};       // Loaded from chrome.storage — geminiKey, tone, profiles[]
var reviews  = [];       // Array of review objects for current page
var stopAuto = false;    // Set to true when user clicks Stop during auto-reply
var pageNum  = 1;        // Current page number for pagination display
var logLines = 0;        // Count for activity log badge
```

### cfg shape
```javascript
{
  geminiKey:    "AIza...",
  tone:         "friendly",          // default tone
  profiles: [
    {
      id:           "p1",
      label:        "House of Salons F7",
      bizName:      "House of Salons",    // matched against rev.biz
      bizType:      "hair salon",
      city:         "Islamabad",
      services:     "haircut, colour, bridal makeup",
      seoKeywords:  "best salon Islamabad, hair salon F7",
      instructions: "Always mention our loyalty card."
    }
  ]
}
```

### Review object shape
```javascript
{
  id:        "r4f2x9a",
  el:        <DOM element>,    // the card element on the Google page
  reviewer:  "Uzma Asif",
  stars:     4,                // 0 = unknown (handled in prompt builder)
  text:      "Great service!", // "" = rating only
  date:      "4 hours ago",
  biz:       "House of Salons - F7 (Men's Salon)",
  replied:   false,
  isLazy:    false,            // true = existing reply is trivial thanks
  replyBtn:  <DOM element>,    // Google's native Reply button
  generated: "",               // filled after Gemini responds
  posted:    false
}
```

---

## Reviewer Name Extraction (6 strategies, in order)

1. `img[aria-label="Photo of NAME"]` — most reliable on standard pages
2. Any `[aria-label]` on a non-button/non-link element that looks like a name
3. `a[href*="maps/contrib"]` link text — Google Maps contributor link
4. Heading elements `h1/h2/h3/[role="heading"]` inside card
5. First leaf `span/div/p` whose text starts with a capital, no digits, no action words
6. Fallback: `"Valued Customer"`

## Star Rating Extraction (5 strategies, in order)

1. `aria-label` / `title` matching `"Rated N out of 5"` or `"N stars"` with `role="img"` preferred
2. SVG `fill` / `stroke` colour — gold hex codes (`#FBBC04`, `#F4B400` etc.) vs grey
3. Material Icons font — count elements with `textContent === "star"` vs `"star_border"`
4. Image `src` pattern — count star images excluding border/outline/empty variants
5. If still 0 and text exists: guess from positive/negative word scoring
6. If still 0 and no text: default to `3` (neutral — safe for no-text unknown ratings)

## Review Text Extraction

- Min length: 3 chars — handles short reviews like "good work", "i am happy"
- Skips nodes inside `button, [role="button"], [role="menuitem"], a`
- `UI_PHRASES` array (substring match, case-insensitive): blocks "flag as inappropriate", "open review options", "helpful", "see more", "translate" etc.
- Single-word UI labels blocked by regex
- Google's "didn't write a review" / "left just a rating" markers → sets `ratingOnly = true`

## Lazy Reply Detection

Detects existing replies that are trivially short. Patterns include:
`thanks`, `thanks sir`, `sir thanks`, `thanks please`, `thank you sir`, `thanks a lot`, `shukriya`, `shukria`, `ji thanks`, `boht shukriya` — and anything ≤ 20 chars starting with "thank".

---

## Prompt Design

Every prompt is built in `buildPrompt(rev, tone)`:
- Profile is auto-selected via `getProfileForReview(rev)` — matches `rev.biz` against `profile.bizName`
- **NEVER mentions star numbers** in the reply
- **Never starts with** "Thank you for your review."
- **1-2 sentences, under 40 words**
- SEO keywords woven in naturally (1 keyword max per reply)
- Uses first name only (splits on space)
- Greeting: `"Dear [FirstName],"` or `"Dear Valued Guest,"`
- Three branches: `isPos (≥4)`, `isMix (3)`, `isNeg (≤2)` — POSITIVE reviews explicitly told DO NOT apologise

---

## Multi-Profile Auto-Matching

Google's reviews page shows all businesses in one feed. Each review card has a heading like `"House of Salons - F7 (Men's Salon)"`. The extension reads this as `rev.biz`.

`getProfileForReview(rev)` tries two match levels:
1. **Contains match**: `rev.biz.includes(profile.bizName)` or vice versa
2. **Word match**: splits `profile.bizName` into words >3 chars, counts how many appear in `rev.biz`

Falls back to `profiles[0]` if no match found. A purple badge on each review card shows which profile was matched.

---

## Auto-Pagination Flow

```
doAutoAll()
  └── runAutoPage(pending)        // loops through pending reviews on current page
        └── [all done on page] → autoNextPage()
              ├── finds Next button
              ├── clicks it, waits 3s
              ├── rescans page silently
              └── if pending > 0 → runAutoPage(pending)
                  if pending = 0 → autoNextPage() again (skip empty page)
                  if no next btn → "All done!"
```

User can click **Stop** at any point — sets `stopAuto = true` which is checked at each loop iteration.

---

## Common Issues & Fixes Applied

| Issue | Root Cause | Fix |
|---|---|---|
| `Unexpected identifier 'visible'` | `/* */` block comment contained `u/*/reviews` — `*/` closed comment early | All comments use `//` only — zero block comments |
| "Open review options" as review text | Min length was 20, UI phrases had anchored `$` regex | Min length 3, `UI_PHRASES` uses `.indexOf()` substring matching |
| Every review shows 1 star | Google labels each star icon `aria-label="1 star"`, `"2 stars"` etc. — code grabbed first | Collect all matches, prefer `role="img"` container, else take unique value or use SVG colour |
| All reviews treated as negative | Stars defaulted to 0 → fell to negative branch | Added text-based word scoring; rating-only unknown defaults to 3 (neutral) |
| Replies too short | `maxOutputTokens: 320` + Gemini 2.5 Flash uses thinking tokens | Raised to 1024, added `thinkingConfig: { thinkingBudget: 0 }` |
| Wrong model error | `gemini-1.5-flash` then `gemini-2.0-flash` deprecated | Using `gemini-2.5-flash` |

---

## Development Notes

- **No build step** — plain vanilla JS, no npm, no bundler
- **No block comments** — use only `//` line comments to avoid accidental `*/` closure in content scripts
- **All CSS uses `!important`** — required to override Google's styles
- **Panel ID is `gmbAI6Panel`**, FAB ID is `gmbAI6FAB` — all element IDs prefixed `gmbAI6`, all classes prefixed `g6`
- **Guard against double injection**: `if (window._gmbAI6) { return; }`
- To reload during development: `chrome://extensions` → click the refresh icon on the extension card, then reload the Google Business Profile tab

## Testing

Navigate to `https://business.google.com/reviews` with the extension loaded. Open the Activity Log in the panel — it shows every step: reviewer name resolved, stars extracted, text found, profile matched, generation status, post result.

Key log lines to watch:
```
Reviewer: "Uzma Asif" | Stars: 4 | Text: "Great service"
Stars guessed from text: 5 (pos:2 neg:0)
Stars unknown — defaulting to neutral (3)
Settings saved (3 profiles)
Page 2 done. Checking for next page...
All reviews replied across all pages!
```
