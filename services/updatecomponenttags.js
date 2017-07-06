'use strict';

// helpers
const _ = require('lodash');
const uuid = require('uuid');
const db = require('../helpers/galaxydb');
const log4galaxy = require('../helpers/galaxyservicelog');
const synchronous = require('../helpers/galaxyutils').synchronous;

// models
const GalaxyReturn = require('../models/galaxyreturn');
const GalaxyError = require('../models/galaxyerror');

module.exports = (request, response, next) => {
    let tags = request.body;
    // if tags is not array or is empty, return an error immediately.
    if (!_.isArray(tags) || _.isEmpty(tags)) {
        let error = new Error('Please provide a valid parameter for the update');
        log4galaxy.logMessage(error);
        response.status(400).json(new GalaxyReturn(null, new GalaxyError(error.message, error.stack)));
    } else {
        db.connect()
            .then(pool => {
                let transaction = pool.transaction();
                return transaction.begin()
                    .then(() => {
                        // synchronously update or insert each of the Tags
                        // if any of the requests fail the subsequent requests will not be executed, 
                        // allowing the entire transaction to be rolled back.
                        let updatedTags = [];
                        let promises = [];
                        for (let tag of tags) {
                            promises.push(() => db.CoMIT.ComponentTag.update(transaction, tag)
                                .then(tag => updatedTags.push(tag)));
                        }
                        return synchronous(promises)
                            .then(() => tags = updatedTags);
                    })
                    .then(() => transaction.commit())
                    .catch(error =>
                        transaction.rollback()
                            .then(() => Promise.reject(error)))
            })
            .then(() => response.status(200).json(new GalaxyReturn(tags, null)))
            .catch(error => {
                // return an error if for some reason errors occured while updating component tags in the database.
                log4galaxy.logMessage(error);
                let friendly = 'An error occurred while updating Component Tags.';
                response.status(500).json(new GalaxyReturn(null, new GalaxyError(friendly, error.stack)));
            });
    }
}