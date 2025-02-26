import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="p-4 bg-gray-900 flex items-center text-white shadow-lg">
          <Link
            to="/"
            className="text-sm  mr-2 sm:text-base font-medium text-gray-200  px-2 sm:px-3 py-1 rounded hover:bg-black hover:text-white transition-all"
          >
            Home
          </Link>
      {user ? (
        <div className="flex w-full justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Link
            to="/my-post"
            className="text-sm sm:text-base font-medium text-gray-200  px-2 sm:px-3 py-1 rounded hover:bg-black hover:text-white transition-all"
          >
            My Posts
          </Link>

          <Link
            to="/saved-post"
            className="text-sm sm:text-base font-medium text-gray-200  px-2 sm:px-3 py-1 rounded hover:bg-black hover:text-white transition-all"
          >
            Saved Posts
          </Link>

          
        </div>
        <div>

          <button
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
            className="text-sm ml-auto sm:text-base cursor-pointer text-white bg-gray-600 px-3 sm:px-4 py-1.5 rounded hover:bg-gray-800 transition-all"
            >
            Logout
          </button>
            </div>
        </div>
      ) : (
        <div className="flex ml-auto items-center space-x-2 sm:space-x-4">
          <Link
            to="/login"
            className="text-sm sm:text-base font-bold text-gray-200 hover:text-blue-500"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="text-sm sm:text-base font-bold text-gray-200 hover:text-green-500"
          >
            Register
          </Link>
        </div>
      )}
    </div>
  );
};

export default Navbar;
