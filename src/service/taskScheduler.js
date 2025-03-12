// import package
const cron = require("node-cron");
const dayjs = require("dayjs");

// import service
const mqttService = require("../service/mqtt");
const mailService = require("./mailer");

// import utils
const pdfReport = require("../utils/pdfReport");

// import model
const reportModel = require("../model/report");
const groupModel = require("../model/group");
const deviceModel = require("../model/device");

// Task Scheduler
const taskScheduler = {
  // Untuk ubah status device di table device apabila updated_at nya melebihi 10 menit tidak menerima data dari sensor
  updateDeviceStatus() {
    cron.schedule("*/1 * * * *", async () => {
      try {
        const updatedRows = await deviceModel.updateStaleDevice();
        console.log(`${dayjs().format("YYYY-MM-DD HH:mm:ss")} | SCHEDULER | DEVICE CHECK STATUS | Updated ${updatedRows} devices to status 0`);
      } catch (error) {
        console.error(error);
      }
    });
  },

  publishTimetoMqtt() {
    cron.schedule("* * * * * *", () => {
      mqttService.publish(
        process.env.MQTT_TOPIC_TIME,
        JSON.stringify({
          clock: dayjs().format("HH:mm"),
          day: dayjs().format("dddd"),
          date: dayjs().format("DD MMMM YYYY"),
          dateArray: [
            dayjs().format("YYYY"),
            dayjs().format("MM"),
            dayjs().format("DD"),
          ],
        })
      );
    });
  },

  generateReportData() {
    cron.schedule("25 15 * * *", async () => {
      try {
        await reportModel.generateReportFromLogging(
          dayjs().format("YYYY-MM-DD")
        );
        console.log(
          `${dayjs().format(
            "YYYY-MM-DD HH:mm:ss"
          )} | SCHEDULER | GENERATE REPORT FROM LOGGING | DATE : ${dayjs().format(
            "YYYY-MM-DD"
          )}`
        );
      } catch (error) {
        console.error(error);
      }
    });
  },

  emailDailyReport() {
    cron.schedule("36 14 * * *", async () => {
      try {
        // Get all groups
        const groups = await groupModel.getGroup();

        // Looping banyak nya group
        for (const group of groups) {
          // Get Report Data
          const reportData = await reportModel.getReport({
            full_date: dayjs().format("YYYY-MM-DD"),
            area: "All",
            group_id: group.group_id,
          });

          // Generate PDF Base64
          if (
            Array.isArray(reportData.data) &&
            reportData.data.length > 0 &&
            group.pics.length > 0
          ) {
            const pdfBase64 = await pdfReport.daily(reportData, "base64");

            // Send Email to list of PIC
            const emailRecipients = group.pics.map((pic) => pic.email);

            // Mail Options
            const mailOptions = {
              to: emailRecipients,
              subject: `RDZ-TH Daily Report for ${group.group_name}`,
              text: "This is daily report for your group",
              html: `<p>Hello, this is daily report for your group</p>
                    <p>Please find the attachment for the report</p>
                    <p>Best regards,</p>
                    <p>IoT System HRS ID</p>`,
            };

            // Attachment
            const attachments = [
              {
                filename: `RDZ-TH Daily Report for ${group.group_name}.pdf`,
                content: pdfBase64,
                encoding: "base64",
              },
            ];

            // Send Email to list of PIC
            await mailService.sendEmail(mailOptions, attachments);
            console.log(
              `${dayjs().format(
                "YYYY-MM-DD HH:mm:ss"
              )} | SCHEDULER | EMAIL DAILY REPORT | GROUP : ${
                group.group_name
              } | SUCCESS`
            );
          } else {
            console.log(
              `${dayjs().format(
                "YYYY-MM-DD HH:mm:ss"
              )} | SCHEDULER | EMAIL DAILY REPORT | GROUP : ${
                group.group_name
              } | SKIPPED (NO DATA)`
            );
          }
        }
      } catch (error) {
        console.error(error);
      }
    });
  },
};

module.exports = taskScheduler;
