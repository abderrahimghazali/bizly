# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Bizly is an expandable business management system with core modules for CRM, sales, and user management. The architecture is designed to easily add new business modules following established patterns.

## Development Commands

### Backend (Laravel)
```bash
# Start DDEV environment
cd backend && ddev start

# Run full development stack (server + queue + logs + vite)
cd backend && composer dev

# Database operations
ddev artisan migrate              # Run migrations
ddev artisan migrate:fresh --seed # Reset and seed database
ddev artisan db:seed              # Seed database

# Testing
cd backend && composer test       # Run all tests
ddev artisan test                 # Alternative test command
ddev artisan test --filter=TestName  # Run specific test

# Generate new resources
ddev artisan make:controller Api/ModuleName/ResourceController --api
ddev artisan make:model ModuleName/Resource -m
ddev artisan make:resource ModuleName/ResourceResource
```

### Frontend (Next.js)
```bash
# Development
cd frontend && npm run dev        # Start dev server (port 3000)

# Building
cd frontend && npm run build      # Production build
cd frontend && npm run start      # Start production server

# Code quality
cd frontend && npm run lint       # Run ESLint
```

## Architecture for Feature Expansion

### Adding New Business Modules
When adding new features (e.g., Inventory, HR, Project Management), follow this pattern:

1. **Backend Structure**:
   ```
   backend/app/
   ├── Http/Controllers/Api/ModuleName/
   │   └── ResourceController.php
   ├── Models/ModuleName/
   │   └── Resource.php
   └── Http/Resources/ModuleName/
       └── ResourceResource.php
   ```

2. **Frontend Structure**:
   ```
   frontend/
   ├── app/(dashboard)/module-name/
   │   ├── page.tsx              # Module landing page
   │   └── [id]/page.tsx         # Detail views
   ├── components/module-name/
   │   └── ModuleComponents.tsx
   └── lib/api/module-name.ts    # API functions
   ```

3. **Database Migration Pattern**:
   ```php
   // Follow existing patterns in backend/database/migrations/
   // Include soft deletes, timestamps, and foreign keys
   ```

### Core Architecture Patterns

**Authentication & Authorization**:
- JWT via Laravel Sanctum stored in localStorage
- 4 roles: Admin, Manager, Employee, Client
- Permission-based access using Spatie Laravel Permission
- Guards: `AuthGuard`, `PermissionWrapper`, `RoleGuard` in frontend

**State Management**:
- Zustand for auth and UI state
- TanStack Query for server state with caching
- Form state via React Hook Form

**API Design Conventions**:
- RESTful endpoints: `GET /api/module/resources`, `POST /api/module/resources`, etc.
- Consistent response format via Laravel API Resources
- Role-based middleware at route level
- Request validation using Form Requests

**UI Component System**:
- shadcn/ui components in `frontend/components/ui/`
- Tailwind CSS for styling
- Consistent DataTable pattern for list views
- Form components with validation

### Existing Modules Reference

**CRM Module** (`backend/app/Http/Controllers/Api/CRM/`):
- Companies → Contacts → Leads → Deals workflow
- Activity tracking system
- Lead conversion process
- Status management

**Sales Module** (`backend/app/Http/Controllers/Api/Sales/`):
- Quote → Order → Invoice lifecycle
- Document generation
- Sales statistics
- Payment tracking

**User Management** (`backend/app/Http/Controllers/Api/`):
- Dynamic role assignment
- Team hierarchy
- Permission matrix
- Profile management

### Adding New Features Checklist

When implementing a new business feature:

1. **Backend**:
   - [ ] Create migration with proper relationships
   - [ ] Create model with relationships and scopes
   - [ ] Create controller following RESTful conventions
   - [ ] Add routes with appropriate middleware
   - [ ] Create API Resource for consistent responses
   - [ ] Add validation rules via Form Request
   - [ ] Update RolePermissionSeeder if new permissions needed
   - [ ] Write feature tests

2. **Frontend**:
   - [ ] Create page components under `(dashboard)/feature-name/`
   - [ ] Add API functions in `lib/api/feature-name.ts`
   - [ ] Create feature components in `components/feature-name/`
   - [ ] Add navigation item to sidebar if needed
   - [ ] Implement permission checks
   - [ ] Use existing DataTable pattern for list views
   - [ ] Follow existing form patterns with React Hook Form

3. **Integration**:
   - [ ] Test API endpoints with frontend
   - [ ] Verify permission checks work correctly
   - [ ] Ensure proper error handling
   - [ ] Check responsive design

### Database Schema Patterns

```php
// Standard fields for business entities
$table->id();
$table->string('name');
$table->text('description')->nullable();
$table->enum('status', ['active', 'inactive', 'pending']);
$table->foreignId('created_by')->constrained('users');
$table->foreignId('company_id')->constrained()->nullable();
$table->timestamps();
$table->softDeletes();

// For documents/files
$table->uuid('uuid')->unique();
$table->string('file_path');
$table->string('mime_type');
$table->integer('file_size');
```

### Frontend API Pattern

```typescript
// Standard API function structure (lib/api/module.ts)
export const moduleApi = {
  getAll: async (params?: QueryParams) => {
    const response = await apiClient.get('/api/module', { params });
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await apiClient.get(`/api/module/${id}`);
    return response.data;
  },
  
  create: async (data: CreateDTO) => {
    const response = await apiClient.post('/api/module', data);
    return response.data;
  },
  
  update: async (id: number, data: UpdateDTO) => {
    const response = await apiClient.put(`/api/module/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await apiClient.delete(`/api/module/${id}`);
    return response.data;
  }
};
```

### Common Patterns to Follow

1. **List Views**: Use the DataTable component pattern from CRM/Sales modules
2. **Forms**: Use React Hook Form with Zod validation
3. **Modals**: Use Dialog component from shadcn/ui
4. **Loading States**: Use Skeleton components
5. **Error Handling**: Use toast notifications for user feedback
6. **Permissions**: Check permissions before rendering UI elements
7. **API Errors**: Handle and display API errors consistently

### Testing Approach
- Backend: PHPUnit with in-memory SQLite
- Frontend: TypeScript for type safety, ESLint for code quality
- Always test permission boundaries
- Test API endpoints with different user roles