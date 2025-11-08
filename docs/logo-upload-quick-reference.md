# Logo Upload - Quick Reference

## 🚀 Quick Start (Local Development)

```bash
# 1. Get Vercel Blob token
vercel link
vercel env pull .env.local

# 2. Start dev server
npm run dev

# 3. Test at:
# http://localhost:3000/dashboard/settings/branding
```

## 📝 Files Changed

| File | Type | Description |
|------|------|-------------|
| `app/api/users/logo/route.ts` | Modified | Added Vercel Blob upload/delete |
| `app/dashboard/settings/branding/page.tsx` | Modified | Updated delete handler |
| `docs/vercel-blob-setup.md` | Created | Setup & configuration |
| `docs/logo-upload-testing-guide.md` | Created | Testing procedures |
| `docs/logo-upload-implementation-summary.md` | Created | Implementation overview |

## ⚙️ Environment Variable

```bash
# Automatically added by Vercel when you create a Blob store
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx
```

## ✅ Features

- Upload logo to Vercel Blob (max 5MB, images only)
- Automatic old logo deletion on new upload
- Public CDN-backed URLs
- One logo per user
- Database synchronization
- Full validation & error handling

## 🧪 Test Cases

1. **Upload:** Select image → See preview → URL saved
2. **Replace:** Upload new → Old deleted → New saved
3. **Delete:** Click trash → Removed from storage & DB
4. **Validate:** Try wrong file type → Error shown
5. **Invoice:** Logo appears in generated PDFs

## 🔍 Debugging

```bash
# Check if token is loaded
echo $BLOB_READ_WRITE_TOKEN

# View server logs
# Look for: "Uploaded logo to Vercel Blob: [URL]"
# Look for: "Deleted old logo: [URL]"
```

## 📦 Vercel Dashboard

```
Project → Storage → Blob Store → Browse
└── logos/
    ├── user-abc123-1699401234567.png
    └── user-xyz789-1699401245678.jpg
```

## 🌐 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/users/logo` | Upload new logo |
| DELETE | `/api/users/logo` | Delete logo |
| GET | `/api/users/logo` | Get logo URLs |

## 📋 Deployment Checklist

- [ ] Code changes pushed to Git
- [ ] Vercel automatic deployment triggered
- [ ] Test upload in production
- [ ] Verify blob URLs are public
- [ ] Check logos in invoices/PDFs
- [ ] Monitor Vercel Storage usage

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| Token not defined | Run `vercel env pull .env.local` |
| Upload fails | Check file size (<5MB) and type (image/*) |
| Old logo not deleted | Only blob URLs are deleted (not base64) |

## 📚 Documentation

- **Setup Guide:** `docs/vercel-blob-setup.md`
- **Testing Guide:** `docs/logo-upload-testing-guide.md`
- **Summary:** `docs/logo-upload-implementation-summary.md`
- **Vercel Docs:** https://vercel.com/docs/storage/vercel-blob

## 🎯 Quick Test

```bash
# 1. Go to branding settings
open http://localhost:3000/dashboard/settings/branding

# 2. Upload a logo image
# 3. Check console for: "Uploaded logo to Vercel Blob: [URL]"
# 4. Verify preview shows the image
# 5. Upload another image
# 6. Check console for: "Deleted old logo: [URL]"
# 7. Verify only new image shows
```

## ✨ What's New

**Before:** Logos stored as base64 data URLs in database
**After:** Logos stored in Vercel Blob with CDN delivery

**Benefits:**
- Faster loading (CDN)
- Smaller database
- Better performance
- Automatic cleanup

---

**Status: ✅ Complete & Ready for Deployment**
