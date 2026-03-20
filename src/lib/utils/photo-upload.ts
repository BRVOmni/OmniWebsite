/**
 * Photo Upload Utility
 *
 * Handles photo uploads to Supabase Storage for supervision module.
 * Supports compression, multiple uploads, and progress tracking.
 */

import { createClient } from '@/lib/supabase/client'

export interface UploadResult {
  url: string
  path: string
  error?: string
}

const BUCKET_NAME = 'supervision-photos'

/**
 * Upload a single photo to Supabase Storage
 */
export async function uploadPhoto(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  const supabase = createClient()

  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${path}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return { url: '', path: '', error: error.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName)

    if (onProgress) {
      onProgress(100)
    }

    return {
      url: publicUrl || '',
      path: fileName,
    }
  } catch (error) {
    console.error('Upload exception:', error)
    return {
      url: '',
      path: '',
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

/**
 * Upload multiple photos
 */
export async function uploadPhotos(
  files: File[],
  path: string,
  onProgress?: (progress: number, index: number) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = []

  for (let i = 0; i < files.length; i++) {
    const result = await uploadPhoto(files[i], path, (progress) => {
      if (onProgress) {
        const overallProgress = ((i * 100) + progress) / files.length
        onProgress(overallProgress, i)
      }
    })

    results.push(result)
  }

  return results
}

/**
 * Delete a photo from Supabase Storage
 */
export async function deletePhoto(path: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path])

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    }
  }
}

/**
 * Get public URL for a photo
 */
export function getPhotoUrl(path: string): string {
  const supabase = createClient()

  try {
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path)

    return data.publicUrl || ''
  } catch {
    return ''
  }
}
