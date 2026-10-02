import { NavLink, Route, Routes, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarRange,
  Building2,
  Percent,
  Wallet,
  Ship,
  ChartNoAxesCombined,
  Plug,
  Settings,
  ChevronDown,
  PanelLeftClose,
  Menu,
  X,
  CircleHelp,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Reservations from "./pages/Reservations";
import ReservationDetail from "./pages/ReservationDetail";
import Properties, { PropertyDetail } from "./pages/Properties";
import CommissionRules from "./pages/CommissionRules";
import OwnerPayments from "./pages/OwnerPayments";
import AdditionalServices from "./pages/AdditionalServices";
import Reports from "./pages/Reports";
import Integrations from "./pages/Integrations";
import SettingsPage from "./pages/Settings";
import { Toast } from "./components/UI";
export default function App() {
  const [menu, setMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width:760px)").matches,
  );
  const sidebarRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const mq = window.matchMedia("(max-width:760px)");
    const update = () => {
      setIsMobile(mq.matches);
      if (!mq.matches) setMenu(false);
    };
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!menu || !isMobile) return;
    const links = Array.from(
      sidebarRef.current?.querySelectorAll<HTMLElement>("a,button") || [],
    );
    links[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setMenu(false);
      }
      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === links[0]) {
          e.preventDefault();
          links.at(-1)?.focus();
        } else if (!e.shiftKey && document.activeElement === links.at(-1)) {
          e.preventDefault();
          links[0]?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      menuRef.current?.focus();
    };
  }, [menu, isMobile]);
  const location = useLocation();
  const nav = [
    { to: "/", title: "Dashboard", icon: LayoutDashboard },
    { to: "/reservations", title: "Reservations", icon: CalendarRange },
    { to: "/properties", title: "Properties", icon: Building2 },
  ];
  return (
    <div className="app-shell">
      <aside
        id="main-sidebar"
        ref={sidebarRef}
        inert={isMobile && !menu}
        className={`sidebar ${menu ? "open" : ""}`}
      >
        <Link to="/" className="brand" onClick={() => setMenu(false)}>
          <span className="brand-symbol">
            tlt<span>·</span>
          </span>
          <div>
            The Lembongan Traveller<span>Back Office</span>
          </div>
        </Link>
        <div className="workspace-selector">
          <span className="workspace-avatar">TL</span>
          <div>
            TLT Management<small>Financial operations</small>
          </div>
          <ChevronDown size={15} />
        </div>
        <nav aria-label="Main navigation">
          {nav.map((n) => (
            <NavLink
              end={n.to === "/"}
              key={n.to}
              to={n.to}
              onClick={() => setMenu(false)}
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <n.icon size={18} />
              {n.title}
            </NavLink>
          ))}
          <div className="nav-section">Financials</div>
          {[
            {
              to: "/financials/commission-rules",
              title: "Commission rules",
              icon: Percent,
            },
            {
              to: "/financials/owner-payments",
              title: "Owner payments",
              icon: Wallet,
            },
            {
              to: "/additional-services",
              title: "Additional services",
              icon: Ship,
            },
            { to: "/reports", title: "Reports", icon: ChartNoAxesCombined },
          ].map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              onClick={() => setMenu(false)}
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <n.icon size={18} />
              {n.title}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="prototype-note">
            <span className="prototype-tag">DEMO WORKSPACE</span>
            <p>
              All data is mocked.
              <br />
              Changes reset on refresh.
            </p>
          </div>
          {[
            { to: "/integrations", title: "Integrations", icon: Plug },
            { to: "/settings", title: "Settings", icon: Settings },
          ].map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              onClick={() => setMenu(false)}
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <n.icon size={18} />
              {n.title}
            </NavLink>
          ))}
          <div className="user-profile">
            <span className="user-avatar">EN</span>
            <div>
              Enrico<small>Workspace admin</small>
            </div>
            <PanelLeftClose size={17} />
          </div>
        </div>
      </aside>
      {menu && (
        <button
          className="mobile-overlay"
          onClick={() => setMenu(false)}
          aria-label="Close navigation"
        />
      )}
      <div className="main-area">
        <div className="topbar">
          <div className="breadcrumbs">
            <button
              ref={menuRef}
              aria-expanded={menu}
              aria-controls="main-sidebar"
              className="icon-button mobile-menu"
              aria-label="Toggle navigation"
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span>Workspace</span>
            <span className="breadcrumb-slash">/</span>
            <strong>
              {location.pathname === "/"
                ? "Overview"
                : location.pathname.startsWith("/financials")
                  ? "Financials"
                  : location.pathname.startsWith("/reservations")
                    ? "Reservations"
                    : location.pathname.startsWith("/properties")
                      ? "Properties"
                      : location.pathname === "/reports"
                        ? "Reports"
                        : location.pathname === "/integrations"
                          ? "Integrations"
                          : location.pathname === "/settings"
                            ? "Settings"
                            : "Additional services"}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="currency-label">USD</span>
            <span className="vertical-rule" />
            <Link aria-label="Prototype assumptions" to="/settings">
              <CircleHelp size={18} />
            </Link>
            <span className="small-avatar">EN</span>
          </div>
        </div>
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/reservations/:id" element={<ReservationDetail />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/:id" element={<PropertyDetail />} />
            <Route
              path="/financials/commission-rules"
              element={<CommissionRules />}
            />
            <Route
              path="/financials/owner-payments"
              element={<OwnerPayments />}
            />
            <Route
              path="/additional-services"
              element={<AdditionalServices />}
            />
            <Route path="/reports" element={<Reports />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route
              path="*"
              element={
                <div className="empty">
                  <h1>Page not found</h1>
                  <Link className="text-link" to="/">
                    Return to dashboard
                  </Link>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
      <Toast />
    </div>
  );
}
