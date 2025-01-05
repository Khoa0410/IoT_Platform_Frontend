import React, { useState } from "react";
import api from "../api/AxiosConfig";

const SendMQTTCommand = () => {
  const [mqttCommand, setMqttCommand] = useState("");
  const [mqttTopic, setMqttTopic] = useState("");
  const [mqttStatus, setMqttStatus] = useState("");

  // Hàm gửi lệnh MQTT
  const sendMqttCommand = async () => {
    if (!mqttTopic || !mqttCommand) {
      setMqttStatus("Topic and Command are required.");
      return;
    }

    try {
      const response = await api.post("/mqtt/sendcommand", {
        topic: mqttTopic,
        command: mqttCommand,
      });

      if (response.status === 200) {
        setMqttStatus("Command sent successfully!");
      } else {
        setMqttStatus(
          `Failed to send command: ${response.data.message || "Unknown error"}`
        );
      }
    } catch (err) {
      console.error("Error sending command:", err.response || err.message);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to send command";
      setMqttStatus(`Failed to send command due to: ${errorMessage}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white shadow-lg rounded-xl p-8 mt-6">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
        Send MQTT Command
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMqttCommand(); // Gọi hàm gửi lệnh
        }}
        className="space-y-6">
        {/* Topic Input */}
        <div>
          <label
            htmlFor="topic"
            className="block text-gray-700 font-medium mb-2">
            MQTT Topic
          </label>
          <input
            id="topic"
            type="text"
            placeholder="Enter the MQTT topic"
            value={mqttTopic}
            onChange={(e) => setMqttTopic(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Command Input */}
        <div>
          <label
            htmlFor="command"
            className="block text-gray-700 font-medium mb-2">
            MQTT Command
          </label>
          <textarea
            id="command"
            placeholder="Enter the MQTT command"
            value={mqttCommand}
            onChange={(e) => setMqttCommand(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="6"
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full px-4 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
            Send Command
          </button>
        </div>
      </form>

      {/* Status Message */}
      {mqttStatus && (
        <p
          className={`mt-6 text-center font-medium ${
            mqttStatus.includes("Failed") ? "text-red-600" : "text-green-600"
          }`}>
          {mqttStatus}
        </p>
      )}
    </div>
  );
};

export default SendMQTTCommand;
