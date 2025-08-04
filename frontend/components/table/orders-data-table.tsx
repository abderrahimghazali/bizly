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
  IconShoppingCart,
  IconBuilding,
  IconCalendar,
  IconCurrencyDollar,
  IconFileText,
  IconTruck,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Order, orderStatuses } from '@/lib/api/orders'

interface OrdersDataTableProps {
  data: Order[]
  loading?: boolean
  onDelete?: (orderId: number) => void
  onStatusChange?: (orderId: number, status: Order['status']) => void
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

export function OrdersDataTable({ data, loading = false, onDelete, onStatusChange }: OrdersDataTableProps) {
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  const columns: ColumnDef<Order>[] = React.useMemo(() => [
    {
      accessorKey: "order_number",
      header: ({ column }) => (
        <SortableHeader column={column}>
          <div className="flex items-center space-x-2">
            <IconShoppingCart className="h-4 w-4" />
            <span>Order</span>
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="min-w-0">
            <div className="font-medium text-sm">{order.order_number}</div>
            <div className="text-xs text-muted-foreground truncate max-w-[140px]">
              {order.title}
            </div>
            {order.quote && (
              <Badge variant="outline" className="text-xs mt-1">
                From Quote
              </Badge>
            )}
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
        const order = row.original
        return (
          <div className="min-w-0">
            <div className="font-medium text-sm truncate max-w-[120px]">
              {order.company?.name || '—'}
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
        const order = row.original
        const status = row.getValue("status") as Order['status']
        return (
          <div className="min-w-0">
            <Badge className={getStatusColor(status)} variant="secondary">
              {orderStatuses[status]}
            </Badge>
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
        const order = row.original
        return (
          <div className="text-right min-w-0 max-w-[100px]">
            <div className="font-medium text-sm">
              {formatCurrency(order.total_amount, order.currency)}
            </div>
          </div>
        )
      },
      size: 100,
    },
    {
      accessorKey: "order_date",
      header: ({ column }) => (
        <SortableHeader column={column}>
          Dates
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="min-w-0">
            <div className="text-sm">
              {new Date(order.order_date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: '2-digit'
              })}
            </div>
            {order.expected_delivery_date && (
              <div className="text-xs text-muted-foreground">
                Due: {new Date(order.expected_delivery_date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric'
                })}
              </div>
            )}
          </div>
        )
      },
    },
    {
      id: "status_actions",
      header: "Update Status",
      enableHiding: false,
      cell: ({ row }) => {
        const order = row.original

        return (
          <Select
            value={order.status}
            onValueChange={(value) => onStatusChange?.(order.id, value as Order['status'])}
          >
            <SelectTrigger className="w-[130px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(orderStatuses).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      },
      size: 140,
    },
    {
      id: "actions",
      header: "",
      enableHiding: false,
      cell: ({ row }) => {
        const order = row.original

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
              <DropdownMenuItem>
                <IconFileText className="mr-2 h-4 w-4" />
                Create Invoice
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
                    <AlertDialogTitle>Delete Order</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this order? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete?.(order.id)}
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
  ], [onDelete, onStatusChange])

  return (
    <DataTable
      columns={columns}
      data={data}
      entityName="orders"
      entityNameSingular="order"
      filterColumn="title"
      filterPlaceholder="Filter orders..."
      loading={loading}
      emptyMessage="No orders found."
    />
  )
}