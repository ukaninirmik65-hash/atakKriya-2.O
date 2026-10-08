import { Outlet, useLocation } from "react-router";
import { useEffect, useState } from "react";
import Header from "../pages/dashboard/Header";
import Sidebar from "../pages/dashboard/Sidebar";

const MainLayout = () => {
  const { pathname } = useLocation();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [expandedSidebarPath, setExpandedSidebarPath] = useState(null);
  const tabletSidebarExpanded =
    sidebarExpanded && expandedSidebarPath === pathname;
  const handleSidebarExpandedChange = (expanded) => {
    setSidebarExpanded(expanded);
    setExpandedSidebarPath(expanded ? pathname : null);
  };
  const [mobileMenu, setMobileMenu] = useState({ pathname: "", open: false });
  const mobileMenuOpen =
    mobileMenu.open && mobileMenu.pathname === pathname;
  const closeMobileMenu = () =>
    setMobileMenu({ pathname, open: false });

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setMobileMenu({ pathname, open: false });
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen, pathname]);

  const pageTitle =
    pathname === "/loan-advance"
      ? "Loan and Advance"
      : pathname
          .slice(1)
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar
        onExpandedChange={handleSidebarExpandedChange}
        mobileOpen={mobileMenuOpen}
        onMobileClose={closeMobileMenu}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-y-0 left-[52px] right-0 z-[35] hidden bg-slate-900/5 transition-[backdrop-filter,background-color,opacity] duration-300 ease-in-out md:inset-y-auto md:bottom-0 md:top-[72px] md:block lg:hidden ${
          tabletSidebarExpanded
            ? "backdrop-blur-sm opacity-100"
            : "backdrop-blur-none bg-transparent opacity-0"
        }`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-y-0 left-[52px] right-0 z-[35] hidden bg-slate-900/5 transition-[backdrop-filter,background-color,opacity] duration-300 ease-in-out lg:block ${
          sidebarExpanded
            ? "backdrop-blur-sm opacity-100"
            : "backdrop-blur-none bg-transparent opacity-0"
        }`}
      />
      <button
        type="button"
        aria-label="Close navigation menu"
        tabIndex={mobileMenuOpen ? 0 : -1}
        onClick={closeMobileMenu}
        className={`fixed inset-0 z-40 bg-slate-950/25 backdrop-blur-sm transition-[opacity,backdrop-filter] duration-300 ease-in-out motion-reduce:transition-none md:hidden ${
          mobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />
      <div className="flex min-h-screen min-w-0 flex-col md:ml-[52px]">
        <Header
          title={pageTitle}
          mobileMenuOpen={mobileMenuOpen}
          onMenuClick={() =>
            setMobileMenu({ pathname, open: !mobileMenuOpen })
          }
        />
        <main
          inert={mobileMenuOpen}
          className="relative z-0 isolate mt-[72px] min-h-[calc(100vh-72px)] flex-1 overflow-y-auto p-5 sm:p-8"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
