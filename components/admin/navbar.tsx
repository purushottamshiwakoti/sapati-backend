import { AuthUser } from "@/lib/auth-user";
import { AuthActions } from "./auth-actions";
import { ThemeSwitcher } from "./theme-switcher";

export const Navbar = async () => {
  const authUser = await AuthUser();
  return (
    <>
      <div className="p-4 inset-0 sticky bg-white dark:bg-black border-b z-50  ">
        <div className="flex items-center justify-between ">
          <div className="hidden lg:block">
            <h2 className="md:text-lg text-xs animate-pulse  font-medium capitalize ">
              Welcome to admin dashboard
            </h2>
          </div>
          <AuthActions name={authUser?.name} />
          <div>
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </>
  );
};
