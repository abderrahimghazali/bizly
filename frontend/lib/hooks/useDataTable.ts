"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'

export interface DataTableConfig<T> {
  entityName: string
  entityNameSingular: string
  filterColumn?: keyof T
  searchPlaceholder?: string
}

export interface DataTableActions<T> {
  onView?: (item: T) => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => Promise<void>
  onConvert?: (item: T) => void
  customActions?: Array<{
    label: string
    icon?: React.ComponentType<any>
    action: (item: T) => void
    condition?: (item: T) => boolean
    variant?: 'default' | 'destructive'
  }>
}

export interface UseDataTableProps<T> {
  initialData: T[]
  config: DataTableConfig<T>
  actions?: DataTableActions<T>
  onDataChange?: (data: T[]) => void
}

export interface UseDataTableReturn<T> {
  // Data state
  data: T[]
  filteredData: T[]
  loading: boolean
  
  // Filters
  searchTerm: string
  setSearchTerm: (term: string) => void
  filters: Record<string, string>
  setFilter: (key: string, value: string) => void
  clearFilters: () => void
  
  // Actions
  handleDelete: (item: T, getIdentifier: (item: T) => string | number) => Promise<void>
  handleBulkDelete: (items: T[], getIdentifier: (item: T) => string | number) => Promise<void>
  updateData: (newData: T[]) => void
  updateItem: (identifier: string | number, updateFn: (item: T) => T, getIdentifier: (item: T) => string | number) => void
  
  // Selection (for bulk operations)
  selectedItems: Set<string | number>
  toggleSelection: (identifier: string | number) => void
  selectAll: () => void
  clearSelection: () => void
  isAllSelected: boolean
  isIndeterminate: boolean
}

export function useDataTable<T>({
  initialData,
  config,
  actions,
  onDataChange
}: UseDataTableProps<T>): UseDataTableReturn<T> {
  const [data, setData] = useState<T[]>(initialData)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(new Set())

  // Update data when initialData changes
  useEffect(() => {
    setData(initialData)
  }, [initialData])

  // Apply filters and search
  const filteredData = useMemo(() => {
    let result = [...data]

    // Apply search
    if (searchTerm && config.filterColumn) {
      result = result.filter(item => {
        const value = item[config.filterColumn!]
        return String(value).toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== 'all' && value !== '') {
        result = result.filter(item => {
          const itemValue = (item as any)[key]
          return String(itemValue).toLowerCase() === value.toLowerCase()
        })
      }
    })

    return result
  }, [data, searchTerm, filters, config.filterColumn])

  const updateData = useCallback((newData: T[]) => {
    setData(newData)
    onDataChange?.(newData)
  }, [onDataChange])

  const updateItem = useCallback((
    identifier: string | number,
    updateFn: (item: T) => T,
    getIdentifier: (item: T) => string | number
  ) => {
    const newData = data.map(item => 
      getIdentifier(item) === identifier ? updateFn(item) : item
    )
    updateData(newData)
  }, [data, updateData])

  const handleDelete = useCallback(async (item: T, getIdentifier: (item: T) => string | number) => {
    try {
      setLoading(true)
      
      // Call the delete action if provided
      if (actions?.onDelete) {
        await actions.onDelete(item)
      }
      
      // Remove from local state
      const identifier = getIdentifier(item)
      const newData = data.filter(dataItem => getIdentifier(dataItem) !== identifier)
      updateData(newData)
      
      toast.success(`${config.entityNameSingular} deleted successfully`)
    } catch (error: any) {
      console.error(`Failed to delete ${config.entityNameSingular}:`, error)
      toast.error(error?.response?.data?.message || `Failed to delete ${config.entityNameSingular}`)
    } finally {
      setLoading(false)
    }
  }, [data, actions, config, updateData])

  const handleBulkDelete = useCallback(async (items: T[], getIdentifier: (item: T) => string | number) => {
    try {
      setLoading(true)
      
      // Process deletions
      for (const item of items) {
        if (actions?.onDelete) {
          await actions.onDelete(item)
        }
      }
      
      // Remove from local state
      const identifiers = new Set(items.map(getIdentifier))
      const newData = data.filter(item => !identifiers.has(getIdentifier(item)))
      updateData(newData)
      
      toast.success(`${items.length} ${config.entityName} deleted successfully`)
      clearSelection()
    } catch (error: any) {
      console.error(`Failed to delete ${config.entityName}:`, error)
      toast.error(error?.response?.data?.message || `Failed to delete ${config.entityName}`)
    } finally {
      setLoading(false)
    }
  }, [data, actions, config, updateData])

  const setFilter = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setFilters({})
  }, [])

  // Selection helpers
  const toggleSelection = useCallback((identifier: string | number) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(identifier)) {
        newSet.delete(identifier)
      } else {
        newSet.add(identifier)
      }
      return newSet
    })
  }, [])

  const selectAll = useCallback(() => {
    // We need the getIdentifier function to be passed to this hook
    // For now, we'll assume the identifier is 'id'
    const allIds = filteredData.map(item => (item as any).id)
    setSelectedItems(new Set(allIds))
  }, [filteredData])

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set())
  }, [])

  const isAllSelected = useMemo(() => {
    if (filteredData.length === 0) return false
    return filteredData.every(item => selectedItems.has((item as any).id))
  }, [filteredData, selectedItems])

  const isIndeterminate = useMemo(() => {
    const selectedCount = filteredData.filter(item => selectedItems.has((item as any).id)).length
    return selectedCount > 0 && selectedCount < filteredData.length
  }, [filteredData, selectedItems])

  return {
    // Data state
    data,
    filteredData,
    loading,
    
    // Filters
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    clearFilters,
    
    // Actions
    handleDelete,
    handleBulkDelete,
    updateData,
    updateItem,
    
    // Selection
    selectedItems,
    toggleSelection,
    selectAll,
    clearSelection,
    isAllSelected,
    isIndeterminate,
  }
}

// Hook for handling sheet/modal states
export function useSheetStates<T>() {
  const [viewSheetOpen, setViewSheetOpen] = useState(false)
  const [editSheetOpen, setEditSheetOpen] = useState(false)
  const [createSheetOpen, setCreateSheetOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<T | null>(null)

  const openViewSheet = useCallback((item: T) => {
    setSelectedItem(item)
    setViewSheetOpen(true)
  }, [])

  const openEditSheet = useCallback((item: T) => {
    setSelectedItem(item)
    setEditSheetOpen(true)
  }, [])

  const openCreateSheet = useCallback(() => {
    setSelectedItem(null)
    setCreateSheetOpen(true)
  }, [])

  const closeAllSheets = useCallback(() => {
    setViewSheetOpen(false)
    setEditSheetOpen(false)
    setCreateSheetOpen(false)
    setSelectedItem(null)
  }, [])

  return {
    // State
    viewSheetOpen,
    editSheetOpen,
    createSheetOpen,
    selectedItem,
    
    // Actions
    openViewSheet,
    openEditSheet,
    openCreateSheet,
    closeAllSheets,
    setViewSheetOpen,
    setEditSheetOpen,
    setCreateSheetOpen,
  }
}