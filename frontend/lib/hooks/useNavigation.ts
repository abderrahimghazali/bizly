'use client';

import { useMemo } from 'react';
import { usePermissions } from './usePermissions';
import {
  IconDashboard,
  IconFileDescription,
  IconFolder,
  IconSettings,
  IconUsers,
  IconUserCog,
  IconShield,
  IconAddressBook,
  IconChartLine,
  IconTargetArrow,
  IconHandshake,
  IconCalendarEvent,
  IconChartBar,
} from "@tabler/icons-react";

export interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<any>;
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
      {
        title: "Companies",
        url: "/companies",
        icon: IconFolder,
        permissions: ['view_companies'],
      },
      {
        title: "Contacts",
        url: "/contacts",
        icon: IconAddressBook,
        permissions: ['view_contacts'],
      },
      {
        title: "CRM",
        url: "/crm/leads",
        icon: IconChartLine,
        permissions: ['view_companies'], // Using existing permission for now
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
            icon: IconHandshake,
            permissions: ['view_companies'],
          },
          {
            title: "Activities",
            url: "/crm/activities",
            icon: IconCalendarEvent,
            permissions: ['view_companies'],
          },
          {
            title: "Reports",
            url: "/crm/reports",
            icon: IconChartBar,
            permissions: ['view_companies'],
          },
        ],
      },
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
            title: "Invoices",
            url: "/documents/invoices",
            icon: IconFileDescription,
            permissions: ['view_documents'],
          },
          {
            title: "Reports",
            url: "/documents/reports",
            icon: IconFileDescription,
            permissions: ['view_documents'],
          },
          {
            title: "Templates",
            url: "/documents/templates",
            icon: IconFileDescription,
            permissions: ['create_document', 'edit_document'],
          },
        ],
      },
    ];

    // Add admin-only items
    if (permissions.isAdmin) {
      mainNavItems.push({
        title: "Users",
        url: "/users/list",
        icon: IconUserCog,
        roles: ['admin'],
        items: [
          {
            title: "List",
            url: "/users/list",
            icon: IconUsers,
            roles: ['admin'],
          },
          {
            title: "Permissions",
            url: "/users/permissions",
            icon: IconShield,
            roles: ['admin'],
          },
          {
            title: "Roles",
            url: "/users/roles",
            icon: IconUserCog,
            roles: ['admin'],
          },
        ],
      });
    }

    // Add manager-only items
    if (permissions.isAdmin || permissions.isManager) {
      mainNavItems.push({
        title: "Teams",
        url: "/manager/team",
        icon: IconUsers,
        roles: ['admin', 'manager'],
      });
    }

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