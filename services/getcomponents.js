'use strict';

const _ = require('lodash');
const db = require('../helpers/galaxydb');
const log4galaxy = require('../helpers/galaxyservicelog');
const GalaxyReturn = require('../models/galaxyreturn');
const GalaxyError = require('../models/galaxyerror');

module.exports = (request, response, next) => {
    let contains = request.params.contains;
    let noCategory = request.params.noCategory; //TODO: parameter not currently used, for future data model
    let stageOnly = request.params.stageOnly; //TODO: parameter not currently used, for future data model
    if (!_.isString(contains) || contains.trim() === '') {
        let error = new Error('Please provide a valid parameter for the search');
        log4galaxy.logMessage(error);
        response.status(400).json(new GalaxyReturn(null, new GalaxyError(error.message, error.stack)));
    } else {
        db.connect()
            .then(pool => db.CoMIT.Component.getByContains(pool, contains.trim().toLowerCase()))
            .then(components => {
                response.status(200).json(new GalaxyReturn(components, null));
            })
            .catch(error => {
                log4galaxy.logMessage(error);
                let friendly = 'An error occurred while fetching Components.';
                response.status(500).json(new GalaxyReturn(null, new GalaxyError(friendly, error.stack)));
            });
    }
}