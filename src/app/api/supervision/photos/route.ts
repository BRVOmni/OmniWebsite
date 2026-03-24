/**
 * API Route: Photo Upload
 *
 * Handles photo uploads for findings and actions using Supabase Storage.
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import {
  uploadPhoto,
  uploadMultiplePhotos,
  attachPhotoToFinding,
  attachPhotoToAction,
  deletePhoto,
  getFindingPhotos,
  getActionPhotos
} from '@/lib/utils/photo-storage'

// ============================================================================
// POST - Upload photo
// ============================================================================

export async function POST(request: Request) {
  try {
    const supabase = createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const entityType = formData.get('entityType') as 'finding' | 'action'
    const entityId = formData.get('entityId') as string
    const photoType = formData.get('photoType') as 'before' | 'after' | 'verification' | 'evidence'

    // Validate required fields
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    if (!entityType || !entityId || !photoType) {
      return NextResponse.json(
        { error: 'Missing required fields: entityType, entityId, photoType' },
        { status: 400 }
      )
    }

    // Upload photo
    const result = await uploadPhoto(file, {
      entityType,
      entityId,
      photoType,
      uploadedBy: user.email || user.id
    })

    if (!result.success || !result.url) {
      return NextResponse.json(
        { error: result.error || 'Upload failed' },
        { status: 500 }
      )
    }

    // Attach to entity
    let attachResult
    if (entityType === 'finding') {
      attachResult = await attachPhotoToFinding(entityId, result.url, photoType)
    } else if (entityType === 'action') {
      attachResult = await attachPhotoToAction(entityId, result.url, photoType)
    }

    if (attachResult && !attachResult.success) {
      // If attachment failed, delete the uploaded file
      if (result.path) {
        await deletePhoto(result.path)
      }
      return NextResponse.json(
        { error: attachResult.error || 'Failed to attach photo' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      path: result.path
    })

  } catch (error) {
    console.error('Photo upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// GET - Get photos for an entity
// ============================================================================

export async function GET(request: Request) {
  try {
    const supabase = createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get('entityType') as 'finding' | 'action'
    const entityId = searchParams.get('entityId') as string

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'Missing required parameters: entityType, entityId' },
        { status: 400 }
      )
    }

    let photos
    if (entityType === 'finding') {
      photos = await getFindingPhotos(entityId)
    } else if (entityType === 'action') {
      photos = await getActionPhotos(entityId)
    } else {
      return NextResponse.json(
        { error: 'Invalid entityType' },
        { status: 400 }
      )
    }

    return NextResponse.json({ photos })

  } catch (error) {
    console.error('Get photos error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Delete photo
// ============================================================================

export async function DELETE(request: Request) {
  try {
    const supabase = createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')

    if (!path) {
      return NextResponse.json(
        { error: 'Path parameter is required' },
        { status: 400 }
      )
    }

    const result = await deletePhoto(path)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Delete failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Photo deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
