const mqtt = require("mqtt");
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL;
const MQTT_TOPIC = process.env.MQTT_TOPIC;
const dbPool = require("../config/dbConfig");
const dayjs = require("dayjs");
const deviceModel = require("../model/device");
const deviceLogModel = require("../model/device_log_error")

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
      const data = JSON.parse(message);
      const area = topic.split("/")[3];
      if (!topic.includes("time") && topic.split("/")[4] == "out") {
        
        if(data.error.temperature.isError){
          await deviceLogModel.addLog({
            area,
            type : 'temperature',
            message: data.error.temperature.reason
          })
        }

        if(data.error.humidity.isError){
          await deviceLogModel.addLog({
            area,
            type : 'humidity',
            message: data.error.humidity.reason
          })
        }

        // Perbarui status device
        await deviceModel.updateDevice(area, { status: 1, updated_at: dayjs().format("YYYY-MM-DD HH:mm:ss")});

        // Logging data sensor to database and update parameter device
        this.loggingData(topic, data.sensor);

        // Broadcast sensor data to websocket
        this.broadcastToWs({
          ...data,
          area: topic.split("/")[3],
          date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        });
      }
    } catch (error) {
      console.error("Error parsing message", error);
      console.error("original message", message);
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
            t_max,
            t_min,
            h_max,
            h_min,
            updated_at: dayjs().format("YYYY-MM-DD HH:mm:ss")
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
};

module.exports = mqttService;
