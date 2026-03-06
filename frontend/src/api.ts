export const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export type Department = {
  id?: number;
  department_id?: number;
  name: string;
  description?: string;
  // Legacy/UI aliases
  department_name?: string;
  location?: string;
};

export type Project = {
  id?: number;
  project_id?: number;
  project_name: string;
  start_date: string;
  end_date: string;
  department_id: number;
  department?: Department;
  // Backend fields
  title?: string;
  description?: string;
};

export type Employee = {
  id?: number;
  employee_id?: number;
  employee_name?: string;
  job_title?: string;
  hire_date?: string;
  // Legacy fields for backward compatibility (read-only)
  first_name?: string;
  last_name?: string;
  position?: string;
  email?: string;
};

export type EmployeeProject = {
  id?: number;
  employee_project_id?: number;
  employee_id: number;
  project_id: number;
  role: string;
  hours_worked: number;
  employee?: Employee;
  project?: Project;
};

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const sanitize = (val: string) => val.replace(/<[^>]*>/g, "").slice(0, 500);
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    ...init
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const detail =
      typeof payload === "string"
        ? sanitize(payload)
        : JSON.stringify(payload);
    throw new Error(detail || response.statusText || "Request failed");
  }

  return payload as T;
}

export function extractResults<T>(data: any): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && Array.isArray(data.results)) return data.results as T[];
  return [];
}

const buildQuery = (params?: Record<string, any>) => {
  if (!params) return "";
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
  if (!entries.length) return "";
  const search = new URLSearchParams();
  entries.forEach(([key, value]) => search.append(key, String(value)));
  return `?${search.toString()}`;
};

async function fetchList<T>(path: string, params?: Record<string, any>): Promise<T[]> {
  const data = await apiRequest<any>(`${path}${buildQuery(params)}`);
  return extractResults<T>(data);
}

// Departments
export const departmentApi = {
  list: (params?: Record<string, any>) => fetchList<Department>("/departments/", params),
  create: (payload: Partial<Department>) =>
    apiRequest<Department>("/departments/", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: number | string, payload: Partial<Department>) =>
    apiRequest<Department>(`/departments/${id}/`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id: number | string) => apiRequest(`/departments/${id}/`, { method: "DELETE" })
};

// Projects
export const projectApi = {
  list: (params?: Record<string, any>) => fetchList<Project>("/projects/", params),
  create: (payload: Partial<Project>) =>
    apiRequest<Project>("/projects/", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: number | string, payload: Partial<Project>) =>
    apiRequest<Project>(`/projects/${id}/`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id: number | string) => apiRequest(`/projects/${id}/`, { method: "DELETE" })
};

// Employees (keep compatibility with existing endpoints)
export const employeeApi = {
  list: (params?: Record<string, any>) => fetchList<Employee>("/employees/", params),
  create: (payload: Pick<Employee, "employee_name" | "job_title" | "hire_date">) =>
    apiRequest<Employee>("/employees/", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: number | string, payload: Pick<Employee, "employee_name" | "job_title" | "hire_date">) =>
    apiRequest<Employee>(`/employees/${id}/`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id: number | string) => apiRequest(`/employees/${id}/`, { method: "DELETE" })
};

// Employee-Projects (Assignments)
export const assignmentApi = {
  list: (params?: { employee_id?: number; project_id?: number }) =>
    fetchList<EmployeeProject>("/employee-projects/", params),
  create: (payload: Partial<EmployeeProject>) =>
    apiRequest<EmployeeProject>("/employee-projects/", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: number | string, payload: Partial<EmployeeProject>) =>
    apiRequest<EmployeeProject>(`/employee-projects/${id}/`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id: number | string) => apiRequest(`/employee-projects/${id}/`, { method: "DELETE" })
};

export function normalizeId(value: any): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return undefined;
}
