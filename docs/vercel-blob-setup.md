# Vercel Blob Storage Setup for Logo Uploads

This document explains how logo uploads are implemented using Vercel Blob storage.

## Overview

The application uses Vercel Blob storage for user logo uploads. This provides:
- Fast, CDN-backed image delivery
- Automatic image optimization
- Public access URLs
- Secure server-side upload handling

## Setup Instructions

### 1. Enable Vercel Blob Storage

1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Create a new **Blob Store**
4. The `BLOB_READ_WRITE_TOKEN` environment variable will be automatically added to your project

### 2. Environment Variables

The following environment variable is required and automatically set by Vercel:

```
BLOB_READ_WRITE_TOKEN=<your-token>
```

**Note:** This token is automatically injected by Vercel in production and preview deployments. For local development, you can obtain it from your Vercel project settings under Storage.

### 3. Local Development Setup

To test logo uploads locally:

1. Install Vercel CLI if not already installed:
   ```bash
   npm i -g vercel
   ```

2. Link your local project to Vercel:
   ```bash
   vercel link
   ```

3. Pull environment variables:
   ```bash
   vercel env pull .env.local
   ```

This will create a `.env.local` file with your `BLOB_READ_WRITE_TOKEN`.

## Implementation Details

### API Endpoint: `/api/users/logo`

**POST** - Upload new logo
- Accepts multipart/form-data with 'logo' field
- Maximum file size: 5MB
- Allowed types: image/*
- Automatically deletes old logo before uploading new one
- Returns public blob URL
- Updates user's `logoUrl` in database

**DELETE** - Remove logo
- Deletes blob from Vercel Blob storage
- Clears `logoUrl` from user record

**GET** - Fetch current logo URLs
- Returns user's `logoUrl` and `aiLogoUrl`

### File Naming Convention

Uploaded logos are stored with the following pattern:
```
logos/{userId}-{timestamp}.{extension}
```

Example: `logos/abc123-1699401234567.png`

### Storage Behavior

- **One logo per user**: When a user uploads a new logo, the old one is automatically deleted
- **Public access**: All logos are publicly accessible via their blob URL
- **Automatic cleanup**: Deleting a logo removes it from both the database and blob storage

## UI Components

### Branding Settings Page
Location: `app/dashboard/settings/branding/page.tsx`

Features:
- File upload with validation (type, size)
- Logo preview
- Delete functionality
- AI logo generation (separate feature)
- Brand preview showing how logo appears in invoices

### Usage in Application

Logos are used in:
- Invoice PDFs (header)
- Email templates
- User profile
- Dashboard branding

## Testing

### Manual Testing Steps

1. Navigate to Settings → Branding
2. Upload an image file (PNG, JPG, SVG)
3. Verify:
   - Upload succeeds
   - Preview shows new logo
   - Logo URL is stored in database
4. Upload a second image
5. Verify:
   - Old logo is deleted from blob storage
   - New logo replaces the old one
6. Delete logo
7. Verify:
   - Logo is removed from blob storage
   - Database `logoUrl` is cleared

### Vercel Blob Storage Dashboard

You can view all uploaded blobs in your Vercel dashboard:
1. Go to project Storage tab
2. Click on your Blob store
3. Browse uploaded files under `logos/` folder

## Security Considerations

- All uploads require authentication (JWT token)
- File type validation prevents non-image uploads
- File size limit prevents abuse (5MB max)
- Server-side validation before blob upload
- Public read access, but only authenticated write access

## Troubleshooting

### "BLOB_READ_WRITE_TOKEN is not defined"

**Solution:** 
- In production: Ensure Blob storage is enabled in Vercel project
- Locally: Run `vercel env pull .env.local`

### Upload fails with "Failed to upload logo"

**Check:**
1. File size (must be < 5MB)
2. File type (must be image/*)
3. Network connection
4. Vercel Blob storage is enabled
5. Token has write permissions

### Old logos not being deleted

**Check:**
1. Verify the old `logoUrl` contains 'vercel-storage.com'
2. Check server logs for delete errors
3. Ensure `BLOB_READ_WRITE_TOKEN` has delete permissions

## Migration Notes

### Migrating from Base64 Data URLs

If you have existing users with base64 data URL logos:

1. The system will automatically handle mixed storage:
   - Base64 logos won't be deleted (not in blob storage)
   - New uploads will use blob storage
   - Old base64 URLs will remain functional

2. To migrate existing base64 logos to blob storage, create a migration script:
   ```typescript
   // Example migration (run once)
   const users = await prisma.user.findMany({
     where: { logoUrl: { startsWith: 'data:' } }
   })
   
   for (const user of users) {
     // Convert base64 to blob, upload, update user
   }
   ```

## Additional Resources

- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [@vercel/blob NPM Package](https://www.npmjs.com/package/@vercel/blob)
- [Next.js File Upload Guide](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#formdata)

## Support

For issues related to:
- **Vercel Blob**: Contact Vercel support or check their documentation
- **Application logic**: Open an issue in the project repository
