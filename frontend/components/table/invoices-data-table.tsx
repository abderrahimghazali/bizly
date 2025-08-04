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
  IconCreditCard,
  IconAlertCircle,
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
import { DataTable } from '@/components/ui/data-table'
import { Invoice, invoiceStatuses } from '@/lib/api/invoices'

interface InvoicesDataTableProps {
  data: Invoice[]
  loading?: boolean
  onDelete?: (invoiceId: number) => void
  onMarkAsPaid?: (invoice: Invoice) => void
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

export function InvoicesDataTable({ data, loading = false, onDelete, onMarkAsPaid }: InvoicesDataTableProps) {
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partially_paid': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  const isOverdue = (invoice: Invoice) => {
    return new Date(invoice.due_date) < new Date() && 
           invoice.status !== 'paid' && 
           invoice.status !== 'cancelled'
  }

  const columns: ColumnDef<Invoice>[] = React.useMemo(() => [
    {
      accessorKey: "invoice_number",
      header: ({ column }) => (
        <SortableHeader column={column}>
          <div className="flex items-center space-x-2">
            <IconFileText className="h-4 w-4" />
            <span>Invoice</span>
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const invoice = row.original
        return (
          <div className="min-w-0">
            <div className="font-medium text-sm">{invoice.invoice_number}</div>
            <div className="text-xs text-muted-foreground truncate max-w-[140px]">
              {invoice.title}
            </div>
            <div className="flex gap-1 mt-1">
              {invoice.order && (
                <Badge variant="outline" className="text-xs">
                  From Order
                </Badge>
              )}
              {invoice.quote && (
                <Badge variant="outline" className="text-xs">
                  From Quote
                </Badge>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "company.name",
      header: ({ column }) => (
        <SortableHeader column={column}>
          Company
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const invoice = row.original
        return (
          <div className="min-w-0">
            <div className="font-medium text-sm truncate max-w-[120px]">
              {invoice.company?.name || '—'}
            </div>
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
        const invoice = row.original
        const status = row.getValue("status") as Invoice['status']
        const overdue = isOverdue(invoice)
        return (
          <div className="min-w-0">
            <Badge className={getStatusColor(status)} variant="secondary">
              {invoiceStatuses[status]}
            </Badge>
            {overdue && (
              <div className="flex items-center mt-1">
                <Badge className="bg-red-100 text-red-800 text-xs">
                  <IconAlertCircle className="mr-1 h-3 w-3" />
                  Overdue
                </Badge>
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "total_amount",
      header: ({ column }) => (
        <SortableHeader column={column}>
          Amount
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const invoice = row.original
        return (
          <div className="text-right min-w-0 max-w-[110px]">
            <div className="font-medium text-sm">
              {formatCurrency(invoice.total_amount, invoice.currency)}
            </div>
            {invoice.due_amount > 0 && (
              <div className="text-xs text-red-600">
                Due: {formatCurrency(invoice.due_amount, invoice.currency)}
              </div>
            )}
          </div>
        )
      },
      size: 110,
    },
    {
      accessorKey: "invoice_date",
      header: ({ column }) => (
        <SortableHeader column={column}>
          Dates
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const invoice = row.original
        const dueDate = new Date(invoice.due_date)
        const overdue = isOverdue(invoice)
        return (
          <div className="min-w-0">
            <div className="text-sm">
              {new Date(invoice.invoice_date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: '2-digit'
              })}
            </div>
            <div className={`text-xs ${overdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
              Due: {dueDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric'
              })}
            </div>
          </div>
        )
      },
    },
    {
      id: "payment_action",
      header: "Payment",
      enableHiding: false,
      cell: ({ row }) => {
        const invoice = row.original

        if (invoice.due_amount <= 0) {
          return <span className="text-muted-foreground text-xs">Fully Paid</span>
        }

        return (
          <Button 
            size="sm" 
            onClick={() => onMarkAsPaid?.(invoice)}
            className="bg-green-600 hover:bg-green-700 h-8 text-xs px-2"
          >
            <IconCreditCard className="mr-1 h-3 w-3" />
            Pay
          </Button>
        )
      },
      size: 100,
    },
    {
      id: "actions",
      header: "",
      enableHiding: false,
      cell: ({ row }) => {
        const invoice = row.original

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
              {invoice.due_amount > 0 && (
                <DropdownMenuItem onClick={() => onMarkAsPaid?.(invoice)}>
                  <IconCreditCard className="mr-2 h-4 w-4" />
                  Record Payment
                </DropdownMenuItem>
              )}
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
                    <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this invoice? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete?.(invoice.id)}
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
  ], [onDelete, onMarkAsPaid])

  return (
    <DataTable
      columns={columns}
      data={data}
      entityName="invoices"
      entityNameSingular="invoice"
      filterColumn="title"
      filterPlaceholder="Filter invoices..."
      loading={loading}
      emptyMessage="No invoices found."
    />
  )
}