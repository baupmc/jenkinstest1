'use strict';

const _ = require('lodash');
_.mixin(require('lodash-uuid'));
const db = require('../helpers/galaxydb');
const log4galaxy = require('../helpers/galaxyservicelog');
const GalaxyReturn = require('../models/galaxyreturn');
const GalaxyError = require('../models/galaxyerror');

module.exports = (request, response, next) => {
    let id = request.params.id;

    if (!_.isUuid(id)) {
        let error = new Error('Please provide a valid message query ID.');
        log4galaxy.logMessage(error);
        response.status(400).json(new GalaxyReturn(null, new GalaxyError(error.message, error.stack)));
    } else {
        db.connect()
            .then(pool => db.CoMIT.MessageQuery.deleteById(pool, id))
            .then(result => {
                response.status(200).json(new GalaxyReturn(result, null));
            })
            .catch(error => {
                log4galaxy.logMessage(error);
                let friendly = 'An error occurred while deleting message query for this user.';
                response.status(500).json(new GalaxyReturn(null, new GalaxyError(friendly, error.stack)));
            });
    }
}