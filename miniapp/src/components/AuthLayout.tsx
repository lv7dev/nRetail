import { Outlet } from "react-router-dom";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div
        className="absolute right-4"
        style={{ top: "var(--zalo-chrome-top)" }}
      >
        <LanguageSwitcher />
      </div>
      <Outlet />
    </div>
  );
};

export default AuthLayout;
