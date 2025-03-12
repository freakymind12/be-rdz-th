const { handleError, handleResponse } = require("../utils/responseUtil");
const picModel = require("../model/pic");
const { validationResult } = require("express-validator");

const picController = {
  addPic: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleResponse(res, errors.array(), 400);
    }
    try {
      const duplicate = await picModel.getPic(req.body);
      if (duplicate.length > 0) {
        return handleResponse(res, "This email already in list", 400, req.body);
      }
      await picModel.addPic(req.body);
      return handleResponse(res, "Success", 200, req.body);
    } catch (error) {
      handleError(res, error);
    }
  },

  updatePic: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleResponse(res, errors.array(), 400);
    }
    try {
      const duplicated = await picModel.getPic(req.body);
      if (duplicated.length > 0) {
        return handleResponse(res, "This email already in list", 400, req.body);
      }
      await picModel.updatePic(req.params.id, req.body);
      handleResponse(res, "Success", 200, req.body);
    } catch (error) {
      handleError(res, error);
    }
  },

  deletePic: async (req, res) => {
    try {
      const deleted = await picModel.deletePic(req.params.id);
      if (deleted) {
        return handleResponse(res, "Success", 200);
      } else {
        return handleResponse(res, "Data not found", 400);
      }
    } catch (error) {
      handleError(res, error);
    }
  },

  getPic: async (req, res) => {
    try {
      const data = await picModel.getPic();
      return handleResponse(res, "Success", 200, data);
    } catch (error) {
      handleError(res, error);
    }
  },

  assignPic: async (req, res) => {
    try {
      const data = await picModel.assignPic(req.body);
      if (data.length === 0) {
        return handleResponse(
          res,
          "All pic already assigned to this group",
          400
        );
      }
      return handleResponse(res, "Success", 200, req.body);
    } catch (error) {
      handleError(res, error);
    }
  },

  unassignPic: async (req, res) => {
    try {
      await picModel.unassignPic(req.params.id);
      return handleResponse(res, "Success", 200);
    } catch (error) {
      handleError(res, error);
    }
  },
};

module.exports = picController;
