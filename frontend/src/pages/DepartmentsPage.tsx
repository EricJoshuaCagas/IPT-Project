import { useEffect, useMemo, useState } from "react";
import { Department, departmentApi } from "../api";
import DataTable, { TableColumn } from "../components/DataTable";
import Modal from "../components/Modal";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";

type FormState = { department_name: string; location: string };

const emptyForm: FormState = { department_name: "", location: "" };

export default function DepartmentsPage() {
  const [items, setItems] = useState<Department[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await departmentApi.list();
      setItems(
        data.map((d) => ({
          ...d,
          department_name: d.department_name || d.name,
          location: d.location || d.description || ""
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
    if (!form.department_name.trim()) {
      setError("Department name is required.");
      return;
    }
    setLoading(true);
    setError("");
    setStatus("");
    const payload = {
      name: form.department_name.trim(),
      description: form.location.trim()
    };
    try {
      if (editingId) {
        await departmentApi.update(editingId, payload);
        setStatus("Department updated");
      } else {
        await departmentApi.create(payload);
        setStatus("Department added");
      }
      resetForm();
      setShowModal(false);
      await loadItems();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const columns: TableColumn<Department>[] = useMemo(
    () => [
      { key: "department_name", title: "Department Name", sortable: true },
      { key: "location", title: "Location", sortable: true }
    ],
    []
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 rounded-2xl border border-secondary/50 bg-light/90 p-6 shadow-lg">
        <p className="text-xs uppercase tracking-[0.2em] text-secondary">Departments</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Departments</h1>
            <p className="text-sm text-slate-600">Manage departments and locations.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={loadItems}
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
              Add Department
            </button>
          </div>
        </div>
      </header>

      <DataTable
        data={items}
        columns={columns}
        isLoading={loading}
        emptyMessage="No departments yet…"
        searchKeys={["department_name", "location"]}
        onEdit={(item) => {
          const id = item.id ?? item.department_id;
          setEditingId(id ?? null);
          setForm({
            department_name: item.department_name,
            location: item.location || ""
          });
          setShowModal(true);
        }}
        onDelete={(item) => setDeleteId(item.id ?? item.department_id ?? null)}
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
            await departmentApi.remove(deleteId);
            setStatus("Department deleted");
            await loadItems();
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setLoading(false);
            setDeleteId(null);
          }
        }}
        message="Delete this department?"
      />

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingId ? "Edit Department" : "Add Department"}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Department Name
            <input
              type="text"
              value={form.department_name}
              onChange={(e) => setForm((prev) => ({ ...prev, department_name: e.target.value }))}
              className="rounded-xl border border-secondary/60 bg-light/80 p-3 shadow-sm focus:ring-2 focus:ring-primary outline-none transition"
              placeholder="Engineering"
              disabled={loading}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Location
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              className="rounded-xl border border-secondary/60 bg-light/80 p-3 shadow-sm focus:ring-2 focus:ring-primary outline-none transition"
              placeholder="Manila HQ"
              disabled={loading}
            />
          </label>

          <div className="flex flex-wrap gap-3 justify-end">
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
