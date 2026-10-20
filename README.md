# Gaylingua

A responsive, installable web app for learning Swardspeak through Filipino and English phrase translations, a searchable 30-word library, saved favorites, a five-question quiz, and a four-pair matching game.

## Run locally

Requires Node.js 20 or later. No packages or API keys are needed.

```sh
npm run dev
```

Open http://localhost:5187. Run `npm test` to check translation and vocabulary behavior. `dist/` is the complete static deployment directory; there is no build step.

## How it works

- Curated phrase matches produce conversational examples. Other supported words are substituted in a single pass; unmatched text stays as written. The UI explicitly labels these modes. This is a dictionary-based learning tool, not a general-purpose AI translator.
- Vocabulary, examples, and phrase rules live in `dist/lingo.js`. Add entries there to expand coverage. Usage varies by community and context. Reading links are available from About / Our reading list.
- Favorites and XP are stored in localStorage on the current browser. No account is required. Clearing site data removes them.
- Quiz answers earn 10 XP; completing all four matching pairs earns 40 XP. Repeated clicks cannot award points twice.
- The service worker caches the application after the first visit. Core translation, library, and games work offline; optional Google Fonts and reading links require a connection.
- Read-aloud uses the browser's speech synthesis and available voices; pronunciation and availability vary by device.
- Install from a supported browser's menu (Android: Install app / Add to Home screen; iOS Safari: Share → Add to Home Screen). An install button appears when the browser offers an install prompt. PNG icons at 192 and 512 pixels support installation. App store packaging is not included.

This is a mobile web app/PWA. It is not an Android APK, iOS binary, or app store submission.
