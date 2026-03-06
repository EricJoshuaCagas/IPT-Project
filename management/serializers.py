from rest_framework import serializers
from django.utils import timezone
from urllib.parse import parse_qs
import json
from .models import Department, Project, Employee, EmployeeProject


class DepartmentSerializer(serializers.ModelSerializer):
    """Serializer for Department model."""
    projects_count = serializers.SerializerMethodField()
    employees_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'projects_count', 'employees_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_projects_count(self, obj):
        return obj.projects.count()

    def get_employees_count(self, obj):
        return obj.employees.count()


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for Project model."""
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        write_only=True,
        source='department'
    )
    employees_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'department', 'department_id',
            'start_date', 'end_date', 'status', 'employees_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_employees_count(self, obj):
        return obj.employees.count()


class EmployeeSerializer(serializers.ModelSerializer):
    """
    Serializer for Employee model.

    Adds frontend-friendly aliases:
    - employee_name (maps to first_name + last_name)
    - job_title (maps to position)

    Keeps legacy fields for compatibility.
    """

    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        write_only=True,
        source='department',
        required=False,
        allow_null=True
    )
    projects = ProjectSerializer(many=True, read_only=True)
    project_ids = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all(),
        many=True,
        write_only=True,
        source='projects',
        required=False
    )
    full_name = serializers.SerializerMethodField()
    # Single source of truth for names (frontend sends employee_name)
    employee_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    first_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    last_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    # New aliases expected by the updated frontend
    job_title = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Employee
        fields = [
            'id',
            'employee_name',
            'first_name',
            'last_name',
            'full_name',
            'email',
            'phone',
            'position',
            'job_title',
            'department',
            'department_id',
            'projects',
            'project_ids',
            'hire_date',
            'is_active',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'position': {'required': False, 'allow_blank': True},
            'email': {'required': False, 'allow_blank': True},
            'hire_date': {'required': False, 'allow_null': True}
        }

    def __init__(self, *args, **kwargs):
        data = kwargs.get("data")
        if isinstance(data, (str, bytes)):
            kwargs["data"] = self._coerce_to_dict(data)
        super().__init__(*args, **kwargs)

    def _coerce_to_dict(self, data):
        if isinstance(data, bytes):
            data = data.decode("utf-8", errors="ignore")
        text = data.strip() if isinstance(data, str) else ""
        if text == "":
            return {}
        try:
            parsed = json.loads(text)
            if isinstance(parsed, dict):
                return parsed
        except Exception:
            qs = parse_qs(text)
            if qs:
                return {k: v[0] for k, v in qs.items()}
        return {}

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

    def _split_employee_name(self, name: str):
        parts = [p for p in (name or "").split(" ") if p]
        first = parts[0] if parts else ""
        last = " ".join(parts[1:]) if len(parts) > 1 else ""
        return first, last

    def _ensure_email(self, validated_data, first_name, last_name):
        if validated_data.get('email'):
            return
        base = f"{first_name}.{last_name}".strip(".") if last_name else first_name
        slug = base.lower().replace(" ", "")
        ts = int(timezone.now().timestamp())
        validated_data['email'] = f"{slug}.{ts}@example.local"

    def to_internal_value(self, data):
        """
        Accept dicts, JSON strings, and urlencoded strings for employee payloads.
        """
        if isinstance(data, bytes):
            data = data.decode("utf-8", errors="ignore")

        if isinstance(data, str):
            text = data.strip()
            if text == "":
                return super().to_internal_value({})
            # Try JSON
            try:
                parsed = json.loads(text)
                if not isinstance(parsed, dict):
                    raise ValueError("JSON root is not an object")
                return super().to_internal_value(parsed)
            except Exception:
                qs = parse_qs(text)
                if qs:
                    flat = {k: v[0] for k, v in qs.items()}
                    return super().to_internal_value(flat)
                # Fallback: treat as empty payload
                return super().to_internal_value({})

        return super().to_internal_value(data)

    def validate(self, attrs):
        # Map employee_name/job_title to legacy fields (accept alt casings)
        initial = getattr(self, "initial_data", {}) or {}
        employee_name = (
            attrs.get('employee_name')
            or attrs.pop('employee_name', None)
            or initial.get('employee_name')
            or initial.get('employeeName')
            or initial.get('Employee_name')
            or initial.get('name')
        )
        job_title = attrs.pop('job_title', None)

        # Debug: log incoming name fields to help diagnose missing employee_name
        try:
            print("[EmployeeSerializer] incoming:", {
                "employee_name": employee_name,
                "initial_keys": list(initial.keys()) if hasattr(initial, "keys") else str(type(initial)),
                "attrs_keys": list(attrs.keys())
            })
        except Exception:
            pass

        # Prefer explicit fields from payload; rescue alternative casings from initial_data
        first = (
            attrs.get('first_name')
            or initial.get('first_name')
            or initial.get('firstName')
            or ''
        )
        last = (
            attrs.get('last_name')
            or initial.get('last_name')
            or initial.get('lastName')
            or ''
        )

        # If employee_name was provided, split it and fill missing pieces
        if employee_name:
            split_first, split_last = self._split_employee_name(employee_name)
            if not first:
                first = split_first
            if not last:
                last = split_last

        # Require a non-empty employee_name (derive from first/last if missing)
        if not employee_name:
            employee_name = f"{first} {last}".strip()

        employee_name = (employee_name or "").strip()
        if not employee_name:
            raise serializers.ValidationError({"employee_name": ["This field is required."]})

        attrs['employee_name'] = employee_name
        attrs['first_name'] = first or ''
        attrs['last_name'] = last or ''

        if job_title is not None:
            attrs['position'] = job_title

        if not attrs.get('position'):
            attrs['position'] = job_title or ''

        if not attrs.get('hire_date'):
            attrs['hire_date'] = timezone.now().date()

        # Auto email if not provided
        self._ensure_email(attrs, attrs['first_name'], attrs['last_name'])

        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Normalize names; prefer stored employee_name
        employee_name = (data.get('employee_name') or "").strip()
        first = (data.get('first_name') or "").strip()
        last = (data.get('last_name') or "").strip()

        if not first and not last and employee_name:
            # split employee_name for convenience
            parts = employee_name.split()
            if parts:
                first = parts[0]
                if len(parts) > 1:
                    last = " ".join(parts[1:])

        data['employee_name'] = employee_name
        data['first_name'] = first
        data['last_name'] = last
        data['job_title'] = data.get('position', '') or ''
        return data


class AssignmentSerializer(serializers.ModelSerializer):
    """
    Serializer for EmployeeProject with role and hours persisted.
    """

    employee_id = serializers.PrimaryKeyRelatedField(queryset=Employee.objects.all(), source="employee")
    project_id = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all(), source="project")

    class Meta:
        model = EmployeeProject
        fields = ['id', 'employee_id', 'project_id', 'role', 'hours_worked', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def __init__(self, *args, **kwargs):
        data = kwargs.get("data")
        if isinstance(data, (str, bytes)):
            kwargs["data"] = self._coerce_to_dict(data)
        super().__init__(*args, **kwargs)

    def _coerce_to_dict(self, data):
        if isinstance(data, bytes):
            data = data.decode("utf-8", errors="ignore")
        text = data.strip() if isinstance(data, str) else ""
        if text == "":
            return {}
        try:
            parsed = json.loads(text)
            if isinstance(parsed, dict):
                return parsed
        except Exception:
            qs = parse_qs(text)
            if qs:
                return {k: v[0] for k, v in qs.items()}
        return {}

    def to_internal_value(self, data):
        """
        Accept dicts, JSON strings, or urlencoded strings.
        """
        if isinstance(data, bytes):
            data = data.decode("utf-8", errors="ignore")

        if isinstance(data, str):
            text = data.strip()
            if text == "":
                return super().to_internal_value({})
            # Try JSON
            try:
                parsed = json.loads(text)
                if not isinstance(parsed, dict):
                    raise ValueError("JSON root is not an object")
                return super().to_internal_value(parsed)
            except Exception:
                qs = parse_qs(text)
                if qs:
                    flat = {k: v[0] for k, v in qs.items()}
                    return super().to_internal_value(flat)
                return super().to_internal_value({})

        return super().to_internal_value(data)

    def create(self, validated_data):
        return super().create(validated_data)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)
