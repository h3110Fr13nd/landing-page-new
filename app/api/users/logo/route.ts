import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { put, del } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      )
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        aiLogoUrl: true,
        aiLogoPrompt: true,
        aiLogoGeneratedAt: true,
        logoUrl: true,
      },
    })

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      )
    }

    return NextResponse.json(userData)

  } catch (error) {
    console.error('Logo fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logo data' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from Supabase auth
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get current user to check for existing logo
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { logoUrl: true }
    })

    // Parse the form data
    const formData = await request.formData()
    const file = formData.get('logo') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type. Please upload an image.' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 })
    }

    // Prepare Vercel Blob token (support alternate env var name used in some setups)
    const vercelBlobToken = process.env.BLOB_READ_WRITE_TOKEN || process.env.INVOICE_BLOB_READ_WRITE_TOKEN

    // Delete old logo from Vercel Blob if it exists and is a blob URL
    if (currentUser?.logoUrl && currentUser.logoUrl.includes('vercel-storage.com')) {
      try {
        // pass token explicitly to avoid package lookup issues in various runtimes
        await del(currentUser.logoUrl, { token: vercelBlobToken })
        console.log('Deleted old logo:', currentUser.logoUrl)
      } catch (deleteError) {
        console.error('Failed to delete old logo:', deleteError)
        // Continue with upload even if delete fails
      }
    }

    // Generate a unique filename with user ID and timestamp
    const fileExtension = file.name.split('.').pop() || 'png'
    const filename = `logos/${user.id}-${Date.now()}.${fileExtension}`

    // Upload to Vercel Blob with public access
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
      token: vercelBlobToken,
    })

    console.log('Uploaded logo to Vercel Blob:', blob.url)

    // Update user profile with new logo URL
    await prisma.user.update({
      where: { id: user.id },
      data: { logoUrl: blob.url }
    })

    return NextResponse.json({ 
      logoUrl: blob.url,
      message: 'Logo uploaded successfully'
    })

  } catch (error) {
    console.error('Logo upload error:', error)
    return NextResponse.json({ 
      error: 'Failed to upload logo. Please try again.' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { logoUrl } = body

    if (!logoUrl) {
      return NextResponse.json(
        { error: 'Logo URL is required' }, 
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { logoUrl },
    })

    return NextResponse.json({
      success: true,
      logoUrl: updatedUser.logoUrl,
    })

  } catch (error) {
    console.error('Logo update error:', error)
    return NextResponse.json(
      { error: 'Failed to update logo' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get current user to delete logo from Vercel Blob
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { logoUrl: true }
    })

    // Prepare Vercel Blob token (support alternate env var name used in some setups)
    const vercelBlobToken = process.env.BLOB_READ_WRITE_TOKEN || process.env.INVOICE_BLOB_READ_WRITE_TOKEN

    // Delete logo from Vercel Blob if it exists and is a blob URL
    if (currentUser?.logoUrl && currentUser.logoUrl.includes('vercel-storage.com')) {
      try {
        await del(currentUser.logoUrl, { token: vercelBlobToken })
        console.log('Deleted logo from Vercel Blob:', currentUser.logoUrl)
      } catch (deleteError) {
        console.error('Failed to delete logo from Vercel Blob:', deleteError)
        // Continue with database update even if blob delete fails
      }
    }

    // Update user profile to remove logo URL
    await prisma.user.update({
      where: { id: user.id },
      data: { logoUrl: null }
    })

    return NextResponse.json({ message: 'Logo deleted successfully' })

  } catch (error) {
    console.error('Logo delete error:', error)
    return NextResponse.json({ error: 'Failed to delete logo' }, { status: 500 })
  }
}