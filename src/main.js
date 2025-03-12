require("dotenv").config();
const PORT = process.env.APP_PORT || 3000;
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const notFoundHandler = require("./middleware/notFound");
const {
  morgan,
  responseTimeMiddleware,
  customFormat,
} = require("../src/config/morgan");

// IMPORT SERVICE
const taskScheduler = require("../src/service/taskScheduler");
const mqttService = require("../src/service/mqtt");
const wsHandler = require("../src/service/websocket");

const PdfPrinter = require("pdfmake");

// INITIAL
const app = express();
require("express-ws")(app);

// SERVICE
taskScheduler.updateDeviceStatus();
taskScheduler.publishTimetoMqtt();
taskScheduler.generateReportData();
taskScheduler.emailDailyReport();
mqttService.init();
app.ws("/rdz-th", wsHandler);

// MIDDLEWARE
app.use(responseTimeMiddleware);
app.use(helmet());
app.use(cors());
app.use(morgan(customFormat));
app.use(express.json());
app.use(express.static("public"));

// IMPORT ROUTES
const rulesRoutes = require("../src/routes/rules");
const reportRoutes = require("../src/routes/report");
const deviceRoutes = require("../src/routes/device");
const picRoutes = require("../src/routes/pic");
const groupRoutes = require("../src/routes/group");
const deviceLogRoutes = require("../src/routes/device_log_error")

// USING ROUTES
app.use("/api/v1/report", reportRoutes);
app.use("/api/v1/device", deviceRoutes);
app.use("/api/v1/pic", picRoutes);
app.use("/api/v1/rules", rulesRoutes);
app.use("/api/v1/group", groupRoutes);
app.use("/api/v1/device-log-error", deviceLogRoutes)

// NOT FOUND ROUTE HANDLER
app.use(notFoundHandler);

// RUNNING SERVER
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
