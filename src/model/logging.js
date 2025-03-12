const dbPool = require("../config/dbConfig");

const loggingModel = {
  addLog: (data) => {
    return dbPool("logging").insert(data);
  },
};

module.exports = loggingModel
