# API Testing Guide

A comprehensive guide for testing the Company Management System API using various tools.

## Using Python Requests Library

### Test Script (test_api.py)

```python
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def print_response(response):
    """Pretty print API response"""
    print(f"Status Code: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    print("\n" + "="*50 + "\n")

# 1. Create a Department
print("1. CREATE DEPARTMENT")
dept_data = {
    "name": "Engineering",
    "description": "Software development team"
}
response = requests.post(f"{BASE_URL}/departments/", json=dept_data)
print_response(response)
dept_id = response.json()["id"]

# 2. Get All Departments
print("2. GET ALL DEPARTMENTS")
response = requests.get(f"{BASE_URL}/departments/")
print_response(response)

# 3. Create an Employee
print("3. CREATE EMPLOYEE")
emp_data = {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@company.com",
    "phone": "+1-555-0101",
    "position": "Senior Developer",
    "department_id": dept_id,
    "hire_date": "2023-06-15",
    "is_active": True
}
response = requests.post(f"{BASE_URL}/employees/", json=emp_data)
print_response(response)
emp_id = response.json()["id"]

# 4. Create a Project
print("4. CREATE PROJECT")
proj_data = {
    "title": "Website Redesign",
    "description": "Complete redesign of the company website",
    "department_id": dept_id,
    "start_date": "2024-01-01",
    "end_date": "2024-03-31",
    "status": "planning"
}
response = requests.post(f"{BASE_URL}/projects/", json=proj_data)
print_response(response)
proj_id = response.json()["id"]

# 5. Assign Project to Employee
print("5. ASSIGN PROJECT TO EMPLOYEE")
assign_data = {"project_id": proj_id}
response = requests.post(
    f"{BASE_URL}/employees/{emp_id}/assign_project/", 
    json=assign_data
)
print_response(response)

# 6. Get Employee Details
print("6. GET EMPLOYEE DETAILS")
response = requests.get(f"{BASE_URL}/employees/{emp_id}/")
print_response(response)

# 7. Update Project Status
print("7. UPDATE PROJECT STATUS")
update_data = {"status": "in_progress"}
response = requests.put(f"{BASE_URL}/projects/{proj_id}/", json=update_data)
print_response(response)

# 8. Filter Projects by Status
print("8. FILTER PROJECTS BY STATUS")
response = requests.get(f"{BASE_URL}/projects/by_status/?status=in_progress")
print_response(response)

# 9. Get Active Employees
print("9. GET ACTIVE EMPLOYEES")
response = requests.get(f"{BASE_URL}/employees/active/")
print_response(response)

# 10. Delete Project
print("10. DELETE PROJECT")
response = requests.delete(f"{BASE_URL}/projects/{proj_id}/")
print(f"Status Code: {response.status_code}")
print("\n" + "="*50 + "\n")
```

**Run the test script:**
```bash
pip install requests
python test_api.py
```

## Using cURL (Command Line)

### List All Departments
```bash
curl -X GET http://127.0.0.1:8000/api/departments/
```

### Create a Department
```bash
curl -X POST http://127.0.0.1:8000/api/departments/ \
  -H "Content-Type: application/json" \
  -d '{"name": "Marketing", "description": "Marketing team"}'
```

### Create an Employee
```bash
curl -X POST http://127.0.0.1:8000/api/employees/ \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@company.com",
    "phone": "+1-555-0102",
    "position": "Project Manager",
    "department_id": 1,
    "hire_date": "2023-03-10",
    "is_active": true
  }'
```

### Create a Project
```bash
curl -X POST http://127.0.0.1:8000/api/projects/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mobile App",
    "description": "Develop mobile application",
    "department_id": 1,
    "start_date": "2024-02-01",
    "end_date": "2024-06-30",
    "status": "planning"
  }'
```

### Update a Project
```bash
curl -X PUT http://127.0.0.1:8000/api/projects/1/ \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'
```

### Delete an Employee
```bash
curl -X DELETE http://127.0.0.1:8000/api/employees/1/
```

### Assign Project to Employee
```bash
curl -X POST http://127.0.0.1:8000/api/employees/1/assign_project/ \
  -H "Content-Type: application/json" \
  -d '{"project_id": 1}'
```

### Get Projects by Status
```bash
curl http://127.0.0.1:8000/api/projects/by_status/?status=in_progress
```

## Using Postman

### Setup

1. Download and install Postman from https://www.postman.com/downloads/
2. Create a new collection for "Company Management API"
3. Set the base URL as an environment variable: `http://127.0.0.1:8000/api`

### Create Requests

#### 1. Create Department
- **Method**: POST
- **URL**: `{{base_url}}/departments/`
- **Headers**: `Content-Type: application/json`
- **Body** (JSON):
```json
{
  "name": "Engineering",
  "description": "Software development team"
}
```

#### 2. Get All Departments
- **Method**: GET
- **URL**: `{{base_url}}/departments/`

#### 3. Create Employee
- **Method**: POST
- **URL**: `{{base_url}}/employees/`
- **Body** (JSON):
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@company.com",
  "phone": "+1-555-0101",
  "position": "Senior Developer",
  "department_id": 1,
  "hire_date": "2023-06-15",
  "is_active": true
}
```

#### 4. Create Project
- **Method**: POST
- **URL**: `{{base_url}}/projects/`
- **Body** (JSON):
```json
{
  "title": "Website Redesign",
  "description": "Complete redesign of the company website",
  "department_id": 1,
  "start_date": "2024-01-01",
  "end_date": "2024-03-31",
  "status": "planning"
}
```

#### 5. Assign Project to Employee
- **Method**: POST
- **URL**: `{{base_url}}/employees/1/assign_project/`
- **Body** (JSON):
```json
{
  "project_id": 1
}
```

#### 6. Update Project
- **Method**: PUT
- **URL**: `{{base_url}}/projects/1/`
- **Body** (JSON):
```json
{
  "status": "in_progress"
}
```

#### 7. Delete Project
- **Method**: DELETE
- **URL**: `{{base_url}}/projects/1/`

## Using Python Shell

Access the API through Django shell:

```bash
python manage.py shell
```

### Example Commands

```python
from management.models import Department, Project, Employee
from django.utils import timezone
from datetime import date

# Create Department
dept = Department.objects.create(
    name="Sales",
    description="Sales team"
)

# Create Employee
emp = Employee.objects.create(
    first_name="Alice",
    last_name="Johnson",
    email="alice.johnson@company.com",
    position="Sales Manager",
    department=dept,
    hire_date=date.today(),
    is_active=True
)

# Create Project
proj = Project.objects.create(
    title="Q2 Sales Campaign",
    description="Sales campaign for Q2",
    department=dept,
    start_date=date.today(),
    status="planning"
)

# Assign project to employee
emp.projects.add(proj)

# Query data
employees = Employee.objects.all()
for emp in employees:
    print(f"{emp.first_name} {emp.last_name} - {emp.position}")
```

## Django Admin Interface

1. Navigate to: `http://127.0.0.1:8000/admin/`
2. Login with admin credentials
3. Access models:
   - **Departments**: View, Create, Update, Delete
   - **Projects**: View, Create, Update, Delete, Assign Employees
   - **Employees**: View, Create, Update, Delete, Assign Projects

## Test Scenarios

### Scenario 1: Complete Employee Onboarding
1. Create a Department
2. Create an Employee in that Department
3. Create Projects in the Department
4. Assign Projects to the Employee
5. Verify relationships in API responses

### Scenario 2: Project Management
1. Create Department
2. Create multiple Projects with different statuses
3. Filter projects by status
4. Update project status
5. Verify employee assignments

### Scenario 3: Department Analytics
1. Get department details
2. List all projects in department
3. List all employees in department
4. Count employees and projects

## Performance Testing

Use Apache Bench or wrk for load testing:

```bash
# Using Apache Bench
ab -n 100 -c 10 http://127.0.0.1:8000/api/employees/

# Using wrk
wrk -t12 -c400 -d30s http://127.0.0.1:8000/api/projects/
```

## Notes

- All timestamps are in UTC timezone
- Date format: YYYY-MM-DD
- DateTime format: ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)
- HTTP 200/201: Success
- HTTP 400: Bad request (validation error)
- HTTP 404: Not found
- HTTP 405: Method not allowed
