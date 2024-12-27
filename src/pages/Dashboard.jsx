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

// Đăng ký các thành phần của chart.js
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

const Dashboard = () => {
  const [charts, setCharts] = useState([]);
  const [selectedChart, setSelectedChart] = useState(null);
  const [telemetryData, setTelemetryData] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const response = await api.get("/charts");
        setCharts(response.data);
      } catch (err) {
        setError("Failed to load charts");
      }
    };

    fetchCharts();
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

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Available Charts</h2>
        <ul className="bg-white shadow rounded p-4">
          {charts.map((chart) => (
            <li
              key={chart._id}
              className={`p-3 rounded mb-2 cursor-pointer ${
                selectedChart?._id === chart._id
                  ? "bg-blue-100"
                  : "hover:bg-gray-200"
              }`}
              onClick={() => handleChartSelect(chart)}>
              {chart.name} ({chart.type})
            </li>
          ))}
        </ul>
      </div>

      {selectedChart && telemetryData.length > 0 && (
        <div className="bg-white shadow rounded p-6">
          <h3 className="text-2xl font-semibold mb-4">
            {selectedChart.name} - {selectedChart.type.toUpperCase()} Chart
          </h3>
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
      )}

      {error && <div className="text-red-500 mt-4">{error}</div>}
    </div>
  );
};

export default Dashboard;
