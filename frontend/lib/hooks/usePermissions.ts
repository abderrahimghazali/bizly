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
    canViewCompanies: hasPermission('view_companies'),
    canCreateCompany: hasPermission('create_company'),
    canEditCompany: hasPermission('edit_company'),
    canDeleteCompany: hasPermission('delete_company'),
    
    // Contact permissions
    canViewContacts: hasPermission('view_contacts'),
    canCreateContact: hasPermission('create_contact'),
    canEditContact: hasPermission('edit_contact'),
    canDeleteContact: hasPermission('delete_contact'),
    
    // Document permissions  
    canViewDocuments: hasPermission('view_documents'),
    canCreateDocument: hasPermission('create_document'),
    canEditDocument: hasPermission('edit_document'),
    canDeleteDocument: hasPermission('delete_document'),
    
    // User management permissions
    canViewUsers: hasPermission('view_users'),
    canCreateUser: hasPermission('create_user'),
    canEditUser: hasPermission('edit_user'),
    canDeleteUser: hasPermission('delete_user'),
  };
}