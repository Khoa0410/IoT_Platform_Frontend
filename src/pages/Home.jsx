import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const Home = () => {
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="top-0 left-0 w-full z-10">
        <Navbar />
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-4xl font-extrabold text-gray-900">
          Welcome to IoT Platform
        </h1>
        <p className="mt-2 text-gray-600">
          Manage your devices and monitor your dashboard from one place.
        </p>
      </div>

      {!isLoggedIn ? (
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md text-center">
          <p className="text-red-600 mb-4">Please log in to continue.</p>
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600">
            Log in
          </Link>
        </div>
      ) : (
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
          <Link
            to="/DeviceList"
            className="w-full mb-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600">
            Go to Device Management
          </Link>

          <Link
            to="/Dashboard"
            className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600">
            Go to Dashboard Management
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;
