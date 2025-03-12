const dbPool = require("../config/dbConfig");

const deviceLogModel = {
  getLog: async (filters = {}) => {
    const { area, year, month } = filters;
    const data = await dbPool("device_log_error")
      .select("*")
      .modify((query) => {
        if (area) {
          query.where("area", area);
        }
        if (year) {
          query.whereRaw("YEAR(created_at) = ?", [year]);
        }
        if (month) {
          query.whereRaw("MONTH(created_at) = ?", [month]);
        }
      });
    return data;
  },

  addLog: async (data) => {
    return dbPool("device_log_error").insert(data);
  },
};

module.exports = deviceLogModel;
