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
import { Deal, dealsApi, dealStages, AssignableUser } from "@/lib/api/deals"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

// Source label helper function
function getSourceLabel(source: string) {
  const sourceLabels: Record<string, string> = {
    website: 'Website',
    referral: 'Referral',
    social_media: 'Social Media',
    email_campaign: 'Email Campaign',
    cold_call: 'Cold Call',
    trade_show: 'Trade Show',
    other: 'Other',
  };
  return sourceLabels[source] || source;
}

interface DealsDataTableProps {
  data: Deal[]
  assignableUsers: AssignableUser[]
  onDataChange?: (updatedData: Deal[]) => void
  onAssignDeal?: (dealId: number, userId: number | null) => void
  onViewDetails?: (deal: Deal) => void
}

export function DealsDataTable({ data: initialData, assignableUsers, onDataChange, onAssignDeal, onViewDetails }: DealsDataTableProps) {
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
      size: 200,
      cell: ({ row }) => {
        const deal = row.original
        return (
          <div className="flex flex-col max-w-[200px]">
            <span className="font-medium truncate" title={deal.title}>{deal.title}</span>
            {deal.description && (
              <span className="text-sm text-muted-foreground truncate" title={deal.description}>
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
      size: 140,
      cell: ({ row }) => {
        const deal = row.original
        return (
          <div className="flex flex-col max-w-[140px]">
            <span className="font-medium truncate" title={formatCurrency(deal.amount)}>{formatCurrency(deal.amount)}</span>
            <span className="text-sm text-muted-foreground truncate" title={`${deal.probability}% • ${formatCurrency(deal.weighted_amount)}`}>
              {deal.probability}% • {formatCurrency(deal.weighted_amount)}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "stage",
      header: "Stage",
      size: 120,
      cell: ({ row }) => <StageBadge stage={row.original.stage} />,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "expected_close_date",
      header: ({ column }) => <SortableHeader column={column}>Close Date</SortableHeader>,
      size: 150,
      cell: ({ row }) => {
        const deal = row.original
        const isOverdue = deal.is_overdue
        const daysUntilClose = deal.days_until_close
        
        return (
          <div className="flex flex-col max-w-[150px]">
            <span className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
              {formatDate(deal.expected_close_date)}
            </span>
            {isOverdue ? (
              <span className="text-sm text-red-600 flex items-center">
                <IconAlertTriangle className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{Math.abs(daysUntilClose)} days overdue</span>
              </span>
            ) : daysUntilClose >= 0 ? (
              <span className="text-sm text-muted-foreground truncate">
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
      size: 150,
      cell: ({ row }) => {
        const deal = row.original
        return deal.company ? (
          <div className="max-w-[150px]">
            <span className="truncate" title={deal.company.name}>{deal.company.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">No company</span>
        )
      },
    },
    {
      accessorKey: "assigned_user",
      header: "Assigned To",
      size: 160,
      cell: ({ row }) => {
        const deal = row.original
        const currentUserId = deal.assigned_user?.id?.toString() || "unassigned"
        
        return (
          <Select
            value={currentUserId}
            onValueChange={(userId) => {
              if (onAssignDeal) {
                // Handle unassigned case or assigned case
                const assignedUserId = userId === "unassigned" ? null : parseInt(userId)
                onAssignDeal(deal.id, assignedUserId)
              }
            }}
          >
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue placeholder="Unassigned">
                {deal.assigned_user ? (
                  <div className="flex items-center">
                    <IconUser className="w-3 h-3 mr-1 text-muted-foreground" />
                    <span className="truncate">{deal.assigned_user.name}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">
                <div className="flex items-center">
                  <IconUser className="w-3 h-3 mr-2 text-muted-foreground" />
                  Unassigned
                </div>
              </SelectItem>
              {assignableUsers.map((user) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <IconUser className="w-3 h-3 mr-2 text-muted-foreground" />
                      <span>{user.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">{user.role}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      },
    },
    {
      accessorKey: "source",
      header: "Source",
      size: 120,
      cell: ({ row }) => {
        const source = row.original.source
        if (!source) {
          return <Badge variant="secondary">N/A</Badge>;
        }
        return (
          <Badge variant="default" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            {getSourceLabel(source)}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      size: 80,
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
                onClick={() => onViewDetails?.(row.original)}
              >
                <IconEye className="mr-2 h-4 w-4" />
                View
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

  return (
    <DataTable
      columns={columns}
      data={data}
      entityName="deals"
      entityNameSingular="deal"
      filterColumn="title"
      filterPlaceholder="Filter deals..."
    />
  )
}