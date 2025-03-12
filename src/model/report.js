const dbPool = require("../config/dbConfig");

const reportModel = {
  getReport: async (filters = {}) => {
    const { year, month, area, full_date, group_id } = filters;
    const reports = await dbPool("report as r")
      .select(
        "r.id",
        "r.area",
        dbPool.raw("COALESCE(d.group_id, null) AS group_id"),
        dbPool.raw("COALESCE(g.name, null) AS group_name"),
        "d.t_max",
        "d.t_min",
        "d.h_max",
        "d.h_min",
        dbPool.raw("DATE_FORMAT(r.report_date, '%Y-%m-%d') AS report_date"),
        dbPool.raw(
          "IF(COALESCE(dc.time00, FALSE) = FALSE, r.temp_00, 'N/C') AS temp_00"
        ),
        dbPool.raw(
          "IF(COALESCE(dc.time00, FALSE) = FALSE, r.humi_00, 'N/C') AS humi_00"
        ),
        dbPool.raw(
          "IF(COALESCE(dc.time06, FALSE) = FALSE, r.temp_06, 'N/C') AS temp_06"
        ),
        dbPool.raw(
          "IF(COALESCE(dc.time06, FALSE) = FALSE, r.humi_06, 'N/C') AS humi_06"
        ),
        dbPool.raw(
          "IF(COALESCE(dc.time12, FALSE) = FALSE, r.temp_12, 'N/C') AS temp_12"
        ),
        dbPool.raw(
          "IF(COALESCE(dc.time12, FALSE) = FALSE, r.humi_12, 'N/C') AS humi_12"
        ),
        dbPool.raw(
          "IF(COALESCE(dc.time18, FALSE) = FALSE, r.temp_18, 'N/C') AS temp_18"
        ),
        dbPool.raw(
          "IF(COALESCE(dc.time18, FALSE) = FALSE, r.humi_18, 'N/C') AS humi_18"
        )
      )
      .leftJoin("rules as dc", function () {
        this.on("r.area", "=", "dc.area").andOn(
          dbPool.raw("dc.day = DAYNAME(r.report_date)")
        );
      })
      .leftJoin("device as d", "r.area", "d.area")
      .leftJoin("group as g", "d.group_id", "g.id")
      .orderBy("r.report_date", "asc")
      .orderBy("r.area", "asc")

      .modify((query) => {
        if (year) {
          query.whereRaw("YEAR(r.report_date) = ?", [year]);
        }
        if (month) {
          query.whereRaw("MONTH(r.report_date) = ?", [month]);
        }
        if (full_date) {
          query.whereRaw("r.report_date = ?", [full_date]);
        }
        if (area != "All") {
          query.whereRaw("r.area = ?", [area]);
        }
        if (group_id) {
          query.whereRaw("(d.group_id = ? )", [group_id]); // Memastikan NULL tetap diambil
        }
      });

    const structuredReports = reports.reduce((acc, report) => {
      // Mencari grup yang sudah ada
      let group = acc.find((g) => g.group_name === report.group_name);

      // Jika grup belum ada, buat grup baru
      if (!group) {
        group = {
          group_name: report.group_name,
          report_date: report.report_date,
          data: [],
        };
        acc.push(group);
      }

      // Menambahkan data ke grup
      group.data.push({
        id: report.id,
        area: report.area,
        t_max: report.t_max,
        t_min: report.t_min,
        h_max: report.h_max,
        h_min: report.h_min,
        temp_00: report.temp_00,
        humi_00: report.humi_00,
        temp_06: report.temp_06,
        humi_06: report.humi_06,
        temp_12: report.temp_12,
        humi_12: report.humi_12,
        temp_18: report.temp_18,
        humi_18: report.humi_18,
      });

      return acc;
    }, []);

    if (group_id) {
      return structuredReports[0] || {};
    } else {
      return reports;
    }
  },

  generateReportFromLogging: async (dateInput = null) => {
    try {
      const reportDate = dateInput
        ? dbPool.raw("?", [dateInput])
        : dbPool.raw("CURDATE()");

      const data = await dbPool
        .select([
          "d.area",
          "d.t_max",
          "d.t_min",
          "d.h_max",
          "d.h_min",
          dbPool.raw("? AS report_date", [reportDate]),

          // Temperature & Humidity at 00:00
          dbPool.raw(
            `(SELECT l.temperature FROM logging l 
            WHERE d.area = l.area 
            AND l.created_at BETWEEN ? - INTERVAL 2 HOUR AND ? + INTERVAL 3 HOUR 
            ORDER BY ABS(TIMESTAMPDIFF(MINUTE, l.created_at, ?)) 
            LIMIT 1) AS temp_00`,
            [reportDate, reportDate, reportDate]
          ),
          dbPool.raw(
            `(SELECT l.humidity FROM logging l 
            WHERE d.area = l.area 
            AND l.created_at BETWEEN ? - INTERVAL 2 HOUR AND ? + INTERVAL 3 HOUR 
            ORDER BY ABS(TIMESTAMPDIFF(MINUTE, l.created_at, ?)) 
            LIMIT 1) AS humi_00`,
            [reportDate, reportDate, reportDate]
          ),
          // Temperature & Humidity at 06:00
          dbPool.raw(
            `(SELECT l.temperature FROM logging l 
            WHERE d.area = l.area 
            AND l.created_at BETWEEN ? + INTERVAL 4 HOUR AND ? + INTERVAL 8 HOUR
            ORDER BY ABS(TIMESTAMPDIFF(MINUTE, l.created_at, ? + INTERVAL 6 HOUR)) 
            LIMIT 1) AS temp_06`,
            [reportDate, reportDate, reportDate]
          ),
          dbPool.raw(
            `(SELECT l.humidity FROM logging l 
            WHERE d.area = l.area 
            AND l.created_at BETWEEN ? + INTERVAL 4 HOUR AND ? + INTERVAL 8 HOUR
            ORDER BY ABS(TIMESTAMPDIFF(MINUTE, l.created_at, ? + INTERVAL 6 HOUR)) 
            LIMIT 1) AS humi_06`,
            [reportDate, reportDate, reportDate]
          ),
          // Temperature & Humidity at 12:00
          dbPool.raw(
            `(SELECT l.temperature FROM logging l 
            WHERE d.area = l.area 
            AND l.created_at BETWEEN ? + INTERVAL 9 HOUR AND ? + INTERVAL 14 HOUR
            ORDER BY ABS(TIMESTAMPDIFF(HOUR, l.created_at, ? + INTERVAL 12 HOUR)) 
            LIMIT 1) AS temp_12`,
            [reportDate, reportDate, reportDate]
          ),
          dbPool.raw(
            `(SELECT l.humidity FROM logging l 
            WHERE d.area = l.area 
            AND l.created_at BETWEEN ? + INTERVAL 9 HOUR AND ? + INTERVAL 14 HOUR
            ORDER BY ABS(TIMESTAMPDIFF(HOUR, l.created_at, ? + INTERVAL 12 HOUR)) 
            LIMIT 1) AS humi_12`,
            [reportDate, reportDate, reportDate]
          ),
          // Temperature & Humidity at 18:00
          dbPool.raw(
            `(SELECT l.temperature FROM logging l 
            WHERE d.area = l.area 
            AND l.created_at BETWEEN ? + INTERVAL 15 HOUR AND ? + INTERVAL 21 HOUR
            ORDER BY ABS(TIMESTAMPDIFF(HOUR, l.created_at, ? + INTERVAL 18 HOUR)) 
            LIMIT 1) AS temp_18`,
            [reportDate, reportDate, reportDate]
          ),
          dbPool.raw(
            `(SELECT l.humidity FROM logging l 
            WHERE d.area = l.area 
            AND l.created_at BETWEEN ? + INTERVAL 15 HOUR AND ? + INTERVAL 21 HOUR
            ORDER BY ABS(TIMESTAMPDIFF(HOUR, l.created_at, ? + INTERVAL 18 HOUR)) 
            LIMIT 1) AS humi_18`,
            [reportDate, reportDate, reportDate]
          ),
        ])
        .from("device as d");
      await dbPool("report").insert(data);
      await dbPool("logging")
        .whereRaw("DATE(created_at) = ?", [reportDate])
        .del();
    } catch (error) {
      console.error(error);
    }
  },

  checkReport: async (dateInput = null) => {
    const reportDate = dateInput
      ? dbPool.raw("?", [dateInput])
      : dbPool.raw("CURDATE()");
    return dbPool("report")
      .count("* as total_report")
      .whereRaw("report_date = ?", [reportDate]);
  },
};

module.exports = reportModel;
