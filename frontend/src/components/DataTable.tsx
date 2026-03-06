import React, { useMemo, useState } from "react";

export type TableColumn<T> = {
  key: string;
  title: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  accessor?: (row: T) => string | number | Date | null | undefined;
  className?: string;
};

type DataTableProps<T> = {
  data: T[];
  columns: TableColumn<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  searchKeys?: string[];
  searchPlaceholder?: string;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onRowClick?: (row: T) => void;
  actionsLabel?: string;
};

type SortState = { key: string | null; direction: "asc" | "desc" };

function getCellValue<T>(row: T, col: TableColumn<T>) {
  if (col.accessor) return col.accessor(row);
  // @ts-expect-error dynamic access
  return row[col.key];
}

export function DataTable<T>({
  data,
  columns,
  isLoading,
  emptyMessage = "No records yet",
  searchKeys,
  searchPlaceholder = "Search…",
  onEdit,
  onDelete,
  onRowClick,
  actionsLabel = "Actions"
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortState>({ key: null, direction: "asc" });

  const filtered = useMemo(() => {
    let rows = data;
    if (search) {
      const term = search.toLowerCase();
      rows = rows.filter((row) => {
        const keys = searchKeys && searchKeys.length > 0 ? searchKeys : columns.map((c) => c.key);
        return keys.some((key) => {
          // @ts-expect-error dynamic access
          const value = row[key];
          return value && String(value).toLowerCase().includes(term);
        });
      });
    }

    if (sort.key) {
      const col = columns.find((c) => c.key === sort.key);
      if (col) {
        rows = [...rows].sort((a, b) => {
          const aVal = getCellValue(a, col);
          const bVal = getCellValue(b, col);
          const dir = sort.direction === "asc" ? 1 : -1;

          if (aVal === undefined || aVal === null) return -1 * dir;
          if (bVal === undefined || bVal === null) return 1 * dir;

          if (aVal instanceof Date && bVal instanceof Date) {
            return (aVal.getTime() - bVal.getTime()) * dir;
          }

          if (typeof aVal === "number" && typeof bVal === "number") {
            return (aVal - bVal) * dir;
          }

          return String(aVal).localeCompare(String(bVal)) * dir;
        });
      }
    }

    return rows;
  }, [data, search, searchKeys, columns, sort]);

  const toggleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
    });
  };

  return (
    <div className="rounded-2xl border border-secondary/50 bg-light/90 backdrop-blur shadow-lg">
      <div className="flex flex-col gap-3 border-b border-secondary/60 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm font-semibold text-slate-700">Table</div>
        <div className="relative w-full md:w-64">
          <input
            className="w-full rounded-xl border border-secondary/60 bg-light/70 px-3 py-2 text-sm shadow focus:border-primary focus:ring-2 focus:ring-primary/60 outline-none transition"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">⌕</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-secondary text-white">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left font-semibold ${col.sortable ? "cursor-pointer select-none" : ""}`}
                  onClick={() => toggleSort(col.key, col.sortable)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.title}
                    {sort.key === col.key && (sort.direction === "asc" ? "▲" : "▼")}
                  </span>
                </th>
              ))}
              {(onEdit || onDelete) && <th className="px-4 py-3 text-left font-semibold">{actionsLabel}</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-6 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            )}

            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-6 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            )}

            {!isLoading &&
              filtered.map((row, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-light" : "bg-light/60"}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 text-slate-800 ${col.className || ""}`}>
                      {col.render ? col.render(row) : (getCellValue(row, col) as React.ReactNode) ?? "—"}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {onEdit && (
                          <button
                            type="button"
                            className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-white shadow hover:scale-105 transition"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(row);
                            }}
                          >
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            className="rounded-full bg-light px-3 py-1 text-xs font-semibold text-slate-800 shadow hover:scale-105 transition"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(row);
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
