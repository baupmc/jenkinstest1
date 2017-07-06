'use strict';

const _ = require('lodash');
const db = require('../helpers/galaxydb');
const log4galaxy = require('../helpers/galaxyservicelog');
const GalaxyReturn = require('../models/galaxyreturn');
const GalaxyError = require('../models/galaxyerror');

module.exports = (request, response, next) => {
    let systemName = request.params.systemName;
    if (!_.isString(systemName)) {
        let error = new Error('Please provide a valid parameter for the search');
        log4galaxy.logMessage(error);
        response.status(400).json(new GalaxyReturn(null, new GalaxyError(error.message, error.stack)));
    } else {
        db.connect()
            .then(pool => db.PermissionType.getBySystemName(pool, systemName.trim().toLowerCase()))
            .then(permissionTypes => {
                let data = {
                    permissionTypes: permissionTypes
                };
                response.status(200).json(new GalaxyReturn(data, null));
            })
            .catch(error => {
                log4galaxy.logMessage(error);
                let friendly = 'An error occurred while fetching Permission Types.';
                response.status(500).json(new GalaxyReturn(null, new GalaxyError(friendly, error.stack)));
            });
    }
}