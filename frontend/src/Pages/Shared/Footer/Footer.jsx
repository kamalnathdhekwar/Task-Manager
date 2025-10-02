import { useContext } from "react";
import { authContext } from "../../../ContextApi/AuthContext";

const Footer = () => {
  const { theme } = useContext(authContext);
  return (
    <div
      className={`flex flex-col gap-2 items-center justify-center pb-6 pt-8 mt-6 ${
        theme === "light"
          ? "bg-blue-50 text-gray-500"
          : "bg-blue-900/30 text-gray-400"
      } px-2`}
    >
      <p className="text-xs text-center">
        Copyright &copy; 2025 All Rights Reserved by Task Management
      </p>
      <p className="text-xs text-center">Developed by Kamlanath Dhekwar</p>
    </div>
  );
};

export default Footer;
