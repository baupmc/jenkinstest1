'use strict';

const _ = require('lodash');
const hbase = require('hbase-rest-cli');
const config = require("../config/config");
const log4galaxy = require('../helpers/galaxyservicelog');
const GalaxyReturn = require('../models/galaxyreturn');
const GalaxyError = require('../models/galaxyerror');

module.exports = (request, response, next) => {
    let rowId = request.params.rowId;
    if (!_.isString(rowId) || rowId.trim() === '') {
        let error = new Error('Please provide a valid parameter for the search');
        log4galaxy.logMessage(error);
        response.status(400).json(new GalaxyReturn(null, new GalaxyError(error.message, error.stack)));
    } else {
        //Do test hbase get row.
        let client = new hbase({
            host: config.hbaseTest.hostname, 
            port: config.hbaseTest.port
        });
        client.get('analytics_demo', rowId)
        .then(rowResult => {
            response.status(200).json(new GalaxyReturn(rowResult, null));
        });
    }
}