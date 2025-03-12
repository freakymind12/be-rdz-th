const dbPool = require("../config/dbConfig");

const rulesModel = {
  getRules: (filters = {}) => {
    const { area, day } = filters;
    return dbPool("rules")
      .select("*")
      .modify((query) => {
        if (area) {
          query.where({ area });
        }
        if (day) {
          query.where({ day });
        }
      });
  },

  addRules: (data) => {
    return dbPool("rules").insert(data);
  },

  updateRules: (id, data) => {
    return dbPool("rules").where({ id }).update(data);
  },

  deleteRules: (id) => {
    return dbPool("rules").where({ id }).del();
  },
};

module.exports = rulesModel;
