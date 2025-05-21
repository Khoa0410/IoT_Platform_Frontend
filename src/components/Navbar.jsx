import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { isLoggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Gọi hàm logout từ context
    navigate("/");
  };

  const handleHomeClick = () => {
    sessionStorage.setItem("lastPath", "/");
    navigate("/");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-30 mx-auto w-full max-w-screen-md border border-gray-100 bg-white/80 py-3 shadow backdrop-blur-lg md:top-6 md:rounded-3xl lg:max-w-screen-lg">
      <div className="px-4">
        <div className="flex items-center justify-between">
          <div className="flex shrink-0">
            <button
              aria-current="page"
              className="flex items-center"
              onClick={handleHomeClick}>
              <img
                className="h-7 w-auto"
                src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
                alt="Website Logo"
              />
              <p className="sr-only">IoT Platform</p>
            </button>
          </div>
          <div className="hidden md:flex md:items-center md:justify-center md:gap-5">
            {isLoggedIn ? (
              // Hiển thị khi đã đăng nhập
              <>
                <Link
                  className="inline-block rounded-lg px-2 py-1 text-sm font-medium text-gray-900 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900"
                  to="/DeviceList">
                  Device
                </Link>
                <Link
                  className="inline-block rounded-lg px-2 py-1 text-sm font-medium text-gray-900 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900"
                  to="/Dashboard">
                  Dashboard
                </Link>
                <a
                  className="inline-block rounded-lg px-2 py-1 text-sm font-medium text-gray-900 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900"
                  href="https://www.linkedin.com/in/nguy%E1%BB%85n-%C4%91%E1%BB%A9c-khoa-a840aa256/"
                  target="_blank"
                  rel="noopener noreferrer">
                  Contact
                </a>
                <a
                  className="inline-block rounded-lg px-2 py-1 text-sm font-medium text-gray-900 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900"
                  href="/Document"
                  target="_blank"
                  rel="noopener noreferrer">
                  Document
                </a>
              </>
            ) : (
              // Hiển thị khi chưa đăng nhập
              <>
                <a
                  className="inline-block rounded-lg px-2 py-1 text-sm font-medium text-gray-900 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900"
                  href="https://www.linkedin.com/in/nguy%E1%BB%85n-%C4%91%E1%BB%A9c-khoa-a840aa256/"
                  target="_blank"
                  rel="noopener noreferrer">
                  Contact
                </a>
                <a
                  className="inline-block rounded-lg px-2 py-1 text-sm font-medium text-gray-900 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900"
                  href="/Document"
                  target="_blank"
                  rel="noopener noreferrer">
                  Document
                </a>
              </>
            )}
          </div>
          <div className="flex items-center justify-end gap-3">
            {isLoggedIn ? (
              // Hiển thị khi đã đăng nhập
              <>
                <Link
                  className="hidden items-center justify-center rounded-xl bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 transition-all duration-150 hover:bg-gray-50 sm:inline-flex"
                  to="">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
                  Log out
                </button>
              </>
            ) : (
              // Hiển thị khi chưa đăng nhập
              <>
                <Link
                  className="hidden items-center justify-center rounded-xl bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 transition-all duration-150 hover:bg-gray-50 sm:inline-flex"
                  to="/register">
                  Sign up
                </Link>
                <Link
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  to="/login">
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
