const mqtt = require("mqtt");
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL;
const MQTT_TOPIC = process.env.MQTT_TOPIC;
const dbPool = require("../config/dbConfig");
const dayjs = require("dayjs");
const deviceModel = require("../model/device");
const deviceLogModel = require("../model/device_log_error");

const mqttService = {
  client: null,
  connectedWs: [],

  init() {
    this.client = mqtt.connect(MQTT_BROKER_URL);
    this.client.on("connect", this.onConnect.bind(this));
    this.client.on("error", this.onError.bind(this));
    this.client.on("message", this.onMessage.bind(this));
  },

  onConnect() {
    this.subscribe(MQTT_TOPIC);
  },

  onError(error) {
    console.error(error);
  },

  async onMessage(topic, message) {
    try {
      // Dilakukan to string dan trim untuk memperbaiki string encoding dari message yang diterima
      const data = JSON.parse(message.toString().trim());
      const topicParts = topic.split("/");
      const area = topicParts[3];
      const isOutTopic = topicParts[4] === "out";
      const isTimeTopic = topic.includes("time");
      const hasRequest = data.hasOwnProperty("request");

      if (!isTimeTopic && isOutTopic) {
        if (!hasRequest) {
          await deviceModel.updateDevice(area, {
            status: 1,
            updated_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          });

          this.loggingData(topic, data.sensor);
          this.loggingError(area, data);
          // console.log(`message from device in area ${area}`,data)
          this.broadcastToWs({
            ...data,
            area,
            date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          });
        } else {
          this.handleChangeArea(area, data);
        }
      }
    } catch (error) {
      console.error("Error parsing message:", error);
      console.error("Original message:", message);
    }
  },

  subscribe(topic) {
    this.client.subscribe(topic, (error) => {
      if (error) {
        console.error(error);
      } else {
        console.log(
          `${dayjs().format(
            "YYYY-MM-DD HH:mm:ss"
          )} | MQTT | SUB | ${topic} | subscribed`
        );
      }
    });
  },

  publish(topic, message) {
    this.client.publish(topic, message, (error) => {
      if (error) {
        console.error(error);
        return;
      }

      if (!topic.includes("time")) {
        console.log(
          `${dayjs().format(
            "YYYY-MM-DD HH:mm:ss"
          )} | MQTT | PUB | ${topic} | ${message}`
        );
      }
    });
  },

  addWsConnection(ws) {
    this.connectedWs.push(ws);
  },

  // for broadcast message from mqtt to websocket
  broadcastToWs(message) {
    this.connectedWs.forEach((ws) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  },

  // insert sensor data to logging table
  loggingData: async (topic, message) => {
    try {
      const { temp, t_max, humi, t_min, h_max, h_min } = message;
      const area = topic.split("/")[3];
      const regional = topic.split("/")[2];
      // isi ke device table jika belum ada area nya dan perbarui nilai setting temperature, humidity min & max
      if (topic.split("/")[4] == "out") {
        await dbPool("device")
          .insert({
            area,
            regional,
            status: 1,
            t_max,
            t_min,
            h_max,
            h_min,
            updated_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          })
          .onConflict("area")
          .merge();

        // insert data sensor ke table logging
        await dbPool("logging").insert({
          temperature: temp,
          humidity: humi,
          t_max,
          t_min,
          h_max,
          h_min,
          area,
        });
      }
    } catch (error) {
      console.error(error);
    }
  },

  // sensor error log to table device_log_error
  loggingError: async (area, data) => {
    try {
      if (data.error?.temperature?.isError) {
        await deviceLogModel.addLog({
          area,
          type: "temperature",
          message: data.error.temperature.reason,
        });
      }

      if (data.error?.humidity?.isError) {
        await deviceLogModel.addLog({
          area,
          type: "humidity",
          message: data.error.humidity.reason,
        });
      }
    } catch (error) {
      console.error("Error logging data for sensor failure", error);
    }
  },

  // handle request change area from device
  handleChangeArea: async function (area, data) {
    try {
      const topic = MQTT_TOPIC.replace("#", `${area}/in`);
      const [device] = await deviceModel.getDevice({
        area: data.request.cek_name,
      });

      let response;

      if (!device) {
        response = {
          status: 1,
          note: "This area is clear, you can proceed to change area.",
        };
        this.publish(topic, JSON.stringify({ response }));
        // disable old device
        await deviceModel.updateDevice(area, {
          status: 0,
          updated_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        });
      } else if (device.status === 1) {
        response = {
          status: 0,
          note: "This area has an active device, disable the old device first.",
        };
        this.publish(topic, JSON.stringify({ response }));
      } else {
        response = {
          status: 1,
          note: "This area has an inactive device, are you sure you want to enable it?",
        };
        this.publish(topic, JSON.stringify({ response }));
        // disable old device
        await deviceModel.updateDevice(area, {
          status: 0,
          updated_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        });
      }
    } catch (error) {
      console.error("Error handling change area:", error);
    }
  },
};

module.exports = mqttService;
