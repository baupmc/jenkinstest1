'use strict';

const GalaxyLog = require('../models/galaxylog');
const GalaxyReturn = require('../models/galaxyreturn');
const GalaxyError = require('../models/galaxyerror');

module.exports = (request, response, next) => {
    let logthis = new GalaxyLog(request.body.systemName, request.body.systemToken, request.body.userName, 
                                request.body.logType, request.body.isFairWarning, request.body.message);
    
    return logthis.toDb()
        .then(() => response.status(200).json(new GalaxyReturn('success', null)))
        .catch( error => { 
            let friendly = 'An error occurred while writing logs to the database.'; 
            response.status(500).json(new GalaxyReturn(null, new GalaxyError(friendly, error.stack)))
        });
}