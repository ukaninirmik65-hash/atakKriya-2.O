import { useEffect, useState } from "react";
import {
  Banknote,
  CalendarCheck2,
  LayoutDashboard,
  LogOut,
  MapPin,
  PersonStanding,
  Settings,
  UserRoundCheck,
  X,
} from "lucide";
import { NavLink, useNavigate } from "react-router";
import LucideIcon from "../../components/common/LucideIcon";
import useAuth from "../../hook/useAuth";

const navigation = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Employee Attendance",
    to: "/employee-attendance",
    icon: UserRoundCheck,
  },
  {
    label: "Leave Requests",
    to: "/leave-requests",
    icon: CalendarCheck2,
  },
  {
    label: "Sales Attendance",
    to: "/sales-attendance",
    icon: PersonStanding,
  },
  {
    label: "Sales Expenses",
    to: "/sales-expenses",
    icon: Banknote,
  },
  {
    label: "Sales Location & Notes",
    to: "/sales-location",
    icon: MapPin,
  },
  {
    label: "Settings",
    to: "/settings",
    icon: Settings,
  },
];

const Sidebar = ({ onExpandedChange, mobileOpen, onMobileClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(() =>
    window.matchMedia("(max-width: 767px)").matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const handleBreakpointChange = (event) => setIsMobile(event.matches);
    mediaQuery.addEventListener("change", handleBreakpointChange);

    return () =>
      mediaQuery.removeEventListener("change", handleBreakpointChange);
  }, []);

  const handleLogout = () => {
    onMobileClose();
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside
      onMouseEnter={() => {
        if (window.matchMedia("(min-width: 768px)").matches) {
          onExpandedChange(true);
        }
      }}
      onMouseLeave={() => {
        if (window.matchMedia("(min-width: 768px)").matches) {
          onExpandedChange(false);
        }
      }}
      aria-label="Main menu"
      aria-hidden={!mobileOpen && isMobile}
      inert={!mobileOpen && isMobile}
      id="mobile-navigation"
      className={`group/sidebar fixed inset-y-0 left-0 z-[60] flex w-[min(33vw,16rem)] min-w-[140px] flex-col overflow-hidden border-r border-slate-200 bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none md:z-40 md:w-[52px] md:min-w-0 md:translate-x-0 md:transition-[width] md:duration-300 md:ease-in-out md:hover:w-64 md:[&:not(:hover)]:duration-[400ms] md:[&:not(:hover)]:ease-[cubic-bezier(0.22,1,0.36,1)] ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-16 shrink-0 items-center justify-start overflow-hidden border-b border-slate-200 px-4 md:h-[60px] md:justify-center md:px-0 md:group-hover/sidebar:justify-start md:group-hover/sidebar:px-2">
        <button
          type="button"
          onClick={onMobileClose}
          className="inline-flex h-full w-full items-center gap-3 text-left text-sm font-medium text-slate-600 md:hidden"
          aria-label="Close navigation menu"
        >
          <LucideIcon icon={X} />
          <span>Close</span>
        </button>
        <img
          src="/AK_Short_hand_192x192.png"
          alt="Atal Karya"
          className="hidden h-9 w-9 shrink-0 object-contain md:block md:group-hover/sidebar:hidden"
        />
        <img
          src="/AK_Full_logo.png"
          alt="Atal Karya"
          className="hidden h-10 w-auto max-w-[220px] object-contain md:group-hover/sidebar:block"
        />
      </div>

      <nav aria-label="Main navigation" className="flex-1 space-y-1 overflow-y-auto py-2">
        {navigation.map(({ label, to, icon }) => (
          <NavLink
            key={to}
            to={to}
            title={label}
            onClick={() => {
              onMobileClose();
              if (
                window.matchMedia(
                  "(min-width: 768px) and (max-width: 1023px)",
                ).matches
              ) {
                onExpandedChange(false);
              }
            }}
            className={({ isActive }) =>
              `mx-1 flex min-h-12 items-center justify-start gap-3 overflow-hidden rounded-md px-3 py-2 text-sm font-medium transition-colors md:min-h-9 md:justify-center md:px-0 md:py-0 md:group-hover/sidebar:justify-start md:group-hover/sidebar:px-3 ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <LucideIcon icon={icon} />
            <span className="min-w-0 whitespace-normal leading-5 md:whitespace-nowrap md:hidden md:group-hover/sidebar:inline">
              {label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-1">
        <button
          type="button"
          onClick={handleLogout}
          title="Logout"
          className="flex min-h-9 w-full cursor-pointer items-center justify-start gap-3 overflow-hidden rounded-md px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 md:justify-center md:px-0 md:group-hover/sidebar:justify-start md:group-hover/sidebar:px-3"
        >
          <LucideIcon icon={LogOut} />
          <span className="min-w-0 whitespace-normal leading-5 md:whitespace-nowrap md:hidden md:group-hover/sidebar:inline">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;