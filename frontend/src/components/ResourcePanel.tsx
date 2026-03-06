import React, { useEffect, useMemo, useState } from "react";
import { apiRequest, extractResults } from "../api";

type Item = Record<string, any>;

type Column = {
  key: string;
  label: string;
  render?: (item: Item) => React.ReactNode;
};

type Option = { label: string; value: string | number };

type Field = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "date" | "select" | "checkbox" | "email";
  placeholder?: string;
  options?: Option[];
  getValue?: (item: Item) => any;
};

interface ResourcePanelProps {
  title: string;
  endpoint: string;
  columns: Column[];
  fields: Field[];
  buildPayload?: (formData: Record<string, any>) => Record<string, any>;
  mapItemToForm?: (item: Item) => Record<string, any>;
}

function normalizeForm(fields: Field[]): Record<string, any> {
  return fields.reduce((acc, field) => {
    acc[field.name] = field.type === "checkbox" ? false : "";
    return acc;
  }, {} as Record<string, any>);
}

export default function ResourcePanel({
  title,
  endpoint,
  columns,
  fields,
  buildPayload,
  mapItemToForm
}: ResourcePanelProps) {
  const emptyForm = useMemo(() => normalizeForm(fields), [fields]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [formData, setFormData] = useState<Record<string, any>>(emptyForm);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const deriveFormFromItem = (item: Item): Record<string, any> => {
    if (mapItemToForm) return mapItemToForm(item);
    const next: Record<string, any> = {};
    fields.forEach((field) => {
      const value = field.getValue ? field.getValue(item) : item[field.name];
      next[field.name] = value ?? (field.type === "checkbox" ? false : "");
    });
    return next;
  };

  const loadItems = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest<any>(`/${endpoint}/`);
      setItems(extractResults<Item>(data));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("");
    try {
      const payload = buildPayload ? buildPayload(formData) : formData;
      const path = selectedId ? `/${endpoint}/${selectedId}/` : `/${endpoint}/`;
      await apiRequest(path, {
        method: selectedId ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });
      setStatus(selectedId ? "Updated successfully" : "Created successfully");
      setFormData(emptyForm);
      setSelectedId(null);
      await loadItems();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = async (id: number) => {
    setStatus("");
    setError("");
    try {
      await apiRequest(`/${endpoint}/${id}/`, { method: "DELETE" });
      setStatus("Deleted");
      if (selectedId === id) {
        setSelectedId(null);
        setFormData(emptyForm);
      }
      await loadItems();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const startEdit = (item: Item) => {
    setSelectedId(item.id ?? null);
    setFormData(deriveFormFromItem(item));
  };

  return (
    <section className="panel">
      <header className="panel__header">
        <div>
          <p className="eyebrow">API: /{endpoint}/</p>
          <h2>{title}</h2>
        </div>
        {selectedId ? <span className="pill">Editing #{selectedId}</span> : <span className="pill pill--ghost">Create</span>}
      </header>

      <div className="panel__body">
        <form className="form" onSubmit={handleSubmit}>
          {fields.map((field) => {
            const value = formData[field.name];
            const commonProps = {
              id: field.name,
              name: field.name,
              value: field.type === "checkbox" ? undefined : value ?? "",
              onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
                if (field.type === "checkbox") {
                  handleChange(field.name, (e.target as HTMLInputElement).checked);
                } else {
                  handleChange(field.name, e.target.value);
                }
              }
            };

            if (field.type === "textarea") {
              return (
                <label key={field.name} className="form__field">
                  <span>{field.label}</span>
                  <textarea {...commonProps} placeholder={field.placeholder} rows={3} />
                </label>
              );
            }

            if (field.type === "select" && field.options) {
              return (
                <label key={field.name} className="form__field">
                  <span>{field.label}</span>
                  <select {...commonProps}>
                    <option value="">Select</option>
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              );
            }

            if (field.type === "checkbox") {
              return (
                <label key={field.name} className="form__field form__field--checkbox">
                  <input
                    type="checkbox"
                    id={field.name}
                    name={field.name}
                    checked={Boolean(value)}
                    onChange={(e) => handleChange(field.name, e.target.checked)}
                  />
                  <span>{field.label}</span>
                </label>
              );
            }

            return (
              <label key={field.name} className="form__field">
                <span>{field.label}</span>
                <input
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                  {...commonProps}
                />
              </label>
            );
          })}

          <div className="form__actions">
            <button type="submit" className="btn btn--solid" disabled={loading}>
              {selectedId ? "Save changes" : "Create"}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setSelectedId(null);
                setFormData(emptyForm);
                setError("");
                setStatus("");
              }}
            >
              Reset
            </button>
          </div>

          {status && <p className="note note--success">{status}</p>}
          {error && <p className="note note--error">{error}</p>}
        </form>

        <div className="table-wrapper">
          <div className="table-header">
            <h3>Records</h3>
            <button className="btn" onClick={loadItems} disabled={loading}>
              Refresh
            </button>
          </div>
          <div className="table">
            <div className="table__row table__row--head">
              {columns.map((col) => (
                <span key={col.key}>{col.label}</span>
              ))}
              <span className="actions-col">Actions</span>
            </div>
            {loading && <div className="table__empty">Loading…</div>}
            {!loading && items.length === 0 && <div className="table__empty">No records yet</div>}
            {!loading &&
              items.map((item) => (
                <div key={item.id} className="table__row">
                  {columns.map((col) => (
                    <span key={col.key}>{col.render ? col.render(item) : item[col.key]}</span>
                  ))}
                  <span className="actions-col">
                    <button className="btn btn--ghost" type="button" onClick={() => startEdit(item)}>
                      Edit
                    </button>
                    <button className="btn btn--danger" type="button" onClick={() => handleDelete(item.id)}>
                      Delete
                    </button>
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
