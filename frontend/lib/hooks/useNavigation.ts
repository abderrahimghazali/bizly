'use client';

import { useMemo } from 'react';
import { usePermissions } from './usePermissions';
import {
  IconDashboard,
  IconFileDescription,
  IconSettings,
  IconUserCog,
  IconAddressBook,
  IconChartLine,
  IconTargetArrow,
  IconBriefcase,
  IconChartBar,
  IconBuilding,
  IconCurrencyDollar,
  IconReceipt,
  IconPackage,
  IconShoppingCart,
  IconTruckDelivery,
  IconReportAnalytics,
  IconClipboardList,
  IconTemplate,
} from "@tabler/icons-react";

export interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  items?: NavItem[];
  permissions?: string[];
  roles?: string[];
}

export function useNavigation() {
  const permissions = usePermissions();

  const navigationItems = useMemo(() => {
    const mainNavItems: NavItem[] = [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: IconDashboard,
      },
      
      // CRM Section
      {
        title: "CRM",
        url: "/crm/leads",
        icon: IconChartLine,
        permissions: ['view_companies', 'view_contacts'],
        items: [
          {
            title: "Leads",
            url: "/crm/leads",
            icon: IconTargetArrow,
            permissions: ['view_companies'],
          },
          {
            title: "Deals",
            url: "/crm/deals",
            icon: IconBriefcase,
            permissions: ['view_companies'],
          },
          {
            title: "Companies",
            url: "/crm/companies",
            icon: IconBuilding,
            permissions: ['view_companies'],
          },
          {
            title: "Contacts",
            url: "/crm/contacts",
            icon: IconAddressBook,
            permissions: ['view_contacts'],
          },
        ],
      },

      // Sales Section (Future - placeholder for now)
      {
        title: "Sales",
        url: "/sales/quotes",
        icon: IconCurrencyDollar,
        permissions: ['view_companies'], // Using existing permission
        items: [
          {
            title: "Quotes",
            url: "/sales/quotes",
            icon: IconReceipt,
            permissions: ['view_companies'],
          },
          {
            title: "Orders",
            url: "/sales/orders",
            icon: IconShoppingCart,
            permissions: ['view_companies'],
          },
          {
            title: "Invoices",
            url: "/sales/invoices",
            icon: IconReceipt,
            permissions: ['view_companies'],
          },
        ],
      },

      // Inventory Section (Future - placeholder for now)
      {
        title: "Inventory",
        url: "/inventory/products",
        icon: IconPackage,
        permissions: ['view_companies'], // Using existing permission
        items: [
          {
            title: "Products",
            url: "/inventory/products",
            icon: IconPackage,
            permissions: ['view_companies'],
          },
          {
            title: "Stock",
            url: "/inventory/stock",
            icon: IconClipboardList,
            permissions: ['view_companies'],
          },
          {
            title: "Suppliers",
            url: "/inventory/suppliers",
            icon: IconTruckDelivery,
            permissions: ['view_companies'],
          },
        ],
      },

      // Documents Section
      {
        title: "Documents",
        url: "/documents",
        icon: IconFileDescription,
        permissions: ['view_documents'],
        items: [
          {
            title: "All Documents",
            url: "/documents",
            icon: IconFileDescription,
            permissions: ['view_documents'],
          },
          {
            title: "Contracts",
            url: "/documents/contracts",
            icon: IconFileDescription,
            permissions: ['view_documents'],
          },
          {
            title: "Templates",
            url: "/documents/templates",
            icon: IconTemplate,
            permissions: ['create_document', 'edit_document'],
          },
          {
            title: "Reports",
            url: "/documents/reports",
            icon: IconReportAnalytics,
            permissions: ['view_documents'],
          },
        ],
      },
    ];

    // Management Section (Admin & Manager)
    if (permissions.isAdmin || permissions.isManager) {
      mainNavItems.push({
        title: "Management",
        url: "#", // No direct URL since this is a parent item
        icon: IconUserCog,
        roles: ['admin', 'manager'],
        items: [
          // Team management for admin and managers
          {
            title: "Team",
            url: "/management/team/team",
          },
          // User management for admin only
          ...(permissions.isAdmin ? [
            {
              title: "Users",
              url: "/management/users/list",
            },
            {
              title: "Roles",
              url: "/management/users/roles",
            },
            {
              title: "Permissions",
              url: "/management/users/permissions",
            },
          ] : []),
        ],
      });
    }

    // Reports Section (Available to all with proper permissions)
    mainNavItems.push({
      title: "Reports",
      url: "/reports/overview",
      icon: IconReportAnalytics,
      permissions: ['view_companies', 'view_documents'],
      items: [
        {
          title: "Overview",
          url: "/reports/overview",
          icon: IconChartBar,
          permissions: ['view_companies'],
        },
        {
          title: "Sales Reports",
          url: "/reports/sales",
          icon: IconCurrencyDollar,
          permissions: ['view_companies'],
        },
        {
          title: "CRM Reports",
          url: "/crm/reports",
          icon: IconChartLine,
          permissions: ['view_companies'],
        },
      ],
    });

    const secondaryNavItems: NavItem[] = [
      {
        title: "Settings",
        url: "/settings",
        icon: IconSettings,
      },
    ];

    return {
      mainNav: filterNavItems(mainNavItems, permissions),
      secondaryNav: filterNavItems(secondaryNavItems, permissions),
    };
  }, [permissions]);

  return navigationItems;
}

function filterNavItems(items: NavItem[], permissions: ReturnType<typeof usePermissions>): NavItem[] {
  return items.filter(item => {
    // Check role requirements
    if (item.roles?.length) {
      const hasRequiredRole = item.roles.some(role => permissions.hasRole(role));
      if (!hasRequiredRole) return false;
    }

    // Check permission requirements
    if (item.permissions?.length) {
      const hasRequiredPermission = item.permissions.some(permission => permissions.hasPermission(permission));
      if (!hasRequiredPermission) return false;
    }

    // Filter sub-items if they exist
    if (item.items) {
      item.items = filterNavItems(item.items, permissions);
      // Only show parent if it has visible sub-items or no permission requirements
      if (item.items.length === 0 && item.permissions?.length) {
        return false;
      }
    }

    return true;
  });
}