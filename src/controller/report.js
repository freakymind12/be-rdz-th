const { handleError, handleResponse } = require("../utils/responseUtil");
const reportModel = require("../model/report");
const { validationResult } = require("express-validator");
const pdfReport = require("../utils/pdfReport");

const reportController = {
  generateDailyReport: async (req, res) => {
    try {
      // Check if report already exists in requested date
      const checkReport = await reportModel.checkReport(req.query.date);
      if (checkReport[0].total_report == 0) {
        // Generate report from logging
        await reportModel.generateReportFromLogging(req.query.date);
        handleResponse(res, "Success");
      } else {
        handleResponse(res, "You have done today's report recap", 400);
      }
    } catch (error) {
      handleError(res, error);
    }
  },

  getReport: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleResponse(res, errors.array(), 400);
    }

    try {
      const data = await reportModel.getReport(req.query);
      handleResponse(res, "Success", 200, data);
    } catch (error) {
      handleError(res, error);
    }
  },

  downloadReport: async (req, res) => {
    try {
      const reports = await reportModel.getReport(req.query);

      if (reports.data.length > 0) {
        const pdfBuffer = await pdfReport.monthly(
          reports.data,
          "pdf",
          req.query
        );
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline; filename=report.pdf");
        res.setHeader("Content-Length", pdfBuffer.length);

        // Kirim PDF
        res.send(pdfBuffer);
      } else {
        handleResponse(
          res,
          "There is no report data for this search option",
          400
        );
      }
    } catch (error) {
      handleError(res, error);
    }
  },
};

module.exports = reportController;
