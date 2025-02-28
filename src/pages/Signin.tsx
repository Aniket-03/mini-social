import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { formatError } from "../common/error";

const SignIn = () => {
  const { loginWithEmailPassword, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    userEmail: "",
    userPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input change
  const updateCredentials = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  // Process login
  const processSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    const { userEmail, userPassword } = credentials;

    if (!userEmail || !userPassword) {
      toast.error("Please provide both email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await loginWithEmailPassword(userEmail, userPassword);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err: any) {
      toast.error(formatError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google authentication
  const authenticateWithGoogle = async () => {
    try {
      await loginWithGoogle();
      toast.success("Signed in using Google!");
      navigate("/");
    } catch (err: any) {
      toast.error(formatError(err));
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="bg-gray-100 p-6 rounded-sm shadow-lg w-full max-w-sm sm:w-96">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Sign In
        </h2>

        <form onSubmit={processSignIn}>
          {/* Email Input */}
          <div className="mb-4">
            <input
              type="email"
              name="userEmail"
              value={credentials.userEmail}
              onChange={updateCredentials}
              className="border border-gray-300 p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email Address"
              required
            />
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <input
              type="password"
              name="userPassword"
              value={credentials.userPassword}
              onChange={updateCredentials}
              className="border border-gray-300 p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-blue-500 text-white p-2 rounded-md w-full hover:bg-blue-600 transition ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {isSubmitting ? "Signing In..." : "Login"}
          </button>
        </form>

        {/* Google Sign-In Button */}
        <div>
          <svg
            onClick={authenticateWithGoogle}
            className="justify-self-center mt-4 cursor-pointer"
            height={40}
            width={40}
            viewBox="-0.5 0 48 48"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            fill="#000000"
          >
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <title>Google-color</title>
              <desc>Created with Sketch.</desc>
              <defs></defs>
              <g id="Icons" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g id="Color-" transform="translate(-401.000000, -860.000000)">
                  <g id="Google" transform="translate(401.000000, 860.000000)">
                    <path
                      d="M9.82727273,24 C9.82727273,22.4757333 10.0804318,21.0144 10.5322727,19.6437333 L2.62345455,13.6042667 C1.08206818,16.7338667 0.213636364,20.2602667 0.213636364,24 C0.213636364,27.7365333 1.081,31.2608 2.62025,34.3882667 L10.5247955,28.3370667 C10.0772273,26.9728 9.82727273,25.5168 9.82727273,24"
                      id="Fill-1"
                      fill="#FBBC05"
                    ></path>
                    <path
                      d="M23.7136364,10.1333333 C27.025,10.1333333 30.0159091,11.3066667 32.3659091,13.2266667 L39.2022727,6.4 C35.0363636,2.77333333 29.6954545,0.533333333 23.7136364,0.533333333 C14.4268636,0.533333333 6.44540909,5.84426667 2.62345455,13.6042667 L10.5322727,19.6437333 C12.3545909,14.112 17.5491591,10.1333333 23.7136364,10.1333333"
                      id="Fill-2"
                      fill="#EB4335"
                    ></path>
                    <path
                      d="M23.7136364,37.8666667 C17.5491591,37.8666667 12.3545909,33.888 10.5322727,28.3562667 L2.62345455,34.3946667 C6.44540909,42.1557333 14.4268636,47.4666667 23.7136364,47.4666667 C29.4455,47.4666667 34.9177955,45.4314667 39.0249545,41.6181333 L31.5177727,35.8144 C29.3995682,37.1488 26.7323182,37.8666667 23.7136364,37.8666667"
                      id="Fill-3"
                      fill="#34A853"
                    ></path>
                    <path
                      d="M46.1454545,24 C46.1454545,22.6133333 45.9318182,21.12 45.6113636,19.7333333 L23.7136364,19.7333333 L23.7136364,28.8 L36.3181818,28.8 C35.6879545,31.8912 33.9724545,34.2677333 31.5177727,35.8144 L39.0249545,41.6181333 C43.3393409,37.6138667 46.1454545,31.6490667 46.1454545,24"
                      id="Fill-4"
                      fill="#4285F4"
                    ></path>
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </div>

        <p className="text-center text-gray-600 mt-4">
          No account yet?{" "}
          <Link to="/register" className="text-blue-500 hover:underline font-medium">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
