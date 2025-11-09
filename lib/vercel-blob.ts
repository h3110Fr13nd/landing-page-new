import { put, del } from '@vercel/blob'

const VERCEL_BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || process.env.INVOICE_BLOB_READ_WRITE_TOKEN

export async function uploadPdfBlob(filename: string, data: Buffer | Blob | File) {
  // filename should be unique per invoice; we'll not add random suffix so uploads replace when same name used
  const blob = await put(filename, data as any, {
    access: 'public',
    addRandomSuffix: false,
    token: VERCEL_BLOB_TOKEN,
  })
  return blob.url
}

export async function deleteBlobByUrl(blobUrl?: string) {
  if (!blobUrl) return
  try {
    await del(blobUrl, { token: VERCEL_BLOB_TOKEN })
  } catch (err) {
    // ignore delete errors
    console.warn('Failed to delete blob:', blobUrl, err)
  }
}

export async function fetchBlobAsBuffer(blobUrl: string) {
  const resp = await fetch(blobUrl)
  if (!resp.ok) throw new Error(`Failed to fetch blob: ${resp.status}`)
  const ab = await resp.arrayBuffer()
  return Buffer.from(ab)
}

export function buildInvoiceBlobFilename(userId: string, invoiceId: string) {
  return `invoices/${userId}/${invoiceId}.pdf`
}

export default { uploadPdfBlob, deleteBlobByUrl, fetchBlobAsBuffer, buildInvoiceBlobFilename }
