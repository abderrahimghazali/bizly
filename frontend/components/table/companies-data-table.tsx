"use client"

import * as React from "react"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconLayoutColumns,
  IconEdit,
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
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

// Company interface
export interface Company {
  id: number
  name: string
  industry: string
  status: 'active' | 'inactive' | 'pending'
  email?: string
  phone?: string
  website?: string
  address?: string
  contact_person?: string
  created_at?: string
  updated_at?: string
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
        const contactPerson = row.getValue("contact_person") as string
        return contactPerson ? (
          <div className="flex items-center space-x-2">
            <IconUser className="h-4 w-4 text-muted-foreground" />
            <span>{contactPerson}</span>
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
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => router.push(`/crm/companies/${company.id}`)}
              >
                <IconEye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/crm/companies/${company.id}/edit`)}
              >
                <IconEdit className="mr-2 h-4 w-4" />
                Edit
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
  ], [handleCompanyDelete, router])

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter companies..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <IconLayoutColumns className="mr-2 h-4 w-4" />
              Columns
              <IconChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuItem
                    key={column.id}
                    className="capitalize"
                    onClick={() => column.toggleVisibility(!column.getIsVisible())}
                  >
                    {column.getIsVisible() ? "✓" : ""} {column.id}
                  </DropdownMenuItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No companies found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} of{" "}
          {table.getCoreRowModel().rows.length} companies
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <IconChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <IconChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <IconChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <IconChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}