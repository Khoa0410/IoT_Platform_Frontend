import React, { useState } from "react";
import api from "../api/AxiosConfig";
import DeviceEdit from "./DeviceEdit";

const Device = ({ name, id, topic, telemetry = [], onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);

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
    setIsEditing(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/devices/${id}`);
      onDelete(id);
    } catch (error) {
      console.error("Error deleting device:", error);
    }
  };

  return (
    <>
      <tr className="border-b">
        <td className="text-center px-4 py-2">{name}</td>
        <td className="text-center px-4 py-2">{id}</td>
        <td className="text-center px-4 py-2">{topic}</td>
        <td className="text-center px-4 py-2">{telemetry.length}</td>
        <td className="text-center px-4 py-2">
          {latestTelemetry ? (
            <table className="min-w-full border border-gray-300 bg-gray-100 rounded">
              <tbody>
                <tr>
                  <td
                    colSpan={2}
                    className="px-2 py-1 text-sm text-gray-500 border-b border-gray-300 text-center">
                    {new Date(latestTelemetry.timestamp).toLocaleString()}
                  </td>
                </tr>
                {Object.entries(latestTelemetry.data).map(([key, value]) => (
                  <tr key={key}>
                    <td className="px-2 py-1 text-sm border-b border-gray-300 text-center font-semibold">
                      {key}
                    </td>
                    <td className="px-2 py-1 text-sm border-b border-gray-300 text-center">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No data</p>
          )}
        </td>
        <td className="px-4 py-2">
          <div className="flex justify-center items-center px-4 py-2">
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
          </div>
        </td>
      </tr>
      {isEditing && (
        <DeviceEdit
          deviceId={id}
          onEditSuccess={onEdit}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  );
};

export default Device;
