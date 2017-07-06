'use strict';

// helpers
const _ = require('lodash');
const ad = require('../helpers/activedirectory');
const log4galaxy = require('../helpers/galaxyservicelog');

// models
const Group = require('../models/group');
const GalaxyReturn = require('../models/galaxyreturn');
const GalaxyError = require('../models/galaxyerror');


module.exports = (request, response, next) => {
    let startsWith = request.params.startsWith;
    if (!_.isString(startsWith) || startsWith.trim() === '') {
        let error = new Error('Please provide a valid parameter for the search');
        log4galaxy.logMessage(error);
        response.status(400).json(new GalaxyReturn(null, new GalaxyError(error.message, error.stack)));
    } else {
        ad.getGroups(startsWith.trim())
            .then(groups => {
                let data = [];
                for (let group of groups) {
                    var id = group.objectGUID;
                    var name = group.cn;
                    data.push(new Group(group.objectGUID, group.cn));
                }
                //log4galaxy.logMessage("Query for groups containing \"" + startsWith +"\" returned " + groups.data.length + " group(s).");
                response.status(200).json(new GalaxyReturn(data, null));
            }).catch(error => {
                log4galaxy.logMessage(error);
                let friendly = 'An error occurred while fetching AD Groups.';
                response.status(500).json(new GalaxyReturn(null, new GalaxyError(friendly, error.stack)));
            });
    }
}