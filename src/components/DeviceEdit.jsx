import React, { useState, useEffect } from "react";
import api from "../api/AxiosConfig";

const DeviceEdit = ({ deviceId, onClose }) => {
  const [deviceData, setDeviceData] = useState({
    name: "",
    topic: "",
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDevice = async () => {
      try {
        const response = await api.get(`/devices/${deviceId}`);
        setDeviceData({ name: response.data.name, topic: response.data.topic });
      } catch (err) {
        console.error("Error fetching device data:", err);
        setError(err.response?.data?.message || "Failed to fetch device data");
      }
    };

    fetchDevice();
  }, [deviceId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDeviceData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/devices/${deviceId}`, deviceData);
      setError(null);
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update device");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-md w-1/3">
        <h2 className="text-lg font-semibold mb-4">Edit Device</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={deviceData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Topic</label>
            <input
              type="text"
              name="topic"
              value={deviceData.topic}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded mr-2">
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeviceEdit;
