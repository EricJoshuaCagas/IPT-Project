export type AnyEmployee = {
  id?: number | string;
  employee_id?: number | string;
  employeeId?: number | string;
  employee_name?: string;
  employeeName?: string;
  Employee_name?: string;
  first_name?: string;
  firstName?: string;
  First_name?: string;
  last_name?: string;
  lastName?: string;
  Last_name?: string;
  [key: string]: any;
};

export function normalizeEmployee(e: AnyEmployee = {}) {
  const employee_name = e.employee_name ?? e.employeeName ?? e.Employee_name ?? "";
  const first_name = e.first_name ?? e.firstName ?? e.First_name ?? "";
  const last_name = e.last_name ?? e.lastName ?? e.Last_name ?? "";

  const full = (employee_name || `${first_name} ${last_name}`.trim()).trim();
  // No splitting needed now; keep raw first/last if they exist, else leave blank.
  const f = first_name?.trim() || "";
  const l = last_name?.trim() || "";

  return {
    ...e,
    employee_id: e.employee_id ?? e.id ?? e.employeeId,
    first_name: (f || "").trim(),
    last_name: (l || "").trim(),
    employee_name: full
  };
}
