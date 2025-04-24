const dbPool = require("../config/dbConfig");

const groupModel = {
  addGroup: (data) => {
    return dbPool("group").insert(data);
  },

  editGroup: (id, data) => {
    return dbPool("group").where({ id }).update(data);
  },

  deleteGroup: (id) => {
    return dbPool("group").where({ id }).delete();
  },

  getGroup: async (filters = {}) => {
    const { name } = filters;
    try {
      const result = await dbPool("group as g")
        .select(
          "g.id as group_id",
          "g.name as group_name",
          "pg.id as pic_group_id",
          "p.id as pic_id",
          "p.email as email",
          "d.area as device_area",
          "d.status as status",
          "d.t_max as t_max",
          "d.t_min as t_min",
          "d.h_max as h_max",
          "d.h_min as h_min"
        )
        .leftJoin("device as d", "d.group_id", "g.id")
        .leftJoin("pic_group as pg", "g.id", "pg.group_id")
        .leftJoin("pic as p", "p.id", "pg.pic_id")
        .modify((query) => name && query.where("g.name", name))
        .orderBy("g.name");

      return result.reduce((acc, row) => {
        let group = acc.find((g) => g.group_id === row.group_id);

        if (!group) {
          group = {
            group_id: row.group_id,
            group_name: row.group_name,
            devices: [],
            pics: [],
          };
          acc.push(group);
        }

        // Tambahkan perangkat ke dalam daftar jika belum ada
        if (
          row.device_area &&
          !group.devices.some((d) => d.device_area === row.device_area)
        ) {
          group.devices.push({
            device_area: row.device_area,
            status: row.status,
            t_max: row.t_max,
            t_min: row.t_min,
            h_max: row.h_max,
            h_min: row.h_min,
          });
        }

        // Tambahkan PIC ke dalam daftar jika belum ada
        if (row.pic_id && !group.pics.some((p) => p.pic_id === row.pic_id)) {
          group.pics.push({
            pic_group_id: row.pic_group_id,
            pic_id: row.pic_id,
            email: row.email,
          });
        }

        return acc;
      }, []);
    } catch (error) {
      console.error("Error in getGroup:", error.message);
      throw error;
    }
  },
};

module.exports = groupModel;
