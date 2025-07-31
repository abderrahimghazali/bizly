'use client';

import { useAuth } from './useAuth';

/**
 * Hook for easy permission checking
 */
export function usePermissions() {
  const { user, hasPermission, hasRole, hasAnyRole, isAdmin, isManager, isEmployee, isClient } = useAuth();

  return {
    // User info
    user,
    
    // Role checks
    hasRole,
    hasAnyRole,
    isAdmin: isAdmin(),
    isManager: isManager(),
    isEmployee: isEmployee(),
    isClient: isClient(),
    
    // Permission checks
    hasPermission,
    
    // Company permissions
    canViewAllCompanies: hasPermission('view_all_companies'),
    canViewAssignedCompanies: hasPermission('view_assigned_companies'),
    canViewOwnCompanies: hasPermission('view_own_companies'),
    canCreateCompany: hasPermission('create_company'),
    canEditCompany: hasPermission('edit_company'),
    canDeleteCompany: hasPermission('delete_company'),
    
    // Contact permissions
    canViewAllContacts: hasPermission('view_all_contacts'),
    canViewAssignedContacts: hasPermission('view_assigned_contacts'),
    canViewOwnContacts: hasPermission('view_own_contacts'),
    canCreateContact: hasPermission('create_contact'),
    canEditContact: hasPermission('edit_contact'),
    canDeleteContact: hasPermission('delete_contact'),
    
    // Document permissions
    canViewAllDocuments: hasPermission('view_all_documents'),
    canViewAssignedDocuments: hasPermission('view_assigned_documents'),
    canViewOwnDocuments: hasPermission('view_own_documents'),
    canCreateDocument: hasPermission('create_document'),
    canEditDocument: hasPermission('edit_document'),
    canDeleteDocument: hasPermission('delete_document'),
    
    // Activity permissions
    canViewTeamActivities: hasPermission('view_team_activities'),
    canViewOwnActivities: hasPermission('view_own_activities'),
    
    // User management permissions
    canManageUsers: hasPermission('manage_users'),
    canAssignRoles: hasPermission('assign_roles'),
  };
}