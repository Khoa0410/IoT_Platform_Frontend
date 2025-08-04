import io from "socket.io-client";
import { backendURL } from "../api/AxiosConfig";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(accessToken) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(backendURL, {
      auth: {
        token: accessToken,
      },
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket.id);
      this.isConnected = true;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      this.isConnected = false;
    });

    this.socket.on("connected", (data) => {
      console.log("Socket authentication successful:", data);
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Lắng nghe device data
  onDeviceData(callback) {
    if (this.socket) {
      this.socket.on("device_data", callback);
    }
  }

  // Lắng nghe alerts
  onAlert(callback) {
    if (this.socket) {
      this.socket.on("alert_notification", callback);
    }
  }

  // Hủy listener
  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  // Gửi ping để test connection
  ping() {
    if (this.socket) {
      this.socket.emit("ping");
    }
  }

  // Lắng nghe pong
  onPong(callback) {
    if (this.socket) {
      this.socket.on("pong", callback);
    }
  }
}

export default new SocketService();
