const mqttService = require("./mqtt");

const wsHandler = (ws, req) => {
  mqttService.addWsConnection(ws);

  ws.on("message", (msg) => {
    console.log(msg);
  });

  ws.on("close", () => {
    // Delete connection when connection is closed
    mqttService.connectedWs = mqttService.connectedWs.filter(
      (connectedWs) => connectedWs !== ws
    );
    console.log("WebSocket connection closed.");
  });
};

module.exports = wsHandler;
