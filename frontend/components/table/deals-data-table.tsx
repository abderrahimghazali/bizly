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

  IconCurrencyDollar,
  IconBriefcase,
  IconBuilding,
  IconUser,
  IconAlertTriangle,
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
  DropdownMenuCheckboxItem,
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
import { toast } from "sonner"
import { Deal, dealsApi, dealStages } from "@/lib/api/deals"
import { useRouter } from "next/navigation"

// Sortable header component
function SortableHeader({ column, children }: { column: { toggleSorting: (ascending?: boolean) => void; getIsSorted: () => string | false }; children: React.ReactNode }) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="h-auto p-0 font-medium hover:bg-transparent"
    >
      <span className="flex items-center space-x-1">
        <span>{children}</span>
        {column.getIsSorted() === "asc" ? (
          <IconArrowUp className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <IconArrowDown className="ml-2 h-4 w-4" />
        ) : (
          <IconArrowsSort className="ml-2 h-4 w-4" />
        )}
      </span>
    </Button>
  )
}

// Stage badge component
function StageBadge({ stage }: { stage: Deal['stage'] }) {
  const variants: Record<Deal['stage'], string> = {
    qualified: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    proposal: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200", 
    negotiation: "bg-orange-100 text-orange-800 hover:bg-orange-200",
    closed_won: "bg-green-100 text-green-800 hover:bg-green-200",
    closed_lost: "bg-red-100 text-red-800 hover:bg-red-200",
  }

  const icons: Record<Deal['stage'], React.ReactNode> = {
    qualified: <IconBriefcase className="w-3 h-3" />,
    proposal: <IconCurrencyDollar className="w-3 h-3" />,
    negotiation: <IconUser className="w-3 h-3" />,
    closed_won: <IconBriefcase className="w-3 h-3" />,
    closed_lost: <IconBriefcase className="w-3 h-3" />,
  }

  return (
    <Badge className={`${variants[stage]} font-medium`}>
      {icons[stage]}
      <span className="ml-1">{dealStages[stage]}</span>
    </Badge>
  )
}

interface DealsDataTableProps {
  data: Deal[]
  onDataChange?: (updatedData: Deal[]) => void
}

export function DealsDataTable({ data: initialData, onDataChange }: DealsDataTableProps) {
  const [data, setData] = React.useState(() => initialData)
  const router = useRouter()

  // Update internal state when parent data changes (for filtering)
  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  const handleDealUpdate = (updatedDeal: Deal) => {
    setData(prevData => 
      prevData.map(deal => 
        deal.id === updatedDeal.id ? updatedDeal : deal
      )
    )
    onDataChange?.(data.map(deal => 
      deal.id === updatedDeal.id ? updatedDeal : deal
    ))
  }

  const handleDealDelete = async (dealId: number, dealTitle: string) => {
    try {
      await dealsApi.delete(dealId);
      const newData = data.filter(deal => deal.id !== dealId);
      setData(newData);
      onDataChange?.(newData);
      toast.success(`Deal "${dealTitle}" deleted successfully`);
    } catch (error) {
      toast.error("Failed to delete deal");
    }
  }



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const columns: ColumnDef<Deal>[] = React.useMemo(() => [
    {
      accessorKey: "title",
      header: ({ column }) => <SortableHeader column={column}>Title</SortableHeader>,
      cell: ({ row }) => {
        const deal = row.original
        return (
          <div className="flex flex-col">
            <span className="font-medium">{deal.title}</span>
            {deal.description && (
              <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                {deal.description}
              </span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "amount",
      header: ({ column }) => <SortableHeader column={column}>Amount</SortableHeader>,
      cell: ({ row }) => {
        const deal = row.original
        return (
          <div className="flex flex-col">
            <span className="font-medium">{formatCurrency(deal.amount)}</span>
            <span className="text-sm text-muted-foreground">
              {deal.probability}% • {formatCurrency(deal.weighted_amount)}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "stage",
      header: "Stage",
      cell: ({ row }) => <StageBadge stage={row.original.stage} />,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "expected_close_date",
      header: ({ column }) => <SortableHeader column={column}>Close Date</SortableHeader>,
      cell: ({ row }) => {
        const deal = row.original
        const isOverdue = deal.is_overdue
        const daysUntilClose = deal.days_until_close
        
        return (
          <div className="flex flex-col">
            <span className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
              {formatDate(deal.expected_close_date)}
            </span>
            {isOverdue ? (
              <span className="text-sm text-red-600 flex items-center">
                <IconAlertTriangle className="w-3 h-3 mr-1" />
                {Math.abs(daysUntilClose)} days overdue
              </span>
            ) : daysUntilClose >= 0 ? (
              <span className="text-sm text-muted-foreground">
                {daysUntilClose === 0 ? 'Today' : `${daysUntilClose} days left`}
              </span>
            ) : null}
          </div>
        )
      },
    },
    {
      accessorKey: "company",
      header: "Company",
      cell: ({ row }) => {
        const deal = row.original
        return deal.company ? (
          <div className="flex items-center">
            <IconBuilding className="w-4 h-4 mr-2 text-muted-foreground" />
            <span>{deal.company.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">No company</span>
        )
      },
    },
    {
      accessorKey: "assigned_user",
      header: "Assigned To",
      cell: ({ row }) => {
        const deal = row.original
        return deal.assigned_user ? (
          <div className="flex items-center">
            <IconUser className="w-4 h-4 mr-2 text-muted-foreground" />
            <span>{deal.assigned_user.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Unassigned</span>
        )
      },
    },
    {
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => {
        const source = row.original.source
        return source ? (
          <Badge variant="outline">{source}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
              >
                <IconDotsVertical />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem
                onClick={() => router.push(`/crm/deals/${row.original.id}/view`)}
              >
                <IconEye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/crm/deals/${row.original.id}/edit`)}
              >
                <IconEdit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <IconTrash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Deal</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete the deal &quot;{row.original.title}&quot;? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDealDelete(row.original.id, row.original.title)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [handleDealDelete, router])

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

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
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
  })

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        
        <div className="flex items-center space-x-2 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns className="mr-2 h-4 w-4" />
                View
                <IconChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" && column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
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
                  No deals found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value))
              }}
              className="h-8 w-[70px] rounded-md border border-input bg-background px-2 py-1 text-sm"
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <IconChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <IconChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <IconChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <IconChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}