"use client"

import * as React from "react"
import {
  IconDotsVertical,
  IconTrash,
  IconEye,
  IconArrowUp,
  IconArrowDown,
  IconArrowsSort,
  IconBuilding,
  IconUser,
  IconBriefcase,
  IconMail,
  IconPhone,
} from "@tabler/icons-react"
import {
  ColumnDef,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { CompanyDetailsSheet } from '@/components/crm/company-details-sheet'
import { Company as ApiCompany } from '@/lib/api/companies'
import { DataTable } from '@/components/ui/data-table'

// Company interface for the data table
export interface Company {
  id: number
  name: string
  industry: string
  status: 'active' | 'inactive' | 'prospect'
  email?: string
  phone?: string
  website?: string
  address?: string
  contact_person?: string
  created_at?: string
  updated_at?: string
  // Add primary contact
  primary_contact?: {
    id: number
    full_name: string
    email?: string
    phone?: string
    position?: string
  }
}

interface CompaniesDataTableProps {
  data: Company[]
  onDataChange?: (data: Company[]) => void
}

function SortableHeader({ 
  column, 
  children 
}: { 
  column: any
  children: React.ReactNode 
}) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="h-auto p-0 font-semibold hover:bg-transparent"
    >
      {children}
      {column.getIsSorted() === "asc" ? (
        <IconArrowUp className="ml-2 h-4 w-4" />
      ) : column.getIsSorted() === "desc" ? (
        <IconArrowDown className="ml-2 h-4 w-4" />
      ) : (
        <IconArrowsSort className="ml-2 h-4 w-4" />
      )}
    </Button>
  )
}

export function CompaniesDataTable({ data: initialData, onDataChange }: CompaniesDataTableProps) {
  const [data, setData] = React.useState(() => initialData)
  const router = useRouter()
  const [selectedCompanyId, setSelectedCompanyId] = React.useState<number | null>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  
  // Update internal state when parent data changes (for filtering)
  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  const handleCompanyDelete = React.useCallback(async (companyId: number) => {
    try {
      // Here you would call the API to delete the company
      // await companiesApi.delete(companyId)
      
      const updatedData = data.filter(company => company.id !== companyId)
      setData(updatedData)
      onDataChange?.(updatedData)
      toast.success('Company deleted successfully')
    } catch (error) {
      console.error('Failed to delete company:', error)
      toast.error('Failed to delete company')
    }
  }, [data, onDataChange])

  const handleViewDetails = React.useCallback((companyId: number) => {
    setSelectedCompanyId(companyId)
    setIsSheetOpen(true)
  }, [])

  const columns: ColumnDef<Company>[] = React.useMemo(() => [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <SortableHeader column={column}>
          <div className="flex items-center space-x-2">
            <IconBuilding className="h-4 w-4" />
            <span>Company Name</span>
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const company = row.original
        return (
          <div className="flex items-center space-x-2">
            <IconBuilding className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{company.name}</div>
              {company.website && (
                <div className="text-sm text-muted-foreground">{company.website}</div>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "industry",
      header: ({ column }) => (
        <SortableHeader column={column}>
          <div className="flex items-center space-x-2">
            <IconBriefcase className="h-4 w-4" />
            <span>Industry</span>
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center space-x-2">
            <IconBriefcase className="h-4 w-4 text-muted-foreground" />
            <span>{row.getValue("industry")}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <SortableHeader column={column}>
          Status
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge 
            variant={
              status === 'active' ? 'default' : 
              status === 'inactive' ? 'destructive' : 
              status === 'prospect' ? 'secondary' : 
              'secondary'
            }
          >
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "contact_person",
      header: ({ column }) => (
        <SortableHeader column={column}>
          <div className="flex items-center space-x-2">
            <IconUser className="h-4 w-4" />
            <span>Contact Person</span>
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const company = row.original
        const contactPerson = company.contact_person || company.primary_contact?.full_name
        return contactPerson ? (
          <div className="flex items-center space-x-2">
            <IconUser className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium text-sm">{contactPerson}</div>
              {company.primary_contact?.position && (
                <div className="text-xs text-muted-foreground">{company.primary_contact.position}</div>
              )}
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Contact Info",
      cell: ({ row }) => {
        const company = row.original
        return (
          <div className="space-y-1">
            {company.email && (
              <div className="flex items-center space-x-2 text-sm">
                <IconMail className="h-3 w-3 text-muted-foreground" />
                <span>{company.email}</span>
              </div>
            )}
            {company.phone && (
              <div className="flex items-center space-x-2 text-sm">
                <IconPhone className="h-3 w-3 text-muted-foreground" />
                <span>{company.phone}</span>
              </div>
            )}
            {!company.email && !company.phone && (
              <span className="text-muted-foreground">—</span>
            )}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        const company = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <IconDotsVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleViewDetails(company.id)}
              >
                <IconEye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-600 focus:text-red-600"
                  >
                    <IconTrash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete the company &quot;{company.name}&quot;? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleCompanyDelete(company.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [handleCompanyDelete, handleViewDetails, router])

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        entityName="companies"
        entityNameSingular="company"
        filterColumn="name"
        filterPlaceholder="Filter companies..."
      />

      <CompanyDetailsSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        companyId={selectedCompanyId}
        onCompanyUpdate={(updatedCompany: ApiCompany) => {
          const updatedData = data.map(company => 
            company.id === updatedCompany.id ? {
              ...company,
              name: updatedCompany.name,
              industry: updatedCompany.industry || '',
              status: updatedCompany.status,
              email: updatedCompany.email,
              phone: updatedCompany.phone,
              website: updatedCompany.website,
              address: updatedCompany.address,
            } : company
          )
          setData(updatedData)
          onDataChange?.(updatedData)
        }}
      />
    </>
  )
}