import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/AxiosConfig";
import Navbar from "../components/Navbar";
import Device from "../components/Device";

const DeviceList = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const [devices, setDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State cho tìm kiếm
  const [newDevice, setNewDevice] = useState({ name: "", topic: "" }); // State cho thêm mới
  const [currentPage, setCurrentPage] = useState(1); // Quản lý trang hiện tại
  const [totalPages, setTotalPages] = useState(1); // Tổng số trang
  const [errorMessage, setErrorMessage] = useState("");
  const devicesPerPage = 5; // Số thiết bị trên mỗi trang
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await api.get("/devices");
        const sortedDevices = response.data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setDevices(sortedDevices);
        setTotalPages(Math.ceil(devices.length / devicesPerPage));
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
    };

    fetchDevices();
  }, [isLoggedIn, navigate]);

  // Lọc danh sách thiết bị theo từ khóa tìm kiếm
  const filteredDevices = devices.filter((device) =>
    device.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tính số trang dựa trên danh sách sau khi lọc
  useEffect(() => {
    setTotalPages(Math.ceil(filteredDevices.length / devicesPerPage));
  }, [filteredDevices, devicesPerPage]);

  // Xác định danh sách thiết bị cần hiển thị cho trang hiện tại
  const currentDevices = filteredDevices.slice(
    (currentPage - 1) * devicesPerPage,
    currentPage * devicesPerPage
  );

  // Xử lý chuyển trang
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();
    try {
      const newDeviceData = {
        name: newDevice.name,
        topic: newDevice.topic,
        telemetry: [], // Luôn gửi telemetry rỗng khi tạo mới
      };

      const response = await api.post("/devices", newDeviceData);
      setDevices((prev) => [...prev, response.data]); // Cập nhật danh sách thiết bị
      setNewDevice({ name: "", topic: "" }); // Reset form
      window.location.reload();
    } catch (error) {
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message || "Error adding device.");
      } else {
        setErrorMessage("Unable to add device. Please try again later.");
      }
      console.error("Error adding device:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 sm:px-6 lg:px-8">
      <div className="top-0 left-0 w-full">
        <Navbar />
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-10 mt-20">
        Device Management
      </h1>

      {/* Thanh tìm kiếm */}
      <div className="w-full max-w-4xl mb-4">
        <input
          type="text"
          placeholder="Search devices..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Form thêm thiết bị */}
      <div className="w-full max-w-4xl mb-6">
        <form
          onSubmit={handleAddDevice}
          className="flex justify-between items-center space-x-4">
          <input
            type="text"
            placeholder="Device Name"
            value={newDevice.name}
            onChange={(e) =>
              setNewDevice({ ...newDevice, name: e.target.value })
            }
            required
            className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Topic"
            value={newDevice.topic}
            onChange={(e) =>
              setNewDevice({ ...newDevice, topic: e.target.value })
            }
            required
            className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Add Device
          </button>
          {errorMessage && (
            <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
          )}
        </form>
      </div>

      {/* Bảng thiết bị */}
      <div className="w-full max-w-4xl bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 text-center">Name</th>
              <th className="px-4 py-2 text-center">ID</th>
              <th className="px-4 py-2 text-center">Topic</th>
              <th className="px-4 py-2 text-center">Number of Records</th>
              <th className="px-4 py-2 text-center">Last Telemetry</th>
              <th className="px-4 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentDevices.length > 0 ? (
              currentDevices.map((device) => (
                <Device
                  key={device._id}
                  name={device.name}
                  id={device._id}
                  topic={device.topic}
                  telemetry={device.telemetry}
                />
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-2 text-center">
                  No devices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Nút phân trang */}
        <div className="flex justify-center items-center px-4 py-4 space-x-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700 ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}>
            Previous
          </button>
          <span className="text-gray-700 text-center">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700 ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeviceList;
