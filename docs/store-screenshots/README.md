# Chrome Web Store screenshots

These files match the listing rules: **1280×800** (default), **24-bit RGB PNG** (no alpha), with **white letterboxing** when the source aspect ratio differs.

The store also accepts **640×400** or **JPEG**; regenerate at another size with:

```bash
STORE_W=640 STORE_H=400 STORE_SCREENSHOTS_OUT=docs/store-screenshots-640 ./scripts/make-store-screenshots.sh
```

Regenerate from `docs/screenshots/` after retaking captures:

```bash
npm run store-screenshots
```

Requires **ffmpeg** on your PATH.
