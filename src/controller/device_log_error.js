const { handleResponse, handleError } = require("../utils/responseUtil");
const deviceLogModel = require("../model/device_log_error");

const deviceLogController = {
  getLogError: async (req, res) => {
    try {
      const data = await deviceLogModel.getLog(req.query);
      handleResponse(res, "Success", 200, data);
    } catch (error) {
      handleError(res, error);
    }
  },
};

module.exports = deviceLogController;
