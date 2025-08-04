"use client"

import * as React from "react"
import {
  ColumnDef,
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
  IconStarFilled,
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
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Contact } from "@/lib/api/contacts"
import { ContactDetailsSheet } from "@/components/crm/contact-details-sheet"
import { CompanyOption } from "@/lib/api/companies"
import { DataTable } from "@/components/ui/data-table"

function SortableHeader({ column, children }: { column: { toggleSorting: (ascending?: boolean) => void; getIsSorted: () => string | false }; children: React.ReactNode }) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="h-8 px-2 lg:px-3"
    >
      {children}
      <span className="ml-2">
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

interface ContactsDataTableProps {
  data: Contact[]
  onDataChange: (data: Contact[]) => void
  onEditContact?: (contact: Contact) => void
  companies?: CompanyOption[]
}

export function ContactsDataTable({ data, onDataChange, onEditContact, companies = [] }: ContactsDataTableProps) {
  const [selectedContactId, setSelectedContactId] = React.useState<number | null>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleContactDelete = async (contactId: number, contactName: string) => {
    try {
      // Import the API here to avoid circular dependencies
      const { contactsApi } = await import('@/lib/api/contacts');
      await contactsApi.delete(contactId);
      const updatedData = data.filter(contact => contact.id !== contactId);
      onDataChange(updatedData);
      toast.success(`Contact "${contactName}" has been deleted successfully`);
    } catch (error: unknown) {
      toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete contact');
    }
  };

  const handleViewDetails = React.useCallback((contactId: number) => {
    setSelectedContactId(contactId)
    setIsSheetOpen(true)
  }, [])

  const columns: ColumnDef<Contact>[] = React.useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <SortableHeader column={column}>Contact</SortableHeader>
        ),
        cell: ({ row }) => {
          const contact = row.original;
          return (
            <div>
              <div className="font-medium">{contact.first_name} {contact.last_name}</div>
              <div className="text-sm text-muted-foreground flex items-center space-x-1">
                <IconMail className="h-3 w-3" />
                <span>{contact.email}</span>
              </div>
              {contact.phone && (
                <div className="text-sm text-muted-foreground flex items-center space-x-1 mt-1">
                  <IconPhone className="h-3 w-3" />
                  <span>{contact.phone}</span>
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
          const contact = row.original;
          return (
            <div className="flex items-center space-x-2">
              <IconBuilding className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{contact.company?.name || 'N/A'}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "position",
        header: ({ column }) => (
          <SortableHeader column={column}>Position</SortableHeader>
        ),
        cell: ({ row }) => {
          const contact = row.original;
          return (
            <div>
              <div className="font-medium">{contact.position || 'N/A'}</div>
              {contact.department && (
                <div className="text-sm text-muted-foreground">{contact.department}</div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "is_primary",
        header: "Primary",
        cell: ({ row }) => {
          const contact = row.original;
          return contact.is_primary ? (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
              <IconStarFilled className="h-3 w-3 mr-1" />
              Primary
            </Badge>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <SortableHeader column={column}>Created</SortableHeader>
        ),
        cell: ({ row }) => {
          const contact = row.original;
          return (
            <div className="text-sm text-muted-foreground">
              {formatDate(contact.created_at)}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        cell: ({ row }) => {
          const contact = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <IconDotsVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleViewDetails(contact.id)}>
                  <IconEye className="mr-2 h-4 w-4" />
                  View details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href={`tel:${contact.phone}`}>
                    <IconPhone className="mr-2 h-4 w-4" />
                    Call contact
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={`mailto:${contact.email}`}>
                    <IconMail className="mr-2 h-4 w-4" />
                    Send email
                  </a>
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
                      <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete <strong>{contact.first_name} {contact.last_name}</strong>? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60"
                        onClick={() => handleContactDelete(contact.id, `${contact.first_name} ${contact.last_name}`)}
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
    [handleContactDelete, handleViewDetails, onEditContact]
  )

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        entityName="contacts"
        entityNameSingular="contact"
        filterColumn="name"
        filterPlaceholder="Filter contacts..."
      />

      <ContactDetailsSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        contactId={selectedContactId}
        companies={companies}
        onContactUpdate={(updatedContact) => {
          const updatedData = data.map(contact => 
            contact.id === updatedContact.id ? updatedContact : contact
          )
          onDataChange(updatedData)
        }}
      />
    </>
  )
} 