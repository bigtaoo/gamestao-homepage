# Game art and the press kit

Two pipelines over the same source images: what the site renders, and what a
journalist downloads. They are imported separately because they are not the
same file — the page wants a small WebP, the press kit wants the original PNG.

Sources are passed on the command line, never listed in this repo — the
originals live in each game's own checkout and a build here must not depend on
a sibling working copy.

## What is real today

| | Site art | Press kit |
|---|---|---|
| Nivara | icon, cover, og, four screenshots | logo, icon, feature graphic, four screenshots |
| SumQuest | icon, cover, og, four screenshots | icon, feature graphic, four screenshots |
| DayDayUp | all generated stand-ins | nothing published |

DayDayUp has no store art anywhere in `D:\daydayup` — no logo, no store icon,
no captured screenshots. Its press section says so rather than hiding: a game
with no entry in the manifest is still listed, marked as not published yet.

## Site art

Each game shows a store icon, a cover and four screenshots. Real art replaces
the generated stand-ins one kind at a time:

```bash
node scripts/import-shots.mjs nivara   --icon "D:/funny/art/store/icons/ios_appicon_1024.png"   --cover "D:/funny/art/store/icons/play_feature_1024x500.png" --cover-fit contain
```

Use `--cover-fit contain` for a composed feature graphic (cropping one cuts
through its own typography) and the default `cover` for a photo or screenshot.

The script records two things besides the images: each file's real pixel size
in `asset-sizes.json`, so the markup reserves the right box and nothing shifts
on load; and the fact that the art is real, in `asset-provenance.json`.

## The press kit

`/press/`, in all eleven languages — the same art at full resolution:

```bash
node scripts/import-press.mjs nivara   --logo    "D:/funny/art/logo/derived/logo-1024.png"   --icon    "D:/funny/art/store/icons/ios_appicon_1024.png"   --feature "D:/funny/art/store/icons/play_feature_1024x500.png"   --screens "D:/funny/art/store/en/battle__android_9x16.png" ...
```

Pass the **same screenshots, in the same order**, as `import-shots.mjs` got:
the press page pairs download `n` with the site's own `shot-<n>.webp` as its
thumbnail, and a test fails if the two counts diverge. A PNG source is copied
byte-for-byte — re-encoding these inflated every one of them. Everything the
page says about a file (pixel size, byte count) comes from the manifest the
script writes, so nothing there can go stale without the file changing.

## The stand-in generator

```bash
npm run build:ssr                                     # the generator reads the game table from it
node scripts/placeholders.mjs                         # fill in whatever is missing
node scripts/placeholders.mjs --regenerate cover,og   # rebuild one kind
```

Regeneration is per kind (`icon`, `cover`, `shot`, `og`, `brand`) and never
touches art marked real, even when `--regenerate` names its kind —
`--overwrite-real` is the only way to replace imported art with a stand-in.
That guard exists because the earlier blanket `--force` destroyed SumQuest's
imported cover and four real screenshots on its first use.
