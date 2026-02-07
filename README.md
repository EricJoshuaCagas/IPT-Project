# Company Management System - Django REST Framework

A comprehensive Django REST Framework application for managing employees, projects, and departments with full CRUD operations and RESTful API endpoints.

## 📋 Project Overview

This is a complete Django REST Framework (DRF) project that implements a company management system with:
- **Employee Management**: Create, read, update, and delete employee records
- **Project Management**: Manage projects with full lifecycle tracking
- **Department Management**: Organize employees and projects by departments
- **Relationship Management**: Handle many-to-many and foreign key relationships
- **RESTful API**: Complete REST API endpoints for all operations

## 🛠 Technologies & Tools

- **Backend Framework**: Django 6.0.2
- **API Framework**: Django REST Framework 3.16.1
- **Database**: SQLite
- **Python Version**: 3.8+
- **Package Manager**: pip
- **Environment**: Virtual Environment (venv)

## 📊 Database Schema

### Entities and Relationships

#### 1. **Department**
```
- id (Primary Key)
- name (Unique, CharField)
- description (TextField, Optional)
- created_at (DateTime, Auto)
- updated_at (DateTime, Auto)

Relationships:
- One-to-Many with Projects
- One-to-Many with Employees
```

#### 2. **Project**
```
- id (Primary Key)
- title (CharField)
- description (TextField)
- department (ForeignKey → Department)
- start_date (DateField)
- end_date (DateField, Optional)
- status (Choices: planning, in_progress, completed, on_hold)
- created_at (DateTime, Auto)
- updated_at (DateTime, Auto)

Relationships:
- Many-to-One with Department
- Many-to-Many with Employees
```

#### 3. **Employee**
```
- id (Primary Key)
- first_name (CharField)
- last_name (CharField)
- email (EmailField, Unique)
- phone (CharField, Optional)
- position (CharField)
- department (ForeignKey → Department, Optional)
- hire_date (DateField)
- is_active (BooleanField)
- created_at (DateTime, Auto)
- updated_at (DateTime, Auto)

Relationships:
- Many-to-One with Department
- Many-to-Many with Projects
```

## 🚀 Installation & Setup

### Step 1: Prerequisites
Ensure you have Python 3.8 or higher installed on your system.

### Step 2: Clone/Navigate to Project Directory
```bash
cd path/to/Cagas_Fitnessapp
```

### Step 3: Create Virtual Environment
```bash
# On Windows
python -m venv venv

# On macOS/Linux
python3 -m venv venv
```

### Step 4: Activate Virtual Environment
```bash
# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

### Step 5: Install Dependencies
```bash
pip install -r requirements.txt
```

Or install manually:
```bash
pip install Django==6.0.2
pip install djangorestframework==3.16.1
```

### Step 6: Apply Database Migrations
```bash
python manage.py migrate
```

### Step 7: Create Superuser (Admin Access)
```bash
python manage.py createsuperuser
```
Follow the prompts to enter username, email, and password.

### Step 8: Run Development Server
```bash
python manage.py runserver
```

The server will start at `http://127.0.0.1:8000/`

## 🌐 API Endpoints

### Base URL
```
http://127.0.0.1:8000/api/
```

### Department Endpoints

#### List All Departments
```
GET /api/departments/
```

**Response Example:**
```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Engineering",
      "description": "Software development team",
      "projects_count": 3,
      "employees_count": 5,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Create Department
```
POST /api/departments/
Content-Type: application/json

{
  "name": "Engineering",
  "description": "Software development team"
}
```

#### Retrieve Specific Department
```
GET /api/departments/{id}/
```

#### Update Department
```
PUT /api/departments/{id}/
Content-Type: application/json

{
  "name": "Engineering",
  "description": "Updated description"
}
```

#### Delete Department
```
DELETE /api/departments/{id}/
```

#### Get Projects in Department
```
GET /api/departments/{id}/projects/
```

#### Get Employees in Department
```
GET /api/departments/{id}/employees/
```

### Project Endpoints

#### List All Projects
```
GET /api/projects/
```

**Response Example:**
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Website Redesign",
      "description": "Redesign company website",
      "department": {
        "id": 1,
        "name": "Engineering",
        "description": "Software development team",
        "projects_count": 1,
        "employees_count": 5,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      },
      "start_date": "2024-01-01",
      "end_date": "2024-03-31",
      "status": "in_progress",
      "employees_count": 3,
      "created_at": "2024-01-15T11:00:00Z",
      "updated_at": "2024-01-15T11:00:00Z"
    }
  ]
}
```

#### Create Project
```
POST /api/projects/
Content-Type: application/json

{
  "title": "Website Redesign",
  "description": "Redesign company website",
  "department_id": 1,
  "start_date": "2024-01-01",
  "end_date": "2024-03-31",
  "status": "planning"
}
```

#### Retrieve Specific Project
```
GET /api/projects/{id}/
```

#### Update Project
```
PUT /api/projects/{id}/
Content-Type: application/json

{
  "title": "Website Redesign - Updated",
  "status": "in_progress"
}
```

#### Delete Project
```
DELETE /api/projects/{id}/
```

#### Get Employees in Project
```
GET /api/projects/{id}/employees/
```

#### Filter Projects by Status
```
GET /api/projects/by_status/?status=in_progress
```

**Status Options:**
- `planning` - Planning phase
- `in_progress` - Currently in progress
- `completed` - Project completed
- `on_hold` - Project on hold

### Employee Endpoints

#### List All Employees
```
GET /api/employees/
```

**Response Example:**
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "full_name": "John Doe",
      "email": "john.doe@company.com",
      "phone": "+1234567890",
      "position": "Senior Developer",
      "department": {
        "id": 1,
        "name": "Engineering",
        "description": "Software development team",
        "projects_count": 1,
        "employees_count": 1,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      },
      "projects": [],
      "hire_date": "2023-06-15",
      "is_active": true,
      "created_at": "2024-01-15T11:15:00Z",
      "updated_at": "2024-01-15T11:15:00Z"
    }
  ]
}
```

#### Create Employee
```
POST /api/employees/
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@company.com",
  "phone": "+1234567890",
  "position": "Senior Developer",
  "department_id": 1,
  "hire_date": "2023-06-15",
  "is_active": true
}
```

#### Retrieve Specific Employee
```
GET /api/employees/{id}/
```

#### Update Employee
```
PUT /api/employees/{id}/
Content-Type: application/json

{
  "position": "Lead Developer",
  "is_active": true
}
```

#### Delete Employee
```
DELETE /api/employees/{id}/
```

#### Assign Project to Employee
```
POST /api/employees/{id}/assign_project/
Content-Type: application/json

{
  "project_id": 1
}
```

#### Remove Project from Employee
```
POST /api/employees/{id}/remove_project/
Content-Type: application/json

{
  "project_id": 1
}
```

#### Get Active Employees
```
GET /api/employees/active/
```

## 🧪 Testing the API

### Using cURL

#### Create a Department
```bash
curl -X POST http://127.0.0.1:8000/api/departments/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Engineering",
    "description": "Software development team"
  }'
```

#### List All Departments
```bash
curl -X GET http://127.0.0.1:8000/api/departments/
```

#### Create an Employee
```bash
curl -X POST http://127.0.0.1:8000/api/employees/ \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@company.com",
    "phone": "+1234567890",
    "position": "Senior Developer",
    "department_id": 1,
    "hire_date": "2023-06-15",
    "is_active": true
  }'
```

#### Create a Project
```bash
curl -X POST http://127.0.0.1:8000/api/projects/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Website Redesign",
    "description": "Redesign company website",
    "department_id": 1,
    "start_date": "2024-01-01",
    "end_date": "2024-03-31",
    "status": "planning"
  }'
```

### Using Django Admin Interface

1. Navigate to `http://127.0.0.1:8000/admin/`
2. Login with your superuser credentials
3. Browse and manage Departments, Projects, and Employees from the admin panel

## 📁 Project Structure

```
Cagas_Fitnessapp/
├── company_management/          # Main project configuration
│   ├── __init__.py
│   ├── settings.py             # Django settings
│   ├── urls.py                 # Main URL configuration
│   ├── asgi.py
│   └── wsgi.py
├── management/                  # Main app for models, views, serializers
│   ├── migrations/             # Database migrations
│   │   ├── 0001_initial.py
│   │   └── __init__.py
│   ├── __init__.py
│   ├── admin.py                # Admin panel configuration
│   ├── apps.py
│   ├── models.py               # Database models
│   ├── serializers.py          # DRF serializers
│   ├── views.py                # API views/viewsets
│   ├── urls.py                 # App URL configuration
│   └── tests.py
├── venv/                        # Virtual environment (not in version control)
├── manage.py                    # Django management script
├── db.sqlite3                   # SQLite database
├── requirements.txt             # Python dependencies
└── README.md                    # This file
```

## 🔑 Key Features

### ✅ CRUD Operations
- **Create**: POST requests to add new records
- **Read**: GET requests to retrieve single or multiple records
- **Update**: PUT requests to modify existing records
- **Delete**: DELETE requests to remove records

### ✅ Relationship Management
- **ForeignKey**: Projects belong to Departments, Employees belong to Departments
- **ManyToMany**: Employees can work on multiple Projects

### ✅ Custom Actions
- Assign/remove projects to/from employees
- Filter projects by status
- Get active employees
- Department-specific project and employee lists

### ✅ Admin Interface
- Full Django admin integration for easy data management
- Customized admin displays with filters and search
- Inline relationship management

### ✅ Serialization
- Complete serialization with nested relationships
- Read-only and write-only fields appropriately configured
- Custom methods for computed fields (count, full name)

## 🔐 Security Considerations

1. **Change SECRET_KEY**: Update the SECRET_KEY in `settings.py` for production
2. **Set DEBUG = False**: In production, set DEBUG to False
3. **ALLOWED_HOSTS**: Configure allowed hosts for your domain
4. **CORS**: Consider adding django-cors-headers for cross-origin requests if needed
5. **Authentication**: Implement authentication tokens for API access in production

## 🚀 Deployment

For production deployment:

1. Set `DEBUG = False` in settings.py
2. Update ALLOWED_HOSTS with your domain
3. Set up a production database (PostgreSQL recommended)
4. Use a WSGI server (Gunicorn, uWSGI)
5. Set up a reverse proxy (Nginx)
6. Configure static files serving

## 📝 Sample API Workflow

1. **Create a Department**
   ```bash
   POST /api/departments/
   {"name": "Engineering", "description": "Development team"}
   ```

2. **Create Projects in Department**
   ```bash
   POST /api/projects/
   {"title": "Project A", ..., "department_id": 1}
   ```

3. **Create Employees**
   ```bash
   POST /api/employees/
   {"first_name": "John", ..., "department_id": 1}
   ```

4. **Assign Employees to Projects**
   ```bash
   POST /api/employees/1/assign_project/
   {"project_id": 1}
   ```

5. **Retrieve and Manage Data**
   ```bash
   GET /api/employees/
   GET /api/projects/by_status/?status=in_progress
   PUT /api/projects/1/
   DELETE /api/departments/1/
   ```

## 🤝 Contributing

This is a learningproject. Feel free to explore and modify the code to understand Django REST Framework better.

## 📄 License

This project is provided as-is for educational purposes.

## 🆘 Troubleshooting

### PORT 8000 Already in Use
```bash
python manage.py runserver 8001
```

### Database Errors
```bash
python manage.py migrate
```

### Model Errors
```bash
python manage.py makemigrations
python manage.py migrate
```

### Clear Database and Start Fresh
```bash
# Delete db.sqlite3 file
# Delete migration files (keep __init__.py)
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

## 📧 Support

For questions or issues, please refer to the Django documentation:
- Django: https://docs.djangoproject.com/
- Django REST Framework: https://www.django-rest-framework.org/

---

**Happy Coding! 🎉**
