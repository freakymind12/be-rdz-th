const morgan = require("morgan");
const dayjs = require("dayjs");
const chalk = require("chalk");

// Middleware untuk menghitung waktu respons
const responseTimeMiddleware = (req, res, next) => {
  const start = Date.now(); // Waktu mulai request
  res.on("finish", () => {
    // Setelah response selesai
    res.responseTime = `${Date.now() - start}`; // Set waktu respons pada objek res
  });
  next();
};


// Fungsi kustom untuk menambahkan timestamp dengan dayjs
morgan.token("date", () => dayjs().format("YYYY-MM-DD HH:mm:ss"));
// Fungsi kustom untuk method HTTP
morgan.token("method", (req) => req.method);
// Fungsi kustom untuk status HTTP dengan warna
morgan.token("status-color", (req, res) => {
  const statusCode = res.statusCode;
  if (statusCode >= 400 && statusCode < 500) {
    return chalk.yellow(statusCode); // Warna kuning untuk 4xx
  } else if (statusCode >= 500) {
    return chalk.red(statusCode); // Warna merah untuk 5xx
  }
  return chalk.green(statusCode); // Warna hijau untuk 2xx dan 3xx
});

// Fungsi kustom untuk response time
morgan.token("response-time", (req, res) => `${res.responseTime}ms`);

// Format log yang diinginkan
const customFormat = ":date | API | :method | :url | :status-color | :response-time";

module.exports = { morgan, customFormat, responseTimeMiddleware };
