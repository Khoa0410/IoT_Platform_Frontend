import React, { useState, useEffect } from "react";
import api from "../api/AxiosConfig";
import { FiXCircle } from "react-icons/fi";

const ButtonList = () => {
  const [buttons, setButtons] = useState([]);
  const [devices, setDevices] = useState([]);
  const [newButton, setNewButton] = useState({
    name: "",
    device: "",
    topic: "",
  });
  const [error, setError] = useState("");

  const fetchButtons = async () => {
    try {
      const response = await api.get("/buttons");
      setButtons(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching buttons:", err);
      setError("Failed to fetch buttons. Please try again later.");
    }
  };

  useEffect(() => {
    fetchButtons();
  }, []);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await api.get("/devices");
        setDevices(response.data);
      } catch (err) {
        setError("Failed to load devices");
      }
    };

    fetchDevices();
  }, []);

  // Xử lý trạng thái button
  const toggleButtonState = async (buttonId, currentState) => {
    try {
      const updatedState = !currentState; // Đảo ngược trạng thái hiện tại
      const response = await api.put(`/buttons/${buttonId}`, {
        state: updatedState,
      });

      // Cập nhật danh sách buttons trong state
      setButtons((prevButtons) =>
        prevButtons.map((btn) =>
          btn._id === buttonId ? { ...btn, state: response.data.state } : btn
        )
      );
      setError("");
    } catch (err) {
      console.error("Error updating button state:", err);
      setError("Failed to update button state. Please try again.");
    }
  };

  // Xử lý tạo mới button
  const handleAddButton = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/buttons", newButton);
      setButtons((prevButtons) => [...prevButtons, response.data]);
      setNewButton({ name: "", device: "", topic: "" });
      setError("");
      fetchButtons();
    } catch (err) {
      console.error("Error adding button:", err);
      setError("Failed to add button. Please try again.");
    }
  };

  // Xử lý xóa button
  const deleteButton = async (buttonId) => {
    try {
      await api.delete(`/buttons/${buttonId}`);
      setButtons((prevButtons) =>
        prevButtons.filter((button) => button._id !== buttonId)
      );
    } catch (err) {
      console.error("Error deleting button:", err);
      setError("Failed to delete button. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 sm:px-6 lg:px-8">
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

      {/* Form tạo mới button */}
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-4xl mb-6">
        <form
          onSubmit={handleAddButton}
          className="flex items-center space-x-4">
          <div>
            <input
              id="name"
              type="text"
              value={newButton.name}
              onChange={(e) =>
                setNewButton({ ...newButton, name: e.target.value })
              }
              required
              placeholder="Name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <select
              id="device"
              value={newButton.device}
              onChange={(e) =>
                setNewButton({ ...newButton, device: e.target.value })
              }
              required
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select a device</option>
              {devices.map((device) => (
                <option key={device._id} value={device._id}>
                  {device.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <input
              id="topic"
              type="text"
              value={newButton.topic}
              onChange={(e) =>
                setNewButton({ ...newButton, topic: e.target.value })
              }
              required
              placeholder="Topic"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600">
            Add Button
          </button>
        </form>
      </div>

      {/* Lưới hiển thị các button */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {buttons.length > 0 ? (
          buttons.map((button) => (
            <div
              key={button._id}
              className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-between space-y-4 relative">
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => deleteButton(button._id)}
                  className="text-xl text-gray-600 hover:text-red-600 focus:outline-none">
                  <FiXCircle />
                </button>
              </div>

              <div className="w-full flex justify-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  {button.name}
                </h3>
              </div>

              <p className="text-sm text-gray-600">Topic: {button.topic}</p>

              {/* Nút bật/tắt trạng thái */}
              <button
                onClick={() => toggleButtonState(button._id, button.state)}
                className={`px-6 py-3 rounded text-white ${
                  button.state
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}>
                {button.state ? "ON" : "OFF"}
              </button>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-600 col-span-full">
            No buttons found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ButtonList;
