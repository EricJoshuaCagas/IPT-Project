from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DepartmentViewSet, ProjectViewSet, EmployeeViewSet, AssignmentViewSet

# Create router and register viewsets
router = DefaultRouter()
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'employee-projects', AssignmentViewSet, basename='employee-project')

urlpatterns = [
    path('', include(router.urls)),
]
