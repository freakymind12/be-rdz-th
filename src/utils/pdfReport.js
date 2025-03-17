const PdfPrinter = require("pdfmake");
const fs = require("fs");
const dayjs = require("dayjs");

// Definisi font agar tidak error
const fonts = {
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
  Times: {
    normal: "Times-Roman",
    bold: "Times-Bold",
    italics: "Times-Italic",
    bolditalics: "Times-BoldItalic",
  },
  Courier: {
    normal: "Courier",
    bold: "Courier-Bold",
    italics: "Courier-Oblique",
    bolditalics: "Courier-BoldOblique",
  },
};
// Color for table cell
const colors = {
  min: "#bfd6ec",
  max: "#fb9a98",
  warning: "#fdff99",
  normal: "#ffffff",
  green: "#05bf3a",
  grey: "#ECECEC",
};

// Formatter color for table cell
const formatterColor = (data, min, max) => {
  if (data === null) return colors.normal;
  if (data === "N/C") return colors.green;
  if (data <= min) return colors.min;
  if (data >= max) return colors.max;
  if (data <= min * 1.1 || data >= max * 0.9) return colors.warning;
  return colors.normal;
};

// Printer
const printer = new PdfPrinter(fonts);

// Function Generate PDF
const generatePDF = {
  daily: (reportData, type = "pdf") => {
    const outputPath = `public/pdf_report/RDZ_TH_${
      reportData.group_name
    }_Report_${dayjs().format("YYYY-MM-DD")}.pdf`;

    const tableInfoHeader = [
      [
        {
          text: "Group",
          style: "tableInfo",
        },
        {
          text: ":",
          style: "tableHeader",
        },
        {
          text: `${reportData.group_name}`,
          style: "tableInfo",
        },
      ],
      [
        {
          text: "Report Date",
          style: "tableInfo",
        },
        {
          text: ":",
          style: "tableHeader",
        },
        {
          text: `${reportData.report_date}`,
          style: "tableInfo",
        },
      ],
      [
        {
          text: "Report Type",
          style: "tableInfo",
        },
        {
          text: ":",
          style: "tableHeader",
        },
        {
          text: "Automatically Email",
          style: "tableInfo",
        },
      ],
    ];

    const tableInfoFooter = [
      [
        {
          table: {
            body: [
              [
                {
                  text: "N/A",
                  fillColor: colors.warning,
                  color: colors.warning,
                  fontSize: 6,
                },
              ],
            ],
          },
        },
        ":",
        { text: "Warning Status", style: "footerText" },
      ],
      [
        {
          table: {
            body: [
              [
                {
                  text: "N/A",
                  fillColor: colors.max,
                  color: colors.max,
                  fontSize: 6,
                },
              ],
            ],
          },
        },
        ":",
        {
          text: "Sensor exceeds max range",
          style: "footerText",
        },
      ],
      [
        {
          table: {
            body: [
              [
                {
                  text: "N/A",
                  fillColor: colors.min,
                  color: colors.min,
                  fontSize: 6,
                },
              ],
            ],
          },
        },
        ":",
        {
          text: "Sensor exceeds min range",
          style: "footerText",
        },
      ],
      [
        {
          table: {
            body: [[{ text: "N/A", fillColor: colors.normal, fontSize: 6 }]],
          },
        },
        ":",
        { text: "No Action (Not Recorded)", style: "footerText" },
      ],
      [
        {
          table: {
            body: [[{ text: "N/C", fillColor: "#03c03c", fontSize: 6 }]],
          },
        },
        ":",
        { text: "No need to control or record", style: "footerText" },
      ],
    ];

    const tableBody = [
      [
        {
          text: "No",
          style: "area",
          rowSpan: 2,
          fillColor: colors.grey,
        },
        {
          text: "Area",
          style: "area",
          rowSpan: 2,
          fillColor: colors.grey,
        },
        {
          text: "Range",
          style: "tableHeader",
          colSpan: 2,
          fillColor: colors.grey,
        },
        {},
        {
          text: "Temperature",
          colSpan: 4,
          style: "tableHeader",
          fillColor: colors.grey,
        },
        {},
        {},
        {},
        {
          text: "Range",
          style: "tableHeader",
          colSpan: 2,
          fillColor: colors.grey,
        },
        {},
        {
          text: "Humidity",
          colSpan: 4,
          style: "tableHeader",
          fillColor: colors.grey,
        },
        {},
        {},
        {},
      ],
      [
        {},
        {},
        { text: "Min", bold: true, style: "tableData", fillColor: colors.grey },
        { text: "Max", bold: true, style: "tableData", fillColor: colors.grey },
        {
          text: "00:00",
          bold: true,
          style: "tableData",
          fillColor: colors.grey,
        },
        {
          text: "06:00",
          bold: true,
          style: "tableData",
          fillColor: colors.grey,
        },
        {
          text: "12:00",
          bold: true,
          style: "tableData",
          fillColor: colors.grey,
        },
        {
          text: "18:00",
          bold: true,
          style: "tableData",
          fillColor: colors.grey,
        },
        { text: "Min", bold: true, style: "tableData", fillColor: colors.grey },
        { text: "Max", bold: true, style: "tableData", fillColor: colors.grey },
        {
          text: "00:00",
          bold: true,
          style: "tableData",
          fillColor: colors.grey,
        },
        {
          text: "06:00",
          bold: true,
          style: "tableData",
          fillColor: colors.grey,
        },
        {
          text: "12:00",
          bold: true,
          style: "tableData",
          fillColor: colors.grey,
        },
        {
          text: "18:00",
          bold: true,
          style: "tableData",
          fillColor: colors.grey,
        },
      ],
    ];

    reportData.data.forEach((item) => {
      tableBody.push([
        { text: reportData.data.indexOf(item) + 1, style: "tableData" },
        { text: item.area, style: "tableData" },
        { text: item.t_min, style: "tableData", fillColor: colors.min },
        { text: item.t_max, style: "tableData", fillColor: colors.max },
        {
          text: item.temp_00 || "N/A",
          style: "tableData",
          fillColor: formatterColor(item.temp_00, item.t_min, item.t_max),
        },
        {
          text: item.temp_06 || "N/A",
          style: "tableData",
          fillColor: formatterColor(item.temp_06, item.t_min, item.t_max),
        },
        {
          text: item.temp_12 || "N/A",
          style: "tableData",
          fillColor: formatterColor(item.temp_12, item.t_min, item.t_max),
        },
        {
          text: item.temp_18 || "N/A",
          style: "tableData",
          fillColor: formatterColor(item.temp_18, item.t_min, item.t_max),
        },
        { text: item.h_min, style: "tableData", fillColor: colors.min },
        { text: item.h_max, style: "tableData", fillColor: colors.max },
        {
          text: item.humi_00 || "N/A",
          style: "tableData",
          fillColor: formatterColor(item.humi_00, item.h_min, item.h_max),
        },
        {
          text: item.humi_06 || "N/A",
          style: "tableData",
          fillColor: formatterColor(item.humi_06, item.h_min, item.h_max),
        },
        {
          text: item.humi_12 || "N/A",
          style: "tableData",
          fillColor: formatterColor(item.humi_12, item.h_min, item.h_max),
        },
        {
          text: item.humi_18 || "N/A",
          style: "tableData",
          fillColor: formatterColor(item.humi_18, item.h_min, item.h_max),
        },
      ]);
    });

    const docDefinition = {
      pageOrientation: "landscape",
      content: [
        {
          columns: [
            // Table Info Header
            {
              layout: "noBorders",
              table: {
                widths: [100, 10, 100],
                body: tableInfoHeader,
              },
              width: "80%",
              style: "wrapTableInfo",
              alignment: "left",
            },
            {
              layout: "noBorders",
              table: {
                widths: [25, 5, 150],
                body: tableInfoFooter,
              },
              style: "wrapTableInfo",
            },
          ],
        },

        // Table Body Report
        {
          table: {
            theme: "grid",
            headerRows: 2,
            widths: [
              30, 120, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40,
            ],
            body: tableBody,
          },
          style: "wrapTableBody",
        },
      ],
      header: () => {
        return {
          text: "Daily Report Temperature & Humidity",
          style: "header",
          margin: [0, 15, 0, 0],
        };
      },

      footer: function (currentPage, pageCount) {
        return {
          columns: [
            {
              image: "public/images/hrs.png",
              width: 40,
              height: 20,
              alignment: "left",
              margin: [0, 5, 0, 0], // Menyesuaikan posisi vertikal gambar
            },
            {
              text: "Internet of Things System",
              alignment: "left",
              width: "10%",
              fontSize: 10,
              margin: [0, 7, 0, 0],
            },

            {
              text: "This report is automatic generated by the IoT System please do not reply to this email",
              alignment: "center",
              width: "70%",
              fontSize: 10,
              margin: [0, 10, 0, 0], // Pastikan teks sejajar vertikal
            },
            {
              text: `Page ${currentPage} of ${pageCount}`,
              alignment: "right",
              fontSize: 9,
              margin: [0, 10, 0, 0], // Sesuaikan agar sejajar dengan teks tengah
            },
          ],
          margin: [10, 10, 10, 0],
          columnGap: 5,
        };
      },
      styles: {
        logo: {
          alignment: "center",
        },
        header: {
          fontSize: 16,
          bold: true,
          margin: [0, 0, 0, 10],
          alignment: "center",
        },
        headerInfo: {
          fontSize: 12,
          margin: [0, 0, 0, 10],
        },
        area: {
          fontSize: 10,
          bold: true,
          cellPadding: 2,
          margin: [5, 5],
          alignment: "center",
        },
        tableHeader: {
          fontSize: 10,
          bold: true,
          cellPadding: 2,
          alignment: "center",
        },
        tableData: {
          fontSize: 10,
          cellPadding: 2,
          alignment: "center",
        },
        tableInfo: {
          fontSize: 10,
          cellPadding: 2,
          alignment: "left",
        },
        wrapTableInfo: {
          margin: [0, 0, 0, 10],
        },
        wrapTableBody: {
          margin: [0, 0, 0, 20],
        },
        footerInfo: {
          fontSize: 10,
          margin: [0, 0, 0, 10],
          bold: true,
        },
        footerText: {
          fontSize: 9,
        },
        tableApproval: {
          fontSize: 10,
          bold: true,
          cellPadding: 2,
          alignment: "center",
        },
        wrapTableApproval: {
          margin: [0, 0, 0, 10],
        },
        noteFooter: {
          fontSize: 10,
          bold: true,
          margin: [0, 50, 0, 0],
          alignment: "center",
        },
        linkFooter: {
          fontSize: 10,
          bold: true,
          alignment: "center",
        },
      },
      defaultStyle: {
        font: "Helvetica",
      },
    };

    // Simpan ke public/pdf_report dan return buffer PDF
    if (type === "pdf") {
      return new Promise((resolve, reject) => {
        try {
          const pdfDoc = printer.createPdfKitDocument(docDefinition);
          const writeStream = fs.createWriteStream(outputPath);
          const chunks = [];

          pdfDoc.pipe(writeStream);

          pdfDoc.on("data", (chunk) => {
            chunks.push(chunk);
          });

          pdfDoc.on("end", () => {
            const result = Buffer.concat(chunks);
            resolve(result); // Mengembalikan buffer PDF
          });

          pdfDoc.on("error", (error) => {
            reject(new Error(error));
          });

          pdfDoc.end();

          writeStream.on("finish", () => {
            resolve(outputPath);
          });
        } catch (error) {
          reject(new Error(error.message || "Failed to generate PDF"));
        }
      });
    }

    if (type === "base64") {
      // Return base64 aktifin ini
      return new Promise((resolve, reject) => {
        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        const chunks = [];

        // Menangkap data PDF ke dalam buffer
        pdfDoc.on("data", (chunk) => {
          chunks.push(chunk);
        });

        pdfDoc.on("end", () => {
          const result = Buffer.concat(chunks);
          const base64 = result.toString("base64"); // Mengonversi buffer ke Base64
          resolve(base64);
        });

        pdfDoc.on("error", (error) => {
          reject(new Error(error));
        });

        pdfDoc.end(); // Mengakhiri dokumen PDF
      });
    }
  },

  monthly: (reportData, type = "pdf", queryParams = {}) => {
    const { year, month, area } = queryParams;

    const outputPath = `public/pdf_report/RDZ_TH_${
      reportData.group_name || "All"
    }_Monthly_Report_${year}-${month}.pdf`;

    const tableInfoHeader = [
      [
        {
          text: "Device Group",
          style: "tableInfo",
        },
        {
          text: ":",
          style: "tableHeader",
        },
        {
          text: area === "All" ? `All` : `${reportData[0].group_name}`,
          style: "tableInfo",
        },
      ],
      [
        {
          text: "Device Area",
          style: "tableInfo",
        },
        {
          text: ":",
          style: "tableHeader",
        },
        {
          text: `${area}`,
          style: "tableInfo",
        },
      ],
      [
        {
          text: "Report Month",
          style: "tableInfo",
        },
        {
          text: ":",
          style: "tableHeader",
        },
        {
          text: `${year}-${month}`,
          style: "tableInfo",
        },
      ],
      [
        {
          text: "Report Type",
          style: "tableInfo",
        },
        {
          text: ":",
          style: "tableHeader",
        },
        {
          text: "Download",
          style: "tableInfo",
        },
      ],
    ];

    const tableInfoFooter = [
      [
        {
          table: {
            body: [
              [
                {
                  text: "N/A",
                  fillColor: colors.warning,
                  color: colors.warning,
                  fontSize: 6,
                },
              ],
            ],
          },
        },
        ":",
        { text: "Warning Status", style: "footerText" },
      ],
      [
        {
          table: {
            body: [
              [
                {
                  text: "N/A",
                  fillColor: colors.max,
                  color: colors.max,
                  fontSize: 6,
                },
              ],
            ],
          },
        },
        ":",
        {
          text: "Sensor exceeds max range",
          style: "footerText",
        },
      ],
      [
        {
          table: {
            body: [
              [
                {
                  text: "N/A",
                  fillColor: colors.min,
                  color: colors.min,
                  fontSize: 6,
                },
              ],
            ],
          },
        },
        ":",
        {
          text: "Sensor exceeds min range",
          style: "footerText",
        },
      ],
      [
        {
          table: {
            body: [[{ text: "N/A", fillColor: colors.normal, fontSize: 6 }]],
          },
        },
        ":",
        { text: "No Action (Not Recorded)", style: "footerText" },
      ],
      [
        {
          table: {
            body: [[{ text: "N/C", fillColor: "#03c03c", fontSize: 6 }]],
          },
        },
        ":",
        { text: "No need to control or record", style: "footerText" },
      ],
      // [
      //   { table: { body: [[{ text: "N/A", color: "white", fontSize: 6 }]] } },
      //   ":",
      //   { text: "Lost Connection (Not Recorded)", style: "footerText" },
      // ],
    ];

    const tableBody = [
      [
        {
          text: "Date",
          style: "area",
          rowSpan: 2,
          fillColor: colors.grey,
        },
        {
          text: "Area",
          style: "area",
          rowSpan: 2,
          fillColor: colors.grey,
        },
        {
          text: "Range",
          style: "tableHeader",
          colSpan: 2,
          fillColor: colors.grey,
        },
        {},
        {
          text: "Temperature",
          colSpan: 4,
          style: "tableHeader",
          fillColor: colors.grey,
        },
        {},
        {},
        {},
        {
          text: "Range",
          style: "tableHeader",
          colSpan: 2,
          fillColor: colors.grey,
        },
        {},
        {
          text: "Humidity",
          colSpan: 4,
          style: "tableHeader",
          fillColor: colors.grey,
        },
        {},
        {},
        {},
      ],
      [
        {},
        {},
        { text: "Min", bold: true, style: "tableData", fillColor: colors.grey },
        { text: "Max", bold: true, style: "tableData", fillColor: colors.grey },
        {
          text: "00:00",
          bold: true,
          style: "tableData",
          fillColor: colors.grey,
        },
        {
          text: "06:00",
          bold: true,
          style: "tableData",
          fillColor: colors.grey,
        },
        {
          text: "12:00",
          bold: true,
          style: "tableData",
          fillColor: colors.grey,
        },
        {
          text: "18:00",
          bold: true,
          style: "tableData",
          fillColor: colors.grey,
        },
        { text: "Min", bold: true, style: "tableData", fillColor: colors.grey },
        { text: "Max", bold: true, style: "tableData", fillColor: colors.grey },
        {
          text: "00:00",
          bold: true,
          style: "tableData",
          fillColor: colors.grey,
        },
        {
          text: "06:00",
          bold: true,
          style: "tableData",
          fillColor: colors.grey,
        },
        {
          text: "12:00",
          bold: true,
          style: "tableData",
          fillColor: colors.grey,
        },
        {
          text: "18:00",
          bold: true,
          style: "tableData",
          fillColor: colors.grey,
        },
      ],
    ];

    reportData.forEach((item) => {
      tableBody.push([
        { text: item.report_date, style: "tableData" },
        { text: item.area, style: "tableData" },
        { text: item.t_min, style: "tableData", fillColor: colors.min },
        { text: item.t_max, style: "tableData", fillColor: colors.max },
        {
          text: item.temp_00 || "N/A",
          style: "tableData",
          fillColor: formatterColor(item.temp_00, item.t_min, item.t_max),
        },
        {
          text: item.temp_06 || "N/A",
          style: "tableData",
          fillColor: formatterColor(item.temp_06, item.t_min, item.t_max),
        },
        {
          text: item.temp_12 || "N/A",
          style: "tableData",
          fillColor: formatterColor(item.temp_12, item.t_min, item.t_max),
        },
        {
          text: item.temp_18 || "N/A",
          style: "tableData",
          fillColor: formatterColor(item.temp_18, item.t_min, item.t_max),
        },
        { text: item.h_min, style: "tableData", fillColor: colors.min },
        { text: item.h_max, style: "tableData", fillColor: colors.max },
        {
          text: item.humi_00 || "N/A",
          style: "tableData",
          fillColor: formatterColor(item.humi_00, item.h_min, item.h_max),
        },
        {
          text: item.humi_06 || "N/A",
          style: "tableData",
          fillColor: formatterColor(item.humi_06, item.h_min, item.h_max),
        },
        {
          text: item.humi_12 || "N/A",
          style: "tableData",
          fillColor: formatterColor(item.humi_12, item.h_min, item.h_max),
        },
        {
          text: item.humi_18 || "N/A",
          style: "tableData",
          fillColor: formatterColor(item.humi_18, item.h_min, item.h_max),
        },
      ]);
    });

    const docDefinition = {
      pageOrientation: "landscape",
      content: [
        {
          columns: [
            // Table Info Header
            {
              layout: "noBorders",
              table: {
                widths: [100, 10, 100],
                body: tableInfoHeader,
              },
              width: "80%",
              style: "wrapTableInfo",
              alignment: "left",
            },
            {
              layout: "noBorders",
              table: {
                widths: [25, 5, 150],
                body: tableInfoFooter,
              },
              style: "wrapTableInfo",
            },
          ],
        },

        // Table Body Report
        {
          table: {
            theme: "grid",
            headerRows: 2,
            widths: [
              80, 80, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40,
            ],
            body: tableBody,
            style: {
              alignment: "center",
            },
          },
          style: "wrapTableBody",
        },
      ],
      header: () => {
        return {
          text: "Monthly Report Temperature & Humidity",
          style: "header",
          margin: [0, 15, 0, 0],
        };
      },

      footer: function (currentPage, pageCount) {
        return {
          columns: [
            {
              image: "public/images/hrs.png",
              width: 40,
              height: 20,
              alignment: "left",
              margin: [0, 5, 0, 0], // Menyesuaikan posisi vertikal gambar
            },
            {
              text: "Internet of Things System",
              alignment: "left",
              width: "10%",
              fontSize: 10,
              margin: [0, 7, 0, 0],
            },

            {
              text: "This report is automatic generated by the IoT System please do not reply to this email",
              alignment: "center",
              width: "70%",
              fontSize: 10,
              margin: [0, 10, 0, 0], // Pastikan teks sejajar vertikal
            },
            {
              text: `Page ${currentPage} of ${pageCount}`,
              alignment: "right",
              fontSize: 9,
              margin: [0, 10, 0, 0], // Sesuaikan agar sejajar dengan teks tengah
            },
          ],
          margin: [10, 10, 10, 0],
          columnGap: 5,
        };
      },
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          alignment: "center",
        },
        headerInfo: {
          fontSize: 12,
          margin: [0, 0, 0, 10],
        },
        area: {
          fontSize: 10,
          bold: true,
          cellPadding: 2,
          margin: [5, 5],
          alignment: "center",
        },
        tableHeader: {
          fontSize: 10,
          bold: true,
          cellPadding: 2,
          alignment: "center",
        },
        tableData: {
          fontSize: 10,
          cellPadding: 2,
          alignment: "center",
        },
        tableInfo: {
          fontSize: 10,
          cellPadding: 2,
          alignment: "left",
        },
        wrapTableInfo: {
          margin: [0, 0, 0, 10],
        },
        wrapTableBody: {
          margin: [0, 0, 0, 20],
        },
        footerInfo: {
          fontSize: 10,
          margin: [0, 0, 0, 10],
          bold: true,
        },
        footerText: {
          fontSize: 9,
        },
        tableApproval: {
          fontSize: 10,
          bold: true,
          cellPadding: 2,
          alignment: "center",
        },
        wrapTableApproval: {
          margin: [0, 0, 0, 10],
        },
        noteFooter: {
          fontSize: 10,
          margin: [0, 0, 0, 0],
          alignment: "center",
        },
        linkFooter: {
          fontSize: 10,
          bold: true,
          alignment: "center",
        },
      },
      defaultStyle: {
        font: "Helvetica",
      },
    };

    if (type === "pdf") {
      return new Promise((resolve, reject) => {
        try {
          const pdfDoc = printer.createPdfKitDocument(docDefinition);
          // const writeStream = fs.createWriteStream(outputPath);
          const chunks = [];

          // pdfDoc.pipe(writeStream);

          pdfDoc.on("data", (chunk) => {
            chunks.push(chunk);
          });

          pdfDoc.on("end", () => {
            const result = Buffer.concat(chunks);
            resolve(result); // Mengembalikan buffer PDF
          });

          pdfDoc.on("error", (error) => {
            reject(new Error(error));
          });

          pdfDoc.end();

          // writeStream.on("finish", () => {
          //   resolve(outputPath);
          // });
        } catch (error) {
          reject(new Error(error.message || "Failed to generate PDF"));
        }
      });
    }
  },
};

module.exports = generatePDF;
