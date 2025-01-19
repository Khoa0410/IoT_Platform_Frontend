import React, { useState } from "react";
import Navbar from "../components/Navbar";
import ChartList from "../components/ChartList";
import SendMQTTCommand from "../components/SendMQTTCommand";
import ButtonList from "../components/ButtonList";

const Dashboard = () => {
  const [activeComponent, setActiveComponent] = useState("charts");

  // Hàm chuyển đổi giữa các component
  const handleComponentChange = (component) => {
    setActiveComponent(component);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="top-0 left-0 w-full z-10">
        <Navbar />
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-10 mt-20 text-center">
        Dashboard Management
      </h1>

      {/* Chuyển đổi giữa ChartList và SendMQTTCommand */}
      <div className="mb-8 flex space-x-4">
        <button
          onClick={() => handleComponentChange("charts")}
          className={`px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 ease-in-out transform focus:outline-none ${
            activeComponent === "charts"
              ? "bg-blue-500 shadow-md hover:bg-blue-600"
              : "bg-gray-500 hover:bg-gray-600"
          } hover:scale-105`}>
          Visualize Data
        </button>

        <button
          onClick={() => handleComponentChange("button")}
          className={`px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 ease-in-out transform focus:outline-none ${
            activeComponent === "button"
              ? "bg-blue-500 shadow-md hover:bg-blue-600"
              : "bg-gray-500 hover:bg-gray-600"
          } hover:scale-105`}>
          Control Device
        </button>

        <button
          onClick={() => handleComponentChange("sendCommand")}
          className={`px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 ease-in-out transform focus:outline-none ${
            activeComponent === "sendCommand"
              ? "bg-blue-500 shadow-md hover:bg-blue-600"
              : "bg-gray-500 hover:bg-gray-600"
          } hover:scale-105`}>
          Send Command
        </button>
      </div>

      {/* Hiển thị component tương ứng */}
      {activeComponent === "charts" ? (
        <ChartList />
      ) : activeComponent === "sendCommand" ? (
        <SendMQTTCommand />
      ) : (
        <ButtonList />
      )}
    </div>
  );
};

export default Dashboard;
