'use strict';

const _ = require('lodash');
const db = require('../helpers/galaxydb');
const log4galaxy = require('../helpers/galaxyservicelog');
const GalaxyReturn = require('../models/galaxyreturn');
const GalaxyError = require('../models/galaxyerror');

module.exports = (request, response, next) => {
    let userid = request.params.userid;

    if (!_.isString(userid) || userid.trim() === '') {
        let error = new Error('Please provide a valid user ID.');
        log4galaxy.logMessage(error);
        response.status(400).json(new GalaxyReturn(null, new GalaxyError(error.message, error.stack)));
    } else {
        db.connect()
            .then(pool => db.CoMIT.MessageQuery.getByUserId(pool, userid.trim().toLowerCase()))
            .then(queries => {
                response.status(200).json(new GalaxyReturn(queries, null));
            })
            .catch(error => {
                log4galaxy.logMessage(error);
                let friendly = 'An error occurred while fetching message queries for this user.';
                response.status(500).json(new GalaxyReturn(null, new GalaxyError(friendly, error.stack)));
            });
    }
}