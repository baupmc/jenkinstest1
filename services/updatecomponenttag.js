'use strict';

// helpers
const _ = require('lodash');
const uuid = require('uuid');
const db = require('../helpers/galaxydb');
const log4galaxy = require('../helpers/galaxyservicelog');


// models
const GalaxyReturn = require('../models/galaxyreturn');
const GalaxyError = require('../models/galaxyerror');

module.exports = (request, response, next) => {
    let tag = request.body;
    // if tags is null or undefined, or not an object then return an error immediately.
    if (_.isNil(tag) || _.isArray(tag) || !_.isObject(tag)) {
        let error = new Error('Please provide a valid Tag for the update');
        log4galaxy.logMessage(error);
        response.status(400).json(new GalaxyReturn(null, new GalaxyError(error.message, error.stack)));
    } else {
        db.connect()
            .then(pool => {
                // update or insert the Tag, if any of the requests fail the entire transaction will be rolled back.
                let transaction = pool.transaction();
                return transaction.begin()
                    .then(() => db.CoMIT.ComponentTag.update(transaction, tag))
                    .then(updatedTag => tag = updatedTag)
                    .then(() => transaction.commit())
                    .catch(error =>
                        transaction.rollback()
                            .then(() => Promise.reject(error)))
            })
            .then(() => response.status(200).json(new GalaxyReturn(tag, null)))
            .catch(error => {
                // return an error if for some reason errors occured while updating component tags in the database.
                log4galaxy.logMessage(error);
                let friendly = 'An error occurred while updating Component Tags.';
                response.status(500).json(new GalaxyReturn(null, new GalaxyError(friendly, error.stack)));
            });
    }
}