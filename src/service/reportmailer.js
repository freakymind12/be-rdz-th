const mailService = require("./mailer");
const groupModel = require("../model/group");
const reportModel = require("../model/report");
const deviceModel = require("../model/device");
const picModel = require("../model/pic");

const generateData = async () => {
  const groups = await groupModel.getGroup();
  const picList = [];
  for (const group of groups) {
    const pic = await picModel.getPic({ id_group: group.id });
    picList.push({ id_group: group.id, pic });
  }
  return { groups, picList };
};

const printData = async () => {
  const data = await generateData();
  console.log(data);
};

printData();
