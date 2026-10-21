# Gaylingua verification — 21 October 2026

**Android build follow-up:** The missing SDK was subsequently installed on D: with the user’s authorization. APK compilation and signature verification now pass. See [APK-BUILD.md](APK-BUILD.md). The original verification results below retain the environment limitations recorded at the time; physical-device and emulator testing are still unverified.

The web application passed the checks below. Android source synchronization passed, but APK compilation and device testing are **blocked by the missing Android SDK**. This report is not a claim that every browser, device, or linguistic interpretation has been validated.

## Automated results

`npm test`: **48 passed, 0 failed** using Node’s test runner and jsdom. There are no skipped tests in that suite.

| Area | Checks | Result |
| --- | ---: | --- |
| App navigation, translation UI, filters, collection, dialogs, games, persistence, and failure paths | 23 | Passed |
| Translation engine, phrase variations, Unicode boundaries, dictionary coverage, daily word, and game option selection | 13 | Passed |
| Service-worker installation, offline responses, fallback navigation, and request handling | 4 | Passed in an isolated worker simulation |
| Import snapshot, PWA icons, and native asset staging | 3 | Passed |
| HTTP assets, MIME types, unknown files, traversal, and malformed URLs | 5 | Passed |

The DOM tests use mocked clipboard, speech, and dialog APIs where jsdom lacks native browser support. They test success and failure handling; those mocks do not verify device permissions, voice quality, or native accessibility behavior.

`npm audit`: **0 known vulnerabilities**, including development dependencies. The Capacitor CLI’s transitive Xcode UUID dependency was overridden to patched version 11.1.1; its UUID API compatibility and Android synchronization were checked. An earlier standalone UUID smoke command lacked an initialized Xcode project fixture; the corrected fixture passed.

## Vocabulary import completeness

- Source: Wikipedia contributors, [Swardspeak, revision 1376991241](https://en.wikipedia.org/w/index.php?title=Swardspeak&oldid=1376991241).
- All **83 vocabulary rows in eight Conventions tables** are represented exactly once by a source record.
- All **98 explicitly listed source spellings/variants** are available through lookup aliases.
- The original 30 entries are preserved. Nine source rows overlap existing entries, giving **104 dictionary entries** in total.
- Twelve original conversational phrase patterns remain separate from the import.
- Source labels, original words/concepts, origins, revision links, and CC BY-SA 4.0 attribution are retained. Imported entries are not given invented sample sentences.
- The page’s nursery-rhyme passages are not individual dictionary mappings and were not imported. The lyric excerpt in the Mag-Sharon derivation was omitted.
- Vulgar, insulting, and stereotyped source entries remain available with context notes.

## Real-browser checks

Performed in the Codex in-app Chromium browser using a separate local test origin to avoid changing the main app origin’s saved data.

- Dictionary rendered all 104 entries; searching `Jowabels` and `Nyormville` found the expected records.
- Word dialogs displayed source spelling variants, the original concept, origin, revision, and license attribution.
- A new-word translation, `The jeepney is expensive.`, produced `The Egyptian Airlines is Mahalia Jackson.` and was labeled **word substitutions**. Clipboard copying returned that exact text. Saving displayed the pressed heart state and survived reload.
- A five-question quiz using the expanded dataset completed with 5/5 and awarded 50 XP. The four-pair matching game completed in four attempts and awarded 40 XP.
- All four screens were checked at viewport widths **320, 390, 768, and 1440 pixels**: **16 combinations**, all without horizontal page overflow after the phone decoration fix.
- Sampled secondary dictionary text contrast ratios were **5.31:1–5.71:1** after darkening the muted copy. Dialogs have accessible titles, controls have labels, and duplicate control IDs were corrected. This is a limited accessibility check, not a full WCAG or screen-reader audit.
- With both owned preview servers stopped, a fresh reload still rendered **104 entries**, variant search still worked, and `jeepney` still translated to `Egyptian Airlines`. This verifies the imported module is included in the real offline cache.
- A retained browser log showed one unlocalized MutationObserver error during the first test tab’s run. The app source does not use MutationObserver, and the error did not recur in a fresh tab while exercising imported-word search and details. Its origin was not established; no reproducible app crash resulted.

Screenshots and layout measurements are in the ignored `artifacts/qa/` folder. `layout-results.json` contains the final 16 layout measurements. `dictionary-final-desktop.png` shows the expanded dictionary; `offline-translation.png` captures the offline result.

## Fixes made during verification

- Translation hearts now update their visual state, accessible label, and `aria-pressed` state immediately and after navigation.
- Removing a saved word updates the collection immediately.
- Malformed saved records and invalid numeric statistics are sanitized rather than breaking rendering.
- Search tolerates surrounding spaces; source spelling variants are searchable.
- Lowercase and uppercase English pronouns are handled consistently during word substitution.
- Games avoid identical or directly overlapping definition labels when selecting choices and pairs. This does not resolve every possible semantic synonym.
- Results and About dialogs no longer introduce duplicate IDs; dialogs receive a labeled heading.
- The small-phone hero decoration no longer creates horizontal overflow; muted supporting copy has stronger contrast.
- The local server returns the correct PNG content type and handles malformed URL encodings without crashing.
- The imported dictionary module is included in PWA precaching and Android asset staging.
- Android launcher assets and colors use the app branding.

## Android and remaining limits

`npm run android:sync`: **passed**. The app and full dictionary are copied into `android/app/src/main/assets/public`, without a remote `server.url`, hosting metadata, or a web service worker.

`npm run android:apk`: **blocked** with the explicit message `Android SDK Platform 36 was not found.` No APK, emulator session, or physical-device session was produced. Actual Android installation, native system-bar/keyboard interactions, speech voices, release signing, and native runtime behavior remain unverified.

Other limits: no Safari/iOS or Firefox run, no actual installation prompt acceptance, no exhaustive penetration or load test, and no linguist/community validation of the imported definitions. Source names and ordinary words may have other meanings; the dictionary-based translator cannot disambiguate arbitrary prose. The UI labels substitutions accordingly.

## Repeat

```sh
npm ci
npm test
npm audit
npm run android:sync
```

Use `npm run test:preview` for a separate local test origin at http://localhost:5188. A refresh of the upstream snapshot is available through `npm run dictionary:import`; review source and test changes before publishing.
