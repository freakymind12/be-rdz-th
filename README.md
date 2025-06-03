
# 📊 RDZ-TH Backend

REST API Backend created using **NodeJS**, **Express** and **KnexJS** for query builder. This is build for **IoT Project RDZ-TH Web Apps** for control and reporting temperature and humidity.

---




## Features

- 📧 **Mailer** : Daily email reports for condition temperature and humidity
- 📶 **MQTT**   : Able to connect for doing subscribe or publish on topics from MQTT Broker
- ✔  **Websocket** : Serve websocker endpoint for realtime dashboard RDZ-TH Device
- 📊 **Report** : Table format report for every area RDZ-TH Device
- 🏚 **Device Grouping** : Device grouping based for easy control RDZ-TH Device for every area in any division


## Project Structure

```bash
backend
┣ public
┃  ┗ images
┣ src
┃  ┣ config               # for configuration
┃  ┣ controller           # controller handler
┃  ┣ middleware           # middleware handler
┃  ┣ model                # for query bussiness logic
┃  ┣ routes               # routing express 
┃  ┣ service              # for adding services function
┃  ┣ utils                # for utility function
┗  ┗ main.js              # main script for run project
```

---
## Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/freakymind12/be-rdz-th.git
cd be-rdz-th
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environtment Variable

See ```.env.example``` for template making file ```.env```


### 4. Run the docker-compose

```bash
docker compose up -d
```

Access the REST API with your port config based on ```.env``` file you've been making

---
## Requirements

- NodeJS v20 or latest
- MQTT Broker
- SMTP GMAIL (for daily report)
## Authors

- [@riankurniawan](https://github.com/freakymind12)


