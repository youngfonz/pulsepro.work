Perform a comprehensive review of the mobile app (located in `mobile/`) to verify it is ready for an alpha push to TestFlight. This is a thorough audit — check everything.

## 1. Build & Configuration

- [ ] Verify `mobile/app.json` has correct `name`, `slug`, `version`, `bundleIdentifier`, and `buildNumber`
- [ ] Verify `mobile/package.json` dependencies are compatible (no version conflicts)
- [ ] Verify `mobile/tsconfig.json` is valid and no TypeScript errors exist (run `cd mobile && npx tsc --noEmit`)
- [ ] Verify `mobile/eas.json` exists and has valid build profiles (development, preview, production)
- [ ] Verify no hardcoded localhost URLs, dev keys, or test credentials in committed code
- [ ] Verify `.env` / `.env.local` files are gitignored and not committed
- [ ] Verify `mobile/.gitignore` excludes `node_modules`, `.expo`, `ios`, `android`, build artifacts

## 2. Authentication

- [ ] Verify Clerk publishable key is loaded from environment variable, not hardcoded
- [ ] Verify OAuth redirect URIs work for both Expo Go (dev) and production builds
- [ ] Verify Login screen renders correctly (no layout issues, all buttons functional)
- [ ] Verify Sign Up screen renders correctly
- [ ] Verify sign-out flow works
- [ ] Verify token refresh / session persistence logic exists

## 3. Navigation & Screens

- [ ] List all screens registered in navigation and verify each has a corresponding component
- [ ] Verify all tab navigator screens exist and are wired up
- [ ] Verify all stack navigators have proper screen definitions
- [ ] Verify deep linking / navigation params are typed correctly
- [ ] Check for any dead routes or screens that reference non-existent components

## 4. API & Data

- [ ] Verify API base URL is configurable via environment variable with production fallback
- [ ] Verify all API calls include proper auth headers (Bearer token from Clerk)
- [ ] Verify error handling exists for API failures (network errors, 401s, 500s)
- [ ] Verify pull-to-refresh works on list screens
- [ ] Verify loading states exist for all data-fetching screens
- [ ] Verify empty states exist for lists with no data
- [ ] Check for any API endpoints that are called but don't exist on the server

## 5. UI & UX

- [ ] Review each screen for layout issues (overlapping elements, text truncation, safe area violations)
- [ ] Verify all interactive elements have proper touch feedback (activeOpacity, ripple, etc.)
- [ ] Verify all icons render (no missing lucide-react-native or other icon imports)
- [ ] Verify color theme is consistent across all screens
- [ ] Verify fonts load correctly (no fallback font flashes)
- [ ] Verify keyboard handling on all input screens (KeyboardAvoidingView, dismiss on tap, etc.)
- [ ] Check for any hardcoded strings that should be dynamic

## 6. Performance

- [ ] Check for unnecessary re-renders (inline object/function props, missing useMemo/useCallback)
- [ ] Verify FlatList/ScrollView usage is appropriate for list screens
- [ ] Check for memory leaks (intervals/timeouts not cleaned up in useEffect)
- [ ] Verify images are optimized and not loading unnecessary large assets

## 7. Error Handling & Edge Cases

- [ ] Verify app doesn't crash on network failure
- [ ] Verify app handles expired/invalid auth tokens gracefully
- [ ] Verify all forms validate input before submission
- [ ] Verify back button behavior is correct on all screens
- [ ] Check for any unhandled promise rejections or caught-but-swallowed errors

## 8. Platform-Specific

- [ ] Verify iOS-specific code uses `Platform.OS === 'ios'` checks where needed
- [ ] Verify safe area insets are handled (notch, home indicator)
- [ ] Verify status bar styling is consistent
- [ ] Verify any native module dependencies are compatible with the Expo SDK version

## 9. Security

- [ ] No API keys, secrets, or tokens in source code
- [ ] No sensitive data logged to console in production
- [ ] Secure storage used for tokens (expo-secure-store)
- [ ] No eval() or dynamic code execution

## Output

After completing the review, provide:

1. **Summary**: Overall readiness assessment (Ready / Needs Work / Blockers)
2. **Critical Issues**: Anything that would cause a crash, data loss, or security vulnerability
3. **Warnings**: Issues that should be fixed but won't block the alpha release
4. **Recommendations**: Nice-to-haves for post-alpha improvement
5. **Files Changed**: If you fixed any issues during the review, list them

For each issue found, include the file path, line number, and a clear description of the problem and suggested fix.
