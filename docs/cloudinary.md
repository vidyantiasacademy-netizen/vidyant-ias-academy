# Cloudinary

All file storage: profile photographs, question papers and keys, lesson
handouts, photographed answer sheets, doubt attachments, faculty documents.
Firebase still does Auth and Firestore; it does not store a single file.

Lecture video is Mux, not this. Marketing imagery is Sanity's own asset
pipeline, not this. Cloudinary holds only what a student or a member of staff
uploads, and none of it is public.

## 1. Create the product environment

1. [console.cloudinary.com](https://console.cloudinary.com) → sign up, or add a
   product environment to an existing account.
2. Use a **separate product environment for development**. There is no
   Cloudinary emulator, so `next dev` writes to a real cloud; pointing it at
   production would put test uploads next to student records.
3. Settings → **API Keys** → copy the cloud name, API key and API secret into
   `.env.local`:

```bash
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

None of these may gain a `NEXT_PUBLIC_` prefix. The key and secret together
sign uploads and delivery URLs; the cloud name stays server-side because the
browser never addresses Cloudinary without a signature from
`/api/uploads/signature`.

Leave them empty and the public website still builds and serves. Only uploads
and anything that displays a stored file become unavailable — the I Card falls
back to its placeholder photograph.

## 2. Recommended console settings

Settings → **Security**:

- **Strict transformations** — on. Blocks on-the-fly transformation URLs unless
  they are signed. Nothing in the app builds an unsigned transformation.
- **Restricted media types** — leave `fetch` restricted. The app never fetches
  a remote URL through Cloudinary.
- Auto-backup and the delete-token window are optional; an answer sheet that
  disappears is evidence that disappears, so backup is worth the storage.

## 3. The access model

Every asset is uploaded with delivery type **`authenticated`**, which means
neither the original nor any derived version is reachable from a plain
Cloudinary URL. A signature is required, and — unlike a Firebase
`getDownloadURL()` token, which never expires — the URL this app mints carries
an `expires_at` the CDN enforces. Ten minutes is the default.

Reads go through `storageService.getSignedUrl()`, which authorises the caller
*before* signing, using the public-id prefix:

| Prefix | Who may read |
| --- | --- |
| `users/{uid}/…`, `students/{uid}/…` | That user, and FACULTY and above |
| `courses/{courseId}/…` | FACULTY and above, or a student with an active enrollment in that course |
| `questions/…` | Any active user (a question image during a test) |
| `tests/…`, `faculty/…` | FACULTY and above / ADMIN and above |

Writes are authorised the same way in `assertCanWrite()`.

**There is no rules file.** Firebase Storage had `storage.rules` re-checking
every write at the bucket; Cloudinary has no such layer. An upload this server
signs is an upload Cloudinary accepts, so `assertCanRead()` and
`assertCanWrite()` in `src/services/storage/storage.service.ts` are the whole of
the access control rather than one of two lines of defence. Treat an edit to
either the way a rules change was treated.

## 4. Public ids and media references

Two strings, and mixing them up is the easy mistake:

| | Example | Where it lives |
| --- | --- | --- |
| Public id | `users/abc/avatar/1712-photo` | What Cloudinary stores the asset under; built only by `MEDIA_PATHS` |
| Media reference | `users/abc/avatar/1712-photo.jpg` | What Firestore stores (`users/{uid}.photoPath`, `lessons/{id}.storagePath`) and what `getSignedUrl()` takes |

The format suffix is appended from Cloudinary's upload response, not from the
uploaded filename: a `.jpeg` upload is stored as format `jpg`, and a signed
download URL has to be signed over the exact format. Hence
`toMediaRef()` / `fromMediaRef()` rather than string surgery at the call site.

Names are timestamped by `uniqueAssetName()` and every upload sets
`overwrite: false`, so a re-upload can never replace an earlier asset — which is
what keeps a submitted answer sheet from being quietly swapped.

## 5. Two upload paths

**Through a Route Handler** — profile photographs. The file is posted to
`/dashboard/services/i-card/photo`, which checks type and size and then calls
`storageService.uploadOwnAvatar()`. Use this whenever the byte count is a real
control: it is the only path where the server sees the bytes.

**Direct from the browser** — anything large, such as a 15 MB answer-sheet
photograph, which would otherwise occupy a serverless function for the whole
upload. `lib/cloudinary/upload.ts` asks `/api/uploads/signature` for a
signature covering one exact public id, then `POST`s the file to Cloudinary.

What a signature cannot do: Cloudinary enforces the signed `allowed_formats`
but has no per-request byte cap, so the size limit on this path is the browser
check plus the account's own file-size ceiling. Anything stricter has to go
through a Route Handler.

## 6. Costs worth knowing

`private_download_url` delivers through an authenticated API request rather than
the CDN. It is what makes expiry possible, and it costs roughly double the
bandwidth of a cached delivery. So: mint these URLs per request and let them
die. Never store one, never embed one in an email, and keep the TTL short.

## Where the code lives

| File | Role |
| --- | --- |
| `src/lib/cloudinary/config.ts` | `server-only` credentials; `isCloudinaryConfigured()` |
| `src/lib/cloudinary/client.ts` | `server-only` lazily-configured SDK |
| `src/lib/cloudinary/media-paths.ts` | Every public id, the upload limits, reference encoding |
| `src/lib/cloudinary/upload.ts` | Browser uploads with progress and fail-fast checks |
| `src/services/storage/storage.service.ts` | Authorisation, signing, server-side upload and delete |
| `src/app/api/uploads/signature/route.ts` | Signs one direct browser upload |
