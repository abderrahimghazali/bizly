"use client"

import * as React from "react"
import {
  IconDotsVertical,
  IconTrash,
  IconEye,
  IconEdit,
  IconArrowUp,
  IconArrowDown,
  IconArrowsSort,
  IconFileText,
  IconBuilding,
  IconCalendar,
  IconCurrencyDollar,
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
import { DataTable } from '@/components/ui/data-table'
import { Quote, quoteStatuses } from '@/lib/api/quotes'

interface QuotesDataTableProps {
  data: Quote[]
  loading?: boolean
  onDelete?: (quoteId: number) => void
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

export function QuotesDataTable({ data, loading = false, onDelete }: QuotesDataTableProps) {
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const getStatusColor = (status: Quote['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  const columns: ColumnDef<Quote>[] = React.useMemo(() => [
    {
      accessorKey: "quote_number",
      header: ({ column }) => (
        <SortableHeader column={column}>
          <div className="flex items-center space-x-2">
            <IconFileText className="h-4 w-4" />
            <span>Quote #</span>
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const quote = row.original
        return (
          <div className="flex items-center space-x-2">
            <IconFileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{quote.quote_number}</div>
              <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                {quote.title}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "company.name",
      header: ({ column }) => (
        <SortableHeader column={column}>
          <div className="flex items-center space-x-2">
            <IconBuilding className="h-4 w-4" />
            <span>Company</span>
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const quote = row.original
        return (
          <div className="flex items-center space-x-2">
            <IconBuilding className="h-4 w-4 text-muted-foreground" />
            <span>{quote.company?.name || '—'}</span>
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
        const status = row.getValue("status") as Quote['status']
        return (
          <Badge className={getStatusColor(status)}>
            {quoteStatuses[status]}
          </Badge>
        )
      },
    },
    {
      accessorKey: "total_amount",
      header: ({ column }) => (
        <SortableHeader column={column}>
          <div className="flex items-center space-x-2">
            <IconCurrencyDollar className="h-4 w-4" />
            <span>Amount</span>
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const quote = row.original
        return (
          <div className="flex items-center space-x-2">
            <IconCurrencyDollar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {formatCurrency(quote.total_amount, quote.currency)}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "quote_date",
      header: ({ column }) => (
        <SortableHeader column={column}>
          <div className="flex items-center space-x-2">
            <IconCalendar className="h-4 w-4" />
            <span>Quote Date</span>
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const quote = row.original
        return (
          <div className="flex items-center space-x-2">
            <IconCalendar className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(quote.quote_date).toLocaleDateString()}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "expiry_date",
      header: ({ column }) => (
        <SortableHeader column={column}>
          <div className="flex items-center space-x-2">
            <IconCalendar className="h-4 w-4" />
            <span>Expires</span>
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const quote = row.original
        const expiryDate = new Date(quote.expiry_date)
        const isExpired = expiryDate < new Date()
        return (
          <div className="flex items-center space-x-2">
            <IconCalendar className="h-4 w-4 text-muted-foreground" />
            <span className={isExpired ? 'text-red-600' : ''}>
              {expiryDate.toLocaleDateString()}
            </span>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        const quote = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <IconDotsVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <IconEye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem>
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
                    <AlertDialogTitle>Delete Quote</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this quote? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete?.(quote.id)}
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
  ], [onDelete])

  return (
    <DataTable
      columns={columns}
      data={data}
      entityName="quotes"
      entityNameSingular="quote"
      filterColumn="title"
      filterPlaceholder="Filter quotes..."
      loading={loading}
      emptyMessage="No quotes found."
    />
  )
}