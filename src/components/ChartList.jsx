import React, { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  PointElement,
  LineController,
  BarController,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import api from "../api/AxiosConfig";

ChartJS.register(
  LineElement,
  BarElement,
  PointElement,
  LineController,
  BarController,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const ChartList = () => {
  const [charts, setCharts] = useState([]);
  const [devices, setDevices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChart, setSelectedChart] = useState(null);
  const [telemetryData, setTelemetryData] = useState([]);
  const [newChart, setNewChart] = useState({
    name: "",
    device: "",
    field: "",
    type: "line",
  });
  const [error, setError] = useState("");

  const fetchCharts = async () => {
    try {
      const response = await api.get("/charts");
      const sortedCharts = response.data.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setCharts(sortedCharts);
    } catch (err) {
      setError("Failed to load charts");
    }
  };

  useEffect(() => {
    fetchCharts();
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

  useEffect(() => {
    const fetchTelemetry = async () => {
      if (!selectedChart) return;

      try {
        const params = {
          field: selectedChart.field,
          startDate: null,
          endDate: null,
        };
        const response = await api.get(
          `/devices/${selectedChart.device}/telemetry`,
          { params }
        );
        setTelemetryData(response.data);
      } catch (err) {
        setError("Failed to load telemetry data");
      }
    };

    fetchTelemetry();
  }, [selectedChart]);

  const handleChartSelect = (chart) => {
    setSelectedChart(chart);
    setTelemetryData([]);
  };

  const handleCreateChart = async () => {
    if (
      !newChart.name ||
      !newChart.device ||
      !newChart.field ||
      !newChart.type
    ) {
      setError("All fields must be filled");
      return;
    }
    try {
      const response = await api.post("/charts", newChart);
      setCharts((prev) => [...prev, response.data]);
      setNewChart({ name: "", device: "", field: "", type: "line" });
      setError("");
      fetchCharts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create chart");
    }
  };

  const handleDeleteChart = async (chartId) => {
    try {
      await api.delete(`/charts/${chartId}`);
      setCharts((prev) => prev.filter((chart) => chart._id !== chartId));
      if (selectedChart && selectedChart._id === chartId) {
        setSelectedChart(null);
      }
      setError("");
      fetchCharts();
    } catch (err) {
      setError("Failed to delete chart");
    }
  };

  const getChartData = () => {
    if (!telemetryData || telemetryData.length === 0) return null;

    const timestamps = telemetryData.map((entry) => entry.timestamp);
    const dataValues = telemetryData.map((entry) => entry.value);

    return {
      labels: timestamps,
      datasets: [
        {
          label: `${selectedChart.name} (${selectedChart.field})`,
          data: dataValues,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderWidth: 2,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { display: true, title: { display: true, text: "Time" } },
      y: { display: true, title: { display: true, text: "Value" } },
    },
  };

  const filteredCharts = charts.filter(
    (chart) =>
      chart.name && chart.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        {/* Tìm kiếm đồ thị */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search charts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Form tạo đồ thị mới */}
        <div className="mb-8 bg-white shadow rounded p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateChart();
            }}
            className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Chart Name"
              value={newChart.name}
              onChange={(e) =>
                setNewChart((prev) => ({ ...prev, name: e.target.value }))
              }
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newChart.device}
              onChange={(e) =>
                setNewChart((prev) => ({ ...prev, device: e.target.value }))
              }
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="" disabled>
                Select device
              </option>
              {devices.map((device) => (
                <option key={device._id} value={device._id}>
                  {device.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Field"
              value={newChart.field}
              onChange={(e) =>
                setNewChart((prev) => ({ ...prev, field: e.target.value }))
              }
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newChart.type}
              onChange={(e) =>
                setNewChart((prev) => ({ ...prev, type: e.target.value }))
              }
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="" disabled>
                Select type
              </option>
              <option value="line">Line</option>
              <option value="bar">Bar</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Create Chart
            </button>
          </form>
          {error && (
            <div className="mt-4 text-red-500 font-semibold text-center">
              {error}
            </div>
          )}
        </div>

        {/* Danh sách đồ thị */}
        <div className="mb-8">
          <div className="overflow-x-auto bg-white shadow rounded">
            <table className="min-w-full border-collapse border border-gray-200">
              <thead className="bg-gray-200">
                <tr>
                  <th className="text-center px-4 py-2 border-b">Name</th>
                  <th className="text-center px-4 py-2 border-b">Type</th>
                  <th className="text-center px-4 py-2 border-b">Device</th>
                  <th className="text-center px-4 py-2 border-b">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCharts.map((chart) => (
                  <tr
                    key={chart._id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedChart?._id === chart._id
                        ? "bg-blue-100"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleChartSelect(chart)}>
                    <td className="text-center px-4 py-2 border-b font-medium text-gray-700">
                      {chart.name}
                    </td>
                    <td className="text-center px-4 py-2 border-b text-gray-600">
                      {chart.type}
                    </td>
                    <td className="text-center px-4 py-2 border-b text-gray-600">
                      {chart.device}
                    </td>
                    <td className="text-center px-4 py-2 border-b">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Ngăn sự kiện click bảng bị kích hoạt
                          handleDeleteChart(chart._id);
                        }}
                        className="px-2 py-1 text-white bg-red-500 rounded hover:bg-red-600">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hiển thị đồ thị */}
        {selectedChart && telemetryData.length > 0 && (
          <div className="bg-white shadow rounded p-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">
              {selectedChart.name} - {selectedChart.type.toUpperCase()} Chart
            </h3>
            <div>
              {selectedChart.type === "line" && (
                <Line
                  key={selectedChart._id}
                  data={getChartData()}
                  options={chartOptions}
                />
              )}
              {selectedChart.type === "bar" && (
                <Bar
                  key={selectedChart._id}
                  data={getChartData()}
                  options={chartOptions}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartList;
