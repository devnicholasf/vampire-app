// ============================================
// useUpload - Gerenciamento de Upload de Arquivos
// ============================================

// @ts-ignore - Auto-importado pelo Nuxt
import type { MediaFile, MediaType, ApiResponse } from '~/types'

export const useUpload = (campaignId?: string) => {
  // @ts-ignore - Auto-importado pelo Nuxt
  const { token } = useAuth()
  
  // @ts-ignore - Auto-importado pelo Nuxt
  const uploading = useState<boolean>('upload-loading', () => false)
  // @ts-ignore - Auto-importado pelo Nuxt
  const progress = useState<number>('upload-progress', () => 0)
  // @ts-ignore - Auto-importado pelo Nuxt
  const error = useState<string | null>('upload-error', () => null)

  // ============================================
  // Validar arquivo
  // ============================================
  const validateFile = (file: File, maxSizeMB: number = 10): { valid: boolean; error?: string } => {
    // Validar tamanho
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `Arquivo muito grande. Máximo: ${maxSizeMB}MB`
      }
    }

    // Validar tipo
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'application/pdf',
      'text/plain'
    ]

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Tipo de arquivo não permitido'
      }
    }

    return { valid: true }
  }

  // ============================================
  // Comprimir imagem (client-side)
  // ============================================
  const compressImage = async (file: File, maxWidth: number = 1920): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          if (width > maxWidth) {
            height *= maxWidth / width
            width = maxWidth
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)

          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              reject(new Error('Erro ao comprimir imagem'))
            }
          }, 'image/jpeg', 0.85)
        }
        
        img.onerror = () => reject(new Error('Erro ao carregar imagem'))
        img.src = e.target?.result as string
      }

      reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
      reader.readAsDataURL(file)
    })
  }

  // ============================================
  // Upload de arquivo
  // ============================================
  const uploadFile = async (
    file: File,
    type: MediaType,
    compress: boolean = true
  ): Promise<{ success: boolean; data?: MediaFile; error?: string }> => {
    uploading.value = true
    progress.value = 0
    error.value = null

    try {
      // Validar arquivo
      const validation = validateFile(file)
      if (!validation.valid) {
        error.value = validation.error || 'Arquivo inválido'
        return { success: false, error: error.value }
      }

      // Comprimir imagem se necessário
      let fileToUpload = file
      if (compress && file.type.startsWith('image/')) {
        try {
          fileToUpload = await compressImage(file)
        } catch (e) {
          console.warn('Não foi possível comprimir a imagem, usando original')
        }
      }

      // Criar FormData
      const formData = new FormData()
      formData.append('file', fileToUpload)
      formData.append('type', type)
      if (campaignId) {
        formData.append('campaignId', campaignId)
      }

      // Upload com progresso
      // @ts-ignore - Auto-importado pelo Nuxt
      const response = await $fetch<ApiResponse<MediaFile>>('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        body: formData,
        onUploadProgress: (event: any) => {
          if (event.total) {
            progress.value = Math.round((event.loaded / event.total) * 100)
          }
        }
      })

      if (response.success && response.data) {
        progress.value = 100
        return { success: true, data: response.data }
      } else {
        error.value = response.error || 'Erro ao fazer upload'
        return { success: false, error: error.value }
      }
    } catch (e: any) {
      error.value = e.message || 'Erro ao fazer upload'
      return { success: false, error: error.value }
    } finally {
      uploading.value = false
    }
  }

  // ============================================
  // Upload de múltiplos arquivos
  // ============================================
  const uploadMultiple = async (
    files: File[],
    type: MediaType,
    compress: boolean = true
  ): Promise<{ success: boolean; data?: MediaFile[]; errors?: string[] }> => {
    const results: MediaFile[] = []
    const errors: string[] = []

    for (const file of files) {
      const result = await uploadFile(file, type, compress)
      if (result.success && result.data) {
        results.push(result.data)
      } else {
        errors.push(`${file.name}: ${result.error}`)
      }
    }

    return {
      success: errors.length === 0,
      data: results,
      errors: errors.length > 0 ? errors : undefined
    }
  }

  // ============================================
  // Deletar arquivo
  // ============================================
  const deleteFile = async (fileId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // @ts-ignore - Auto-importado pelo Nuxt
      const response = await $fetch<ApiResponse>(`/api/upload/${fileId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      if (response.success) {
        return { success: true }
      } else {
        return { success: false, error: response.error || 'Erro ao deletar arquivo' }
      }
    } catch (e: any) {
      return { success: false, error: e.message || 'Erro ao deletar arquivo' }
    }
  }

  // ============================================
  // Buscar arquivos da campanha
  // ============================================
  const fetchCampaignFiles = async (
    campaignId: string,
    type?: MediaType
  ): Promise<{ success: boolean; data?: MediaFile[]; error?: string }> => {
    try {
      const url = type 
        ? `/api/upload/campaign/${campaignId}?type=${type}`
        : `/api/upload/campaign/${campaignId}`

      // @ts-ignore - Auto-importado pelo Nuxt
      const response = await $fetch<ApiResponse<MediaFile[]>>(url, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      if (response.success && response.data) {
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.error || 'Erro ao buscar arquivos' }
      }
    } catch (e: any) {
      return { success: false, error: e.message || 'Erro ao buscar arquivos' }
    }
  }

  return {
    // State
    // @ts-ignore - Auto-importado pelo Nuxt
    uploading: readonly(uploading),
    // @ts-ignore - Auto-importado pelo Nuxt
    progress: readonly(progress),
    // @ts-ignore - Auto-importado pelo Nuxt
    error: readonly(error),

    // Methods
    validateFile,
    compressImage,
    uploadFile,
    uploadMultiple,
    deleteFile,
    fetchCampaignFiles
  }
}
