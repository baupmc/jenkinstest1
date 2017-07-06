'use strict';

const _ = require('lodash');
const btoa = require('btoa');
const config = require('../config/config');
const log4galaxy = require('../helpers/galaxyservicelog');
const GalaxyReturn = require('../models/galaxyreturn');
const GalaxyError = require('../models/galaxyerror');
const externalRequest = require('request');

module.exports = (request, response, next) => {
    let startsWith = request.params.startswith;

    if (!_.isString(startsWith) || startsWith.trim() === '') {
        let error = new Error('Please provide a valid search parameter.');
        log4galaxy.logMessage(error);
        response.status(400).json(new GalaxyReturn(null, new GalaxyError(error.message, error.stack)));
    } else {
        //Request to MQ REST API for queues.
        //
        //For now, GalaxyAPI requests a static JSON file stored on ComitUI's 
        //localhost server for an accurate test of retrieving data via external 
        //request in the service layer. Will be changed to point at IBM MQ REST 
        //API when it is enabled and properly secured. JSON stored on ComitUI 
        //mirrors the structure that will be returned by IBM MQ REST API.
        //
        //NOTE: API may have name wildcard matching disabled for security reasons.
        //If this is the case, remove the "startsWith" parameter from service and 
        //refactor the typeahead on ComitUI to act as prefetch instead of remote.
        var auth = btoa(config.ibmMq.username + ":" + config.ibmMq.password);
        var options = {
            url: config.ibmMq.url + "src/json/queues.json", //+ "qmgr/QMD1/queue", //+ "/name=" + startsWith + "*",
            headers: {
                'Authorization':'Basic ' + auth
            }
        };
        externalRequest.get(options, function(e, r, body) {
            if(!e && r.statusCode == 200){
                //Format data and return
                var queues = JSON.parse(body).queue;
                response.status(200).json(new GalaxyReturn(queues, null));
            } else {
                //Return error
                log4galaxy.logMessage(e);
                let friendly = 'An error occurred while fetching queues for this parameter.';
                response.status(500).json(new GalaxyReturn(null, new GalaxyError(friendly, e.stack)));  
            }
        });        
    }
}