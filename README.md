# Gaylingua

A responsive, installable web app for learning Swardspeak through Filipino and English phrase translations, a searchable 104-entry library, saved favorites, a five-question quiz, and a four-pair matching game. Android project packaging is also included.

## Run locally

The web app requires Node.js 20 or later to preview; no API keys are needed. Android tooling and the automated test suite require Node.js 22 or later. Install development dependencies with `npm ci` before running tests or Android commands.

```sh
npm run dev
```

Open http://localhost:5187. Run `npm test` to check translation and vocabulary behavior. `dist/` is the complete static deployment directory; there is no build step.

## How it works

- Curated phrase matches produce conversational examples. Other supported words are substituted in a single pass; unmatched text stays as written. The UI explicitly labels these modes. This is a dictionary-based learning tool, not a general-purpose AI translator.
- The original 30 entries and 12 phrase patterns live in `dist/lingo.js`. All 83 vocabulary rows from Wikipedia’s eight Conventions tables are included in `dist/wikipedia-words.js`, with all 98 listed source spellings/variants searchable. Nine overlapping rows merge into original entries, producing 104 dictionary entries. Imported entries retain their source concepts, origins, and attribution instead of receiving fabricated sample sentences. See `ATTRIBUTION.md` and `data/wikipedia-swardspeak.json`.
- `npm run dictionary:import` refreshes the Wikipedia snapshot. The importer stops rather than replacing data if the table structure changes unexpectedly. Review the data diff and attribution before publication. Nursery-rhyme passages are not individual dictionary mappings and are not imported.
- Favorites and XP are stored in localStorage on the current browser. No account is required. Clearing site data removes them.
- Quiz answers earn 10 XP; completing all four matching pairs earns 40 XP. Repeated clicks cannot award points twice.
- The service worker caches the application after the first visit. Core translation, library, and games work offline; optional Google Fonts and reading links require a connection.
- Read-aloud uses the browser's speech synthesis and available voices; pronunciation and availability vary by device.
- Install from a supported browser's menu (Android: Install app / Add to Home screen; iOS Safari: Share → Add to Home Screen). An install button appears when the browser offers an install prompt. PNG icons at 192 and 512 pixels support installation. App store packaging is not included.

## Android packaging

The Capacitor Android project is in `android/`, using app ID `app.gaylingua.mobile`. Its core files are bundled locally; it does not load the private hosted site or require ChatGPT sign-in. `npm run android:sync` prepares and copies the web app, including the complete dictionary, into that project. Generated native assets are ignored by Git.

The Android SDK is now installed locally in `.android-sdk/` on D:. Build caches, temporary files, and Android user settings are kept in `.gradle/` and `.android-sdk-user/` inside this project. Java 21 is already installed. No Android Studio installation or global environment-variable changes were needed.

To build another APK, run:

```sh
npm run android:apk
```

The script copies the debug-signed test APK to `artifacts/gaylingua-debug.apk`. The first APK was successfully compiled on 21 October 2026; its signature, manifest, and bundled dictionary were verified. See `APK-BUILD.md`. `npm run android:open` is available if Android Studio is installed later. A release for stores requires your own signing key. Device behavior, installation, system speech voices, and keyboard/system-bar interactions still require a physical Android device or emulator.

For a new Windows checkout without the SDK, review Google’s Android SDK License Agreement at https://developer.android.com/studio/terms. After agreeing to the license, `node scripts/setup-android-sdk.mjs --accept-sdk-license` installs the required tools inside that checkout. Alternatively, install Platform 36 and the build tools through Android Studio’s SDK Manager and set `ANDROID_HOME`. The build script also recognizes a local `.android-sdk/`, `android/local.properties`, or the standard Windows SDK location.
