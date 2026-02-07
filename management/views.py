from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Department, Project, Employee
from .serializers import DepartmentSerializer, ProjectSerializer, EmployeeSerializer


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Department CRUD operations.
    
    Provides endpoints for:
    - GET /api/departments/ - List all departments
    - POST /api/departments/ - Create a new department
    - GET /api/departments/{id}/ - Retrieve a specific department
    - PUT /api/departments/{id}/ - Update a department
    - DELETE /api/departments/{id}/ - Delete a department
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    @action(detail=True, methods=['get'])
    def projects(self, request, pk=None):
        """Get all projects in a specific department."""
        department = self.get_object()
        projects = department.projects.all()
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def employees(self, request, pk=None):
        """Get all employees in a specific department."""
        department = self.get_object()
        employees = department.employees.all()
        serializer = EmployeeSerializer(employees, many=True)
        return Response(serializer.data)


class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Project CRUD operations.
    
    Provides endpoints for:
    - GET /api/projects/ - List all projects
    - POST /api/projects/ - Create a new project
    - GET /api/projects/{id}/ - Retrieve a specific project
    - PUT /api/projects/{id}/ - Update a project
    - DELETE /api/projects/{id}/ - Delete a project
    """
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    @action(detail=True, methods=['get'])
    def employees(self, request, pk=None):
        """Get all employees assigned to a specific project."""
        project = self.get_object()
        employees = project.employees.all()
        serializer = EmployeeSerializer(employees, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """Filter projects by status."""
        status_param = request.query_params.get('status')
        if not status_param:
            return Response(
                {'error': 'status parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        projects = Project.objects.filter(status=status_param)
        serializer = self.get_serializer(projects, many=True)
        return Response(serializer.data)


class EmployeeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Employee CRUD operations.
    
    Provides endpoints for:
    - GET /api/employees/ - List all employees
    - POST /api/employees/ - Create a new employee
    - GET /api/employees/{id}/ - Retrieve a specific employee
    - PUT /api/employees/{id}/ - Update an employee
    - DELETE /api/employees/{id}/ - Delete an employee
    """
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

    @action(detail=True, methods=['post'])
    def assign_project(self, request, pk=None):
        """Assign a project to an employee."""
        employee = self.get_object()
        project_id = request.data.get('project_id')
        
        if not project_id:
            return Response(
                {'error': 'project_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            project = Project.objects.get(id=project_id)
            employee.projects.add(project)
            return Response(
                {'message': 'Project assigned successfully'},
                status=status.HTTP_200_OK
            )
        except Project.DoesNotExist:
            return Response(
                {'error': 'Project not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def remove_project(self, request, pk=None):
        """Remove a project from an employee."""
        employee = self.get_object()
        project_id = request.data.get('project_id')
        
        if not project_id:
            return Response(
                {'error': 'project_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            project = Project.objects.get(id=project_id)
            employee.projects.remove(project)
            return Response(
                {'message': 'Project removed successfully'},
                status=status.HTTP_200_OK
            )
        except Project.DoesNotExist:
            return Response(
                {'error': 'Project not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active employees."""
        employees = Employee.objects.filter(is_active=True)
        serializer = self.get_serializer(employees, many=True)
        return Response(serializer.data)
