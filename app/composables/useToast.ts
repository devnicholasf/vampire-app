// ============================================
// useToast - Sistema Profissional de Notificações
// ============================================

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  persistent?: boolean
}

export const useToast = () => {
  const toasts = useState<Toast[]>('toasts', () => [])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newToast: Toast = {
      id,
      duration: 4000,
      persistent: false,
      ...toast
    }

    toasts.value.push(newToast)

    // Auto remove se não for persistente
    if (!newToast.persistent && newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }

  const removeToast = (id: string) => {
    toasts.value = toasts.value.filter(toast => toast.id !== id)
  }

  const clearAllToasts = () => {
    toasts.value = []
  }

  // Métodos de conveniência
  const success = (title: string, message?: string, duration: number = 4000) => {
    return addToast({ type: 'success', title, message, duration, persistent: false })
  }

  const error = (title: string, message?: string, persistent: boolean = false, duration?: number) => {
    return addToast({ 
      type: 'error', 
      title, 
      message, 
      persistent,
      duration: persistent ? undefined : (duration || 4000)
    })
  }

  const warning = (title: string, message?: string, duration: number = 4000) => {
    return addToast({ type: 'warning', title, message, duration, persistent: false })
  }

  const info = (title: string, message?: string, duration: number = 4000) => {
    return addToast({ type: 'info', title, message, duration, persistent: false })
  }

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info
  }
}