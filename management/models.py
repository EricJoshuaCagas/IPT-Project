from django.db import models


class Department(models.Model):
    """Model for managing departments in the company."""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class Project(models.Model):
    """Model for managing projects."""
    title = models.CharField(max_length=200)
    description = models.TextField()
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='projects'
    )
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('planning', 'Planning'),
            ('in_progress', 'In Progress'),
            ('completed', 'Completed'),
            ('on_hold', 'On Hold'),
        ],
        default='planning'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']


class Employee(models.Model):
    """Model for managing employees."""
    employee_name = models.CharField(max_length=200)
    first_name = models.CharField(max_length=100, blank=True, default="")
    last_name = models.CharField(max_length=100, blank=True, default="")
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    position = models.CharField(max_length=100)
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        related_name='employees'
    )
    hire_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}".strip()

    class Meta:
        ordering = ['last_name', 'first_name']
        verbose_name_plural = "Employees"


class EmployeeProject(models.Model):
    """Explicit through model capturing role and hours worked."""

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="employee_projects")
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="project_employees")
    role = models.CharField(max_length=150, blank=True, default="")
    hours_worked = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("employee", "project")
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.employee} -> {self.project} ({self.role})"


# Link many-to-many through the explicit through model
Employee.add_to_class(
    "projects",
    models.ManyToManyField(
        Project,
        through=EmployeeProject,
        related_name="employees",
        blank=True,
    ),
)
