'use client'

/**
 * Photo Upload Component
 *
 * Reusable component for uploading photos for findings and actions.
 * Supports drag & drop, preview, and progress indication.
 */

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useTranslations } from 'next-intl'

interface PhotoUploadProps {
  entityType: 'finding' | 'action'
  entityId: string
  photoType: 'before' | 'after' | 'verification' | 'evidence'
  currentPhoto?: string
  onPhotoUploaded?: (url: string) => void
  onPhotoRemoved?: () => void
  disabled?: boolean
  accept?: string
  maxSize?: number // in MB
}

export function PhotoUpload({
  entityType,
  entityId,
  photoType,
  currentPhoto,
  onPhotoUploaded,
  onPhotoRemoved,
  disabled = false,
  accept = 'image/jpeg,image/png,image/webp',
  maxSize = 5
}: PhotoUploadProps) {
  const t = useTranslations()
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhoto || null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    setError(null)

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(t('supervision.photoUpload.errorSize', { maxSize: maxSize.toString() }))
      return
    }

    // Validate file type
    const allowedTypes = accept.split(',')
    if (!allowedTypes.includes(file.type)) {
      setError(t('supervision.photoUpload.errorType'))
      return
    }

    setIsUploading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to server
      const formData = new FormData()
      formData.append('file', file)
      formData.append('entityType', entityType)
      formData.append('entityId', entityId)
      formData.append('photoType', photoType)

      const response = await fetch('/api/supervision/photos', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setPreviewUrl(data.url)
      onPhotoUploaded?.(data.url)

    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
      // Reset preview on error
      if (!currentPhoto) {
        setPreviewUrl(null)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleRemove = async () => {
    setPreviewUrl(null)
    setError(null)
    onPhotoRemoved?.()

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getPhotoTypeLabel = () => {
    const labels = {
      before: t('supervision.photoUpload.before'),
      after: t('supervision.photoUpload.after'),
      verification: t('supervision.photoUpload.verification'),
      evidence: t('supervision.photoUpload.evidence')
    }
    return labels[photoType]
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          {getPhotoTypeLabel()}
        </label>
        {previewUrl && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isUploading}
          >
            <X className="h-4 w-4 mr-1" />
            {t('common.remove')}
          </Button>
        )}
      </div>

      {!previewUrl ? (
        <Card
          className={`border-2 border-dashed p-8 transition-colors cursor-pointer ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDrop={disabled ? undefined : handleDrop}
          onDragOver={disabled ? undefined : handleDragOver}
          onDragLeave={disabled ? undefined : handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            {isUploading ? (
              <Loader2 className="h-12 w-12 animate-muted text-muted-foreground" />
            ) : (
              <div className={`p-4 rounded-full ${
                isDragging ? 'bg-primary/10' : 'bg-muted'
              }`}>
                {isDragging ? (
                  <Upload className="h-8 w-8 text-primary" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
            )}

            <div className="space-y-1">
              <p className="text-sm font-medium">
                {isUploading
                  ? t('supervision.photoUpload.uploading')
                  : isDragging
                    ? t('supervision.photoUpload.dropHere')
                    : t('supervision.photoUpload.dragDrop')
                }
              </p>
              <p className="text-xs text-muted-foreground">
                {t('supervision.photoUpload.allowedFormats')} • {maxSize}MB {t('common.max')}
              </p>
            </div>

            <Button type="button" variant="secondary" size="sm" disabled={disabled || isUploading}>
              <Upload className="h-4 w-4 mr-2" />
              {t('supervision.photoUpload.browse')}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            disabled={disabled || isUploading}
            className="hidden"
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="relative aspect-video bg-muted">
            <img
              src={previewUrl}
              alt={getPhotoTypeLabel()}
              className="w-full h-full object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
          </div>
        </Card>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

/**
 * Photo Gallery Component
 *
 * Displays multiple photos in a grid layout.
 */

interface PhotoGalleryProps {
  photos: string[]
  onRemove?: (index: number) => void
  disabled?: boolean
}

export function PhotoGallery({ photos, onRemove, disabled }: PhotoGalleryProps) {
  const t = useTranslations()

  if (photos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">{t('supervision.photoUpload.noPhotos')}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {photos.map((photo, index) => (
        <Card key={index} className="overflow-hidden relative group">
          <div className="aspect-square relative">
            <img
              src={photo}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {!disabled && onRemove && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
