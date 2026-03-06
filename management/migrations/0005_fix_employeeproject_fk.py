from django.db import migrations

SQL_CREATE_CASCADE = """
CREATE TABLE IF NOT EXISTS management_employeeproject_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    role VARCHAR(150) NOT NULL DEFAULT '',
    hours_worked REAL NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    UNIQUE(employee_id, project_id),
    FOREIGN KEY(employee_id) REFERENCES management_employee(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY(project_id) REFERENCES management_project(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);
CREATE INDEX IF NOT EXISTS mgmt_ep_emp_idx ON management_employeeproject_new(employee_id);
CREATE INDEX IF NOT EXISTS mgmt_ep_proj_idx ON management_employeeproject_new(project_id);
"""

SQL_COPY = """
INSERT INTO management_employeeproject_new (id, employee_id, project_id, role, hours_worked, created_at, updated_at)
SELECT id, employee_id, project_id, role, hours_worked, created_at, updated_at
FROM management_employeeproject;
"""

SQL_SWAP = """
DROP TABLE management_employeeproject;
ALTER TABLE management_employeeproject_new RENAME TO management_employeeproject;
"""


class Migration(migrations.Migration):
    dependencies = [
        ("management", "0004_alter_employee_first_name"),
    ]

    operations = [
        migrations.RunSQL(SQL_CREATE_CASCADE, reverse_sql="DROP TABLE IF EXISTS management_employeeproject_new;"),
        migrations.RunSQL(SQL_COPY, reverse_sql="DELETE FROM management_employeeproject_new;"),
        migrations.RunSQL(SQL_SWAP, reverse_sql=""),
    ]
