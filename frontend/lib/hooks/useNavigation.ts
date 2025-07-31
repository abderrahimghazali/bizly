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
        permissions: ['view_all_companies', 'view_assigned_companies', 'view_own_companies'],
      },
      {
        title: "Contacts",
        url: "/contacts",
        icon: IconUsers,
        permissions: ['view_all_contacts', 'view_assigned_contacts', 'view_own_contacts'],
      },
      {
        title: "Documents",
        url: "/documents",
        icon: IconFileDescription,
        permissions: ['view_all_documents', 'view_assigned_documents', 'view_own_documents'],
        items: [
          {
            title: "All Documents",
            url: "/documents",
            icon: IconFileDescription,
            permissions: ['view_all_documents', 'view_assigned_documents', 'view_own_documents'],
          },
          {
            title: "Contracts",
            url: "/documents/contracts",
            icon: IconFileDescription,
            permissions: ['view_all_documents', 'view_assigned_documents', 'view_own_documents'],
          },
          {
            title: "Invoices",
            url: "/documents/invoices",
            icon: IconFileDescription,
            permissions: ['view_all_documents', 'view_assigned_documents', 'view_own_documents'],
          },
          {
            title: "Reports",
            url: "/documents/reports",
            icon: IconFileDescription,
            permissions: ['view_all_documents', 'view_assigned_documents', 'view_own_documents'],
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
        title: "User Management",
        url: "/admin/users",
        icon: IconUserCog,
        roles: ['admin'],
      });
    }

    // Add manager-only items
    if (permissions.isAdmin || permissions.isManager) {
      mainNavItems.push({
        title: "Team Management",
        url: "/manager/team",
        icon: IconShield,
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