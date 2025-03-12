const { handleError, handleResponse } = require("../utils/responseUtil");
const deviceModel = require("../model/device");
const mqttService = require("../service/mqtt");
const MQTT_TOPIC = process.env.MQTT_TOPIC;
const RDZ_UPDATE_PASSWORD = process.env.RDZ_UPDATE_PASSWORD;

const deviceController = {
  getDevice: async (req, res) => {
    try {
      const data = await deviceModel.getDevice(req.query);
      handleResponse(res, "Success", 200, data);
    } catch (error) {
      handleError(res, error);
    }
  },

  updateParameter: async (req, res) => {
    const { area, regional, ...parameter } = req.body;
    // const topic = MQTT_TOPIC.replace("#", `${regional}/${area}/in`);
    const topic = MQTT_TOPIC.replace("#", `${area}/in`);

    const initialPayload = {
      setting: {
        ...parameter,
      },
      password: RDZ_UPDATE_PASSWORD,
    };

    try {
      // Kirim pesan ke device untuk inform request perubahan parameter settingan di lakukan dari web
      mqttService.publish(topic, JSON.stringify(initialPayload));

      handleResponse(res, "Success", 200);
    } catch (error) {
      handleError(res, error);
    }
  },

  updateArea: async (req, res) => {
    const { oldArea, newArea, regional } = req.body;
    // const topic = MQTT_TOPIC.replace("#", `${regional}/${oldArea}/IN`);
    const topic = MQTT_TOPIC.replace("#", `${oldArea}/in`);
    const initialPayload = {
      setting: {
        area: newArea,
        reboot: true,
      },
      password: RDZ_UPDATE_PASSWORD,
    };
    try {
      // Kirim pesan ke device untuk inform request perubahan area di lakukan dari web
      await deviceModel.updateDevice(oldArea, { area: newArea });
      
      mqttService.publish(topic, JSON.stringify(initialPayload));


      handleResponse(res, "Success", 200);
    } catch (error) {
      handleError(res, error);
    }
  },

  updateGroup: async (req, res) => {
    const { oldArea, ...payload } = req.body;
    try {
      const data = await deviceModel.updateDevice(oldArea, payload);
      handleResponse(res, "Success", 200, data);
    } catch (error) {
      handleError(res, error);
    }
  },
};

module.exports = deviceController;
