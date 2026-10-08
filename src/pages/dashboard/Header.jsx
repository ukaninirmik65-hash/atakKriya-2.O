import { Menu, X } from "lucide";
import LucideIcon from "../../components/common/LucideIcon";

const Header = ({ title, onMenuClick, mobileMenuOpen }) => {
  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-[72px] items-center rounded-b-lg bg-gradient-to-r from-indigo-600 to-blue-500 px-5 text-white shadow-md md:left-[52px]">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-navigation"
        className="mr-3 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:hidden"
      >
        <LucideIcon icon={mobileMenuOpen ? X : Menu} />
      </button>
      <h1 className="min-w-0 truncate text-xl font-bold leading-none md:text-2xl">
        {title}
      </h1>
    </header>
  );
};

export default Header;
