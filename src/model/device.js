const dbPool = require("../config/dbConfig");
const dayjs = require("dayjs");
require("dotenv").config();

const deviceModel = {
  addDevice: (data) => {
    return dbPool("device").insert(data);
  },

  getDevice: (filters = {}) => {
    const { area, status } = filters;
    return dbPool("device as d")
      .select("d.*", "g.name as group_name", "g.id as group_id")
      .leftJoin("group as g", "d.group_id", "g.id")
      .modify((query) => {
        if (area) {
          query.where("d.area", area);
        }
        if (status) {
          query.where("d.status", status);
        }
      })
      .orderBy("g.name", "asc")
      .then((result) => result);
  },

  updateDevice: (area, data) => {
    return dbPool("device").where({ area }).update(data);
  },

  updateStaleDevice: () => {
    const difMinutes = Number(process.env.REFRESH_STATUS_DEVICE_INTERVAL)
    const threshold = dayjs()
      .subtract(difMinutes, "minute")
      .format("YYYY-MM-DD HH:mm:ss");

    return dbPool("device")
      .where("updated_at", "<", threshold)
      .andWhere("status", "=", 1)
      .update({ status: 0 });
  },
};

module.exports = deviceModel;
