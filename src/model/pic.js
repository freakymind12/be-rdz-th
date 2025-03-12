const e = require("express");
const dbPool = require("../config/dbConfig");

const picModel = {
  addPic: (data) => {
    return dbPool("pic").insert(data);
  },

  updatePic: (id, data) => {
    return dbPool("pic").where({ id }).update(data);
  },

  deletePic: (id) => {
    return dbPool("pic").where({ id }).del();
  },

  getPic: (filters = {}) => {
    const { email } = filters;
    return dbPool("pic as p")
      .select("p.*")
      .modify((query) => {
        if (email) {
          query.where("p.email", email);
        }
      });
  },

  assignPic: async (data) => {
    const { pic_id, group_id } = data;

    // Ambil data yang sudah ada di tabel pic_group
    const existingRecords = await dbPool("pic_group")
      .whereIn("pic_id", pic_id)
      .andWhere("group_id", group_id)
      .select("pic_id");

    const existingPicIds = existingRecords.map((record) => record.pic_id);

    // Filter hanya yang belum ada
    const newPicGroup = pic_id
      .filter((pic) => !existingPicIds.includes(pic))
      .map((pic) => ({
        pic_id: pic,
        group_id: group_id,
      }));

    if (newPicGroup.length > 0) {
      return dbPool("pic_group").insert(newPicGroup);
    } else {
      return [];
    }
  },

  unassignPic: (id) => {
    return dbPool("pic_group").where({ id }).del();
  },
};

module.exports = picModel;
