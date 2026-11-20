import { NavLink, Route, Routes, useLocation, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarRange,
  Building2,
  Percent,
  Wallet,
  Ship,
  ListPlus,
  ChartNoAxesCombined,
  Plug,
  Settings,
  Users,
  PanelLeftClose,
  Menu,
  X,
  CircleHelp,
} from "lucide-react";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { BrandMark } from "./components/BrandMark";
import Dashboard from "./pages/Dashboard";
import Reservations from "./pages/Reservations";
import ReservationDetail from "./pages/ReservationDetail";
import Properties, { PropertyDetail } from "./pages/Properties";
import CommissionRules from "./pages/CommissionRules";
import OwnerPayments from "./pages/OwnerPayments";
import AdditionalServices from "./pages/AdditionalServices";
import BoatOrders from "./pages/BoatOrders";
import Reports from "./pages/Reports";
import Integrations from "./pages/Integrations";
import SettingsPage from "./pages/Settings";
import UserManagement from "./pages/UserManagement";
import { Button, Toast } from "./components/UI";
import { useApp } from "./context/AppContext";
import { accessModules, type AccessModule } from "./data/access";
import Login from "./pages/Login";

const mainNavigation = [
  { to: "/", icon: LayoutDashboard, page: Dashboard },
  { to: "/reservations", icon: CalendarRange, page: Reservations, detail: ReservationDetail },
  { to: "/properties", icon: Building2, page: Properties, detail: PropertyDetail },
  { to: "/boat-orders", icon: Ship, page: BoatOrders },
] as const;
const financeNavigation = [
  { to: "/financials/commission-rules", icon: Percent, page: CommissionRules },
  { to: "/financials/owner-payments", icon: Wallet, page: OwnerPayments },
  { to: "/additional-services", icon: ListPlus, page: AdditionalServices },
  { to: "/reports", icon: ChartNoAxesCombined, page: Reports },
] as const;
const adminNavigation = [
  { to: "/integrations", icon: Plug, page: Integrations },
  { to: "/user-management", icon: Users, page: UserManagement },
  { to: "/settings", icon: Settings, page: SettingsPage },
] as const;
const navigation = [...mainNavigation, ...financeNavigation, ...adminNavigation];

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();
  if (!loggedIn) {
    return <Login onLogin={() => {
      setLoggedIn(true);
      navigate("/", { replace: true });
    }} />;
  }
  return <AppShell />;
}

function AppShell() {
  const { canAccess, currentUser, currentRole, previewUserId, endAccessPreview } = useApp();
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
  const firstPage = navigation.find((item) => canAccess(item.to))?.to;
  const currentPage = navigation.find(({ to }) =>
    to === "/" ? location.pathname === to :
      location.pathname === to || location.pathname.startsWith(to + "/"),
  );
  const initials = currentUser?.name.split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
  const renderLink = (item: (typeof navigation)[number]) => (
    <NavLink
      end={item.to === "/"}
      key={item.to}
      to={item.to}
      onClick={() => setMenu(false)}
      className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
    >
      <item.icon size={18} />
      {accessModules[item.to]}
    </NavLink>
  );
  const requireAccess = (module: AccessModule, Page: ComponentType) =>
    canAccess(module) ? <Page /> : (
      <div className="empty">
        <h1>Access denied</h1>
        <p>Your role does not have access to {accessModules[module]}.</p>
        {firstPage && <Link className="text-link" to={firstPage}>Go to {accessModules[firstPage]}</Link>}
      </div>
    );
  return (
    <div className="app-shell">
      <aside
        id="main-sidebar"
        ref={sidebarRef}
        inert={isMobile && !menu}
        className={`sidebar ${menu ? "open" : ""}`}
      >
        <Link to={firstPage ?? "/"} className="brand" onClick={() => setMenu(false)}>
          <BrandMark />
        </Link>
        <nav aria-label="Main navigation">
          {mainNavigation.filter((item) => canAccess(item.to)).map(renderLink)}
          {financeNavigation.some((item) => canAccess(item.to)) && (
            <div className="nav-section">Financials</div>
          )}
          {financeNavigation.filter((item) => canAccess(item.to)).map(renderLink)}
        </nav>
        <div className="sidebar-bottom">
          {adminNavigation.filter((item) => canAccess(item.to)).map(renderLink)}
          <div className="user-profile">
            <span className="user-avatar">{initials}</span>
            <div>
              {currentUser?.name}<small>{currentRole?.name}</small>
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
              {currentPage?.to === "/" ? "Overview" :
                currentPage?.to.startsWith("/financials") ? "Financials" :
                currentPage ? accessModules[currentPage.to] : "Page not found"}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="currency-label">IDR</span>
            <span className="vertical-rule" />
            {canAccess("/settings") && (
              <Link aria-label="Prototype assumptions" to="/settings">
                <CircleHelp size={18} />
              </Link>
            )}
            <span className="small-avatar">{initials}</span>
          </div>
        </div>
        <main>
          {previewUserId && (
            <div className="access-preview panel">
              <p>Previewing access as <strong>{currentUser?.name}</strong> ({currentRole?.name}).</p>
              <Button onClick={endAccessPreview}>Exit preview</Button>
            </div>
          )}
          <Routes>
            {navigation.map((item) => (
              <Route key={item.to} path={item.to} element={requireAccess(item.to, item.page)} />
            ))}
            {navigation.map((item) => "detail" in item && (
              <Route key={item.to} path={item.to + "/:id"} element={requireAccess(item.to, item.detail)} />
            ))}
            <Route
              path="*"
              element={
                <div className="empty">
                  <h1>Page not found</h1>
                  {firstPage && <Link className="text-link" to={firstPage}>Go to {accessModules[firstPage]}</Link>}
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
