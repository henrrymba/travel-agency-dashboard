import { Outlet, redirect, useNavigate } from "react-router";
import { getCurrentUser } from "~/appwrite/auth";
import RootNavbar from "../../../components/RootNavbar";

export async function clientLoader() {
  try {
    const user = await getCurrentUser();

    if (!user) return redirect("/sign-in");

    return user;
  } catch (e) {
    console.log("Error fetching user", e);
    return redirect("/sign-in");
  }
}

const PageLayout = () => {
  return (
    <div className="bg-light-200">
      <RootNavbar />
      <Outlet />
    </div>
  );
};
export default PageLayout;
