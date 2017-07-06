'use strict';

const _ = require('lodash');
_.mixin(require('lodash-uuid'));
const db = require('../helpers/galaxydb');
const log4galaxy = require('../helpers/galaxyservicelog');
const GalaxyReturn = require('../models/galaxyreturn');
const GalaxyError = require('../models/galaxyerror');
const MessageQuery = require('../models/messagequery');

module.exports = (request, response, next) => {
    let messageQuery = new MessageQuery(
        request.body.id,
        request.body.name,
        request.body.userId,
        request.body.queryData
    );

    if (!_.isUuid(messageQuery.id)) {
        let error = new Error('Please provide a valid message query ID.');
        log4galaxy.logMessage(error);
        response.status(400).json(new GalaxyReturn(null, new GalaxyError(error.message, error.stack)));
    }
    else if (!_.isString(messageQuery.userId) || messageQuery.userId.trim() === '') {
        let error = new Error('Please provide a valid user ID.');
        log4galaxy.logMessage(error);
        response.status(400).json(new GalaxyReturn(null, new GalaxyError(error.message, error.stack)));
    }
    else if (!_.isString(messageQuery.name) || messageQuery.name.trim() === '') {
        let error = new Error('Please provide a valid name.');
        log4galaxy.logMessage(error);
        response.status(400).json(new GalaxyReturn(null, new GalaxyError(error.message, error.stack)));
    }
    else {
        db.connect()
            .then(pool => db.CoMIT.MessageQuery.updateById(pool, messageQuery))
            .then(result => {
                response.status(200).json(new GalaxyReturn(result, null));
            })
            .catch(error => {
                log4galaxy.logMessage(error);
                let friendly = 'An error occurred while updating message query for this user.';
                response.status(500).json(new GalaxyReturn(null, new GalaxyError(friendly, error.stack)));
            });
    }
}