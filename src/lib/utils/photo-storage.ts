/**
 * Photo Storage Utility
 *
 * Handles photo uploads for findings and actions using Supabase Storage.
 * Supports before/after photos for findings and verification photos for actions.
 */

import { createClient } from '@/lib/supabase/server'

// ============================================================================
// TYPES
// ============================================================================

export interface PhotoUploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
}

export interface PhotoMetadata {
  entityType: 'finding' | 'action'
  entityId: string
  photoType: 'before' | 'after' | 'verification' | 'evidence'
  uploadedBy: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const BUCKET_NAME = 'supervision-photos'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// ============================================================================
// PHOTO UPLOAD FUNCTIONS
// ============================================================================

/**
 * Upload a photo to Supabase Storage
 */
export async function uploadPhoto(
  file: File,
  metadata: PhotoMetadata
): Promise<PhotoUploadResult> {
  try {
    // Validate file
    const validation = validatePhotoFile(file)
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      }
    }

    const supabase = createClient()

    // Generate unique file path
    const path = generatePhotoPath(metadata, file.name)

    // Upload file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Photo upload error:', uploadError)
      return {
        success: false,
        error: uploadError.message
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path)

    return {
      success: true,
      url: urlData.publicUrl,
      path: path
    }

  } catch (error) {
    console.error('Photo upload exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Upload multiple photos
 */
export async function uploadMultiplePhotos(
  files: File[],
  metadata: PhotoMetadata
): Promise<PhotoUploadResult[]> {
  const uploadPromises = files.map(file => uploadPhoto(file, metadata))
  return Promise.all(uploadPromises)
}

/**
 * Delete a photo from Supabase Storage
 */
export async function deletePhoto(path: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path])

    if (error) {
      console.error('Photo deletion error:', error)
      return {
        success: false,
        error: error.message
      }
    }

    return { success: true }

  } catch (error) {
    console.error('Photo deletion exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Update finding with photo URL
 */
export async function attachPhotoToFinding(
  findingId: string,
  photoUrl: string,
  photoType: 'before' | 'after' | 'additional'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    const updateData: any = {}

    if (photoType === 'before') {
      updateData.photo_url = photoUrl
    } else if (photoType === 'after') {
      updateData.resolution_photo_url = photoUrl
    } else if (photoType === 'additional') {
      // Get existing additional photos
      const { data: finding } = await supabase
        .from('operational_findings')
        .select('additional_photos')
        .eq('id', findingId)
        .single()

      const additionalPhotos = finding?.additional_photos || []
      updateData.additional_photos = [...additionalPhotos, photoUrl]
    }

    const { error } = await supabase
      .from('operational_findings')
      .update(updateData)
      .eq('id', findingId)

    if (error) {
      console.error('Error attaching photo to finding:', error)
      return {
        success: false,
        error: error.message
      }
    }

    return { success: true }

  } catch (error) {
    console.error('Exception attaching photo to finding:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Update action with photo URL
 */
export async function attachPhotoToAction(
  actionId: string,
  photoUrl: string,
  photoType: 'before' | 'after' | 'verification'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    const updateData: any = {}

    if (photoType === 'before') {
      updateData.before_photo_url = photoUrl
    } else if (photoType === 'after') {
      updateData.after_photo_url = photoUrl
    } else if (photoType === 'verification') {
      updateData.verification_photo_url = photoUrl
    }

    const { error } = await supabase
      .from('corrective_actions')
      .update(updateData)
      .eq('id', actionId)

    if (error) {
      console.error('Error attaching photo to action:', error)
      return {
        success: false,
        error: error.message
      }
    }

    return { success: true }

  } catch (error) {
    console.error('Exception attaching photo to action:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate photo file
 */
function validatePhotoFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`
    }
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`
    }
  }

  return { valid: true }
}

/**
 * Generate unique file path for photo
 */
function generatePhotoPath(metadata: PhotoMetadata, fileName: string): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const timestamp = date.getTime()

  // Generate file extension
  const ext = fileName.split('.').pop() || 'jpg'

  // Generate path: {entityType}/{year}/{month}/{entityId}/{photoType}_{timestamp}.{ext}
  return `${metadata.entityType}/${year}/${month}/${metadata.entityId}/${metadata.photoType}_${timestamp}.${ext}`
}

/**
 * Get all photos for a finding
 */
export async function getFindingPhotos(findingId: string): Promise<{
  before?: string
  after?: string
  additional: string[]
}> {
  const supabase = createClient()

  const { data: finding } = await supabase
    .from('operational_findings')
    .select('photo_url, resolution_photo_url, additional_photos')
    .eq('id', findingId)
    .single()

  if (!finding) {
    return { additional: [] }
  }

  return {
    before: finding.photo_url || undefined,
    after: finding.resolution_photo_url || undefined,
    additional: (finding.additional_photos as string[]) || []
  }
}

/**
 * Get all photos for an action
 */
export async function getActionPhotos(actionId: string): Promise<{
  before?: string
  after?: string
  verification?: string
}> {
  const supabase = createClient()

  const { data: action } = await supabase
    .from('corrective_actions')
    .select('before_photo_url, after_photo_url, verification_photo_url')
    .eq('id', actionId)
    .single()

  if (!action) {
    return {}
  }

  return {
    before: action.before_photo_url || undefined,
    after: action.after_photo_url || undefined,
    verification: action.verification_photo_url || undefined
  }
}

/**
 * Create a signed URL for temporary access (useful for private files)
 */
export async function createSignedUrl(path: string, expiresIn: number = 3600): Promise<{
  success: boolean
  url?: string
  error?: string
}> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, expiresIn)

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      url: data.signedUrl
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
