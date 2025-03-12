const { validationResult } = require("express-validator");
const { handleError, handleResponse } = require("../utils/responseUtil");
const rulesModel = require("../model/rules");

const rulesController = {
  addRules: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleResponse(res, errors.array(), 400);
    }
    try {
      const duplicate = await rulesModel.getRules(req.body);
      if (duplicate.length > 0) {
        return handleResponse(
          res,
          "Exception rules on this day and area already exist",
          400,
          req.body
        );
      }
      await rulesModel.addRules(req.body);
      handleResponse(res, "Success", 200, req.body);
    } catch (error) {
      handleError(res, error);
    }
  },

  updateRules: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleResponse(res, errors.array(), 400);
    }
    try {
      await rulesModel.updateRules(req.params.id, req.body);
      handleResponse(res, "Success", 200, req.body);
    } catch (error) {
      handleError(res, error);
    }
  },

  deleteRules: async (req, res) => {
    try {
      const deleted = await rulesModel.deleteRules(req.params.id);
      if (deleted) {
        return handleResponse(res, "Success", 200);
      } else {
        return handleResponse(res, "Data not found", 400);
      }
    } catch (error) {
      handleError(res, error);
    }
  },

  getRules: async (req, res) => {
    try {
      const data = await rulesModel.getRules(req.query);
      handleResponse(res, "Success", 200, data);
    } catch (error) {
      handleError(res, error);
    }
  },
};

module.exports = rulesController;
