const { handleError, handleResponse } = require("../utils/responseUtil");
const groupModel = require("../model/group");
const { validationResult } = require("express-validator");

const groupController = {
  addGroup: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleResponse(res, errors.array(), 400);
    }
    try {
      const existing = await groupModel.getGroup(req.body);
      if (existing.length > 0) {
        return handleResponse(res, "Group already exists", 400);
      }

      await groupModel.addGroup(req.body);
      handleResponse(res, "Success", 200, req.body);
    } catch (error) {
      handleError(res, error);
    }
  },

  editGroup: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleResponse(res, errors.array(), 400);
    }
    try {
      await groupModel.editGroup(req.params.id, req.body);
      handleResponse(res, "Success", 200);
    } catch (error) {
      handleError(res, error);
    }
  },

  deleteGroup: async (req, res) => {
    try {
      const data = await groupModel.deleteGroup(req.params.id);
      handleResponse(res, "Success", 200, data);
    } catch (error) {
      handleError(res, error);
    }
  },

  getGroup: async (req, res) => {
    try {
      const data = await groupModel.getGroup(req.query);
      handleResponse(res, "Success", 200, data);
    } catch (error) {
      handleError(res, error);
    }
  },
};

module.exports = groupController;
