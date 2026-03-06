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
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";
import Modal from "../components/Modal";
import { normalizeEmployee } from "../utils/normalizeEmployee";

type FormState = { employee_name: string; job_title: string; hire_date: string };
type UiEmployee = ReturnType<typeof normalizeEmployee> & Employee & { job_title?: string };

const today = () => new Date().toISOString().slice(0, 10);
const emptyForm: FormState = { employee_name: "", job_title: "", hire_date: today() };
const slug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<UiEmployee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignments, setAssignments] = useState<EmployeeProject[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<UiEmployee | null>(null);

  const withJob = (e: Employee): UiEmployee => {
    const base = normalizeEmployee(e) as UiEmployee;
    base.job_title = (e as any).job_title || (e as any).position || base.job_title || "";
    return base;
  };

  useEffect(() => {
    loadEmployees();
    loadProjects();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await employeeApi.list();
      console.log("EMPLOYEES LIST RESPONSE:", data);
      console.log("EMPLOYEE DATA:", data);
      setEmployees(data.map(withJob));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await projectApi.list();
      setProjects(data);
    } catch (err) {
      console.warn("Failed to load projects for assignments view", err);
    }
  };

  const resetForm = () => {
    setForm({ ...emptyForm, hire_date: today() });
    setEditingId(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const employeeName = form.employee_name.trim();
    if (!employeeName || employeeName.length < 2) {
      return setError("Employee name is required (min 2 characters).");
    }
    if (!form.hire_date) return setError("Hire date is required.");

    setLoading(true);
    setError("");
    setStatus("");

    const existing = editingId ? employees.find((e) => (e.id ?? e.employee_id) === editingId) : undefined;
    const employee_name = employeeName;
    const job = form.job_title.trim() || "Employee";
    console.log("FORM VALUES:", {
      employee_name,
      job_title: job,
      hire_date: form.hire_date
    });

    const departmentId =
      (existing as any)?.department?.id ??
      (existing as any)?.department_id ??
      (existing as any)?.department ??
      null;

    const payload = {
      employee_name,
      job_title: job,
      hire_date: form.hire_date
    };
    console.log("SUBMIT PAYLOAD:", payload);
    console.log("CREATE PAYLOAD:", payload);
    if (departmentId !== null && departmentId !== undefined) payload.department_id = departmentId;

    try {
      const saved = editingId
        ? await employeeApi.update(editingId, payload as any)
        : await employeeApi.create(payload as any);
      console.log("CREATE RESPONSE:", saved);
      setStatus(editingId ? "Employee updated" : "Employee added");
      const normalized = withJob(saved);
      setEmployees((prev) => {
        const others = prev.filter(
          (e) => (e.id ?? e.employee_id) !== (normalized.id ?? normalized.employee_id)
        );
        return [normalized, ...others];
      });
      resetForm();
    } catch (err) {
      setError((err as Error).message || "Unable to save employee");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (employee: UiEmployee) => {
    setForm({
      employee_name: employee.employee_name || "",
      job_title: employee.job_title || employee.position || "",
      hire_date: employee.hire_date || today()
    });
    setEditingId(employee.id ?? employee.employee_id ?? null);
    setStatus("");
    setError("");
  };

  const confirmDelete = (employee: Employee) => {
    setDeleteId(employee.id ?? employee.employee_id ?? null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    setStatus("");
    setError("");
    try {
      await employeeApi.remove(deleteId);
      if (editingId === deleteId) resetForm();
      setStatus("Employee deleted and assignments removed");
      setAssignments([]);
      await loadEmployees();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };

  const openDetails = async (employee: Employee) => {
    setSelectedEmployee(employee);
    setDetailsOpen(true);
    setDetailsLoading(true);
    setError("");
    try {
      const data = await assignmentApi.list({ employee_id: employee.id ?? employee.employee_id });
      setAssignments(data);
    } catch (err) {
      setError("Unable to load assignments. Please try again.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const totalHours = useMemo(
    () => assignments.reduce((sum, item) => sum + (item.hours_worked || 0), 0),
    [assignments]
  );

  const projectLookup = useMemo(() => {
    const map = new Map<number, string>();
    projects.forEach((p) => {
      const id = p.id ?? p.project_id;
      const name = p.project_name || (p as any).title;
      if (id !== undefined) map.set(id, name || `Project #${id}`);
    });
    return map;
  }, [projects]);

  const columns: TableColumn<UiEmployee & { actions?: string }>[] = [
    {
      key: "employee_name",
      title: "Employee Name",
      sortable: true,
      render: (row) => {
        return row.employee_name?.trim() || "(No name)";
      }
    },
    { key: "job_title", title: "Job Title", sortable: true },
    { key: "hire_date", title: "Hire Date", sortable: true },
    {
      key: "details",
      title: "Details",
      render: (row) => (
        <button
          type="button"
          className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white shadow hover:scale-105 transition"
          onClick={(e) => {
            e.stopPropagation();
            openDetails(row);
          }}
        >
          View
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 rounded-2xl border border-secondary/50 bg-light/90 p-6 shadow-lg">
        <p className="text-xs uppercase tracking-[0.2em] text-secondary">Dashboard</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Employees</h1>
            <p className="text-sm text-slate-600">Manage employees and view their project assignments.</p>
          </div>
          <button
            type="button"
            onClick={loadEmployees}
            className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:scale-105 transition disabled:opacity-60"
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="space-y-5 rounded-2xl border border-secondary/50 bg-light/90 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-secondary">
                {editingId ? `Editing #${editingId}` : "Create"}
              </p>
              <h2 className="text-xl font-semibold text-slate-900">Employee Form</h2>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-slate-800 shadow hover:scale-105 transition"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Employee Name
                <input
                  type="text"
                  value={form.employee_name}
                  onChange={(e) => setForm((prev) => ({ ...prev, employee_name: e.target.value }))}
                  className="rounded-xl border border-secondary/60 bg-light/80 p-3 shadow-sm focus:ring-2 focus:ring-primary outline-none transition"
                  placeholder="Jane Doe"
                  disabled={loading}
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Job Title
                <input
                  type="text"
                  value={form.job_title}
                  onChange={(e) => setForm((prev) => ({ ...prev, job_title: e.target.value }))}
                  className="rounded-xl border border-secondary/60 bg-light/80 p-3 shadow-sm focus:ring-2 focus:ring-primary outline-none transition"
                  placeholder="Product Designer"
                  disabled={loading}
                />
              </label>
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Hire Date
              <input
                type="date"
                value={form.hire_date}
                onChange={(e) => setForm((prev) => ({ ...prev, hire_date: e.target.value }))}
                className="rounded-xl border border-secondary/60 bg-light/80 p-3 shadow-sm focus:ring-2 focus:ring-primary outline-none transition"
                disabled={loading}
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-primary px-5 py-3 font-semibold text-white shadow-lg shadow-primary/25 hover:scale-105 hover:bg-primary/90 transition disabled:opacity-60"
              >
                {editingId ? "Update Employee" : "Add Employee"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl bg-primary px-4 py-3 font-semibold text-white  shadow hover:scale-105 transition disabled:opacity-60"
                disabled={loading}
              >
                Clear
              </button>
            </div>

            {status && (
              <p className="rounded-lg border border-secondary/60 bg-accent/20 px-3 py-2 text-sm text-primary">
                {status}
              </p>
            )}
            {error && (
              <p className="rounded-lg border border-secondary/60 bg-light px-3 py-2 text-sm text-primary">
                {error}
              </p>
            )}
          </form>
        </section>

        <section className="space-y-4 rounded-2xl border border-secondary/50 bg-light/90 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-secondary">Current Employees</p>
              <h2 className="text-xl font-semibold text-slate-900">Employee List</h2>
            </div>
            <span className="rounded-full border border-secondary/60 bg-light px-3 py-1 text-xs font-semibold text-accent">
              {employees.length} total
            </span>
          </div>

          <DataTable
            data={employees}
            columns={columns}
            isLoading={loading}
            searchKeys={["employee_name", "first_name", "last_name", "job_title", "hire_date"]}
            onEdit={startEdit}
            onDelete={confirmDelete}
            emptyMessage="No employees yet. Add one to get started."
            actionsLabel="Actions"
          />
        </section>
      </div>

      <ConfirmDeleteDialog
        isOpen={deleteId !== null}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
        message="This will delete the employee and all their project assignments."
      />

      <Modal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title={selectedEmployee ? selectedEmployee.employee_name : "Employee"}
        variant="drawer"
      >
        {detailsLoading && <p className="text-sm text-slate-500">Loading assignments…</p>}

        {selectedEmployee && (
          <div className="space-y-3">
            <div className="rounded-xl border border-secondary/60 bg-light px-4 py-3 shadow-sm text-accent">
              <p className="text-sm text-secondary uppercase tracking-[0.2em]">Basic Info</p>
              <p className="text-lg font-semibold text-slate-900">{selectedEmployee.employee_name}</p>
              <p className="text-sm text-slate-600">{selectedEmployee.job_title || "—"}</p>
              {selectedEmployee.hire_date && (
                <p className="text-xs text-slate-500">Hired: {selectedEmployee.hire_date}</p>
              )}
            </div>

            <div className="rounded-xl border border-secondary/60 bg-light px-4 py-3 shadow-sm text-accent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Assigned Projects</p>
                  <p className="text-xs text-slate-500">Total hours: {totalHours}</p>
                </div>
                <span className="rounded-full bg-light px-3 py-1 text-xs font-semibold text-slate-800">
                  {assignments.length} assignments
                </span>
              </div>
              {assignments.length === 0 && !detailsLoading && (
                <p className="py-3 text-sm text-slate-500">No assignments yet.</p>
              )}
              <ul className="divide-y divide-accent/50">
                {assignments.map((item) => (
                  <li key={item.id ?? `${item.employee_id}-${item.project_id}`} className="py-2 text-sm">
                    <p className="font-semibold text-slate-900">
                      {projectLookup.get(item.project_id) || `Project #${item.project_id}`}
                    </p>
                    <p className="text-slate-600">
                      Role: {item.role || "-"} · Hours: {item.hours_worked ?? 0}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
