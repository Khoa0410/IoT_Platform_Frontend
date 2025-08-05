import React, { useEffect, useState, useContext } from "react";
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
  TimeScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import api, { getAccessToken } from "../api/AxiosConfig";
import { FaTrash } from "react-icons/fa";
import "chartjs-adapter-date-fns";
import socketService from "../services/socketService";
import { AuthContext } from "../context/AuthContext";

ChartJS.register(
  LineElement,
  BarElement,
  PointElement,
  LineController,
  BarController,
  CategoryScale,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend
);

const ChartList = () => {
  const { isLoggedIn, user } = useContext(AuthContext);
  const [charts, setCharts] = useState([]);
  const [devices, setDevices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChart, setSelectedChart] = useState(null);
  const [telemetryData, setTelemetryData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [newChart, setNewChart] = useState({
    name: "",
    device: "",
    field: "",
    type: "line",
  });
  const [telemetryFields, setTelemetryFields] = useState([]);
  const [error, setError] = useState("");

  // Kết nối socket khi component mount và user đã đăng nhập
  useEffect(() => {
    console.log("useEffect triggered - isLoggedIn:", isLoggedIn, "user:", user);

    if (isLoggedIn) {
      const accessToken = getAccessToken();
      console.log("Connecting to socket with token:", accessToken);

      if (accessToken) {
        console.log("Token exists, connecting to socket...");
        socketService.connect(accessToken);

        // Lắng nghe alerts
        socketService.onAlert((alertData) => {
          console.log("Received alert:", alertData);
          // Xử lý alert nếu cần
        });
      } else {
        console.log("No access token found");
      }
    } else {
      console.log("User not logged in");
    }

    return () => {
      console.log("Cleaning up socket connection");
      socketService.disconnect();
    };
  }, [isLoggedIn]);

  // Đăng ký socket listener cho device data với dependencies phù hợp
  useEffect(() => {
    if (!isLoggedIn) return;

    // Hủy listener cũ trước khi đăng ký mới
    socketService.off("device_data");

    // Đăng ký listener mới với state hiện tại
    socketService.onDeviceData((data) => {
      console.log("Received device data:", data);
      handleRealtimeData(data);
    });

    return () => {
      socketService.off("device_data");
    };
  }, [isLoggedIn, selectedChart]); // Dependencies quan trọng

  // Xử lý dữ liệu realtime từ socket
  const handleRealtimeData = (socketData) => {
    console.log("handleRealtimeData called with:", {
      socketData,
      selectedChart: selectedChart
        ? {
            id: selectedChart._id,
            deviceId: selectedChart.device?._id,
            field: selectedChart.field,
          }
        : null,
    });

    // Check nếu không có chart được chọn hoặc device không hợp lệ
    if (!selectedChart || !selectedChart.device?._id) {
      console.log("Realtime data ignored - selectedChart:", !!selectedChart);
      return;
    }

    // Check nếu device data không thuộc về chart đang được chọn
    if (socketData.deviceId !== selectedChart.device._id) {
      console.log(
        "Device ID mismatch - received:",
        socketData.deviceId,
        "expected:",
        selectedChart.device._id
      );
      return;
    }

    // Chuyển đổi dữ liệu socket thành format telemetry
    const newTelemetryEntry = {
      timestamp: socketData.timestamp,
      // Xử lý dữ liệu từ socket - có thể có cấu trúc nested hoặc flat
      value:
        socketData.data[selectedChart.field]?.value ||
        socketData.data[selectedChart.field],
    };

    console.log("Creating new telemetry entry:", newTelemetryEntry);

    // Chỉ thêm nếu có giá trị cho field được chọn
    if (newTelemetryEntry.value !== undefined) {
      console.log("Adding new data point to chart");
      setTelemetryData((prevData) => {
        const newData = [...prevData, newTelemetryEntry];
        console.log("Updated telemetry data length:", newData.length);

        // Giới hạn số lượng điểm dữ liệu (ví dụ: 100 điểm gần nhất)
        if (newData.length > 100) {
          return newData.slice(-100);
        }

        return newData;
      });
    } else {
      console.log(
        "Value is undefined for field:",
        selectedChart.field,
        "in data:",
        socketData.data
      );
    }
  };

  const fetchCharts = async () => {
    try {
      const response = await api.get("/charts");

      // Kiểm tra và lọc dữ liệu hợp lệ
      const validCharts = (response.data || []).filter(
        (chart) =>
          chart && chart._id && chart.name && chart.device && chart.device.name
      );

      const sortedCharts = validCharts.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setCharts(sortedCharts);
    } catch (err) {
      console.error("Failed to load charts:", err);
      setError("Failed to load charts");
      setCharts([]); // Set empty array on error
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

  // Lấy danh sách trường telemetry khi chọn thiết bị
  useEffect(() => {
    const fetchTelemetryFields = async () => {
      if (!newChart.device) {
        setTelemetryFields([]);
        setNewChart((prev) => ({ ...prev, field: "" }));
        return;
      }
      try {
        const response = await api.get(`/telemetry/fields/${newChart.device}`);

        // Trích xuất field names từ response
        const fieldNames = response.data.fields.map((field) => field.name);
        setTelemetryFields(fieldNames || []);

        // Đặt lại field nếu không còn trong danh sách mới
        if (!fieldNames.includes(newChart.field)) {
          setNewChart((prev) => ({ ...prev, field: "" }));
        }
      } catch (err) {
        console.error("Failed to load telemetry fields:", err);
        setError("Failed to load telemetry fields");
        setTelemetryFields([]);
      }
    };

    fetchTelemetryFields();
  }, [newChart.device]);

  const fetchTelemetry = async () => {
    if (!selectedChart || !selectedChart.device?._id) {
      console.log(
        "Cannot fetch telemetry - no chart selected or device ID missing"
      );
      return;
    }

    try {
      const toUTCString = (localDateTimeStr) => {
        if (!localDateTimeStr) return null;
        const localDate = new Date(localDateTimeStr);
        return new Date(localDate.getTime()).toISOString();
      };

      const params = {
        field: selectedChart.field,
        limit: 100, // Giới hạn số lượng record
      };

      // Chỉ thêm startDate và endDate nếu có giá trị
      if (startDate) {
        params.startDate = toUTCString(startDate);
      }
      if (endDate) {
        params.endDate = toUTCString(endDate);
      }

      const response = await api.get(`/telemetry/${selectedChart.device._id}`, {
        params,
      });

      // Xử lý dữ liệu từ response mới
      const processedData = response.data.data.map((entry) => ({
        timestamp: entry.timestamp,
        value: entry.data[selectedChart.field]?.value, // Lấy value từ nested object
      }));

      // Lọc bỏ các entry không có value cho field được chọn
      const filteredData = processedData.filter(
        (entry) => entry.value !== undefined && entry.value !== null
      );

      setTelemetryData(filteredData);
    } catch (err) {
      console.error("Failed to load telemetry data:", err);
      setError("Failed to load telemetry data");
    }
  };

  // Load dữ liệu lịch sử khi chọn chart hoặc thay đổi khoảng thời gian
  useEffect(() => {
    if (!selectedChart) {
      return;
    }

    fetchTelemetry();
  }, [selectedChart, startDate, endDate]);

  const handleChartSelect = (chart) => {
    setSelectedChart(chart);
    setStartDate("");
    setEndDate("");
    // Không clear telemetryData để giữ data realtime
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

    const timestamps = telemetryData.map((entry) => {
      const date = new Date(entry.timestamp);

      // Chuyển về múi giờ GMT+7
      const options = {
        timeZone: "Asia/Ho_Chi_Minh", // Múi giờ GMT+7
        hour12: false, // Định dạng giờ 24
      };

      return date.toLocaleString("en-GB", options);
    });

    const dataValues = telemetryData.map((entry) => entry.value);

    return {
      labels: timestamps,
      datasets: [
        {
          label: `${selectedChart?.name || "Unknown"} (${
            selectedChart?.field || "Unknown"
          })`,
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
      x: { display: false, title: { display: true, text: "Time" } },
      y: { display: true, title: { display: true, text: "Value" } },
    },
  };

  const filteredCharts = charts.filter(
    (chart) =>
      chart &&
      chart.name &&
      chart.device &&
      chart.device.name &&
      chart.name.toLowerCase().includes(searchQuery.toLowerCase())
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
            <select
              value={newChart.field}
              onChange={(e) =>
                setNewChart((prev) => ({ ...prev, field: e.target.value }))
              }
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!newChart.device || telemetryFields.length === 0}>
              <option value="" disabled>
                {telemetryFields.length === 0
                  ? newChart.device
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
                      {chart?.name || "N/A"}
                    </td>
                    <td className="text-center px-4 py-2 border-b text-gray-600">
                      {chart?.type || "N/A"}
                    </td>
                    <td className="text-center px-4 py-2 border-b text-gray-600">
                      {chart?.device?.name || "N/A"}
                    </td>
                    <td className="text-center px-4 py-2 border-b">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Ngăn sự kiện click bảng bị kích hoạt
                          handleDeleteChart(chart._id);
                        }}
                        className="px-2 py-1 text-black hover:text-red-500">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hiển thị đồ thị */}
        {selectedChart && (
          <div className="bg-white shadow rounded p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                {selectedChart?.name || "Unknown Chart"} -{" "}
                {selectedChart?.type?.toUpperCase() || "UNKNOWN"} Chart
                (Real-time)
              </h3>

              {/* Debug button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    console.log("Debug Info:", {
                      selectedChart: selectedChart
                        ? {
                            id: selectedChart._id,
                            name: selectedChart.name,
                            field: selectedChart.field,
                            deviceId: selectedChart.device?._id,
                          }
                        : null,
                      telemetryDataLength: telemetryData.length,
                      accessToken: getAccessToken() ? "exists" : "missing",
                    });
                  }}
                  className="px-3 py-1 bg-gray-500 text-white rounded text-sm">
                  Debug
                </button>
              </div>
            </div>

            {/* Bộ lọc thời gian - luôn hiển thị */}
            <div className="flex items-end gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border rounded w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border rounded w-full"
                />
              </div>
              <button
                onClick={fetchTelemetry}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 h-[42px]">
                Load Historical
              </button>
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setTelemetryData([]);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 h-[42px]">
                Live Mode
              </button>
            </div>

            {/* Biểu đồ */}
            <div>
              {telemetryData.length > 0 ? (
                <>
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
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Waiting for real-time data or load historical data using the
                    filters above...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartList;
