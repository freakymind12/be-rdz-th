require("dotenv").config();
const dayjs = require("dayjs");
const mailService = require("../service/mailer");
// import utils
const generatePDF = require("./pdfReport");

// import model
const reportModel = require("../model/report");
const groupModel = require("../model/group");

const mailDailyReport = async () => {
  try {
    // Get all groups
    const groups = await groupModel.getGroup();

    // Get all reports
    for (const group of groups) {
      // Get Report Data
      const reportData = await reportModel.getReport({
        full_date: dayjs().format("YYYY-MM-DD"),
        area: "All",
        group_id: group.group_id,
      });
      console.log("success get report data for group", group.group_name);
      // Generate PDF Base64
      if (Array.isArray(reportData.data) && reportData.data.length > 0) {
        const pdfBase64 = await generatePDF.daily(reportData, "base64");
        console.log("success generate pdf base64 for group", group.group_name);

        // Send Email to list of PIC
        const emailRecipients = group.pics.map((pic) => pic.email);
        console.log("Recipients:", emailRecipients);

        const mailOptions = {
          to: emailRecipients,
          subject: `RDZ-TH Daily Report for ${group.group_name}`,
          text: "This is daily report for your group",
          html: `<p>Hello, this is daily report for your group</p>
        <p>Please find the attachment for the report</p>
        <p>Best regards,</p>
        <p>IoT System HRS ID</p>`,
        };

        const attachments = [
          {
            filename: `RDZ-TH Daily Report for ${group.group_name}.pdf`,
            content: pdfBase64,
            encoding: "base64",
          },
        ];

        console.log(attachments);

        await mailService.sendEmail(mailOptions, attachments);
        console.log("success send email to group", group.group_name);
      } else {
        console.log(
          "There is no report data for this group (SKIPPED)",
          group.group_name
        );
      }
    }
  } catch (error) {
    console.error(error);
  }
};

mailDailyReport();
