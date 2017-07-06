'use strict';

const _ = require('lodash');
const db = require('../helpers/galaxydb');
const log4galaxy = require('../helpers/galaxyservicelog');
const GalaxyReturn = require('../models/galaxyreturn');
const GalaxyError = require('../models/galaxyerror');

module.exports = (request, response, next) => {
    let contains = request.params.contains;
    if (!_.isString(contains) || contains.trim() === '') {
        let error = new Error('Please provide a valid parameter for the search');
        log4galaxy.logMessage(error);
        response.status(400).json(new GalaxyReturn(null, new GalaxyError(error.message, error.stack)));
    } else {
        db.connect()
            .then(pool => db.CoMIT.ComponentTag.getByContains(pool, contains.trim().toLowerCase()))
            .then(tags => {
                response.status(200).json(new GalaxyReturn(tags, null));
            })
            .catch(error => {
                log4galaxy.logMessage(error);
                let friendly = 'An error occurred while fetching Component Tags.';
                response.status(500).json(new GalaxyReturn(null, new GalaxyError(friendly, error.stack)));
            });
    }
}