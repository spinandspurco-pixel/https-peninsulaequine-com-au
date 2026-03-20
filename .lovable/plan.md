

## Audit Summary

The Equus Ridge page has **three sections**, and the same `heroVideo` MP4 is used in all three:

1. **Hero** (full-screen) — video at 35% brightness as cinematic backdrop ✓ correct use
2. **Atmosphere** (py-44/64) — same video at 6% opacity as ambient background → repetitive
3. **Private Viewing** (py-44/64) — same video again in a 4:5 portrait frame → third use, feels wallpaper-like

The page is only ~3 sections long, so the fix is surgical: keep the hero video, remove the repeated video from the middle section, and replace the portrait video in section 3 with a static treatment.

---

## Plan

### 1. Hero section — KEEP as-is
No changes. The full-screen video backdrop is the premium identity moment.

### 2. Atmosphere section — REMOVE video, replace with grounded treatment
- **Remove** the ambient video element entirely (lines 47–57)
- **Keep** the grain texture overlay and `bg-primary` dark background
- **Add** a single faint `BlueprintLineOverlay` (variant `"dimensions"`, color `"light"`) at very low opacity as the one permitted brand callback — subtle architectural linework, not a repeated animated background
- This makes the section feel like a clean, dark editorial content block with just a whisper of PE identity

### 3. Private Viewing section — REPLACE video frame with static image
- **Remove** the `<video>` element from the portrait frame (lines 90–99)
- **Replace** with a high-quality static image import (e.g., one of the existing architectural photos like a barn exterior or landscape shot from the assets)
- This creates visual variety: video hero → dark text section → editorial image + text layout
- **Keep** the grain texture, gradient overlay, and all text content

### 4. Clean up unused import
- Remove the `heroVideo` import if it's only used in the hero after these changes — but it will still be used in the hero, so keep it. Just ensure the two removed `<video>` elements no longer reference it.

---

### Visual rhythm after changes

```text
┌─────────────────────────────┐
│  HERO — cinematic video     │  ← identity moment (video)
│  full-screen, 35% bright    │
└─────────────────────────────┘
┌─────────────────────────────┐
│  ATMOSPHERE — dark + grain  │  ← substance (no video)
│  faint blueprint linework   │     clean editorial text block
│  editorial text centered    │
└─────────────────────────────┘
┌─────────────────────────────┐
│  PRIVATE VIEWING            │  ← refined closing (static image)
│  static image | text        │     architectural photo in frame
│  signature closing line     │
└─────────────────────────────┘
```

### Files to edit
- `src/pages/EquusRidge.tsx` — remove 2 video elements, add 1 blueprint line overlay import, add 1 static image import for the portrait frame

