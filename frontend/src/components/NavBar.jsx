import { NavLink } from "react-router-dom";

const NavBar = () => {
  return (
    <nav className="top-nav">
      <div>
        <p className="eyebrow subtle">Flow Runner</p>
        <h1 className="brand">Async Task Orchestrator</h1>
      </div>
      <div className="nav-links">
        <NavLink to="/" end className="nav-link">
          Launch tasks
        </NavLink>
        <NavLink to="/track" className="nav-link">
          Track by ID
        </NavLink>
      </div>
    </nav>
  );
};

export default NavBar;

