/**
 * Photo Uploader Component
 *
 * Optional photo upload component for evidence documentation.
 * Integrates with Supabase Storage for persistent photo storage.
 */

import { useState, useCallback } from 'react'
import { useLanguage } from '@/lib/language-context'
import { cn } from '@/lib/utils'
import { Camera, X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react'
import { uploadPhoto, deletePhoto } from '@/lib/utils/photo-upload'

interface Photo {
  id: string
  url: string
  path?: string
  file?: File
  description?: string
  category?: string
  uploadedAt: Date
  uploading?: boolean
}

interface PhotoUploaderProps {
  photos?: Photo[]
  onPhotosChange?: (photos: Photo[]) => void
  maxPhotos?: number
  maxSizeMB?: number
  required?: boolean
  photoType?: 'finding' | 'before' | 'after' | 'general' | 'evidence'
  uploadPath?: string // Custom upload path (e.g., 'supervision/visits/visit-id')
  className?: string
}

export function PhotoUploader({
  photos = [],
  onPhotosChange,
  maxPhotos = 5,
  maxSizeMB = 10,
  required = false,
  photoType = 'evidence',
  uploadPath = 'supervision',
  className,
}: PhotoUploaderProps) {
  const { t } = useLanguage()
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploadError(null)

    // Check max photos limit
    if (photos.length + files.length > maxPhotos) {
      setUploadError(t('photoLimitError', { max: maxPhotos }))
      return
    }

    const newPhotos: Photo[] = []

    for (const file of Array.from(files)) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setUploadError(t('photoTypeError'))
        return
      }

      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setUploadError(t('photoSizeError', { max: maxSizeMB }))
        return
      }

      // Create preview URL (temporary)
      const previewUrl = URL.createObjectURL(file)

      // Create photo object with uploading state
      const photo: Photo = {
        id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        url: previewUrl,
        file,
        uploadedAt: new Date(),
        uploading: true,
      }

      newPhotos.push(photo)

      // Update UI immediately with preview
      if (onPhotosChange) {
        onPhotosChange([...photos, ...newPhotos])
      }

      // Upload to Supabase Storage
      try {
        const result = await uploadPhoto(file, uploadPath)

        if (result.error) {
          // Update with error state
          photo.uploading = false
          if (onPhotosChange) {
            onPhotosChange([...photos, ...newPhotos])
          }
          setUploadError(`${t('uploadFailed')}: ${result.error}`)
          continue
        }

        // Update with uploaded URL
        photo.url = result.url
        photo.path = result.path
        photo.uploading = false

        // Clean up preview URL
        URL.revokeObjectURL(previewUrl)

        if (onPhotosChange) {
          onPhotosChange([...photos, ...newPhotos])
        }
      } catch (error) {
        photo.uploading = false
        if (onPhotosChange) {
          onPhotosChange([...photos, ...newPhotos])
        }
        setUploadError(`${t('uploadFailed')}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }, [photos, maxPhotos, maxSizeMB, onPhotosChange, uploadPath, t])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleRemove = useCallback(async (id: string) => {
    const photoToRemove = photos.find(p => p.id === id)

    // Delete from Supabase Storage if it was uploaded
    if (photoToRemove?.path) {
      await deletePhoto(photoToRemove.path)
    }

    // Clean up preview URL if it exists
    if (photoToRemove?.url && photoToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(photoToRemove.url)
    }

    if (onPhotosChange) {
      const updatedPhotos = photos.filter(p => p.id !== id)
      onPhotosChange(updatedPhotos)
    }
  }, [photos, onPhotosChange])

  const handleDescriptionChange = useCallback((id: string, description: string) => {
    if (onPhotosChange) {
      const updatedPhotos = photos.map(p =>
        p.id === id ? { ...p, description } : p
      )
      onPhotosChange(updatedPhotos)
    }
  }, [photos, onPhotosChange])

  return (
    <div className={cn('space-y-3', className)}>
      {/* Upload area */}
      {photos.length < maxPhotos && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-6 text-center transition-colors',
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
            required && photos.length === 0 && 'border-orange-300 bg-orange-50/30'
          )}
        >
          <input
            type="file"
            id="photo-upload"
            className="hidden"
            accept="image/*"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          <label
            htmlFor="photo-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            {isDragging ? (
              <Upload className="w-8 h-8 text-blue-500" />
            ) : (
              <Camera className="w-8 h-8 text-gray-400" />
            )}
            <div className="text-sm">
              <p className="font-medium text-gray-700">
                {isDragging ? t('dropPhotos') : t('uploadPhotos')}
              </p>
              <p className="text-gray-500 mt-1">
                {t('uploadInstructions', { max: maxSizeMB })}
              </p>
            </div>
            <span className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors">
              {t('browse')}
            </span>
          </label>
        </div>
      )}

      {/* Error message */}
      {uploadError && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          <span>{uploadError}</span>
          <button
            onClick={() => setUploadError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Photo count */}
      {required && photos.length === 0 && (
        <p className="text-xs text-orange-600">
          {t('photoRequired')}
        </p>
      )}

      {/* Photos grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <img
                  src={photo.url}
                  alt={photo.description || t('photo')}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Remove button */}
              <button
                onClick={() => handleRemove(photo.id)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>

              {/* Description input */}
              <div className="mt-1">
                <input
                  type="text"
                  placeholder={t('addDescription')}
                  value={photo.description || ''}
                  onChange={(e) => handleDescriptionChange(photo.id, e.target.value)}
                  className="w-full text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo count indicator */}
      {photos.length > 0 && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            {photos.length} / {maxPhotos} {t('photos')}
          </span>
          {required && photos.length > 0 && (
            <span className="text-green-600">✓ {t('requirementMet')}</span>
          )}
        </div>
      )}
    </div>
  )
}
