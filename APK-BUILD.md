# Gaylingua APK — 21 October 2026

The Android debug APK was compiled successfully and its installable signature verified.

| Property | Result |
| --- | --- |
| File | `artifacts/gaylingua-debug.apk` |
| Size | 4,133,529 bytes (about 4.1 MB) |
| App label | Gaylingua |
| Application ID | `app.gaylingua.mobile` |
| Version | 1.0, version code 1 |
| Minimum Android API | 24 (Android 7.0); an updated Android WebView is needed for the app’s JavaScript features |
| Target / compile API | 36 |
| Signing | Android debug certificate; APK Signature Scheme v2 verified |
| SHA-256 | `872cb604d0cea4fc70f8492ac205c8a767347a5d21259c3f159944b8434691d9` |

## Validation

- `npm test`: all 48 automated checks passed before the native build.
- `npm run android:apk`: Gradle `assembleDebug` completed successfully; 93 tasks executed.
- Android `apksigner verify --verbose --print-certs`: passed.
- Android `aapt dump badging`: confirmed the app ID, label, version, minimum API, target API, and debug configuration.
- APK ZIP inspection confirmed the manifest, DEX code, HTML, JavaScript, styles, native safe-area styles, and the imported dictionary module are present.
- All 83 Wikipedia source records are in the packaged dictionary module. With the original entries and merged overlaps, the app’s dictionary contains 104 entries.
- The APK uses bundled assets, with no remote `server.url` and no ChatGPT sign-in requirement.

This is an installable **debug/test build**, not a Play Store release. It has not been installed on a physical Android device or run in an emulator. The original browser verification remains documented in `TEST-REPORT.md`.

## Build tools on D:

The user authorized installing the Android SDK on D: and accepting Google’s SDK license for this build.

- SDK: `D:\Projects\WebApps\Gayligua\gaylingua\.android-sdk`
- Gradle cache and temporary files: `D:\Projects\WebApps\Gayligua\gaylingua\.gradle`
- Android user settings and debug signing key: `D:\Projects\WebApps\Gayligua\gaylingua\.android-sdk-user`
- Download staging: `D:\Projects\WebApps\Gayligua\gaylingua\artifacts\sdk-downloads`

The existing Java 21 installation is used. Android Studio was not installed, and no global SDK environment variables were changed. Keep the local debug signing key if you want future debug builds to install as updates to this one.

## Install or rebuild

Copy `artifacts/gaylingua-debug.apk` to your Android phone, open it, and follow Android’s installation prompts. Installation permission is managed on the phone.

To rebuild from this project:

```sh
npm run android:apk
```

The build script finds the local SDK automatically and keeps Gradle’s cache on the project’s drive. A production or Play Store release requires a separate release signing setup.
