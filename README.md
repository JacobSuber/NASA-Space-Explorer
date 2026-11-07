# Project 7 — NASA Space Explorer App

An interactive, responsive NASA Astronomy Picture of the Day (APOD) gallery built from the class's starter project requirements. No build step, Node packages or API key needed.

## Run locally

Open `index.html` in a web browser, or run a local server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000/` and click **Get Space Images**.

## Features

- Date selection with class-provided 1995-to-today constraints and nine-day default (`js/dateRange.js`).
- Live NASA APOD data fetching, loading message, error handling and gallery cards (`js/script.js`).
- Larger photo modal with original title, date and full explanation; Escape, click-outside and accessible close control.
- NASA-themed colors, polished layout, and mobile/tablet/desktop responsive grid (`style.css`).
- **Extra credit (25 possible points):** video entries link to their NASA original (10); random space fact on page load (10); hover image zoom (5).

### Important API change

NASA moved the APOD API on September 10, 2026. This project uses the current endpoint `https://science.nasa.gov/wp-json/wp/v2/apod-basic/` rather than the older `https://api.nasa.gov/planetary/apod` endpoint, which NASA says will go offline on December 1, 2026. The new API's `url` field may point to NASA's article page; its `hdurl` field holds the actual featured image. Video and other-media entries link to their NASA page.

NASA API information: https://api.nasa.gov/

## Publish with GitHub Pages

1. Extract this ZIP and add its contents (not the ZIP itself) to your own GitHub repository. Keep `index.html`, `style.css`, `js/` and `img/` together.
2. Commit and push files to your repository's `main` branch.
3. Open **Settings → Pages → Build and deployment**. Select **Deploy from a branch**, then `main` and `/(root)`. Save.
4. Once published, open the GitHub Pages URL (it will resemble `https://USERNAME.github.io/REPO/`) in a private/incognito browser. Check date selection, gallery and modal.
5. Paste the real published URL into Question 1 of the reflection PDF. Do not submit the repository URL as the website URL.

This starter-compatible project was prepared as a standalone ZIP; publishing to the user's GitHub account needs their authenticated access.

## Troubleshooting

- If NASA is down, has an error, or blocks a cross-origin request, an error panel with Try again appears.
- If an entry has no image, its card links to the NASA original instead of displaying a broken image.
- Test a real API response in your own browser after publishing; local layout tests used sample API responses.
