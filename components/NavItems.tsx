import { Link, NavLink, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { sidebarItems } from "~/constants";
import { cn } from "~/lib/utils";
import { useAuth } from "~/context/AuthContext";

const NavItems = ({ handleClick }: { handleClick?: () => void }) => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/sign-in");
  };

  return (
    <section className="nav-items">
      <Link to="/" className="link-logo">
        <img src="/assets/icons/logo.svg" alt="logo" className="size-[30px]" />
        <h1>Tourvisto</h1>
      </Link>

      <div className="container">
        <nav>
          {sidebarItems.map(({ id, href, icon, label }) => {
            let translatedLabel = label;
            if (label === "Dashboard") translatedLabel = t("sidebar.dashboard");
            if (label === "All Users") translatedLabel = t("sidebar.allUsers");
            if (label === "AI Trips") translatedLabel = t("sidebar.aiTrips");

            return (
              <NavLink to={href} key={id}>
                {({ isActive }: { isActive: boolean }) => (
                  <div
                    className={cn("group nav-item", {
                      "bg-primary-100 !text-white": isActive,
                    })}
                    onClick={handleClick}
                  >
                    <img
                      src={icon}
                      alt={translatedLabel}
                      className={`group-hover:brightness-0 size-0 group-hover:invert ${isActive ? "brightness-0 invert" : "text-dark-200"}`}
                    />
                    {translatedLabel}
                  </div>
                )}
              </NavLink>
            );
          })}
          <LanguageSwitcher />
        </nav>

        <footer className="nav-footer">
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user?.name || "User"}
              className="size-10 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="size-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-lg">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}

          <article>
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
          </article>

          <button onClick={handleLogout} className="cursor-pointer">
            <img
              src="/assets/icons/logout.svg"
              alt="logout"
              className="size-6"
            />
          </button>
        </footer>
      </div>
    </section>
  );
};

export default NavItems;
