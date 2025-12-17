# ADR 001: Dashboard Architecture and Data Isolation

## Status
Accepted

## Context
The platform requires distinct experiences for Managers and Leaders. Managers need to oversee their organization, allocate tests, and view aggregate results. Leaders need a focused view of their pending tasks and personal results, with strict isolation from other leaders' data. Security and performance are critical.

## Decision
We will implement a split architecture for dashboards with enforced data isolation at the database level using Row-Level Security (RLS).

### 1. Dashboard Separation
- **Manager Dashboard (`/dashboard/manager`)**:
  - Accessible only to users with `role = 'manager'`.
  - Features:
    - **Test Catalog**: List available tests (paginated).
    - **Leader Management**: List leaders in the organization (paginated).
    - **Allocation**: Interface to assign tests to leaders.
    - **Org Results**: View results for all leaders in the org.
- **Leader Dashboard (`/dashboard/leader`)**:
  - Accessible only to users with `role = 'leader'`.
  - Features:
    - **My Assignments**: List pending tests (paginated).
    - **My Results**: List completed tests and view personal reports.
  - **Constraint**: No access to other leaders' data or aggregate org stats.

### 2. Data Isolation Strategy (RLS)
We rely on Supabase RLS policies as the primary security layer, not just application logic.
- **Assignments Table**:
  - `select`: Leaders can only see rows where `leader_id = auth.uid()`. Managers can see rows where `organization_id` matches their own.
- **Results Table**:
  - `select`: Leaders can only see rows where `user_id = auth.uid()`. Managers can see rows linked to assignments in their organization.

### 3. Performance & Data Access
- **Repository Pattern**: All data access goes through strictly typed repositories (`AssessmentRepository`, `AssignmentRepository`, `ResultRepository`).
- **Optimized Queries**:
  - **NO `SELECT *`**: All queries must specify exact columns needed for the UI.
  - **Pagination**: Mandatory for all list views (`page`, `limit`).
  - **Indexing**: Database indexes on foreign keys (`leader_id`, `organization_id`, `assignment_id`) must be used.

### 4. Frontend Architecture
- **Route Guards**: `ProtectedRoute` component checks user role and redirects unauthorized access.
- **State Management**: React Query for server state (caching, pagination) and Zustand for complex local state (e.g., multi-step test taking).

## Consequences
- **Positive**: Strict security by default, optimized performance for large datasets, clear separation of concerns.
- **Negative**: Slightly more boilerplate code for repositories and types to ensure specific column selection.
