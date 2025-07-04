import React, { useState, useEffect } from "react";
import api from "../api/AxiosConfig";
import { FiXCircle } from "react-icons/fi";

const AlertList = () => {
  const [alerts, setAlerts] = useState([]);
  const [devices, setDevices] = useState([]);
  const [telemetryFields, setTelemetryFields] = useState([]);
  const [newAlert, setNewAlert] = useState({
    name: "",
    device: "",
    conditions: [{ sensorField: "", operator: "==", value: "" }],
    logic: "OR",
    emailNotification: true,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alertRes, deviceRes] = await Promise.all([
          api.get("/alerts"),
          api.get("/devices"),
        ]);
        setAlerts(alertRes.data);
        setDevices(deviceRes.data);
      } catch (err) {
        setError("Failed to load alerts or devices");
      }
    };
    fetchData();
  }, []);

  // Lấy danh sách trường telemetry khi chọn thiết bị
  useEffect(() => {
    const fetchTelemetryFields = async () => {
      if (!newAlert.device) {
        setTelemetryFields([]);
        setNewAlert((prev) => ({
          ...prev,
          conditions: prev.conditions.map((cond) => ({
            ...cond,
            sensorField: "",
          })),
        }));
        return;
      }
      try {
        const response = await api.get(
          `/devices/${newAlert.device}/telemetry-field`
        );
        setTelemetryFields(response.data.fields || []);
        // Đặt lại sensorField cho tất cả điều kiện nếu không còn trong danh sách mới
        setNewAlert((prev) => ({
          ...prev,
          conditions: prev.conditions.map((cond) => ({
            ...cond,
            sensorField: response.data.fields.includes(cond.sensorField)
              ? cond.sensorField
              : "",
          })),
        }));
      } catch (err) {
        setError("Failed to load telemetry fields");
        setTelemetryFields([]);
      }
    };

    fetchTelemetryFields();
  }, [newAlert.device]);

  const handleAddAlert = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/alerts", newAlert);
      setAlerts([...alerts, res.data.alert]);
      setNewAlert({
        name: "",
        device: "",
        conditions: [{ sensorField: "", operator: "==", value: "" }],
        logic: "OR",
        emailNotification: true,
      });
    } catch (err) {
      setError("Failed to create alert");
    }
  };

  const deleteAlert = async (id) => {
    try {
      await api.delete(`/alerts/${id}`);
      setAlerts(alerts.filter((alert) => alert._id !== id));
    } catch (err) {
      setError("Failed to delete alert");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      {error && (
        <div className="text-red-500 text-sm mb-4 text-center">{error}</div>
      )}

      {/* ========== FORM ========== */}
      <div className="flex flex-col items-center mb-12">
        <h2 className="text-2xl font-bold mb-4">Create New Alert</h2>
        <div className="bg-white shadow rounded-lg p-6 w-[700px] max-w-full">
          <form onSubmit={handleAddAlert} className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Alert Name"
                value={newAlert.name}
                onChange={(e) =>
                  setNewAlert({ ...newAlert, name: e.target.value })
                }
                required
                className="w-1/2 px-4 py-2 border rounded-md"
              />
              <select
                value={newAlert.device}
                onChange={(e) =>
                  setNewAlert({ ...newAlert, device: e.target.value })
                }
                required
                className="w-1/2 px-4 py-2 border rounded-md">
                <option value="">Select Device</option>
                {devices.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              {newAlert.conditions.map((cond, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select
                    value={cond.sensorField}
                    onChange={(e) => {
                      const updated = [...newAlert.conditions];
                      updated[idx].sensorField = e.target.value;
                      setNewAlert({ ...newAlert, conditions: updated });
                    }}
                    className="flex-1 px-2 py-1 border rounded"
                    disabled={!newAlert.device || telemetryFields.length === 0}
                  >
                    <option value="">
                      {telemetryFields.length === 0
                        ? newAlert.device
                          ? "No fields available"
                          : "Select a device first"
                        : "Select field"}
                    </option>
                    {telemetryFields.map((field) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </select>
                  <select
                    value={cond.operator}
                    onChange={(e) => {
                      const updated = [...newAlert.conditions];
                      updated[idx].operator = e.target.value;
                      setNewAlert({ ...newAlert, conditions: updated });
                    }}
                    className="px-2 py-1 border rounded">
                    <option value=">">&gt;</option>
                    <option value=">=">&gt;=</option>
                    <option value="<">&lt;</option>
                    <option value="<=">&lt;=</option>
                    <option value="==">==</option>
                    <option value="!=">!=</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Value"
                    value={cond.value}
                    onChange={(e) => {
                      const updated = [...newAlert.conditions];
                      updated[idx].value = e.target.value;
                      setNewAlert({ ...newAlert, conditions: updated });
                    }}
                    className="flex-1 px-2 py-1 border rounded"
                  />
                  {newAlert.conditions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = newAlert.conditions.filter(
                          (_, i) => i !== idx
                        );
                        setNewAlert({ ...newAlert, conditions: updated });
                      }}
                      className="text-red-500 hover:text-red-700">
                      Remove
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setNewAlert({
                    ...newAlert,
                    conditions: [
                      ...newAlert.conditions,
                      { sensorField: "", operator: "==", value: "" },
                    ],
                  })
                }
                className="text-sm text-blue-600 hover:underline mt-2">
                + Add Condition
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Add Alert
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ========== ALERT LIST ========== */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">Active Alerts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alerts.map((alert) => (
            <div
              key={alert._id}
              className="bg-white p-4 rounded shadow relative w-[300px] h-[220px] max-w-full overflow-hidden">
              <button
                onClick={() => deleteAlert(alert._id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                <FiXCircle size={20} />
              </button>
              <h3 className="text-lg font-semibold break-words whitespace-pre-wrap max-w-full">
                {alert.name}
              </h3>
              <p className="text-sm text-gray-600">
                Device: {alert.device?.name || "Unknown"}
              </p>
              <ul className="mt-2 text-sm">
                {alert.conditions.map((c, i) => (
                  <li key={i}>
                    {c.sensorField} {c.operator} {c.value}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlertList;
