'use strict';

// helpers
const _ = require('lodash');
_.mixin(require('lodash-uuid'));
const uuid = require('uuid');
const db = require('../helpers/galaxydb');
const log4galaxy = require('../helpers/galaxyservicelog');
const synchronous = require('../helpers/galaxyutils').synchronous;

// models
const GalaxyReturn = require('../models/galaxyreturn');
const GalaxyError = require('../models/galaxyerror');

/**
 * Synchronously inserts a Permission and CoMIT_GroupSystemPermission record 
 * for each of the Group's System Permissions.
 * @param {(ConnectionPool|Transaction)} transaction an open transaction with the database.
 * @param {uuid} groudId the uuid of the Group to insert System Permissions for.
 * @param {Permisssions[]} systemPermissions an array of System Permissions for the Group.
 * @return {Promise} A promise that will either resolve to an array of Permissions, or reject with an error.
*/
const insertSystemPermissionsSync = (transaction, groudId, systemPermissions) => {
    let permissions = [];
    let promises = [];
    for (let permission of systemPermissions) {
        promises.push(() =>
            db.CoMIT.SystemPermission.set(transaction, groudId, permission)
                .then(permission => permissions.push(permission))
        );
    }
    return synchronous(promises)
        .then(() => permissions);
}

/**
 * Synchronously insert a Permission and CoMIT_GroupTagPermission 
 * record for each of the Component Tag's Permissions.
 * @param {(ConnectionPool|Transaction)} transaction an open transaction with the database.
 * @param {uuid} groudId the uuid of the Group in which the Tag belongs.
 * @param {uuid} tagId the uuid of the Tag to insert Component Tag Permissions for.
 * @param {Permisssions[]} tagPermissions an array of Permissions for the Tag.
 * @return {Promise} A promise that will either resolve to an array of Permissions, or reject with an error.
*/
const insertComponentTagPermissionsSync = (transaction, groudId, tagId, tagPermissions) => {
    // synchronously insert a Permission and CoMIT_GroupTagPermission
    // record for each of the Component Tag's Permissions
    let permissions = [];
    let promises = [];
    for (let permission of tagPermissions) {
        promises.push(() =>
            db.CoMIT.ComponentTagPermission.set(transaction, groudId, tagId, permission)
                .then(permission => permissions.push(permission))
        );
    }
    return synchronous(promises)
        .then(() => permissions);
}

/**
 * Synchronously update (insert if it does not exist) each Component Tag of the Component Tag Permissions, then
 * synchronously insert a Permission and CoMIT_GroupTagPermission record for each of the Component Tag's Permissions
 * @param {(ConnectionPool|Transaction)} transaction an open transaction with the database.
 * @param {uuid} groudId the uuid of the Group to insert Component Tag Permissions for.
 * @param {Permisssions[]} componentTagPermissions an array of Component Tag Permissions for the Group.
 * @return {Promise} A promise that will either resolve to an array of Component Tag Permissions, or reject with an error.
*/
const updatecomponentTagPermissionsSync = (transaction, groudId, componentTagPermissions) => {
    // synchronously 
    // update (insert if it does not exist) each Component Tag of the Component Tag Permissions
    // insert a Permission and CoMIT_GroupTagPermission record for each of the Component Tag's Permissions
    let promises = [];
    for (let componentTagPermission of componentTagPermissions) {
        promises.push(() =>
            db.CoMIT.ComponentTag.update(transaction, componentTagPermission.tag)
                .then(updatedTag => componentTagPermission.tag = updatedTag)
        );
        promises.push(() =>
            insertComponentTagPermissionsSync(transaction, groudId, componentTagPermission.tag.id, componentTagPermission.permissions)
                .then(updatedPermissions => componentTagPermission.permissions = updatedPermissions))
    }
    return synchronous(promises)
        .then(() => componentTagPermissions);
}

module.exports = (request, response, next) => {
    const group = request.body;
    if (_.isNil(group) || !_.isObject(group)) {
        let error = new Error('Please provide a valid Group for the update');
        log4galaxy.logMessage(error);
        response.status(400).json(new GalaxyReturn(null, new GalaxyError(error.message, error.stack)));
    } else if (!_.isBoolean(group.isAdmin)) {
        let error = new Error('Please provide a valid Administrative flag for the update');
        log4galaxy.logMessage(error);
        response.status(400).json(new GalaxyReturn(null, new GalaxyError(error.message, error.stack)));
    } else if (group.isAdmin === false && !_.isArray(group.systemPermissions)) {
        let error = new Error('A valid list of System Permissions are required for the update');
        log4galaxy.logMessage(error);
        response.status(400).json(new GalaxyReturn(null, new GalaxyError(error.message, error.stack)));
    } else if (group.isAdmin === false && !_.isArray(group.componentTagPermissions)) {
        let error = new Error('A valid list of Component Tag Permissions are required for the update');
        log4galaxy.logMessage(error);
        response.status(400).json(new GalaxyReturn(null, new GalaxyError(error.message, error.stack)));
    } else {
        db.connect()
            .then(pool => {
                const transaction = pool.transaction();
                return transaction.begin()
                    .then(() => {
                        // if the Group exists, then delete it from the database,
                        // this also causes a cascading delete of all related
                        // CoMIT_GroupTagPermissions & CoMIT_GroupSystemPermissions
                        if (_.isUuid(group.id)) {
                            return db.CoMIT.Group.deleteById(transaction, group.id);
                        }
                        // if the Group does not exist, then simply generate its uuid
                        group.id = uuid();
                    })
                    .then(() => db.CoMIT.Group.set(transaction, group))
                    .then(() => {
                        // short circuit if the Group is marked as administrative,
                        // there is no need for System or Component Tag permissions.
                        if (group.isAdmin) {
                            return;
                        } else {
                            // if any of the synchronous requests fail the subsequent requests will not be executed, 
                            // allowing the entire transaction to be rolled back.
                            return Promise.resolve()
                                .then(() => insertSystemPermissionsSync(transaction, group.id, group.systemPermissions))
                                .then(updatedSystemPermissions => group.systemPermissions = updatedSystemPermissions)
                                .then(() => updatecomponentTagPermissionsSync(transaction, group.id, group.componentTagPermissions))
                                .then(updatedComponentTagPermissions => group.componentTagPermissions = updatedComponentTagPermissions)
                        }
                    })
                    .then(() => transaction.commit())
                    .catch(error =>
                        transaction.rollback()
                            .then(() => Promise.reject(error)))
            })
            .then(() => response.status(200).json(new GalaxyReturn(group, null)))
            .catch(error => {
                // return an error if for some reason errors occured while updating group permissions in the database.
                log4galaxy.logMessage(error);
                let friendly = 'An error occurred while updating Group permissions.';
                response.status(500).json(new GalaxyReturn(null, new GalaxyError(friendly, error.stack)));
            });
    }
}