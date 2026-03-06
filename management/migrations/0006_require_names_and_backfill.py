from django.db import migrations, models


BACKFILL_SQL = """
UPDATE management_employee
SET first_name = CASE WHEN COALESCE(first_name, '') = '' THEN 'Temp' || id ELSE first_name END,
    last_name  = CASE WHEN COALESCE(last_name, '') = '' THEN 'User' || id ELSE last_name END
WHERE COALESCE(first_name, '') = '' OR COALESCE(last_name, '') = '';
"""

REVERT_SQL = """
-- No-op revert; leave data as-is
SELECT 1;
"""


class Migration(migrations.Migration):

    dependencies = [
        ("management", "0005_fix_employeeproject_fk"),
    ]

    operations = [
        migrations.AlterField(
            model_name="employee",
            name="first_name",
            field=models.CharField(max_length=100),
        ),
        migrations.AlterField(
            model_name="employee",
            name="last_name",
            field=models.CharField(max_length=100),
        ),
        migrations.RunSQL(BACKFILL_SQL, reverse_sql=REVERT_SQL),
    ]
