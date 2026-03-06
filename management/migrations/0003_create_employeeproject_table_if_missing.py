from django.db import migrations


CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS management_employeeproject (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES management_employee(id) DEFERRABLE INITIALLY DEFERRED,
    project_id INTEGER NOT NULL REFERENCES management_project(id) DEFERRABLE INITIALLY DEFERRED,
    role VARCHAR(150) NOT NULL DEFAULT '',
    hours_worked REAL NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    UNIQUE(employee_id, project_id)
);
CREATE INDEX IF NOT EXISTS management_employeeproject_employee_id_uniq
    ON management_employeeproject(employee_id);
CREATE INDEX IF NOT EXISTS management_employeeproject_project_id_uniq
    ON management_employeeproject(project_id);
"""

DROP_TABLE_SQL = """
DROP TABLE IF EXISTS management_employeeproject;
"""


class Migration(migrations.Migration):

    dependencies = [
        ("management", "0002_alter_employee_last_name_employeeproject_and_more"),
    ]

    operations = [
        migrations.RunSQL(CREATE_TABLE_SQL, reverse_sql=DROP_TABLE_SQL),
    ]
