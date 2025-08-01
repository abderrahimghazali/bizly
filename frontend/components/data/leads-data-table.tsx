"use client"

import * as React from "react"
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
import { 
  IconArrowUp, 
  IconArrowDown, 
  IconArrowsSort,
  IconDotsVertical,
  IconEye,
  IconEdit,
  IconPhone,
  IconMail,
  IconTrash,
  IconBuilding,
  IconCalendar,
  IconClock,
  IconCircleCheck,
  IconCircleX,
  IconTrendingUp
} from "@tabler/icons-react"

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
import { toast } from "sonner"
import { Lead, leadsApi } from "@/lib/api/leads"

function SortableHeader({ column, children }: { column: any; children: React.ReactNode }) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="h-auto p-0 font-medium hover:bg-transparent"
    >
      <span className="flex items-center space-x-1">
        <span>{children}</span>
        {column.getIsSorted() === "asc" ? (
          <IconArrowUp className="h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <IconArrowDown className="h-4 w-4" />
        ) : (
          <IconArrowsSort className="h-4 w-4 opacity-50" />
        )}
      </span>
    </Button>
  )
}

interface LeadsDataTableProps {
  data: Lead[]
  onDataChange: (data: Lead[]) => void
}

export function LeadsDataTable({ data, onDataChange }: LeadsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'contacted': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'qualified': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'proposal': return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'negotiation': return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      case 'won': return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200';
      case 'lost': return 'bg-red-100 text-red-800 hover:bg-red-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <IconClock className="h-3 w-3" />;
      case 'contacted': return <IconPhone className="h-3 w-3" />;
      case 'qualified': return <IconCircleCheck className="h-3 w-3" />;
      case 'proposal': return <IconEdit className="h-3 w-3" />;
      case 'negotiation': return <IconTrendingUp className="h-3 w-3" />;
      case 'won': return <IconCircleCheck className="h-3 w-3" />;
      case 'lost': return <IconCircleX className="h-3 w-3" />;
      default: return <IconClock className="h-3 w-3" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleLeadDelete = async (leadId: number, leadName: string) => {
    try {
      await leadsApi.delete(leadId);
      const updatedData = data.filter(lead => lead.id !== leadId);
      onDataChange(updatedData);
      toast.success(`Lead "${leadName}" has been deleted successfully`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete lead');
    }
  };



  const columns: ColumnDef<Lead>[] = React.useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <SortableHeader column={column}>Lead</SortableHeader>
        ),
        cell: ({ row }) => {
          const lead = row.original;
          return (
            <div>
              <div className="font-medium">{lead.name}</div>
              <div className="text-sm text-muted-foreground flex items-center space-x-1">
                <IconMail className="h-3 w-3" />
                <span>{lead.email}</span>
              </div>
              {lead.phone && (
                <div className="text-sm text-muted-foreground flex items-center space-x-1 mt-1">
                  <IconPhone className="h-3 w-3" />
                  <span>{lead.phone}</span>
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "company",
        header: ({ column }) => (
          <SortableHeader column={column}>Company</SortableHeader>
        ),
        cell: ({ row }) => {
          const lead = row.original;
          return (
            <div className="flex items-center space-x-1">
              <IconBuilding className="h-3 w-3 text-muted-foreground" />
              <span>{lead.company || 'N/A'}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <SortableHeader column={column}>Status</SortableHeader>
        ),
        cell: ({ row }) => {
          const lead = row.original;
          return (
            <Badge className={`${getStatusColor(lead.status)} flex items-center space-x-1 w-fit`}>
              {getStatusIcon(lead.status)}
              <span className="capitalize">{lead.status}</span>
            </Badge>
          );
        },
      },
      {
        accessorKey: "source",
        header: "Source",
        cell: ({ row }) => {
          const lead = row.original;
          return <span className="text-sm">{lead.source || 'N/A'}</span>;
        },
      },
      {
        accessorKey: "value",
        header: ({ column }) => (
          <SortableHeader column={column}>Value</SortableHeader>
        ),
        cell: ({ row }) => {
          const lead = row.original;
          return <span className="font-medium">{formatCurrency(lead.value)}</span>;
        },
      },
      {
        accessorKey: "last_contact",
        header: ({ column }) => (
          <SortableHeader column={column}>Last Contact</SortableHeader>
        ),
        cell: ({ row }) => {
          const lead = row.original;
          return (
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <IconCalendar className="h-3 w-3" />
              <span>{lead.last_contact ? formatDate(lead.last_contact) : 'Never'}</span>
            </div>
          );
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const lead = row.original;

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
                <DropdownMenuItem>
                  <IconEye className="mr-2 h-4 w-4" />
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <IconEdit className="mr-2 h-4 w-4" />
                  Edit lead
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <IconPhone className="mr-2 h-4 w-4" />
                  Call lead
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <IconMail className="mr-2 h-4 w-4" />
                  Send email
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
                      <AlertDialogTitle>Delete Lead</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete <strong>{lead.name}</strong>? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60"
                        onClick={() => handleLeadDelete(lead.id, lead.name)}
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
    ],
    [data, handleLeadDelete]
  )

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
          placeholder="Filter leads..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} total leads
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}