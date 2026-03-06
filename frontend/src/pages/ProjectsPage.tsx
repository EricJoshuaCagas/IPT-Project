import { useEffect, useMemo, useState } from "react";
import { Department, Project, departmentApi, projectApi } from "../api";
import DataTable, { TableColumn } from "../components/DataTable";
import Modal from "../components/Modal";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";
import SelectDropdown from "../components/SelectDropdown";
import DateInput from "../components/DateInput";

type FormState = {
  project_name: string;
  start_date: string;
  end_date: string;
  department_id: string;
};

const emptyForm: FormState = {
  project_name: "",
  start_date: "",
  end_date: "",
  department_id: ""
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    loadProjects();
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await departmentApi.list();
      setDepartments(data);
    } catch (err) {
      console.warn("Failed to load departments for project form", err);
    }
  };

  const loadProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await projectApi.list();
      setProjects(
        data.map((p) => {
          const deptId =
            p.department_id ??
            (p.department && (p.department.id ?? p.department.department_id));
          return {
            ...p,
            project_name: p.project_name || p.title,
            start_date: p.start_date,
            end_date: p.end_date,
            department_id: deptId as number
          };
        })
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
    if (!form.project_name.trim()) {
      setError("Project name is required.");
      return;
    }
    if (!form.start_date) {
      setError("Start date is required.");
      return;
    }
    if (form.end_date && form.end_date < form.start_date) {
      setError("End date cannot be earlier than start date.");
      return;
    }
    if (!form.department_id) {
      setError("Department is required.");
      return;
    }

    setLoading(true);
    setError("");
    setStatus("");

    const payload = {
      title: form.project_name.trim(),
      description: form.project_name.trim(), // basic placeholder since backend requires description
      start_date: form.start_date,
      end_date: form.end_date || null,
      department_id: Number(form.department_id)
    };

    try {
      if (editingId) {
        await projectApi.update(editingId, payload);
        setStatus("Project updated");
      } else {
        await projectApi.create(payload);
        setStatus("Project added");
      }
      resetForm();
      setShowModal(false);
      await loadProjects();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const departmentOptions = useMemo(
    () =>
      departments.map((d) => ({
        value: d.id ?? d.department_id ?? 0,
        label: d.department_name || d.name
      })),
    [departments]
  );

  const departmentLookup = useMemo(() => {
    const map = new Map<number, string>();
    departments.forEach((d) => {
      const id = d.id ?? d.department_id;
      if (id !== undefined) map.set(id, d.department_name || d.name);
    });
    return map;
  }, [departments]);

  const columns: TableColumn<Project>[] = useMemo(
    () => [
      { key: "project_name", title: "Project Name", sortable: true },
      {
        key: "department",
        title: "Department",
        render: (row) => departmentLookup.get(row.department_id) || "—",
        sortable: true,
        accessor: (row) => departmentLookup.get(row.department_id) || ""
      },
      { key: "start_date", title: "Start Date", sortable: true },
      { key: "end_date", title: "End Date", sortable: true }
    ],
    [departmentLookup]
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 rounded-2xl border border-secondary/50 bg-light/90 p-6 shadow-lg">
        <p className="text-xs uppercase tracking-[0.2em] text-secondary">Projects</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Projects</h1>
            <p className="text-sm text-slate-600">Manage projects with department linkage and timelines.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={loadProjects}
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
              Add Project
            </button>
          </div>
        </div>
      </header>

      <DataTable
        data={projects}
        columns={columns}
        isLoading={loading}
        searchKeys={["project_name", "start_date", "end_date"]}
        emptyMessage="No projects yet…"
        onEdit={(item) => {
          const id = item.id ?? item.project_id;
          setEditingId(id ?? null);
          setForm({
            project_name: item.project_name,
            start_date: item.start_date || "",
            end_date: item.end_date || "",
            department_id: String(item.department_id ?? "")
          });
          setShowModal(true);
        }}
        onDelete={(item) => setDeleteId(item.id ?? item.project_id ?? null)}
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
            await projectApi.remove(deleteId);
            setStatus("Project deleted");
            await loadProjects();
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setLoading(false);
            setDeleteId(null);
          }
        }}
        message="Delete this project?"
      />

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingId ? "Edit Project" : "Add Project"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Project Name
            <input
              type="text"
              value={form.project_name}
              onChange={(e) => setForm((prev) => ({ ...prev, project_name: e.target.value }))}
              className="rounded-xl border border-secondary/60 bg-light/80 p-3 shadow-sm focus:ring-2 focus:ring-primary outline-none transition"
              placeholder="Website Redesign"
              disabled={loading}
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DateInput
              label="Start Date"
              value={form.start_date}
              onChange={(value) => setForm((prev) => ({ ...prev, start_date: value }))}
              disabled={loading}
            />
            <DateInput
              label="End Date"
              value={form.end_date}
              min={form.start_date || undefined}
              onChange={(value) => setForm((prev) => ({ ...prev, end_date: value }))}
              disabled={loading}
            />
          </div>

          <SelectDropdown
            label="Department"
            value={form.department_id}
            onChange={(value) => setForm((prev) => ({ ...prev, department_id: value }))}
            options={departmentOptions}
            placeholder="Select department"
            disabled={loading}
          />

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
