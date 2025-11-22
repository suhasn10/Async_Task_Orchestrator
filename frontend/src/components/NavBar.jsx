import { NavLink } from "react-router-dom";

const NavBar = () => {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Flow Runner
            </p>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              Async Orchestrator
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `rounded-md px-4 py-1.5 text-sm font-medium transition-all ${isActive
                ? "bg-white text-primary-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
              }`
            }
          >
            Launch
          </NavLink>
          <NavLink
            to="/track"
            className={({ isActive }) =>
              `rounded-md px-4 py-1.5 text-sm font-medium transition-all ${isActive
                ? "bg-white text-primary-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
              }`
            }
          >
            Track
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;

