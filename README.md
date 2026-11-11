# NASA Space Explorer — LevelUp Progressive Web App

This updates the **existing** Project 7 / Project 8 NASA APOD gallery with the LevelUp PWA requirements while preserving the original gallery, date picker, NASA API fetch, modal, random facts and image hover zoom.

## Features added
1. `manifest.json` with `display: standalone`, scoped relative to the GitHub Pages repo, plus 192px and 512px app icons.
2. Root-scoped `service-worker.js` installs and caches the app shell **cache first**. The NASA APOD API fetch uses **network first**, falling back to saved responses for previously visited date ranges when offline.
3. Visible connection indicator in the app header. If a previously fetched NASA API response is loaded offline, the app tells you.
4. Custom `Install App` control that captures `beforeinstallprompt` in supported browsers and triggers the browser prompt when clicked. On iOS it guides through Safari's Share → Add to Home Screen flow (iOS does not expose `beforeinstallprompt`).
5. `Enable Notifications` button that requests browser permission from a user click, shows the permission state, and attempts a local demo notification when supported.

## Publish to your existing GitHub Pages repository
Repository: https://github.com/JacobSuber/NASA-Space-Explorer

1. Open the repository on GitHub, logged into your account.
2. Choose **Add file → Upload files** on the repository main page.
3. Upload the files/folders from this ZIP so `index.html`, `manifest.json`, `service-worker.js`, `style.css`, `js/`, and `img/` are at the repository root. When replacing files, use the GitHub browser editor to commit the changed files or GitHub Desktop (GitHub's web uploader may not overwrite existing files in some interfaces).
4. Commit changes to the **main** branch. The existing GitHub Pages deployment will update automatically.
5. Open https://jacobsuber.github.io/NASA-Space-Explorer/ and hard-refresh once to install the new service worker. Use Chrome DevTools → Application → Manifest / Service workers / Cache Storage to verify caching, and test offline only after a NASA date range has successfully loaded online.

**Important**: The new files are not published to GitHub just because this ZIP exists; they must be uploaded to the repository. GitHub Pages updates are not instant.

## Record the required 30-second demo on your phone
- **Android (Chrome):** Open the GitHub Pages URL → tap **Install App** → approve the browser's prompt. If no prompt appears, use Chrome menu → **Add to Home screen** / **Install app**.
- **iPhone (Safari):** Open the URL in Safari → tap Share → **Add to Home Screen** → Add. This is the platform's supported install flow; the app's custom button supplies instructions because Apple does not support the browser `beforeinstallprompt` event.
- Open the installed icon **from your home screen** (not the Safari/Chrome tab), and record it opening, the absence of browser address bar, the NASA gallery working, and preferably the notification control or offline indicator.
- Upload video to an unlisted YouTube link, Google Drive (link sharing enabled), or Loom.

## What the assignment document needs
1. **Live app URL:** https://jacobsuber.github.io/NASA-Space-Explorer/
2. **30-second demo URL:** [your video link after recording]
3. Export the completed assignment document as **PDF**, then upload PDF to the LevelUp submission page on HQ. The web app URL is *not* the GitHub repository URL.

## Local development / troubleshooting
Run `python -m http.server 8000` at the project root; navigate to http://localhost:8000. A local server is required because service workers cannot register from `file://`.

The NASA endpoint, previously changed in September 2026, remains `https://science.nasa.gov/wp-json/wp/v2/apod-basic/`. Network access and NASA's current CORS/availability are necessary to populate **new** dates. Only previously successfully fetched responses can be shown offline. Cache stores API data but does not guarantee all high-resolution external NASA imagery is available offline.
