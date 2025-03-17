const dayjs = require("dayjs");
const getEmailTemplate = (groupName) => {
  const date = dayjs().subtract(1, "day").format("YYYY-MM-DD");

  return `<html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>RDZ-TH System Report</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
              }
              
              .note {
                font-size: medium;
                font-style: italic
              }
              .button-wrapper {
                display:flex;
                align-items: center;
                justify-content: center;
              }
              .header {
                background: #007bff;
                color: white;
                text-align: center;
                padding: 15px;
                border-radius: 8px 8px 0 0;
              }
              .content {
                padding: 20px;
                font-size: 16px;
                color: #333;
              }
              .footer {
                text-align: center;
                padding: 15px;
                font-size: 14px;
                color: #777;
              }
              .btn {
                display: inline-block;
                padding: 10px 20px;
                margin-top: 10px;
                background: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 5px;
              }
              .btn:hover {
                background: #0056b3;
              }
            </style>
          </head>
          <body>
  
          <div class="container">
            <div class="header">
              <h2>RDZ-TH Daily Report</h2>
            </div>

            <div class="content">
              <p>Hello,</p>
              <p>This is daily report condition temperature and humidity in your group areas</p>

              <h3>📋 Report Summary:</h3>
              <ul>
                <li><strong>Date:</strong> ${date}</li>
                <li><strong>Group:</strong> ${groupName}</li>
              </ul>

              <p>Please find the attached report in PDF format.</p>
              <p>You can also view the report online by clicking the button below:</p>
              <div class="button-wrapper">
                <a href="http://192.168.148.125:5173/report" class="btn">View Report</a>
              </div>
              
              <p class="note"><strong>Note:</strong>
              Please do not reply to this email</p>
            </div>

            <div class="footer">
              <p>HRS IoT System &copy; ${dayjs().format("YYYY")}</p>
              <p>For any support, contact: <a href="mailto:support@example.com">support@example.com</a></p>
            </div>
          </div>

        </body>
        </html>`;
};

module.exports = getEmailTemplate;