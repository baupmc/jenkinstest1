'use strict';

const GalaxyLog = require('../models/galaxylog');
const config = require('../config/config');

var logId = config.logId.id;

const logMessage = (message) => {
    let loggingmessage = new GalaxyLog('galaxyapi', logId, 'galaxyapi', 'info', false, message);

    return loggingmessage.toDb()
        .then(() => true)
        .catch(error => false);
}

module.exports = {
    logMessage: logMessage
}