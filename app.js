'use strict';

const express = require('express');
const WebSocket = require('ws');
const jwt = require("./helpers/jwt");
const passport = require('passport');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require("./config/config");
const port = config.runtime.port;
const wsport = config.runtime.wsport;

// import middleware
const authentication = require('./middlewares/auth').authentication;
const authorization = require('./middlewares/auth').authorization;
const renewal = require('./middlewares/auth').renewal;

// import services
const login = require('./services/login');
const renew = require('./services/renew');
const getadgroups = require('./services/getadgroups');
const getcategories = require('./services/getcategories');
const getcomponents = require('./services/getcomponents');
const getcomponenttags = require('./services/getcomponenttags');
const getgrouppermissions = require('./services/getgrouppermissions');
const gethl7fields = require('./services/gethl7fields');
const getallhl7fields = require('./services/getallhl7fields');
const getpermissiontypes = require('./services/getpermissiontypes');
const getmessagequeries = require('./services/getmessagequeries');
const getqueues = require('./services/getqueues');
const getcomponentsettings = require("./services/getcomponentsettings");
const savemessagequery = require('./services/savemessagequery');
const deletemessagequery = require('./services/deletemessagequery');
const updatemessagequery = require('./services/updatemessagequery');
const updatecomponenttag = require('./services/updatecomponenttag');
const updatecomponenttags = require('./services/updatecomponenttags');
const updategrouppermissions = require('./services/updategrouppermissions');
const updatecomponentsettings = require('./services/updatecomponentsettings');
const email = require('./services/email');
const log = require('./services/logmessage');
// Test HBASE Service
const gethbasetestdata = require('./services/gethbasetestdata');

// import wedbsocket server definition
const definewss = require('./websocket_server/define');

// create express
const app = express();

// create websocket server
const wss = new WebSocket.Server({ 
    port: wsport,
    path: '/alertstream',
    verifyClient: function(info, callback) {
        let token = info.req.url.split('?token=')[1];
        if (!token)
            callback(false, 401, 'Unauthorized');
        else {
            jwt.decode(token)
            .then(user => {
                info.req.user = user;
                callback(true);
            })
            .catch(error => JSON.stringify(error.message));
        }
    }
});

// define websocket server
definewss(wss);

// define middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: '*/*' }));
app.use(cors());

// define passport middleware
passport.use('authentication', authentication);
passport.use('authorization', authorization);
passport.use('renewal', renewal);

// define routes
app.post('/login', passport.authenticate('authentication', { session: false }), login);
app.post('/renew', passport.authenticate('renewal', { session: false }), renew);
app.post('/comms//email', passport.authenticate('authorization', { session: false }), email);
app.post('/message/query/save', passport.authenticate('authorization', { session: false }), savemessagequery);
app.post('/component/tag/update', passport.authenticate('authorization', { session: false }), updatecomponenttag);
app.post('/component/tags/update', passport.authenticate('authorization', { session: false }), updatecomponenttags);
app.post('/component/settings/update', passport.authenticate('authorization', { session: false }), updatecomponentsettings);
app.post('/security/group/perms/update', passport.authenticate('authorization', { session: false }), updategrouppermissions);
app.post('/log/create', log);

app.get('/security/group/get/:startsWith', passport.authenticate('authorization', { session: false }), getadgroups);
app.get('/getcategories/:contains', passport.authenticate('authorization', { session: false }), getcategories);
app.get('/component/get/:contains', passport.authenticate('authorization', { session: false }), getcomponents);
app.get('/component/get/:contains/:noCategory/:stageOnly', passport.authenticate('authorization', { session: false }), getcomponents);
app.get('/component/tags/get/:contains', passport.authenticate('authorization', { session: false }), getcomponenttags);
app.get('/component/settings/get/:componentId', passport.authenticate('authorization', { session: false }), getcomponentsettings);
app.get('/message/hl7/fields/get/:contains', passport.authenticate('authorization', { session: false }), gethl7fields);
app.get('/message/hl7/fields/get', passport.authenticate('authorization', { session: false }), getallhl7fields);
app.get('/message/query/get/:userid', passport.authenticate('authorization', { session: false }), getmessagequeries);
app.get('/message/hbase/testdata/get/:rowId', passport.authenticate('authorization', { session: false }), gethbasetestdata);
app.get('/security/group/perms/get/:groupId', passport.authenticate('authorization', { session: false }), getgrouppermissions);
app.get('/permissiontypes/get/:systemName', passport.authenticate('authorization', { session: false }), getpermissiontypes);
app.get('/queue/get/:startswith', passport.authenticate('authorization', { session: false }), getqueues);

app.put('/message/query/update/:id', passport.authenticate('authorization', { session: false }), updatemessagequery);

app.delete('/message/query/delete/:id', passport.authenticate('authorization', { session: false }), deletemessagequery);
// Test HBASE service

app.listen(port, (error => {
    console.log('Galaxy API listening on port ' + port);
    console.log('Galaxy API websocket server listening on port ' + wsport);
}));