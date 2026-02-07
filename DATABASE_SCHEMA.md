# Database Schema & Relationships

## Entity Relationship Diagram (ERD)

```
┌─────────────────────┐
│    DEPARTMENT       │
├─────────────────────┤
│ id (PK)             │
│ name (Unique)       │
│ description         │
│ created_at          │
│ updated_at          │
└──────────┬──────────┘
           │
           │ (One-to-Many)
           │
    ┌──────┴─────────────────────────┐
    │                                 │
    ▼                                 ▼
┌─────────────────────────────┐  ┌──────────────────────┐
│       PROJECT               │  │     EMPLOYEE         │
├─────────────────────────────┤  ├──────────────────────┤
│ id (PK)                     │  │ id (PK)              │
│ title                       │  │ first_name           │
│ description                 │  │ last_name            │
│ department_id (FK)    <<<───┼──┤ email (Unique)       │
│ start_date                  │  │ phone                │
│ end_date                    │  │ position             │
│ status                      │  │ department_id (FK)   │
│ created_at                  │  │ hire_date            │
│ updated_at                  │  │ is_active            │
└──────────┬──────────────────┘  │ created_at           │
           │                     │ updated_at           │
           │ (Many-to-Many)      └──────┬───────────────┘
           │                           │
    ┌──────┘                           │
    │                                  │
    └──────────────────────┬───────────┘
                           │
                    (Many-to-Many)
                    Through Table:
                    employee_projects
                    - employee_id (FK)
                    - project_id (FK)
```

## Detailed Relationships

### Department → Projects
- **Type**: One-to-Many (One Department has Many Projects)
- **Django Field**: `ForeignKey(Department, on_delete=models.CASCADE, related_name='projects')`
- **Related Name**: `projects` (Access from Department: `department.projects.all()`)
- **On Delete**: CASCADE (Deleting department deletes its projects)
- **Description**: Each project belongs to exactly one department

### Department → Employees
- **Type**: One-to-Many (One Department has Many Employees)
- **Django Field**: `ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='employees')`
- **Related Name**: `employees` (Access from Department: `department.employees.all()`)
- **On Delete**: SET_NULL (Deleting department doesn't delete employees, just sets to NULL)
- **Description**: Each employee can belong to a department, but it's optional

### Employee ↔ Projects
- **Type**: Many-to-Many (Many Employees work on Many Projects)
- **Django Field**: `ManyToManyField(Project, related_name='employees', blank=True)`
- **Related Name**: `employees` (Access from Project: `project.employees.all()`)
- **Related Name (reverse)**: `projects` (Access from Employee: `employee.projects.all()`)
- **Through Table**: Automatically created by Django: `management_employee_projects`
- **Description**: Employees can be assigned to multiple projects

## Database Tables

### 1. management_department
```sql
CREATE TABLE management_department (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### 2. management_project
```sql
CREATE TABLE management_project (
    id INTEGER PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    department_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES management_department(id)
);
```

### 3. management_employee
```sql
CREATE TABLE management_employee (
    id INTEGER PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    phone VARCHAR(20),
    position VARCHAR(100) NOT NULL,
    department_id INTEGER,
    hire_date DATE NOT NULL,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES management_department(id)
);
```

### 4. management_employee_projects (Through Table)
```sql
CREATE TABLE management_employee_projects (
    id INTEGER PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES management_employee(id),
    FOREIGN KEY (project_id) REFERENCES management_project(id),
    UNIQUE (employee_id, project_id)
);
```

## Relationship Usage Examples

### Access Projects from Department
```python
department = Department.objects.get(id=1)
projects = department.projects.all()  # Related name: 'projects'
```

### Access Employees from Department
```python
department = Department.objects.get(id=1)
employees = department.employees.all()  # Related name: 'employees'
```

### Access Department from Project
```python
project = Project.objects.get(id=1)
department = project.department  # Direct access via FK
```

### Access Employees from Project
```python
project = Project.objects.get(id=1)
employees = project.employees.all()  # Related name: 'employees'
```

### Access Projects from Employee
```python
employee = Employee.objects.get(id=1)
projects = employee.projects.all()  # ManyToMany
```

### Access Department from Employee
```python
employee = Employee.objects.get(id=1)
department = employee.department  # FK can be None
```

## Data Integrity Rules

### Cascade Delete Rules
1. **Department → Projects**: CASCADE
   - Deleting a department automatically deletes all its projects
   - Important: Plan carefully before deleting departments with active projects

2. **Department → Employees**: SET_NULL
   - Deleting a department sets employee department to NULL
   - Important: Employee records are preserved

### Unique Constraints
1. **Department.name**: Must be unique across all departments
2. **Employee.email**: Must be unique across all employees
3. **Employee → Project**: Can't have duplicate assignments

### Optional vs Required
- `Department` for Project: REQUIRED
- `Department` for Employee: OPTIONAL (can be NULL)
- `Projects` for Employee: OPTIONAL (blank=True)
- `Projects_count` for Department: Can be zero
- `Employees_count` for Department: Can be zero

## Query Performance Tips

### N+1 Query Problem - AVOID
```python
# BAD: Makes N+1 queries (1 for departments + N for each department's projects)
for dept in Department.objects.all():
    projects = dept.projects.all()
```

### Solution: Use select_related() or prefetch_related()
```python
# GOOD: Optimized query
departments = Department.objects.prefetch_related('projects').all()
```

### Complex Queries
```python
# Get all projects with their departments and employee counts
projects = Project.objects.select_related('department').prefetch_related('employees')

# Get employees with their department and assigned projects
employees = Employee.objects.select_related('department').prefetch_related('projects')

# Get active employees in specific department
active_employees = Employee.objects.filter(
    department_id=1,
    is_active=True
).prefetch_related('projects')
```

## Migration History

### Initial Migration (0001_initial.py)
This migration created three models:
1. **Department** - Initial table with 5 fields
2. **Project** - Initial table with 9 fields and FK to Department
3. **Employee** - Initial table with 11 fields, FK to Department, and M2M to Project

All fields are set up with appropriate constraints and relationships.

---

## Visual Summary

```
A DEPARTMENT can have:
├── Many PROJECTS
│   └── Each project has Many EMPLOYEES (through M2M)
└── Many EMPLOYEES
    └── Each employee can work on Many PROJECTS

A PROJECT must have:
└── Exactly ONE DEPARTMENT

An EMPLOYEE can have:
├── Zero or One DEPARTMENT
└── Zero or Many PROJECTS
```

This schema ensures:
✓ Data integrity through constraints
✓ Flexible relationships (M2M for employee-project assignments)
✓ No duplicate assignments
✓ Data preservation when deletions occur
✓ Efficient querying with proper indexes
