from django.db import migrations, models


def backfill_employee_name(apps, schema_editor):
    Employee = apps.get_model("management", "Employee")
    for emp in Employee.objects.all():
        full = emp.employee_name or f"{emp.first_name} {emp.last_name}".strip()
        emp.employee_name = full or f"Employee {emp.id}"
        emp.save(update_fields=["employee_name"])


class Migration(migrations.Migration):
    dependencies = [
        ("management", "0006_require_names_and_backfill"),
    ]

    operations = [
        migrations.AddField(
            model_name="employee",
            name="employee_name",
            field=models.CharField(default="", max_length=200),
        ),
        migrations.RunPython(backfill_employee_name, reverse_code=migrations.RunPython.noop),
    ]
