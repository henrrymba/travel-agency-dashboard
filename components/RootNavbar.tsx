import React from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { useAuth } from "~/context/AuthContext";
import { cn } from "~/lib/utils";

const RootNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/sign-in");
  };

  if (!user) return null;

  return (
    <nav
      className={cn(
        location.pathname === `/travel/${params.tripId}`
          ? "bg-white"
          : "glassmorphism",
        "w-full fixed z-50"
      )}
    >
      <header className="root-nav wrapper">
        <Link to="/" className="link-logo">
          <img
            src="/assets/icons/logo.svg"
            alt="logo"
            className="size-[30px]"
          />
          <h1>Tourvisto</h1>
        </Link>

        <aside>
          {user.status === "admin" && (
            <Link
              to="/dashboard"
              className={cn("text-base font-normal text-white", {
                "text-dark-100": location.pathname.startsWith("/travel"),
              })}
            >
              Admin Panel
            </Link>
          )}

          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt="user"
              className="size-10 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="size-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-lg">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}

          <button onClick={handleLogout} className="cursor-pointer">
            <img
              src="/assets/icons/logout.svg"
              alt="logout"
              className="size-6 rotate-180"
            />
          </button>
        </aside>
      </header>
    </nav>
  );
};
export default RootNavbar;
