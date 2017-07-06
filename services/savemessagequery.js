'use strict';

const _ = require('lodash');
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
    //If userId or name is somehow malformed, return an error immediately.
    if (!_.isString(messageQuery.userId) || messageQuery.userId.trim() === '') {
        let error = new Error('Please provide a valid user ID.');
        log4galaxy.logMessage(error);
        response.status(400).json(new GalaxyReturn(null, new GalaxyError(error.message, error.stack)));
    } else if (!_.isString(messageQuery.name) || messageQuery.name.trim() === '') {
        let error = new Error('Please provide a valid name.');
        log4galaxy.logMessage(error);
        response.status(400).json(new GalaxyReturn(null, new GalaxyError(error.message, error.stack)));
    } else {
        //Get all message queries for this user from the database for existence checking.
        db.connect()
            .then(pool => db.CoMIT.MessageQuery.getByUserId(pool, messageQuery.userId))
            .then(queries => {
                //Check queries matching userId if the name of the query to be 
                //saved matches any of the queries already saved in the database.
                var nameExistsForUser = false;
                for (let query of queries) {
                    if (query.name == messageQuery.name) {
                        log4galaxy.logMessage("Name '" + messageQuery.name + "' exists for user already.");
                        nameExistsForUser = true;
                    }
                }
                //If the name doesn't exist in the database, insert it.
                if (!nameExistsForUser) {
                    db.connect()
                        .then(pool => db.CoMIT.MessageQuery.set(pool, messageQuery))
                        .then(result => {
                            response.status(200).json(new GalaxyReturn(result, null));
                        })
                        .catch(error => {
                            log4galaxy.logMessage(error);
                            let friendly = 'An error occurred while saving message query for this user.';
                            response.status(500).json(new GalaxyReturn(null, new GalaxyError(friendly, error.stack)));
                        });
                }
                //Otherwise, return an error to the user that the name they 
                //attempted to save already exists and to try again..
                else {
                    let error = new Error('Name for query already exists! Try a different name, or update the query instead.');
                    log4galaxy.logMessage(error);
                    response.status(400).json(new GalaxyReturn(null, new GalaxyError(error.message, error.stack)));
                }
            }).catch(error => {
                //Return an error if for some reason errors occured while getting queries from the database.
                log4galaxy.logMessage(error);
                let friendly = 'An error occurred while checking the saved queries for this user.';
                response.status(500).json(new GalaxyReturn(null, new GalaxyError(friendly, error.stack)));
            });
    }
}