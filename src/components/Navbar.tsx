import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path ? "text-gray-600" : "text-gray-200";

  return (
    <nav className="p-4 bg-gray-900 flex items-center text-white shadow-lg">
      <Link
        to="/"
        className={`text-sm sm:text-base font-medium px-2 sm:px-3 py-1 rounded hover:bg-black hover:text-white transition-all ${isActive(
          "/"
        )}`}
      >
        Home
      </Link>

      {user ? (
        <div className="flex w-full justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link
              to="/myPost"
              className={`text-sm sm:text-base font-medium px-2 sm:px-3 py-1 rounded hover:bg-black hover:text-white transition-all ${isActive(
                "/myPost"
              )}`}
            >
              My Posts
            </Link>

            <Link
              to="/savePost"
              className={`text-sm sm:text-base font-medium px-2 sm:px-3 py-1 rounded hover:bg-black hover:text-white transition-all ${isActive(
                "/savePost"
              )}`}
            >
              Saved Posts
            </Link>
          </div>

          <button
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
            className="text-sm sm:text-base ml-auto cursor-pointer text-white bg-gray-600 px-3 sm:px-4 py-1.5 rounded hover:bg-gray-800 transition-all"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex ml-auto items-center space-x-2 sm:space-x-4">
          <Link
            to="/login"
            className={`text-sm sm:text-base font-bold hover:text-gray-500 ${isActive(
              "/login"
            )}`}
          >
            Login
          </Link>

          <Link
            to="/register"
            className={`text-sm sm:text-base font-bold hover:text-gray-500 ${isActive(
              "/register"
            )}`}
          >
            Register
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
