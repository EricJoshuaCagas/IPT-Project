"""
Sample data loader for testing the API.

This script creates sample departments, projects, and employees for testing.
Run with: python manage.py shell < load_sample_data.py
"""

from management.models import Department, Project, Employee
from datetime import date, timedelta

# Clear existing data (optional)
# Department.objects.all().delete()
# Project.objects.all().delete()
# Employee.objects.all().delete()

# Create Departments
dept_engineering = Department.objects.create(
    name="Engineering",
    description="Software development and technical team"
)

dept_marketing = Department.objects.create(
    name="Marketing",
    description="Marketing and communications team"
)

dept_hr = Department.objects.create(
    name="Human Resources",
    description="Human resources and recruitment team"
)

print("✓ Departments created")

# Create Projects
project1 = Project.objects.create(
    title="Website Redesign",
    description="Complete redesign of the company website",
    department=dept_engineering,
    start_date=date(2024, 1, 1),
    end_date=date(2024, 3, 31),
    status="in_progress"
)

project2 = Project.objects.create(
    title="Mobile App Development",
    description="Develop a mobile application for iOS and Android",
    department=dept_engineering,
    start_date=date(2024, 2, 1),
    end_date=date(2024, 6, 30),
    status="planning"
)

project3 = Project.objects.create(
    title="Brand Campaign",
    description="Launch a new brand campaign",
    department=dept_marketing,
    start_date=date(2024, 1, 15),
    end_date=date(2024, 4, 15),
    status="in_progress"
)

project4 = Project.objects.create(
    title="HR System Migration",
    description="Migrate HR system to cloud",
    department=dept_hr,
    start_date=date(2024, 3, 1),
    end_date=None,
    status="planning"
)

print("✓ Projects created")

# Create Employees
emp1 = Employee.objects.create(
    first_name="John",
    last_name="Doe",
    email="john.doe@company.com",
    phone="+1-555-0101",
    position="Senior Developer",
    department=dept_engineering,
    hire_date=date(2022, 6, 15),
    is_active=True
)

emp2 = Employee.objects.create(
    first_name="Jane",
    last_name="Smith",
    email="jane.smith@company.com",
    phone="+1-555-0102",
    position="Project Manager",
    department=dept_engineering,
    hire_date=date(2021, 3, 10),
    is_active=True
)

emp3 = Employee.objects.create(
    first_name="Michael",
    last_name="Johnson",
    email="michael.johnson@company.com",
    phone="+1-555-0103",
    position="Frontend Developer",
    department=dept_engineering,
    hire_date=date(2023, 1, 20),
    is_active=True
)

emp4 = Employee.objects.create(
    first_name="Sarah",
    last_name="Williams",
    email="sarah.williams@company.com",
    phone="+1-555-0104",
    position="Marketing Manager",
    department=dept_marketing,
    hire_date=date(2020, 9, 5),
    is_active=True
)

emp5 = Employee.objects.create(
    first_name="David",
    last_name="Brown",
    email="david.brown@company.com",
    phone="+1-555-0105",
    position="HR Specialist",
    department=dept_hr,
    hire_date=date(2021, 11, 1),
    is_active=True
)

print("✓ Employees created")

# Assign Employees to Projects
emp1.projects.add(project1, project2)
emp2.projects.add(project1)
emp3.projects.add(project1, project2)
emp4.projects.add(project3)
emp5.projects.add(project4)

print("✓ Employees assigned to projects")

print("\n✅ Sample data loaded successfully!")
print("\nCreated:")
print(f"  - {Department.objects.count()} departments")
print(f"  - {Project.objects.count()} projects")
print(f"  - {Employee.objects.count()} employees")
