# AGENTS.md

## Session Checkpoint: "Continue"

Project: RigCraft e-commerce (MERN). Admin panel: `client/src/admin`. Server: `server/src`.

### Changes completed this session

1. **Admin topbar avatar** (`client/src/admin/store/authStore.js`, `components/layout/Header.jsx`)
   - `login` now persists `firstName`/`lastName` alongside `name`; `setUser` passes them through.
   - Added `version: 1` + `migrate` in zustand `persist` to backfill `firstName`/`lastName` from `name` for stale sessions (storage key `admin-auth-storage`).
   - Header `<Avatar>` now uses `src={user?.avatar || undefined}`; initials/name fall back to `user.name`.

2. **Top Products rank badge** (`client/src/admin/components/dashboard/TopProducts.jsx`)
   - Removed orange `#1` highlight (`--color-admin-warning`); all rank badges now use neutral `--color-admin-bg-tertiary`.

3. **Prebuilt PC image delete on edit** (`client/src/admin/services/prebuiltService.js`, `server/src/services/prebuiltPC.service.js`)
   - `normalizePrebuilt`: `image` now holds the full first-image object (`p.images?.[0] || null`) instead of just the URL string (needed for `ImageUpload` delete matching).
   - `adaptPayload`: `image` null → sends `images: []`; string → `images: [{ url }]`.
   - Server `update`: distinguishes unchanged (`data.images === undefined` → preserve) vs explicit clear (`data.images` array → delete Cloudinary images + set empty).

4. **Prebuilt thumbnails on admin panel** (`client/src/admin/pages/prebuilt/PrebuiltList.jsx`, `PrebuiltDetails.jsx`)
   - `AdminThumbnail` src now uses `row.image?.url || row.image` (and same for details `item.image`). This fixed a regression from change #3 where the object was passed as `<img src>`.

### Verification
- Client: `npx eslint` on edited files passes (a pre-existing `react-hooks/set-state-in-effect` error exists in `PrebuiltList.jsx:50`, unrelated).
- Server: `npx vitest run` — 11 files / 101 tests pass.

### Lint/build commands
- Client lint: `npx eslint src/...` (from `client/`)
- Server tests: `npm test` (from `server/`)

### Notes / potential follow-ups
- `AdminThumbnail` hardening was offered (accept object `src`, extract `.url` internally) but deferred; user chose the two targeted fixes first.
