# PROMPT: Minimal Fix - App Opening with Settings-Only Auth

## Problem Statement

The app won't open because `AuthOverlay.tsx` is trying to call `window.electronAPI.gemini.checkStatus()` which doesn't exist. The error is:

```
Cannot read properties of undefined (reading 'checkStatus')
```

We need a quick fix: **skip all Gemini CLI checks and just verify API keys are set in Settings**.

## Current Flow (Broken)

```
App starts
  ↓
AuthOverlay tries to checkStatus() → ERROR (method doesn't exist)
```

## Desired Flow (Fixed)

```
App starts
  ↓
Check if both API keys are set in Settings
  ├─ YES (both Gemini + GNews keys exist)
  │  └─ Close AuthOverlay, show main app
  │
  └─ NO (one or both keys missing)
     └─ Auto-open Settings modal
        ↓
     User enters Gemini key in Settings
        ↓
     User enters GNews key in Settings
        ↓
     User clicks "Done"
        ↓
     Verify both keys are now set
        ↓
     Close Settings, show main app
```

## Architecture

The Settings system is already working:

- `window.electronAPI.settings.bothKeysSet()` exists
- Returns `Promise<boolean>` (true if both Gemini + GNews keys are stored)
- SettingsModal is already built and functional

We just need to wire it into the app startup flow.

## Changes Needed

### 1. AuthOverlay.tsx

**Current behavior:**

- Imports `gemini-auth` service
- Calls `checkSystemStatus()` which calls `window.electronAPI.gemini.checkStatus()`
- Multi-step UI: "Install CLI" → "Login with Google" → "Enter API Key"

**New behavior:**

- Remove all Gemini CLI related imports and logic
- Remove all OAuth/Google login related code
- Single responsibility: **Check if both API keys are set**
- If keys are set → call `onAuthenticated()` callback
- If keys are NOT set → return `null` (let parent App.tsx handle showing Settings)
- Show loading spinner while checking

**What to remove:**

- Import of `gemini-auth` service
- All state related to `isCliInstalled`
- All state related to CLI installation steps
- All state related to Google OAuth login
- All UI for "Install CLI" button
- All UI for "Login with Google" button
- Call to `checkSystemStatus()`
- Calls to `installCli()`
- Calls to `loginUser()`
- Calls to `window.electronAPI.gemini.checkStatus()`
- Calls to `window.electronAPI.gemini.checkAuth()`

**What to keep:**

- Loading spinner while checking
- Error display if something goes wrong
- Basic UI layout (dark theme matching the app)

**New logic:**

- On mount: call `window.electronAPI.settings.bothKeysSet()`
- If returns true → call `onAuthenticated()` → overlay closes
- If returns false → return null (let App.tsx show Settings modal instead)
- While checking → show loading spinner

### 2. App.tsx

**Current behavior:**

- Shows AuthOverlay
- Waits for `onAuthenticated` callback
- Shows main app content

**New behavior:**

- Add state: `isAuthenticated` (boolean, starts false)
- Add state: `showSettings` (boolean, starts false)
- Add effect on mount: check `window.electronAPI.settings.bothKeysSet()`
  - If true → set `isAuthenticated` to true
  - If false → set `showSettings` to true (auto-open Settings modal)
- Show AuthOverlay always (it checks keys and calls onAuthenticated)
- Show SettingsModal when `showSettings` is true
- Show main app content only when `isAuthenticated` is true
- Add Settings button to sidebar that opens Settings modal anytime (even after auth)

**Conditional rendering logic:**

- If NOT authenticated → show AuthOverlay (with SettingsModal possibly open)
- If authenticated → show main app content (with SettingsModal accessible via Settings button)

### 3. SettingsModal.tsx

**Current behavior:**

- Takes `isOpen`, `onClose`, `onKeysUpdated` props
- User can enter both API keys
- User can test connection
- User can clear all keys
- User can close with "Done" button

**New behavior:**

- Add callback after "Done" button: verify both keys are set before closing
- When `onKeysUpdated` is called, re-check `window.electronAPI.settings.bothKeysSet()`
- If both keys confirmed set → trigger the `onKeysUpdated` callback
- If keys are missing → show error message, don't close modal
- This prevents user closing without both keys set

**Updated logic in the "Done" button handler:**

- After user clicks Done
- Verify `bothKeysSet()` returns true
- Only then close modal and call callback
- If either key is missing → show error, keep modal open

## Implementation Order

1. **AuthOverlay.tsx** – simplify to only check if keys exist
2. **SettingsModal.tsx** – add verification before closing
3. **App.tsx** – wire up the authentication state and Settings modal visibility

## Testing Checklist

After implementation:

- [ ] App starts without errors
- [ ] No error about `checkStatus` being undefined
- [ ] If NO API keys are set:
  - [ ] Settings modal auto-opens on startup
  - [ ] Can enter Gemini API key
  - [ ] Can enter GNews API key
  - [ ] "Done" button is disabled or blocked if either key is missing
  - [ ] After entering both keys, "Done" closes Settings
  - [ ] Main app content appears
- [ ] If API keys ARE set:
  - [ ] AuthOverlay closes immediately
  - [ ] Main app content appears
  - [ ] Settings accessible from sidebar
  - [ ] Can update keys in Settings anytime
  - [ ] Updating keys persists across app restart
- [ ] No console errors
- [ ] No TypeScript compilation errors
- [ ] No references to `checkStatus()`, `checkAuth()`, `installCli()`, `loginUser()`

## Success Criteria

✅ App opens without errors
✅ User can set API keys via Settings modal
✅ Main app content shows after keys are set
✅ Settings accessible anytime from sidebar
