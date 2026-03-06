import { useEffect, useMemo, useState } from "react";
import {
  Employee,
  EmployeeProject,
  Project,
  assignmentApi,
  employeeApi,
  projectApi
} from "../api";
import DataTable, { TableColumn } from "../components/DataTable";
import Modal from "../components/Modal";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";
import SelectDropdown from "../components/SelectDropdown";

type FormState = {
  employee_id: string;
  project_id: string;
  role: string;
  hours_worked: string;
};

const emptyForm: FormState = {
  employee_id: "",
  project_id: "",
  role: "",
  hours_worked: "0"
};

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<EmployeeProject[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filterEmployee, setFilterEmployee] = useState<string>("");
  const [filterProject, setFilterProject] = useState<string>("");

  useEffect(() => {
    loadLookups();
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [filterEmployee, filterProject]);

  const loadLookups = async () => {
    try {
      const [emps, projs] = await Promise.all([employeeApi.list(), projectApi.list()]);
      setEmployees(
        emps.map((e) => ({
          ...e,
          employee_name: e.employee_name || `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim() || "Unnamed"
        }))
      );
      setProjects(
        projs.map((p) => ({
          ...p,
          project_name: p.project_name || p.title || `Project #${p.id ?? p.project_id ?? ""}`
        }))
      );
    } catch (err) {
      console.warn("Failed to load employees/projects for assignments", err);
    }
  };

  const loadAssignments = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await assignmentApi.list({
        employee_id: filterEmployee ? Number(filterEmployee) : undefined,
        project_id: filterProject ? Number(filterProject) : undefined
      });
      setAssignments(
        data.map((a) => ({
          ...a,
          employee_id: Number(a.employee_id),
          project_id: Number(a.project_id),
          role: a.role || "",
          hours_worked: Number(a.hours_worked ?? 0)
        }))
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee_id || !form.project_id) {
      setError("Employee and Project are required.");
      return;
    }
    if (Number(form.hours_worked) < 0) {
      setError("Hours worked cannot be negative.");
      return;
    }
    setLoading(true);
    setError("");
    setStatus("");

    const payload = {
      employee_id: Number(form.employee_id),
      project_id: Number(form.project_id),
      role: form.role.trim(),
      hours_worked: Number(form.hours_worked) || 0
    };

    try {
      if (editingId) {
        await assignmentApi.update(editingId, payload);
        setStatus("Assignment updated");
      } else {
        await assignmentApi.create(payload);
        setStatus("Assignment added");
      }
      resetForm();
      setShowModal(false);
      await loadAssignments();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const employeeOptions = useMemo(
    () =>
      employees.map((e) => ({
        value: Number(e.id ?? e.employee_id ?? 0),
        label: e.employee_name || `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim() || "Unnamed"
      })),
    [employees]
  );

  const projectOptions = useMemo(
    () =>
      projects.map((p) => ({
        value: p.id ?? p.project_id ?? 0,
        label: p.project_name
      })),
    [projects]
  );

  const employeeLookup = useMemo(() => {
    const map = new Map<number, string>();
    employees.forEach((e) => {
      const id = Number(e.id ?? e.employee_id);
      if (id !== undefined)
        map.set(id, e.employee_name || `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim() || `#${id}`);
    });
    return map;
  }, [employees]);

  const projectLookup = useMemo(() => {
    const map = new Map<number, string>();
    projects.forEach((p) => {
      const id = p.id ?? p.project_id;
      if (id !== undefined) map.set(id, p.project_name);
    });
    return map;
  }, [projects]);

  const columns: TableColumn<EmployeeProject>[] = useMemo(
    () => [
      {
        key: "employee",
        title: "Employee",
        render: (row) => employeeLookup.get(row.employee_id) || `#${row.employee_id}`,
        sortable: true,
        accessor: (row) => employeeLookup.get(row.employee_id) || ""
      },
      {
        key: "project",
        title: "Project",
        render: (row) => projectLookup.get(row.project_id) || `#${row.project_id}`,
        sortable: true,
        accessor: (row) => projectLookup.get(row.project_id) || ""
      },
      { key: "role", title: "Role", sortable: true },
      {
        key: "hours_worked",
        title: "Hours Worked",
        sortable: true,
        render: (row) => row.hours_worked ?? 0
      }
    ],
    [employeeLookup, projectLookup]
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 rounded-2xl border border-secondary/50 bg-light/90 p-6 shadow-lg">
        <p className="text-xs uppercase tracking-[0.2em] text-secondary">Assignments</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Assignments</h1>
            <p className="text-sm text-slate-600">
              Assign employees to projects, track roles, and hours worked.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={loadAssignments}
              className="rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-white shadow hover:scale-105 transition disabled:opacity-60"
              disabled={loading}
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:scale-105 transition"
            >
              New Assignment
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-4 rounded-2xl border border-secondary/50 bg-light/90 p-4 shadow">
        <SelectDropdown
          label="Filter by Employee"
          value={filterEmployee}
          onChange={(value) => setFilterEmployee(value)}
          options={[{ value: "", label: "All" }, ...employeeOptions]}
          placeholder="All employees"
        />
        <SelectDropdown
          label="Filter by Project"
          value={filterProject}
          onChange={(value) => setFilterProject(value)}
          options={[{ value: "", label: "All" }, ...projectOptions]}
          placeholder="All projects"
        />
      </div>

      <DataTable
        data={assignments}
        columns={columns}
        isLoading={loading}
        emptyMessage="No assignments yet…"
        searchKeys={["role"]}
        onEdit={(item) => {
          const id = item.id ?? item.employee_project_id;
          setEditingId(id ?? null);
          setForm({
            employee_id: String(item.employee_id),
            project_id: String(item.project_id),
            role: item.role || "",
            hours_worked: String(item.hours_worked ?? 0)
          });
          setShowModal(true);
        }}
        onDelete={(item) => setDeleteId(item.id ?? item.employee_project_id ?? null)}
      />

      <ConfirmDeleteDialog
        isOpen={deleteId !== null}
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          setLoading(true);
          setError("");
          setStatus("");
          try {
            await assignmentApi.remove(deleteId);
            setStatus("Assignment deleted");
            await loadAssignments();
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setLoading(false);
            setDeleteId(null);
          }
        }}
        message="Delete this assignment?"
      />

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingId ? "Edit Assignment" : "New Assignment"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <SelectDropdown
            label="Employee"
            value={form.employee_id}
            onChange={(value) => setForm((prev) => ({ ...prev, employee_id: value }))}
            options={employeeOptions}
            placeholder="Choose employee"
            disabled={loading}
          />

          <SelectDropdown
            label="Project"
            value={form.project_id}
            onChange={(value) => setForm((prev) => ({ ...prev, project_id: value }))}
            options={projectOptions}
            placeholder="Choose project"
            disabled={loading}
          />

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Role
            <input
              type="text"
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
              className="rounded-xl border border-secondary/60 bg-light/80 p-3 shadow-sm focus:ring-2 focus:ring-primary outline-none transition"
              placeholder="Lead Developer"
              disabled={loading}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Hours Worked
            <input
              type="number"
              min={0}
              value={form.hours_worked}
              onChange={(e) => setForm((prev) => ({ ...prev, hours_worked: e.target.value }))}
              className="rounded-xl border border-secondary/60 bg-light/80 p-3 shadow-sm focus:ring-2 focus:ring-primary outline-none transition"
              placeholder="0"
              disabled={loading}
            />
          </label>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowModal(false);
              }}
              className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-slate-800 shadow hover:scale-105 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:scale-105 transition disabled:opacity-60"
            >
              {editingId ? "Save changes" : "Create"}
            </button>
          </div>

          {status && (
            <p className="rounded-lg border border-secondary/60 bg-accent/20 px-3 py-2 text-sm text-primary">
              {status}
            </p>
          )}
          {error && (
            <p className="rounded-lg border border-secondary/60 bg-light px-3 py-2 text-sm text-primary">{error}</p>
          )}
        </form>
      </Modal>
    </div>
  );
}
