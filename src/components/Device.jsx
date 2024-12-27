import React from "react";
import api from "../api/AxiosConfig";

const Device = ({ name, id, topic, telemetry = [] }) => {
  const latestTelemetry =
    Array.isArray(telemetry) && telemetry.length > 0
      ? telemetry.reduce((latest, current) => {
          return !latest ||
            new Date(current.timestamp) > new Date(latest.timestamp)
            ? current
            : latest;
        }, null)
      : null;

  const handleEdit = () => {
    // Logic xử lý khi bấm sửa
    console.log("Edit device:", id);
    // Navigation or API call for editing
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/devices/${id}`);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting device:", error);
    }
  };

  return (
    <tr className="border-b">
      <td className="text-center px-4 py-2">{name}</td>
      <td className="text-center px-4 py-2">{id}</td>
      <td className="text-center px-4 py-2">{topic}</td>
      <td className="text-center px-4 py-2">{telemetry.length}</td>
      <td className="text-center px-4 py-2">
        {latestTelemetry ? (
          <div>
            <p>Time: {new Date(latestTelemetry.timestamp).toLocaleString()}</p>
            <p>Data: {JSON.stringify(latestTelemetry.data)}</p>
          </div>
        ) : (
          <p>No data</p>
        )}
      </td>
      <td className="flex justify-center items-center px-4 py-2">
        <button
          onClick={handleEdit}
          className="px-2 py-1 mr-2 text-white bg-yellow-500 rounded hover:bg-yellow-600">
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="px-2 py-1 text-white bg-red-500 rounded hover:bg-red-600">
          Delete
        </button>
      </td>
    </tr>
  );
};

export default Device;
