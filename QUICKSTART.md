# Quick Start Guide

Get the Company Management System up and running in 5 minutes!

## Windows Quick Start

### 1. Navigate to Project Directory
```cmd
cd C:\Users\ACER\Desktop\Cagas_Fitnessapp
```

### 2. Activate Virtual Environment
```cmd
venv\Scripts\activate
```

### 3. Load Sample Data (Optional)
```cmd
python manage.py shell < load_sample_data.py
```

### 4. Start Development Server
```cmd
python manage.py runserver
```

### 5. Access the Application

**Django Admin Interface:**
- URL: `http://127.0.0.1:8000/admin/`
- Username: `admin`
- Password: (was set during setup)

**API Endpoints:**
- Base URL: `http://127.0.0.1:8000/api/`
- Departments: `http://127.0.0.1:8000/api/departments/`
- Projects: `http://127.0.0.1:8000/api/projects/`
- Employees: `http://127.0.0.1:8000/api/employees/`

## Test API Endpoints with cURL

### Create a Department
```cmd
curl -X POST http://127.0.0.1:8000/api/departments/ ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"Sales\", \"description\": \"Sales team\"}"
```

### Get All Departments
```cmd
curl http://127.0.0.1:8000/api/departments/
```

### Get All Employees
```cmd
curl http://127.0.0.1:8000/api/employees/
```

### Get All Projects
```cmd
curl http://127.0.0.1:8000/api/projects/
```

## Troubleshooting

### Virtual Environment Not Activating?
Make sure you're in the project directory:
```cmd
cd C:\Users\ACER\Desktop\Cagas_Fitnessapp
venv\Scripts\activate
```

### Port 8000 Already in Use?
```cmd
python manage.py runserver 8001
```

### Forgot Admin Password?
Create a new superuser:
```cmd
python manage.py createsuperuser
```

### Database Issues?
Reset the database:
```cmd
python manage.py migrate
```

## Next Steps

1. Check the full README.md for detailed API documentation
2. Use the Django admin interface to manage data
3. Test API endpoints using cURL or Postman
4. Review the code in `management/` folder to understand the structure

## Key Files

- `models.py` - Data models (Department, Project, Employee)
- `serializers.py` - API serializers for request/response formatting
- `views.py` - API views and business logic
- `urls.py` - URL routing configuration
- `admin.py` - Django admin configuration
