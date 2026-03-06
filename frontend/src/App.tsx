import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import AssignmentsPage from "./pages/AssignmentsPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import EmployeesPage from "./pages/EmployeesPage";
import ProjectsPage from "./pages/ProjectsPage";

const navItems = [
  { path: "/", label: "Employees" },
  { path: "/departments", label: "Departments" },
  { path: "/projects", label: "Projects" },
  { path: "/assignments", label: "Assignments" }
];

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-accent via-primary to-secondary px-4 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-2xl border border-secondary/50 bg-light/90 p-6 shadow-lg backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-secondary">Company Management</p>
              <h1 className="text-3xl font-semibold text-slate-900">Employee Suite</h1>
              <p className="text-sm text-slate-600">
                Manage employees, departments, projects, and assignments with a unified UI.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 rounded-xl border border-secondary/60 bg-light/80 px-4 py-2 text-xs font-semibold text-accent">
              <span>Tailwind UI</span>
              <span className="text-secondary">React + Vite</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[230px,1fr]">
          <aside className="rounded-2xl border border-secondary/50 bg-light/90 p-4 shadow-lg backdrop-blur">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    [
                      "rounded-xl px-4 py-3 text-sm font-semibold transition",
                      isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                        : "bg-light text-accent border border-secondary/50 hover:bg-secondary/10"
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <main className="space-y-6">
            <Routes>
              <Route path="/" element={<EmployeesPage />} />
              <Route path="/departments" element={<DepartmentsPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/assignments" element={<AssignmentsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}
