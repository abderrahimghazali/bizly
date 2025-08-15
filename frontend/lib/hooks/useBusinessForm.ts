"use client"

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

export interface UseBusinessFormProps<T, CreateData = Partial<T>, UpdateData = Partial<T>> {
  initialData?: CreateData
  onSubmit: (data: CreateData | UpdateData) => Promise<{ success: boolean; data?: T; message?: string }>
  onSuccess?: (data: T) => void
  onError?: (error: any) => void
  resetOnSuccess?: boolean
  validateForm?: (data: CreateData | UpdateData) => string | null
}

export interface UseBusinessFormReturn<T, CreateData = Partial<T>, UpdateData = Partial<T>> {
  // Form state
  formData: CreateData | UpdateData
  setFormData: (data: CreateData | UpdateData | ((prev: CreateData | UpdateData) => CreateData | UpdateData)) => void
  updateField: <K extends keyof (CreateData | UpdateData)>(field: K, value: (CreateData | UpdateData)[K]) => void
  
  // Submission state
  isSubmitting: boolean
  hasErrors: boolean
  validationError: string | null
  
  // Actions
  handleSubmit: (e?: React.FormEvent) => Promise<void>
  resetForm: () => void
  validateAndSubmit: () => Promise<void>
}

export function useBusinessForm<T, CreateData = Partial<T>, UpdateData = Partial<T>>({
  initialData,
  onSubmit,
  onSuccess,
  onError,
  resetOnSuccess = true,
  validateForm
}: UseBusinessFormProps<T, CreateData, UpdateData>): UseBusinessFormReturn<T, CreateData, UpdateData> {
  const [formData, setFormData] = useState<CreateData | UpdateData>(initialData || {} as CreateData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const updateField = useCallback(<K extends keyof (CreateData | UpdateData)>(
    field: K, 
    value: (CreateData | UpdateData)[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear validation error when user makes changes
    if (validationError) {
      setValidationError(null)
    }
  }, [validationError])

  const resetForm = useCallback(() => {
    setFormData(initialData || {} as CreateData)
    setValidationError(null)
    setIsSubmitting(false)
  }, [initialData])

  const validateAndSubmit = useCallback(async () => {
    // Client-side validation
    if (validateForm) {
      const error = validateForm(formData)
      if (error) {
        setValidationError(error)
        return
      }
    }

    setValidationError(null)
    setIsSubmitting(true)

    try {
      const result = await onSubmit(formData)
      
      if (result.success && result.data) {
        toast.success(result.message || 'Operation completed successfully')
        onSuccess?.(result.data)
        
        if (resetOnSuccess) {
          resetForm()
        }
      } else {
        throw new Error(result.message || 'Operation failed')
      }
    } catch (error: any) {
      console.error('Form submission error:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred'
      toast.error(errorMessage)
      onError?.(error)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, validateForm, onSubmit, onSuccess, onError, resetForm, resetOnSuccess])

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    await validateAndSubmit()
  }, [validateAndSubmit])

  return {
    // Form state
    formData,
    setFormData,
    updateField,
    
    // Submission state
    isSubmitting,
    hasErrors: !!validationError,
    validationError,
    
    // Actions
    handleSubmit,
    resetForm,
    validateAndSubmit,
  }
}

// Common validation helpers
export const validators = {
  required: (value: any, fieldName: string) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} is required`
    }
    return null
  },
  
  email: (value: string) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Please enter a valid email address'
    }
    return null
  },
  
  minLength: (value: string, minLength: number, fieldName: string) => {
    if (value && value.length < minLength) {
      return `${fieldName} must be at least ${minLength} characters`
    }
    return null
  },
  
  maxLength: (value: string, maxLength: number, fieldName: string) => {
    if (value && value.length > maxLength) {
      return `${fieldName} must be no more than ${maxLength} characters`
    }
    return null
  },
  
  positiveNumber: (value: number, fieldName: string) => {
    if (value !== undefined && value < 0) {
      return `${fieldName} must be a positive number`
    }
    return null
  }
}

// Helper to combine multiple validations
export function combineValidations<T>(
  data: T,
  validations: Array<(data: T) => string | null>
): string | null {
  for (const validation of validations) {
    const error = validation(data)
    if (error) return error
  }
  return null
}