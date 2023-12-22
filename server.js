const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv/config');

// middle-wares

app.use(logger);
app.use(express.static('./public'));
app.use(cookieParser());
app.use(bodyParser.json());
app.set('view engine', 'ejs');

app.get('/getSensorData', sendSensorData);
app.get('/setSensorData', setSensorData);
app.get('*', getHandler);


let sensorData = {
    deviceStatus: false,
    temp: '--',
    humidity: '--',
    rain: '--',
    lastUpdated: 'Waiting for device'
}

setInterval(() => {checkTimer();}, 2000);

let offlineTimer = 0;

function checkTimer() {
    if(offlineTimer == 0) {
        return sensorData.deviceStatus = false;
    }
    sensorData.deviceStatus = true;
    offlineTimer--;
}

function getHandler(req, res) {

    
    return res.status(200).render(
        'index', 
        sensorData
    );
}


function sendSensorData(req, res) {

    console.log('sending data')

    return res.status(200).json(sensorData);
}


function setSensorData(req, res) {

    if(req.query.r && req.query.h && req.query.t) {

        offlineTimer = 5;
        sensorData.lastUpdated = getIST();
        sensorData.humidity = parseInt(req.query.h);
        sensorData.temp = parseInt(req.query.t);
        sensorData.rain = parseInt(req.query.r);

        console.log('sensor data updated');

        return res.status(200).send('ok');
    }
    
    return res.status(405).send('invalid url');
}


function getIST() {
    const options = {
      timeZone: 'Asia/Kolkata',
      hour12: true,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      day: 'numeric',
      month: 'short'
    };
  
    return new Date().toLocaleString('en-IN', options);
}


function logger(req, res, next) {
    const ipAddr = req.headers['cf-connecting-ip'] || req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    console.log(ipAddr + ' ' + req.method + ''+ req.url);
    next();
}

// listener

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('Listening on port '+ port +'..');
});
