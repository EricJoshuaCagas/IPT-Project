from django.contrib import admin
from .models import Department, Project, Employee, EmployeeProject


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at', 'updated_at']
    search_fields = ['name', 'description']
    list_filter = ['created_at']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'department', 'status', 'start_date', 'created_at']
    search_fields = ['title', 'description']
    list_filter = ['status', 'department', 'created_at']


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['get_full_name', 'email', 'position', 'department', 'is_active', 'hire_date']
    search_fields = ['first_name', 'last_name', 'email', 'position']
    list_filter = ['department', 'is_active', 'hire_date']
    # Using explicit through model; remove horizontal widget for projects

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    get_full_name.short_description = 'Name'
