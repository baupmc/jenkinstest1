'use strict';

const _ = require('lodash');

module.exports = (wss) => {
    wss.on('connection', function connection(ws) {
        // Parrot functionality.
        ws.on('message', function incoming(message) {
            ws.send(message);
        });
        // On-connection functionality
        ws.send('Successfully connected to GalaxyAPI Websocket Server on port 31500.');
    });
}
